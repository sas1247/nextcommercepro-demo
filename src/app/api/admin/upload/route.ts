import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/auth";

export const runtime = "nodejs"; // important pt upload (Buffer)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function extFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg"; // default + image/jpeg
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return NextResponse.json(
        { error: "Lipsesc env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // NOTE: translated template comment.
    const max = 5 * 1024 * 1024;
    if (file.size > max) {
      return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 400 });
    }

    // (optional) doar imagini
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Doar imagini sunt permise." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = extFromMime(file.type);
    const safeName =
      (file.name || "image")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9.\-_]/g, "")
        .replace(/\.+/g, ".")
        .slice(0, 80) || `image.${ext}`;

    const path = `p-${Date.now()}-${Math.random().toString(16).slice(2)}-${safeName}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("SUPABASE UPLOAD ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from("products").getPublicUrl(path);
    const url = data?.publicUrl;

    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    console.error("UPLOAD ROUTE ERROR:", e);
    return NextResponse.json(
      { error: e?.message || "Upload failed" },
      { status: 500 }
    );
  }
}