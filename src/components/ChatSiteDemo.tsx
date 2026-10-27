"use client";

import { useEffect, useRef, useState } from "react";

export type ChatSiteDemoLabels = Record<
  | "Label" | "Pause" | "Play" | "Fiction" | "Tagline" | "HoursTitle" | "Mon" | "TueFri" | "SatSun"
  | "HMon" | "HTueFri" | "HSatSun" | "Closed" | "User1" | "Assistant1" | "User2" | "Assistant2",
  string
>;

// Timeline in ms (loop ~12 s)
const TICK = 60;
const T_TYPE = 800; // user message starts typing
const CHAR_MS = 55;
const T_DOTS = 3600;
const T_A1 = 4800;
const T_U2 = 6600;
const T_A2 = 7600; // published: hours update
const T_FLASH_END = 9200;
const T_LOOP = 12000;

export default function ChatSiteDemo({ labels: l }: { labels: ChatSiteDemoLabels }) {
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
    const id = setTimeout(() => setT((p) => (p + TICK >= T_LOOP ? 0 : p + TICK)), TICK);
    return () => clearTimeout(id);
  }, [t, reduced, visible, paused]);

  // Reduced motion: show the final state statically.
  const now = reduced ? T_FLASH_END + 1000 : t;
  const typed = Math.max(0, Math.min(l.User1.length, Math.floor((now - T_TYPE) / CHAR_MS)));
  const showU1 = now >= T_TYPE;
  const dots = now >= T_DOTS && now < T_A1;
  const showA1 = now >= T_A1;
  const showU2 = now >= T_U2;
  const showA2 = now >= T_A2;
  const flash = !reduced && now >= T_A2 && now < T_FLASH_END;
  const shown = reduced ? l.User1.length : typed;

  const bubble = (mine: boolean, on: boolean, text: string, typedLen = text.length) => (
    <p
      aria-hidden="true"
      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-5 transition-all duration-300 motion-reduce:transition-none sm:text-[13px] ${
        mine ? "self-end rounded-br-sm bg-brand-hover text-white dark:bg-brand dark:text-background" : "self-start rounded-bl-sm bg-muted text-foreground"
      } ${on ? "translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"}`}
    >
      {text.slice(0, typedLen)}
      <span className="invisible">{text.slice(typedLen)}</span>
    </p>
  );

  const row = (day: string, hours: string, closed?: boolean) => (
    <div
      className={`flex justify-between rounded-md px-2 py-1 transition-colors duration-700 motion-reduce:transition-none ${
        closed && flash ? "bg-brand-soft dark:bg-accent" : "bg-transparent"
      }`}
    >
      <dt className="text-muted-foreground">{day}</dt>
      <dd className={`font-medium text-foreground ${closed ? "min-w-[4.5rem] text-right" : ""}`}>{closed ? l.Closed : hours}</dd>
    </div>
  );

  return (
    <div ref={ref} className="relative mx-auto mt-4 w-full max-w-[560px] lg:mt-0 md:pb-20">
      <button
        type="button"
        aria-pressed={paused}
        aria-label={paused ? l.Play : l.Pause}
        onClick={() => setPaused((p) => !p)}
        className="absolute left-2 top-[7px] z-10 flex h-5 w-5 items-center justify-center rounded-full text-[9px] text-muted-foreground hover:bg-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
      </button>
      {/* Mini website (fictional) */}
      <div role="img" aria-label={l.Label} className="overflow-hidden rounded-2xl border bg-card shadow-sm md:mr-16">
        <div className="flex h-8 items-center border-b bg-muted px-3 py-2">
          <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{l.Fiction}</span>
        </div>
        <div className="px-5 pb-12 pt-5 md:pb-6">
          <p className="text-xl font-semibold tracking-tight text-foreground">Le Petit Comptoir</p>
          <p className="mt-1 text-sm text-muted-foreground">{l.Tagline}</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-hover dark:text-brand">{l.HoursTitle}</p>
          <dl className="mt-2 max-w-[220px] text-sm">
            {row(l.Mon, showA2 ? l.Closed : l.HMon, showA2)}
            {row(l.TueFri, l.HTueFri)}
            {row(l.SatSun, l.HSatSun)}
          </dl>
        </div>
      </div>

      {/* Neutral phone-shaped chat, overlapping */}
      <div
        aria-hidden="true"
        className="relative -mt-10 ml-auto mr-2 w-[86%] max-w-[300px] rounded-[1.75rem] border-[5px] border-foreground/80 bg-background p-3 shadow-lg md:absolute md:bottom-0 md:right-0 md:mr-0 md:mt-0 md:w-[290px]"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-foreground/20" />
        <div className="flex min-h-[290px] flex-col justify-end gap-2">
          {bubble(true, showU1, l.User1, shown)}
          <span className={`flex gap-1 self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2.5 ${dots ? "" : "invisible"}`}>
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-pulse motion-reduce:animate-none rounded-full bg-muted-foreground" style={{ animationDelay: `${d}ms` }} />
              ))}
          </span>
          {bubble(false, showA1, l.Assistant1)}
          {bubble(true, showU2, l.User2)}
          {bubble(false, showA2, l.Assistant2)}
        </div>
      </div>
    </div>
  );
}
