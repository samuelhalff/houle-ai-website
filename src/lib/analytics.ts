"use client";

import posthog from "@/src/lib/posthog-lazy";
import { getAttribution } from "@/src/lib/attribution";
import { AI_SOURCE_KEY, gaClientIdFromCookies, readConsentChoice } from "@/src/lib/consent-mode";

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

const posthogConfigured = Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST);
/** Events mirrored to PostHog (same set as ark-fid.ch, without its own product events). */
const posthogEvents = new Set(["contact_form_start", "form_submit_error", "generate_lead"]);

export function trackEvent(name: string, params?: AnalyticsParams) {
  if (name === "generate_lead") {
    params = { ...leadContext(), ...params };
    mirrorToGtm(name, params);
  }
  try {
    if (typeof window === "undefined") return;
    if (posthogConfigured && posthogEvents.has(name)) posthog.capture(name, params);
    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== "function") return;
    gtag("event", name, { transport_type: "beacon", ...params });
  } catch {
    // Analytics must never surface errors to users.
  }
}

/**
 * Campaign context of the visit for generate_lead: the first-touch UTM values
 * kept for the session (src/lib/attribution.ts) and the AI assistant that
 * sent the visitor (ai_source, set by the consent bootstrap). Prefixed names,
 * GA4 reserves source/medium/campaign for its own campaign handling.
 */
export function leadContext(): AnalyticsParams {
  const out: AnalyticsParams = {};
  try {
    const utm = getAttribution()?.utm;
    if (utm) {
      if (utm.source) out.lead_utm_source = utm.source;
      if (utm.medium) out.lead_utm_medium = utm.medium;
      if (utm.campaign) out.lead_utm_campaign = utm.campaign;
      if (utm.term) out.lead_utm_term = utm.term;
      if (utm.content) out.lead_utm_content = utm.content;
    }
    const w = window as { __aiSource?: string };
    let ai = w.__aiSource;
    if (!ai) {
      try {
        ai = window.sessionStorage.getItem(AI_SOURCE_KEY) || undefined;
      } catch {}
    }
    if (ai) out.ai_source = ai;
  } catch {}
  return out;
}

/**
 * GTM has its own dataLayer (created by the consent bootstrap, gtm.js loads
 * for every visitor); lead events are copied there. Consent Mode decides
 * what its tags may do.
 */
function mirrorToGtm(name: string, params?: AnalyticsParams) {
  try {
    if (typeof window === "undefined") return;
    const layer = (window as { gtmDataLayer?: unknown[] }).gtmDataLayer;
    if (!Array.isArray(layer)) return;
    layer.push({ event: name, ...params });
  } catch {
    // Analytics must never surface errors to users.
  }
}

/**
 * GA client id for lead submissions: sent whenever a _ga cookie exists and
 * the visitor has not refused (see gaClientIdFromCookies).
 */
export function getGaClientId(): string | undefined {
  try {
    if (typeof document === "undefined") return undefined;
    return gaClientIdFromCookies(document.cookie, readConsentChoice());
  } catch {
    return undefined;
  }
}
