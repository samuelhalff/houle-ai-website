"use client";

/**
 * Safe GA4 event helper.
 *
 * gtag is only defined after the user has made a cookie choice ("accepted" or
 * "minimal"): CookieConsent injects the gtag script only then. Under "minimal",
 * analytics_storage stays denied and events go out as cookieless Consent Mode
 * pings. Before any choice (or if declined/blocked), events are dropped.
 *
 * Never let analytics break product flows: this must not throw.
 */
export type AnalyticsParams = Record<string, string | number | boolean>;

export function trackEvent(name: string, params?: AnalyticsParams) {
  try {
    if (typeof window === "undefined") return;
    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== "function") return;
    gtag("event", name, { transport_type: "beacon", ...params });
  } catch {
    // Analytics must never surface errors to users.
  }
}
