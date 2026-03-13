"use client";

import { useEffect, useState } from "react";

import { WhatsAppIcon } from "@/src/components/icons/WhatsAppIcon";
import { getWhatsAppContent, getWhatsAppLink } from "@/src/lib/whatsapp";
import type { Locale } from "@/src/lib/i18n-locales";

const STORED_CONSENT_VALUES = new Set(["accepted", "minimal", "declined"]);
const ENTRANCE_ANIMATION_DELAY = 180;
const BASE_OFFSET = 16;
const COOKIE_GAP = 12;

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
  const [bottomOffset, setBottomOffset] = useState(BASE_OFFSET);
  const [cookieBannerVisible, setCookieBannerVisible] = useState(false);

  useEffect(() => {
    const updateOffset = () => {
      const cookieBanner = document.querySelector<HTMLElement>(
        "[data-cookie-banner='true']"
      );
      const cookieManage = document.querySelector<HTMLElement>(
        "[data-cookie-manage='true']"
      );

      if (cookieBanner) {
        const rect = cookieBanner.getBoundingClientRect();
        setCookieBannerVisible(true);
        setBottomOffset(Math.max(BASE_OFFSET, window.innerHeight - rect.top + COOKIE_GAP));
        return;
      }

      setCookieBannerVisible(false);

      if (cookieManage) {
        const rect = cookieManage.getBoundingClientRect();
        setBottomOffset(
          Math.max(BASE_OFFSET, window.innerHeight - rect.top + COOKIE_GAP)
        );
        return;
      }

      setBottomOffset(BASE_OFFSET);
    };

    const timer = window.setTimeout(
      () => setIsReady(true),
      ENTRANCE_ANIMATION_DELAY
    );
    const onConsentChange = () => window.requestAnimationFrame(updateOffset);
    const mutationObserver = new MutationObserver(() =>
      window.requestAnimationFrame(updateOffset)
    );
    const resizeObserver = new ResizeObserver(() => updateOffset());

    updateOffset();
    if (document.body) {
      resizeObserver.observe(document.body);
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    window.addEventListener("cookie-consent-changed", onConsentChange);
    window.addEventListener("resize", updateOffset);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("cookie-consent-changed", onConsentChange);
      window.removeEventListener("resize", updateOffset);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const copy = getWhatsAppContent(locale);
  const href = getWhatsAppLink(locale);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={copy.floatingAriaLabel}
      className={[
        "group fixed right-4 z-40 inline-flex size-12 items-center justify-center rounded-full border border-white/70 text-white shadow-[0_12px_30px_-16px_rgba(37,211,102,0.95)] transition-all duration-300",
        "bg-[linear-gradient(180deg,#2CD96B_0%,#25D366_100%)] hover:-translate-y-0.5 hover:shadow-[0_16px_35px_-18px_rgba(37,211,102,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]",
        "motion-reduce:transition-none motion-reduce:transform-none",
        isReady && !cookieBannerVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-6 scale-95 opacity-0",
      ].join(" ")}
      style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + ${bottomOffset}px)` }}
    >
      <span
        className="absolute inset-0 rounded-full bg-[#25D366]/20 blur-lg transition-opacity duration-300 group-hover:opacity-80"
        aria-hidden="true"
      />
      <span
        className="absolute inset-0 rounded-full bg-white/12"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute right-[calc(100%+0.75rem)] top-1/2 hidden -translate-y-1/2 rounded-full border bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-sm transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block"
        aria-hidden="true"
      >
        {copy.floatingLabel}
      </span>
      <span className="relative flex size-12 items-center justify-center">
        <WhatsAppIcon className="size-5 text-white" />
      </span>
    </a>
  );
}
