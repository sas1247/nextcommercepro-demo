"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Consent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

const LS_KEY = "asta_cookie_consent_v1";

function loadConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Consent;
  } catch {
    return null;
  }
}

function saveConsent(consent: Consent) {
  localStorage.setItem(LS_KEY, JSON.stringify(consent));
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = loadConsent();
    if (!consent) {
      setOpen(true);
      return;
    }
    // NOTE: translated template comment.
    setOpen(false);
  }, []);

  function acceptAll() {
    const consent: Consent = {
      essential: true,
      analytics: true,
      marketing: true,
      decidedAt: new Date().toISOString(),
    };
    saveConsent(consent);
    setOpen(false);
    setSettingsOpen(false);

    // NOTE: translated template comment.
  }

  function acceptEssentials() {
    const consent: Consent = {
      essential: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    };
    saveConsent(consent);
    setOpen(false);
    setSettingsOpen(false);
  }

  function saveSettings() {
    const consent: Consent = {
      essential: true,
      analytics,
      marketing,
      decidedAt: new Date().toISOString(),
    };
    saveConsent(consent);
    setOpen(false);
    setSettingsOpen(false);
  }

  if (!open) return null;

  return (
    <>
      {/* NOTE: translated template comment. */}
      <div className="fixed inset-x-0 bottom-0 z-[60]">
        <div className="bg-black/70 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
            <div className="text-sm text-white/90 leading-relaxed">
              This site uses cookies to provide required functionality and an improved experience.
              By continuing to browse, you agree to{" "}
              <Link href="/pagini/cookies" className="underline underline-offset-2 text-white">
                Politica de Cookies
              </Link>.
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <button
                onClick={() => setSettingsOpen(true)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white border border-white/20
                           hover:bg-white/10 transition whitespace-nowrap"
              >
                Cookie preferences
              </button>

              <button
                onClick={acceptEssentials}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-black bg-white
                           hover:opacity-90 transition whitespace-nowrap"
              >
                Essential cookies only
              </button>

              <button
                onClick={acceptAll}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white
                           bg-gradient-to-r from-black to-[#3533cd]
                           hover:opacity-95 transition whitespace-nowrap"
              >
                Accept all cookies
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NOTE: translated template comment. */}
      {settingsOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-black/10 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-black/10 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-black">Cookie preferences</div>
                <div className="text-sm text-neutral-600">You can change preferences at any time.</div>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="h-10 w-10 rounded-xl border border-black/10 hover:bg-black hover:text-white transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-black/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-black">Essential</div>
                    <div className="text-sm text-neutral-600">Required for site functionality.</div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-black text-white">
                    Mereu active
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-black/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-black">Analitice</div>
                    <div className="text-sm text-neutral-600">Help us understand traffic (e.g., Google Analytics).</div>
                  </div>
                  <button
                    onClick={() => setAnalytics((v) => !v)}
                    className={`h-10 w-20 rounded-full border transition relative ${
                      analytics ? "bg-black border-black" : "bg-white border-black/20"
                    }`}
                    aria-label="Toggle analytics"
                  >
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-full transition ${
                        analytics ? "left-11 bg-white" : "left-1 bg-black"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-black/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-black">Marketing</div>
                    <div className="text-sm text-neutral-600">Personalization and ads (e.g., Meta Pixel).</div>
                  </div>
                  <button
                    onClick={() => setMarketing((v) => !v)}
                    className={`h-10 w-20 rounded-full border transition relative ${
                      marketing ? "bg-black border-black" : "bg-white border-black/20"
                    }`}
                    aria-label="Toggle marketing"
                  >
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-full transition ${
                        marketing ? "left-11 bg-white" : "left-1 bg-black"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-black/10 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={acceptEssentials}
                className="rounded-xl px-4 py-2 text-sm font-semibold border border-black/10 hover:bg-black hover:text-white transition"
              >
                Essential only
              </button>
              <button
                onClick={saveSettings}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-black to-[#3533cd] hover:opacity-95 transition"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}