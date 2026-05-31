"use client";

import { useEffect, useState } from "react";
import CookieConsent from "@/src/components/CookieConsent";
import ConsentAnalytics from "@/src/components/ConsentAnalytics";

type CookieLabels = {
  Title: string;
  Text: string;
  LearnMore: string;
  Accept: string;
  Decline: string;
  Manage: string;
};

export default function ClientOnlyProviders({
  nonce,
  locale,
  gaId,
  gtmId,
  cookieLabels,
}: {
  nonce?: string;
  locale?: string;
  gaId: string;
  gtmId: string;
  cookieLabels: CookieLabels;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      <CookieConsent nonce={nonce} locale={locale} labels={cookieLabels} />
      <ConsentAnalytics gaId={gaId} gtmId={gtmId} nonce={nonce} />
    </>
  );
}
