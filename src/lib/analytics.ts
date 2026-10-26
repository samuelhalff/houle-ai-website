"use client";

import { readConsentChoice } from "@/src/lib/consent-mode";

/**
 * Safe GA4 event helper.
 *
 * gtag is defined for every visitor by the Consent Mode bootstrap in
 * app/layout.tsx. Whether an event sets cookies or goes out as a cookieless
 * ping is decided by the consent state (regional default or the visitor's
 * choice), not here.
 *
 * Never let analytics break product flows: this must not throw.
 */
export type AnalyticsParams = Record<string, string | number | boolean>;

export function trackEvent(name: string, params?: AnalyticsParams) {
  if (name === "generate_lead") mirrorToGtm(name, params);
  try {
    if (typeof window === "undefined") return;
    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== "function") return;
    gtag("event", name, { transport_type: "beacon", ...params });
  } catch {
    // Analytics must never surface errors to users.
  }
}

/**
 * GTM has its own dataLayer (see ConsentAnalytics) that only exists after the
 * visitor accepted; lead events are copied there while consent is active.
 */
function mirrorToGtm(name: string, params?: AnalyticsParams) {
  try {
    if (typeof window === "undefined") return;
    const layer = (window as { gtmDataLayer?: unknown[] }).gtmDataLayer;
    if (!Array.isArray(layer) || readConsentChoice() !== "accepted") return;
    layer.push({ event: name, ...params });
  } catch {
    // Analytics must never surface errors to users.
  }
}
