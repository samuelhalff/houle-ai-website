"use client";

import { useEffect, useState } from "react";
import CookieConsent from "@/src/components/CookieConsent";
import EngagementTracker from "@/src/components/EngagementTracker";

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
  cookieLabels,
}: {
  nonce?: string;
  locale?: string;
  cookieLabels: CookieLabels;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      <CookieConsent nonce={nonce} locale={locale} labels={cookieLabels} />
      <EngagementTracker />
    </>
  );
}
