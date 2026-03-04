"use client";

import { useEffect, useState } from "react";

const LS_KEY = "asta_voucher_popup_seen_v1";

export default function VoucherPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem(LS_KEY);
    if (!seen) setOpen(true);
  }, []);

  function close() {
    localStorage.setItem(LS_KEY, "1");
    setOpen(false);
  }

  async function subscribe(e: React.FormEvent) {
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
        setMsg(data?.message ?? "An error occurred.");
        return;
      }

      setStatus("ok");
      setCode(data?.code ?? null);
      setMsg("Success! Check your email for your discount code.");
      localStorage.setItem(LS_KEY, "1");
    } catch {
      setStatus("error");
      setMsg("An error occurred.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 grid place-items-center px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white border border-black/10 shadow-2xl relative overflow-hidden">
        <button
          onClick={close}
          className="absolute right-4 top-4 h-10 w-10 rounded-xl border border-black/10 hover:bg-black hover:text-white transition"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="p-8 md:p-10 text-center">
          <div className="text-sm tracking-widest text-neutral-600 font-semibold">
            20 USD OFF YOUR FIRST ORDER
          </div>

          <div className="mt-2 text-5xl md:text-6xl font-extrabold text-[#E24A3B]">
            GIFT VOUCHER!
          </div>

          <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">
            Sign up with your email and receive a discount code of{" "}
            <span className="font-semibold text-black">20 USD</span> that you can use on your first order
            (valid for minimum orders <span className="font-semibold text-black">300 USD</span>).
          </p>

          <form onSubmit={subscribe} className="mt-8 max-w-xl mx-auto">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="Your email address"
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-4 w-full rounded-xl py-4 text-sm font-extrabold text-white
                         bg-gradient-to-r from-black to-[#3533cd]
                         hover:opacity-95 disabled:opacity-60 transition"
            >
              {status === "loading" ? "..." : "SUBSCRIBE"}
            </button>

            {msg ? (
              <p className={`mt-3 text-sm ${status === "ok" ? "text-green-700" : "text-red-700"}`}>
                {msg}
              </p>
            ) : null}

            {code ? (
              <p className="mt-3 text-sm text-black">
                Your code: <span className="font-extrabold">{code}</span>
              </p>
            ) : null}

            <button
              type="button"
              onClick={close}
              className="mt-6 text-sm text-neutral-700 hover:underline"
            >
              No thanks. I want to pay full price.
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}