"use client";

import { useEffect, useState } from "react";
import TrackedLink from "@/src/components/ui/tracked-link";
import { Button } from "@/src/components/ui/button";

/**
 * Mobile-only CTA pinned to the bottom of the screen. Hidden until the CTA
 * with `targetId` has scrolled out of view, so the page never shows two at once. Stops
 * short of the right edge to leave room for the floating chat button.
 */
export default function StickyMobileCta({
  href,
  label,
  cta,
  targetId,
}: {
  href: string;
  label: string;
  cta: string;
  targetId: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // The hero node can be swapped after hydration (Reveal), so look it up on
    // every check instead of holding a reference.
    let frame = 0;
    const check = () => {
      frame = 0;
      const target = document.getElementById(targetId);
      setShow(!!target && target.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden={!show}
      className={`fixed bottom-4 left-4 right-[4.5rem] z-40 transition-opacity duration-200 sm:hidden ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <TrackedLink cta={cta} href={href} prefetch={false} tabIndex={show ? 0 : -1}>
        <Button size="lg" variant="brand" className="w-full rounded-full text-base shadow-lg">
          <span>{label}</span>
        </Button>
      </TrackedLink>
    </div>
  );
}
