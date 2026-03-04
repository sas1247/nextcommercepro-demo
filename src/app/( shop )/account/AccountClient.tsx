"use client";

import * as React from "react";
import { syncLocalToServer } from "@/lib/favorites-client";
import Link from "next/link";

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
} | null;

type Tab = "login" | "register";

function cx(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "An error occurred.");
  return data as T;
}

// NOTE: translated template comment.
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cx(
          "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black",
          "placeholder:text-black/40 outline-none",
          "focus:border-[#3533cd]/40 focus:ring-2 focus:ring-[#3533cd]/15",
          props.className
        )}
      />
    );
  }
);

export default function AccountClient() {
  const [user, setUser] = React.useState<User>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);

  const [tab, setTab] = React.useState<Tab>("login");
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  // NOTE: translated template comment.
  const loginEmailRef = React.useRef<HTMLInputElement>(null);
  const loginPassRef = React.useRef<HTMLInputElement>(null);

  const regEmailRef = React.useRef<HTMLInputElement>(null);
  const regPassRef = React.useRef<HTMLInputElement>(null);
  const regPass2Ref = React.useRef<HTMLInputElement>(null);

    // reset password UI
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [forgotLoading, setForgotLoading] = React.useState(false);
  const forgotEmailRef = React.useRef<HTMLInputElement>(null);

  // NOTE: translated template comment.
  React.useEffect(() => {
    let alive = true;

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setUser(data.user);
        setLoadingUser(false);
      })
      .catch(() => {
        if (!alive) return;
        setUser(null);
        setLoadingUser(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  async function refreshMe() {
    const r = await api<{ user: User }>("/api/auth/me");
    setUser(r.user);
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const email = (loginEmailRef.current?.value || "").trim().toLowerCase();
      const password = loginPassRef.current?.value || "";

      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      await refreshMe();
      await syncLocalToServer();   // NOTE: translated template comment.
      setMsg("You have successfully logged in.");
    } catch (e: any) {
      setErr(e?.message || "Authentication error.");
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    const email = (regEmailRef.current?.value || "").trim().toLowerCase();
    const password = regPassRef.current?.value || "";
    const password2 = regPass2Ref.current?.value || "";

    if (!email || !password || !password2) {
      setErr("Please fill in all fields.");
      return;
    }
    if (password !== password2) {
      setErr("Parolele nu coincid.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      await refreshMe();
      await syncLocalToServer();   // NOTE: translated template comment.
      setMsg("Account created and signed in.");
    } catch (e: any) {
      setErr(e?.message || "Registration error.");
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      await api("/api/auth/logout", { method: "POST" });
      setUser(null);
      setTab("login");
      setMsg("Te-ai delogat.");

      // NOTE: translated template comment.
      if (loginPassRef.current) loginPassRef.current.value = "";
      if (regPassRef.current) regPassRef.current.value = "";
      if (regPass2Ref.current) regPass2Ref.current.value = "";
    } catch (e: any) {
      setErr(e?.message || "Eroare la logout.");
    } finally {
      setLoading(false);
    }
  }

  async function onRequestReset(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErr(null);
    setMsg(null);

    const email =
      (forgotEmailRef.current?.value ||
        loginEmailRef.current?.value ||
        "").trim().toLowerCase();

    if (!email) {
      setErr("Introdu emailul.");
      return;
    }

    setForgotLoading(true);
    try {
      await api("/api/auth/request-password-reset", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMsg("If the email exists, you will receive a reset link in a few minutes.");
      setForgotOpen(false);
    } catch {
      setMsg("If the email exists, you will receive a reset link in a few minutes.");
      setForgotOpen(false);
    } finally {
      setForgotLoading(false);
    }
  }

  const GradientBtn = ({
    children,
    type = "button",
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    type?: "button" | "submit";
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white",
        "bg-gradient-to-r from-black to-[#3533cd] shadow-sm",
        "hover:opacity-95 active:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );

  const GhostBtn = ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-xl px-4 py-3 text-sm font-semibold",
        "border border-black/10 bg-white text-black hover:bg-black/[0.03]",
        className
      )}
    >
      {children}
    </button>
  );

  if (loadingUser) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/60 shadow-sm">
        Loading…
      </div>
    );
  }

  // ---- Dashboard (logat) ----
  if (user) {
    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

    return (
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-black/50">Bun venit</div>
              <div className="mt-1 text-lg font-semibold text-black">{displayName}</div>
              <div className="mt-1 text-sm text-black/60">{user.email}</div>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-black to-[#3533cd]" />
          </div>

          <div className="mt-5 space-y-2">
            <Link
  href="/wishlist"
  className="block w-full rounded-xl border border-black/10 px-4 py-3 text-left hover:bg-black/[0.03]"
>
  Wishlist →
</Link>

            <Link
  href="/account/billing"
  className="block w-full rounded-xl border border-black/10 px-4 py-3 text-left hover:bg-black/[0.03]"
>
  Billing / Shipping details →
</Link>
            <Link
  href="/account/orders"
  className="block w-full rounded-xl border border-black/10 px-4 py-3 text-left hover:bg-black/[0.03]"
>
  My Orders→
</Link>
          </div>

          <div className="mt-5">
            <GhostBtn onClick={onLogout} className="w-full">
              Logout
            </GhostBtn>
          </div>

          {loading && <p className="mt-3 text-xs text-black/50">Processing…</p>}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-black">Account panel</h2>
              <p className="mt-1 text-sm text-black/60">
                Here you can manage contact info, billing, shipping, orders, and favorites.
              </p>
            </div>
            <div className="hidden sm:block">
              <GradientBtn onClick={() => (window.location.href = "/")} className="px-5">
                Continue shopping
              </GradientBtn>
            </div>
          </div>

          {(err || msg) && (
            <div
              className={cx(
                "mt-6 rounded-2xl border p-4 text-sm",
                err ? "border-red-200 bg-red-50 text-red-700" : "border-black/10 bg-black/[0.03] text-black"
              )}
            >
              {err || msg}
            </div>
          )}
        </section>
      </div>
    );
  }

  // ---- Auth (nelogat) ----
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex rounded-2xl border border-black/10 bg-white p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={cx(
              "w-1/2 rounded-2xl px-4 py-3 text-sm font-semibold",
              tab === "login"
                ? "bg-gradient-to-r from-black to-[#3533cd] text-white"
                : "text-black hover:bg-black/[0.03]"
            )}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={cx(
              "w-1/2 rounded-2xl px-4 py-3 text-sm font-semibold",
              tab === "register"
                ? "bg-gradient-to-r from-black to-[#3533cd] text-white"
                : "text-black hover:bg-black/[0.03]"
            )}
          >
            Create account
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={onLogin} className="mt-6 space-y-3">
            <Input ref={loginEmailRef} type="email" placeholder="Email" autoComplete="email" required />
            <Input ref={loginPassRef} type="password" placeholder="Password" autoComplete="current-password" required />

            <div className="pt-2">
              <GradientBtn type="submit" disabled={loading} className="w-full">
                {loading ? "Processing…" : "Sign in"}
              </GradientBtn>
            </div>

            <button
  type="button"
  className="w-full text-center text-xs font-semibold text-[#3533cd] hover:underline"
  onClick={() => {
    setErr(null);
    setMsg(null);
    setForgotOpen((v) => !v);

    setTimeout(() => {
      const v = (loginEmailRef.current?.value || "").trim();
      if (forgotEmailRef.current && !forgotEmailRef.current.value) {
        forgotEmailRef.current.value = v;
      }
      forgotEmailRef.current?.focus();
    }, 0);
  }}
>
  Ai uitat parola?
</button>

{forgotOpen ? (
  <div className="mt-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
    <div className="text-xs font-semibold text-black/60">Password reset</div>

    <div className="mt-3 space-y-3">
      <Input
        ref={forgotEmailRef}
        type="email"
        placeholder="Email pentru resetare"
        autoComplete="email"
        required
      />

      <div className="flex gap-2">
        <GradientBtn
          type="button"
          disabled={forgotLoading}
          className="flex-1"
          onClick={() => onRequestReset()}
        >
          {forgotLoading ? "Se trimite…" : "Trimite link"}
        </GradientBtn>

        <GhostBtn
          onClick={() => {
            setForgotOpen(false);
            setErr(null);
          }}
          className="px-4"
        >
          Cancel
        </GhostBtn>
      </div>

      <div className="text-xs text-black/50">
        If the email exists, you will receive a link valid for 30 minutes.
      </div>
    </div>
  </div>
) : null}
          </form>
        ) : (
          <form onSubmit={onRegister} className="mt-6 space-y-3">
            <Input ref={regEmailRef} type="email" placeholder="Email" autoComplete="email" required />
            <Input
              ref={regPassRef}
              type="password"
              placeholder="Password (minim 8 caractere)"
              autoComplete="new-password"
              required
            />
            <Input ref={regPass2Ref} type="password" placeholder="Confirm password" autoComplete="new-password" required />

            <div className="pt-2">
              <GradientBtn type="submit" disabled={loading} className="w-full">
                {loading ? "Processing…" : "Create account"}
              </GradientBtn>
            </div>

            <p className="text-xs text-black/50">
              By creating an account, you agree to the terms and privacy policy.
            </p>
          </form>
        )}

        {(err || msg) && (
          <div
            className={cx(
              "mt-6 rounded-2xl border p-4 text-sm",
              err ? "border-red-200 bg-red-50 text-red-700" : "border-black/10 bg-black/[0.03] text-black"
            )}
          >
            {err || msg}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="rounded-2xl bg-gradient-to-r from-black to-[#3533cd] p-6 text-white">
          <div className="text-sm font-semibold opacity-90">NextCommerce Pro</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Your account</h2>
          <p className="mt-2 text-sm opacity-90">
            Save billing/shipping details, view orders, keep favorites, and checkout faster.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 p-5">
            <div className="text-xs font-semibold text-black/50">Wishlist</div>
            <div className="mt-2 text-sm text-black">
              Add products to your wishlist and come back anytime.
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 p-5">
            <div className="text-xs font-semibold text-black/50">Orders</div>
            <div className="mt-2 text-sm text-black">
              Order history and status
            </div>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-black/[0.03]"
          >
            Back to store →
          </a>
        </div>
      </section>
    </div>
  );
}