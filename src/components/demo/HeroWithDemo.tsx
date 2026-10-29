import type { ReactNode } from "react";

/** Hero grid: text left, animated demo right on lg+, demo below the CTA on mobile. */
export default function HeroWithDemo({ hero, demo }: { hero: ReactNode; demo: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
      {hero}
      <div className="pb-14 lg:py-12">{demo}</div>
    </div>
  );
}
