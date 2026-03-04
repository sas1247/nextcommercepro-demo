"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Login failed.");
        setLoading(false);
        return;
      }

      // NOTE: translated template comment.
      router.replace(next);
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Admin Login</h1>
          <p className="text-sm text-neutral-600">
            Acces doar pentru administratori.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {err ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          <button
            className="w-full rounded-xl px-3 py-2 text-white"
            style={{
              background: "linear-gradient(90deg,#000000,#3533cd)",
            }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Enter Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}