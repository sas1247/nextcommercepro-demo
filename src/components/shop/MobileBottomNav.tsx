"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/components/cart/CartProvider";
import FavoritesBadge from "@/components/shop/FavoritesBadge";

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  children,
}: {
  href: string;
  label: string;
  icon: any;
  active: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex flex-col items-center justify-center gap-1 py-2",
        active ? "text-[#3533cd]" : "text-black/60"
      )}
    >
      <div className="relative">
        <Icon className="h-6 w-6" />
        {children}
      </div>
      <div className="text-[11px] font-medium">{label}</div>
    </Link>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  const isHome = pathname === "/";
  const isCats = pathname === "/categorii" || pathname?.startsWith("/categorie/");
  const isFav = pathname === "/wishlist";
  const isCart = pathname === "/cart";
  const isAccount = pathname?.startsWith("/account");

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="border-t border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl grid grid-cols-5">
          <NavItem href="/" label="Home" icon={Home} active={isHome} />

          <NavItem href="/categorii" label="Categories" icon={LayoutGrid} active={isCats} />

          <NavItem href="/wishlist" label="Favorite" icon={Heart} active={isFav}>
            <FavoritesBadge className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-r from-black to-[#3533cd] text-[11px] text-white" />
          </NavItem>

          <NavItem href="/cart" label="Cart" icon={ShoppingBag} active={isCart}>
            <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-r from-black to-[#3533cd] text-[11px] text-white">
              {count}
            </span>
          </NavItem>

          <NavItem href="/account" label="Cont" icon={User} active={isAccount} />
        </div>
      </div>
      {/* NOTE: translated template comment. */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white/95" />
    </div>
  );
}