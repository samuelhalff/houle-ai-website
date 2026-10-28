"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type FrameLabels = { Label: string; Pause: string; Play: string; Fiction: string };
export type Clock = {
  now: number;
  reduced: boolean;
  /** true while now is in [from, to) and motion is allowed (brief highlight) */
  flash: (from: number, to: number) => boolean;
};

const TICK = 60;
export const FLASH_CLASS =
  "transition-colors duration-700 motion-reduce:transition-none";
export const FLASH_ON = "bg-brand-soft dark:bg-accent";

/** Typed text: visible part + invisible remainder (keeps the box size stable). */
export function Typed({ text, now, start, ms = 55 }: { text: string; now: number; start: number; ms?: number }) {
  const n = Math.max(0, Math.min(text.length, Math.floor((now - start) / ms)));
  return (
    <>
      {text.slice(0, n)}
      <span className="invisible">{text.slice(n)}</span>
    </>
  );
}

/** Chat bubble. Hidden bubbles keep their space (no layout shift). */
export function Bubble({ mine, on, children }: { mine?: boolean; on: boolean; children: ReactNode }) {
  return (
    <p
      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-5 transition-all duration-300 motion-reduce:transition-none sm:text-[13px] ${
        mine ? "self-end rounded-br-sm bg-brand-hover text-white dark:bg-brand dark:text-background" : "self-start rounded-bl-sm bg-muted text-foreground"
      } ${on ? "translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"}`}
    >
      {children}
    </p>
  );
}

type Props = {
  labels: FrameLabels;
  /** Content of the main window (fictional site / mail / document...). */
  windowBody: (c: Clock) => ReactNode;
  /** Content of the overlapping panel (chat, assistant pane...). */
  panelBody: (c: Clock) => ReactNode;
  panelVariant?: "phone" | "pane";
  loop?: number;
  /** Time shown when motion is reduced (final state). */
  finalAt?: number;
};

const PANEL = {
  phone: "rounded-[1.75rem] border-[5px] border-foreground/80 bg-background p-3 shadow-lg",
  pane: "rounded-2xl border bg-background p-3 shadow-lg",
};

export default function DemoFrame({ labels: l, windowBody, panelBody, panelVariant = "phone", loop = 12000, finalAt = 10500 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setVisible(true);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible || paused) return;
    const id = setTimeout(() => setT((p) => (p + TICK >= loop ? 0 : p + TICK)), TICK);
    return () => clearTimeout(id);
  }, [t, reduced, visible, paused, loop]);

  const now = reduced ? finalAt : t;
  const clock: Clock = { now, reduced, flash: (a, b) => !reduced && now >= a && now < b };

  return (
    <div ref={ref} className="relative mx-auto mt-4 w-full max-w-[560px] md:pb-20 lg:mt-0">
      <button
        type="button"
        aria-pressed={paused}
        aria-label={paused ? l.Play : l.Pause}
        onClick={() => setPaused((p) => !p)}
        className="absolute left-2 top-[7px] z-10 flex h-5 w-5 items-center justify-center rounded-full text-[9px] text-muted-foreground hover:bg-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
      </button>
      <div role="img" aria-label={l.Label} className="overflow-hidden rounded-2xl border bg-card shadow-sm md:mr-16">
        <div aria-hidden="true">
          <div className="flex h-8 items-center border-b bg-muted px-3 py-2">
            <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{l.Fiction}</span>
          </div>
          <div className="px-5 pb-12 pt-5 md:pb-6"><div className="md:max-w-[240px]">{windowBody(clock)}</div></div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className={`relative -mt-10 ml-auto mr-2 w-[86%] max-w-[300px] md:absolute md:bottom-0 md:right-0 md:mr-0 md:mt-0 md:w-[290px] ${PANEL[panelVariant]}`}
      >
        {panelVariant === "phone" && <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-foreground/20" />}
        <div className={`flex flex-col gap-2 ${panelVariant === "phone" ? "min-h-[290px] justify-end" : "min-h-[240px] justify-start"}`}>{panelBody(clock)}</div>
      </div>
    </div>
  );
}
