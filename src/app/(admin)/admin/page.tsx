"use client";

import { useEffect, useState } from "react";

const LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en-US";
const CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD";

const nfMoney = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = (bani: number) => nfMoney.format((Number(bani) || 0) / 100);

export default function AdminHome() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setData(j))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          title="Orders today"
          value={loading ? "—" : String(data?.ordersToday || 0)}
          hint="orders placed today"
        />

        <Card
          title="Sales today"
          value={loading ? "—" : money(data?.salesToday || 0)}
          hint="total revenue today"
        />

        <Card
          title="Active products"
          value={loading ? "—" : String(data?.activeProducts || 0)}
          hint="products in stock"
        />

        <Card
          title="Low stock"
          value={loading ? "—" : String(data?.lowStock || 0)}
          hint="under 5 units"
        />
      </div>

      {/* quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Action
          title="Add product"
          desc="Quickly create a new product with attributes & images."
          href="/admin/products/new"
        />
        <Action
          title="See orders"
          desc="Manage statuses, payments, and deliveries."
          href="/admin/orders"
        />
        <Action
          title="Reports"
          desc="Analyze sales, top products, and time ranges."
          href="/admin/reports"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        You are signed in as <span className="font-semibold text-white">ADMIN</span> ✅
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
      <div className="text-xs text-white/60">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-xs text-white/50">{hint}</div>
      <div className="mt-4 h-[2px] w-full rounded-full bg-gradient-to-r from-black to-[#3533cd]" />
    </div>
  );
}

function Action({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition block"
    >
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-white">{title}</div>
        <div className="text-white/50 group-hover:text-white transition">
          →
        </div>
      </div>
      <div className="mt-2 text-sm text-white/70">{desc}</div>
      <div className="mt-4 h-[2px] w-full rounded-full bg-gradient-to-r from-black to-[#3533cd]" />
    </a>
  );
}