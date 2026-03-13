"use client";

import { useEffect, useState } from "react";

import { WhatsAppIcon } from "@/src/components/icons/WhatsAppIcon";
import { getWhatsAppContent, getWhatsAppLink } from "@/src/lib/whatsapp";
import type { Locale } from "@/src/lib/i18n-locales";

const STORED_CONSENT_VALUES = new Set(["accepted", "minimal", "declined"]);
const ENTRANCE_ANIMATION_DELAY = 180;

function hasStoredConsent() {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem("cookieConsent");
    return stored !== null && STORED_CONSENT_VALUES.has(stored);
  } catch {
    // localStorage may be unavailable in private browsing or strict privacy modes.
  }

  try {
    return /(?:^|;\s*)cookieConsent=/.test(document.cookie);
  } catch {
    // Access to document.cookie can be blocked in hardened browsing contexts.
    return false;
  }
}

export default function WhatsAppButton({ locale }: { locale: Locale }) {
  const [isReady, setIsReady] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setHasConsent(hasStoredConsent());

    const timer = window.setTimeout(
      () => setIsReady(true),
      ENTRANCE_ANIMATION_DELAY
    );
    const onConsentChange = () => setHasConsent(true);

    window.addEventListener("cookie-consent-changed", onConsentChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("cookie-consent-changed", onConsentChange);
    };
  }, []);

  const copy = getWhatsAppContent(locale);
  const href = getWhatsAppLink(locale);
  const bottomOffset = hasConsent
    ? "calc(env(safe-area-inset-bottom, 0px) + 5rem)"
    : "calc(env(safe-area-inset-bottom, 0px) + 9rem)";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={copy.floatingAriaLabel}
      className={[
        "group fixed right-4 z-40 inline-flex items-center gap-3 rounded-full px-4 py-3 text-white shadow-[0_20px_45px_-20px_rgba(37,211,102,0.9)] ring-1 ring-white/20 transition-all duration-500",
        "bg-[linear-gradient(135deg,#25D366_0%,#1FA855_100%)] hover:-translate-y-1 hover:shadow-[0_24px_55px_-22px_rgba(37,211,102,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]",
        "motion-reduce:transition-none motion-reduce:transform-none",
        isReady
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-6 scale-95 opacity-0",
      ].join(" ")}
      style={{ bottom: bottomOffset }}
    >
      <span
        className="absolute inset-0 rounded-full bg-[#25D366]/30 blur-xl transition-opacity duration-500 group-hover:opacity-90"
        aria-hidden="true"
      />
      <span
        className="absolute -inset-1 rounded-full border border-white/20 opacity-70"
        aria-hidden="true"
      />
      <span className="relative flex size-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
        <span
          className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden="true"
        />
        <WhatsAppIcon className="relative size-6 text-white" />
      </span>
      <span className="relative hidden text-sm font-semibold tracking-tight sm:inline">
        {copy.floatingLabel}
      </span>
    </a>
  );
}
