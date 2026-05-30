"use client";

import dynamic from "next/dynamic";

export const ShareButtons = dynamic(
  () => import("@/src/components/ui/ShareButtons"),
  { ssr: false, loading: () => null }
);

export const ReadingProgress = dynamic(
  () => import("@/src/components/ui/reading-progress"),
  { ssr: false, loading: () => null }
);

export const BackToTop = dynamic(
  () => import("@/src/components/ui/back-to-top"),
  { ssr: false, loading: () => null }
);
