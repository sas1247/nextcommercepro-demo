"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState<string>("");

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMsg(data?.message ?? "An error occurred. Please try again.");
        return;
      }

      setStatus("ok");
      setMsg("Subscribed successfully! We'll send offers by email.");
      setEmail("");
    } catch {
      setStatus("error");
      setMsg("An error occurred. Please try again.");
    }
  }

  return (
    <footer className="mt-10 border-t border-black/10 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Col 1 */}
          <div>
            <div className="text-lg font-semibold text-black">NextCommerce Pro</div>
            <p className="mt-2 text-sm text-neutral-600">
              Demo store description — replace with your own.
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="text-neutral-700">
                <span className="font-medium text-black">Phone orders:</span>{" "}
                <a href="tel:0771751855" className="hover:underline">
                  +1 000 000 000
                </a>
              </div>
              <div className="text-neutral-700">
                <span className="font-medium text-black">Email:</span>{" "}
                <a href="mailto:contact@example.com" className="hover:underline">
                  contact@example.com
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                className="h-10 w-10 rounded-xl border border-black/10 grid place-items-center hover:bg-black hover:text-white transition"
                aria-label="Facebook"
                title="Facebook"
              >
                f
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-xl border border-black/10 grid place-items-center hover:bg-black hover:text-white transition"
                aria-label="Instagram"
                title="Instagram"
              >
                ig
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-xl border border-black/10 grid place-items-center hover:bg-black hover:text-white transition"
                aria-label="TikTok"
                title="TikTok"
              >
                tt
              </a>
            </div>
          </div>

          {/* NOTE: translated template comment. */}
          <div className="grid grid-cols-2 gap-6 md:contents">
            {/* Col 2 */}
            <div>
              <div className="text-sm font-semibold text-black">USEFUL INFO</div>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li>
                  <Link className="hover:underline" href="/pagini/conditii-comerciale">
                    Commercial terms
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="/pagini/livrare-transport">
                    Shipping & Delivery
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="/pagini/returnare">
                    Returning products
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="/pagini/politica-confidentialitate">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="/pagini/cookies">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="/pagini/termeni-conditii">
                    Terms and conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <div className="text-sm font-semibold text-black">LEGAL &amp; SUPORT</div>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li>
                  <Link className="hover:underline" href="/pagini/gdpr">
                    Data Protection (GDPR)
                  </Link>
                </li>
                <li>
                  <a className="hover:underline" href="#" target="_blank" rel="noreferrer">
                    ODR
                  </a>
                </li>
                <li>
                  <Link className="hover:underline" href="/pagini/cookies-settings">
                    Cookies settings
                  </Link>
                </li>
                <li>
                  <a
                    className="hover:underline"
                    href="https://consumer-redress.ec.europa.eu/site-relocation_en"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Dispute resolution (ODR)
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4 Newsletter */}
          <div>
            <div className="text-sm font-semibold text-black">NEWSLETTER</div>
            <p className="mt-3 text-sm text-neutral-600">
              Subscribe to receive offers and discounts.
            </p>

            <form onSubmit={onSubscribe} className="mt-4 flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="Your email address"
                className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white whitespace-nowrap min-w-[128px]
                           bg-gradient-to-r from-black to-[#3533cd]
                           hover:opacity-95 disabled:opacity-60 transition"
              >
                {status === "loading" ? "..." : "Subscribe"}
              </button>
            </form>

            {msg ? (
              <p className={`mt-2 text-sm ${status === "ok" ? "text-green-700" : "text-red-700"}`}>
                {msg}
              </p>
            ) : null}

            {/* NOTE: translated template comment. */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-neutral-700">PAYMENTS</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["VISA", "Mastercard", "Google Pay", "Apple Pay", "Stripe"].map((x) => (
                  <span
                    key={x}
                    className="rounded-lg border border-black/10 px-2.5 py-1 text-xs text-neutral-700 bg-white"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-black/10 pt-6">
          <div className="text-xs text-neutral-600">
            © {new Date().getFullYear()} NextCommerce Pro. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a className="text-neutral-700 hover:underline" href="https://anpc.ro/" target="_blank" rel="noreferrer">
              ANPC
            </a>
            <a
              className="text-neutral-700 hover:underline"
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noreferrer"
            >
              Dispute resolution (ODR)
            </a>
            <span className="text-neutral-400">|</span>
            <span className="text-neutral-700">Cards & online payments</span>
          </div>
        </div>
      </div>
    </footer>
  );
}