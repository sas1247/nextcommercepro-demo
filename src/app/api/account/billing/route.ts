import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function s(v: any) {
  const x = String(v ?? "").trim();
  return x.length ? x : null;
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const [billing, shipping] = await Promise.all([
    prisma.billingProfile.findUnique({ where: { userId: user.id } }),
    prisma.address.findFirst({
      where: { userId: user.id, type: "SHIPPING", isDefault: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    billing: billing || null,
    shipping: shipping || null,
  });
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // --- 1) BILLING PROFILE (PF / PJ) ---
  const personType = String(body?.personType || "").toUpperCase();
  if (personType !== "PF" && personType !== "PJ") {
    return NextResponse.json({ error: "personType invalid (PF/PJ)." }, { status: 400 });
  }

  const billingData = {
    personType,

    // PF
    pfName: s(body?.pfName),
    pfPhone: s(body?.pfPhone),
    pfEmail: s(body?.pfEmail),

    // PJ
    pjCompany: s(body?.pjCompany),
    pjCui: s(body?.pjCui),
    pjRegCom: s(body?.pjRegCom),
    pjContact: s(body?.pjContact),
    pjPhone: s(body?.pjPhone),
    pjEmail: s(body?.pjEmail),
  };

  // NOTE: translated template comment.
  if (personType === "PF") {
    if (!billingData.pfName || !billingData.pfPhone || !billingData.pfEmail) {
      return NextResponse.json({ error: "Please fill in name, phone, and email (Individual)." }, { status: 400 });
    }
  } else {
    if (
      !billingData.pjCompany ||
      !billingData.pjCui ||
      !billingData.pjContact ||
      !billingData.pjPhone ||
      !billingData.pjEmail
    ) {
      return NextResponse.json(
        { error: "Please fill in company, tax ID, contact person, phone, and email (Company)." },
        { status: 400 }
      );
    }
  }

  const billing = await prisma.billingProfile.upsert({
    where: { userId: user.id },
    update: billingData,
    create: { userId: user.id, ...billingData },
  });

  // --- 2) SHIPPING ADDRESS (type SHIPPING, default) ---
  const county = s(body?.county);
  const city = s(body?.city);
  const address1 = s(body?.address);
  const zip = s(body?.zip);

  if (!county || !city || !address1) {
    return NextResponse.json({ error: "Please fill in state/region, city, and full address (shipping)." }, { status: 400 });
  }

  // facem upsert pe (userId + type + isDefault) simplu, alegem prima default
  const existingDefault = await prisma.address.findFirst({
    where: { userId: user.id, type: "SHIPPING", isDefault: true },
    orderBy: { updatedAt: "desc" },
  });

  const shipping = existingDefault
    ? await prisma.address.update({
        where: { id: existingDefault.id },
        data: {
          county,
          city,
          address1,
          zip,
          country: "RO",
          type: "SHIPPING",
          isDefault: true,
        },
      })
    : await prisma.address.create({
        data: {
          userId: user.id,
          type: "SHIPPING",
          isDefault: true,
          county,
          city,
          address1,
          zip,
          country: "RO",
        },
      });

  return NextResponse.json({ ok: true, billing, shipping });
}