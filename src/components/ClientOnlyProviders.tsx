"use client";

import dynamic from "next/dynamic";

const CookieConsent = dynamic(() => import("@/src/components/CookieConsent"), {
  ssr: false,
  loading: () => null,
});

const ConsentAnalytics = dynamic(
  () => import("@/src/components/ConsentAnalytics"),
  { ssr: false, loading: () => null }
);

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
  return (
    <>
      <CookieConsent nonce={nonce} locale={locale} labels={cookieLabels} />
      <ConsentAnalytics gaId={gaId} gtmId={gtmId} nonce={nonce} />
    </>
  );
}
