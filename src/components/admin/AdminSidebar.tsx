import Link from "next/link";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/vouchers", label: "Voucher" },
  { href: "/admin/marketing", label: "Marketing" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-[280px] shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="p-6">
        <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
          <div className="text-sm text-white/70">NextCommerce Pro</div>
          <div className="text-lg font-semibold text-white">Admin Panel</div>
          <div className="mt-2 h-[2px] w-full rounded-full bg-gradient-to-r from-black to-[#3533cd]" />
        </div>

        <nav className="mt-6 space-y-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/80 hover:text-white border border-transparent hover:border-white/15 hover:bg-white/10 transition"
            >
              <span>{item.label}</span>
              <span className="text-white/40 group-hover:text-white/80 transition">
                →
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Tip</div>
          <div className="mt-1 text-sm text-white/85">
            Manage products, orders, and reports in real time.
          </div>
        </div>
      </div>
    </aside>
  );
}