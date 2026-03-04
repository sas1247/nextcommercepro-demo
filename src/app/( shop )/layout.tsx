import type { ReactNode } from "react";
import { Header } from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import CookieConsent from "@/components/shop/CookieConsent";
import VoucherPopup from "@/components/shop/VoucherPopup";
import { CartProvider } from "@/components/cart/CartProvider";
import MobileBottomNav from "@/components/shop/MobileBottomNav";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Header />

      <div className="pb-24 md:pb-0">
        <main className="mx-auto max-w-7xl px-4 py-3 md:py-3">
          {children}
        </main>

        <Footer />
      </div>

      <MobileBottomNav />

      <CookieConsent />
      <VoucherPopup />
    </CartProvider>
  );
}