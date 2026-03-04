"use client";

import { usePathname } from "next/navigation";

function titleFromPath(path: string) {
  if (path === "/admin") return "Dashboard";
  if (path.startsWith("/admin/products")) return "Products";
  if (path.startsWith("/admin/orders")) return "Orders";
  if (path.startsWith("/admin/customers")) return "Customers";
  if (path.startsWith("/admin/reports")) return "Reports";
  return "Admin";
}

export default function AdminTopbar() {
  const pathname = usePathname();
  const title = titleFromPath(pathname);

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs text-white/60">NextCommerce Pro • Admin</div>
        <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:block rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
          NextCommerce Pro
        </div>
        <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/10" />
      </div>
    </div>
  );
}