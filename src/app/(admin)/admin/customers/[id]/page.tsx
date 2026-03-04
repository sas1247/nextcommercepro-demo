"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

const money = (centi: number) => (centi / 100).toFixed(2).replace(".", ",");

export default function AdminClientPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    setErr(null);

    fetch(`/api/admin/customers/${id}`, { cache: "no-store" as RequestCache })
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.error || "Error loading customer.");
        return j;
      })
      .then((j) => alive && setData(j))
      .catch((e: any) => alive && setErr(e?.message || "Error"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [id]);

  const c = data?.customer;

  const totalOrders = useMemo(() => (data?.orders?.length ? data.orders.length : 0), [data]);
  const lastOrder = useMemo(() => (data?.orders?.[0] ? data.orders[0] : null), [data]);

  if (loading) return <div className="text-sm text-white/70">Loading...</div>;
  if (err) return <div className="text-sm text-red-200">{err}</div>;
  if (!data) return <div className="text-sm text-red-200">
Customer does not exist.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/60">Customers</div>
          <div className="text-2xl font-semibold text-white">{c?.name}</div>
          <div className="text-sm text-white/55 mt-1">{c?.email}</div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/clients"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
          >
            Back
          </Link>
          <Link
            href={lastOrder?.id ? `/admin/orders/${lastOrder.id}` : "/admin/orders"}
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg,#000000,#3533cd)" }}
          >
            View latest order
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="text-sm font-semibold text-white">Customer data</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/85">
            <div>
              <div className="text-xs text-white/60">Name / company</div>
              <div className="font-semibold">{c?.name ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-white/60">Phone</div>
              <div className="font-semibold">{c?.phone ?? "—"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-white/60">Address (latest)</div>
              <div className="font-semibold">{c?.lastAddress ?? "—"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="text-sm font-semibold text-white">Sumar</div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/85 space-y-1">
            <div className="flex justify-between"><span>Orders</span><span className="font-semibold">{c?.ordersCount ?? totalOrders}</span></div>
            <div className="flex justify-between"><span>Products purchased</span><span className="font-semibold">{c?.productsCount ?? 0}</span></div>
           <div className="flex justify-between pt-2 border-t border-white/10">
  <span>Total spent</span>
  <span className="font-semibold">
    {formatMoney(c?.totalSpent ?? 0)}
  </span>
</div>
          </div>

          <div className="text-xs text-white/60">Top purchased products</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
            {(c?.topItems ?? []).length ? (
              (c.topItems as any[]).map((x, i) => (
                <div key={i} className="flex justify-between text-sm text-white/85">
                  <span className="line-clamp-1">{x.title}</span>
                  <span className="text-white/70">x{x.qty}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-white/60">—</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">Istoric orders</div>

          <div className="mt-3 divide-y divide-white/10">
            {(data.orders || []).map((o: any) => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-white font-semibold">
                    Order #{o.orderNo}{" "}
                    <span className="text-xs text-white/60 font-normal">
                      • {new Date(o.createdAt).toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="text-xs text-white/60 line-clamp-1">
                    Payment: {o.paymentMethod} • Status: {o.status}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-white/85 whitespace-nowrap">
  {formatMoney(o.total)}
</div>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10 transition"
                  >
                    View 
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}