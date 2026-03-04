"use client";

import * as React from "react";

type PersonType = "PF" | "PJ";

type FormState = {
  personType: PersonType;

  // PF
  pfName: string;
  pfPhone: string;
  pfEmail: string;

  // PJ
  pjCompany: string;
  pjCui: string;
  pjRegCom: string;
  pjContact: string;
  pjPhone: string;
  pjEmail: string;

  // Shipping (livrare)
  county: string;
  city: string;
  address: string;
  zip: string;
};

const empty: FormState = {
  personType: "PF",

  pfName: "",
  pfPhone: "",
  pfEmail: "",

  pjCompany: "",
  pjCui: "",
  pjRegCom: "",
  pjContact: "",
  pjPhone: "",
  pjEmail: "",

  county: "",
  city: "",
  address: "",
  zip: "",
};

function cx(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  required,
  disabled,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-black/70">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="rounded-xl border border-black/10 bg-white px-4 py-3 outline-none ring-premium disabled:bg-black/[0.03]"
      />
    </label>
  );
}

export default function AccountBillingPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const [f, setF] = React.useState<FormState>(empty);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setF((p) => ({ ...p, [k]: v }));
  }

  async function load() {
    setLoading(true);
    setErr(null);
    setOk(null);

    try {
      const res = await fetch("/api/account/billing", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any)?.error || "Loading error.");

      const billing = (data as any)?.billing;
      const shipping = (data as any)?.shipping;

      setF((p) => ({
        ...p,
        personType: (billing?.personType || "PF") as PersonType,

        pfName: billing?.pfName || "",
        pfPhone: billing?.pfPhone || "",
        pfEmail: billing?.pfEmail || "",

        pjCompany: billing?.pjCompany || "",
        pjCui: billing?.pjCui || "",
        pjRegCom: billing?.pjRegCom || "",
        pjContact: billing?.pjContact || "",
        pjPhone: billing?.pjPhone || "",
        pjEmail: billing?.pjEmail || "",

        county: shipping?.county || "",
        city: shipping?.city || "",
        address: shipping?.address1 || "",
        zip: shipping?.zip || "",
      }));
    } catch (e: any) {
      setErr(e?.message || "Eroare.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    setErr(null);
    setOk(null);

    try {
      const res = await fetch("/api/account/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any)?.error || "Nu s-a putut salva.");

      setOk("Salvat cu succes.");
    } catch (e: any) {
      setErr(e?.message || "Eroare la salvare.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-black/60">Loading…</div>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Billing / Shipping details</h1>
        <p className="mt-2 text-sm text-black/60">These details will auto-fill during checkout.</p>
      </div>

      {err ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>
      ) : null}
      {ok ? (
        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">{ok}</div>
      ) : null}

      {/* Tabs PF / PJ */}
      <div className="mb-6 inline-flex overflow-hidden rounded-full border border-black/10 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => set("personType", "PF")}
          className={cx(
            "rounded-full px-4 py-2 text-sm font-semibold",
            f.personType === "PF" ? "bg-gradient-to-r from-black to-[#3533cd] text-white" : "text-black/70"
          )}
        >
          Individual
        </button>
        <button
          type="button"
          onClick={() => set("personType", "PJ")}
          className={cx(
            "rounded-full px-4 py-2 text-sm font-semibold",
            f.personType === "PJ" ? "bg-gradient-to-r from-black to-[#3533cd] text-white" : "text-black/70"
          )}
        >
          Company
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Billing */}
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Billing details</h2>

          {f.personType === "PF" ? (
            <div className="mt-4 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Full name"
                  required
                  placeholder="Ex: John Smith"
                  value={f.pfName}
                  onChange={(v) => set("pfName", v)}
                />
                <Input
                  label="Phone"
                  required
                  placeholder="Ex: 07xx xxx xxx"
                  value={f.pfPhone}
                  onChange={(v) => set("pfPhone", v)}
                />
              </div>
              <Input
                label="Email"
                required
                placeholder="e.g. email@domain.com"
                value={f.pfEmail}
                onChange={(v) => set("pfEmail", v)}
                type="email"
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Company name"
                  required
                  placeholder="Ex: Demo Company LLC"
                  value={f.pjCompany}
                  onChange={(v) => set("pjCompany", v)}
                />
                <Input label="CUI" required placeholder="Ex: RO12345678" value={f.pjCui} onChange={(v) => set("pjCui", v)} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Nr. Reg. Com."
                  placeholder="Ex: J40/1234/2024"
                  value={f.pjRegCom}
                  onChange={(v) => set("pjRegCom", v)}
                />
                <Input
                  label="Contact person"
                  required
                  placeholder="Ex: John Smith"
                  value={f.pjContact}
                  onChange={(v) => set("pjContact", v)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Phone"
                  required
                  placeholder="Ex: 07xx xxx xxx"
                  value={f.pjPhone}
                  onChange={(v) => set("pjPhone", v)}
                />
                <Input
                  label="Email"
                  required
                  placeholder="e.g. billing@company.com"
                  value={f.pjEmail}
                  onChange={(v) => set("pjEmail", v)}
                  type="email"
                />
              </div>
            </div>
          )}
        </section>

        {/* Livrare */}
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Shipping address</h2>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="State/Region"
                required
                placeholder="e.g. California"
                value={f.county}
                onChange={(v) => set("county", v)}
              />
              <Input
                label="City"
                required
                placeholder="e.g. Los Angeles"
                value={f.city}
                onChange={(v) => set("city", v)}
              />
            </div>

            <Input
              label="Full address"
              required
              placeholder="Street, number, building, unit, etc."
              value={f.address}
              onChange={(v) => set("address", v)}
            />

            <Input label="Postal code" placeholder="Ex: 505400" value={f.zip} onChange={(v) => set("zip", v)} />
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-black to-[#3533cd] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </main>
  );
}