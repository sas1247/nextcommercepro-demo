"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";

  const [pw, setPw] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  async function submit() {
    setErr(null);
    setMsg(null);

    if (!token) return setErr("Missing token.");
    if (pw.length < 6) return setErr("Password must be at least 6 characters.");
    if (pw !== pw2) return setErr("Parolele nu coincid.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: pw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any)?.message || "Eroare.");

      setDone(true);
      setMsg((data as any)?.message || "Password updated.");
    } catch (e: any) {
      setErr(e?.message || "Eroare.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold">Password reset</h1>
      <p className="mt-2 text-sm text-black/60">Set a new password for your account.</p>

      {err ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div> : null}
      {msg ? <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 text-sm">{msg}</div> : null}

      {!done ? (
        <div className="mt-6 space-y-3 rounded-2xl border border-black/10 bg-white p-6">
          <input
            type="password"
            placeholder="New password"
            className="w-full rounded-xl border border-black/10 px-4 py-3"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <input
            type="password"
            placeholder="Repeat password"
            className="w-full rounded-xl border border-black/10 px-4 py-3"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />

          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Change password"}
          </button>
        </div>
      ) : (
        <Link href="/account" className="mt-6 inline-flex text-sm font-semibold hover:underline">
          ← Go to login
        </Link>
      )}
    </main>
  );
}