"use client";
import type { NavData } from "@/src/components/navigation/types";
import MobileMenu from "@/src/components/navigation/MobileMenu";

export default function MobileMenuIsland({
  locale,
  navData,
}: {
  locale?: string;
  navData: NavData;
}) {
  return <MobileMenu locale={locale} navData={navData} />;
}
