"use client";

import DemoFrame, { Bubble, Typed, FLASH_CLASS, FLASH_ON, type FrameLabels } from "@/src/components/demo/DemoFrame";

export type ChatSiteDemoLabels = FrameLabels &
  Record<"Tagline" | "HoursTitle" | "Mon" | "TueFri" | "SatSun" | "HMon" | "HTueFri" | "HSatSun" | "Closed" | "User1" | "Assistant1" | "User2" | "Assistant2", string>;

export default function ChatSiteDemo({ labels: l }: { labels: ChatSiteDemoLabels }) {
  const row = (day: string, hours: string, hl = false) => (
    <div className={`flex justify-between rounded-md px-2 py-1 ${FLASH_CLASS} ${hl ? FLASH_ON : "bg-transparent"}`}>
      <dt className="text-muted-foreground">{day}</dt>
      <dd className={`font-medium text-foreground ${hl ? "min-w-[4.5rem] text-right" : ""}`}>{hours}</dd>
    </div>
  );
  return (
    <DemoFrame
      labels={l}
      finalAt={10200}
      windowBody={({ now, flash }) => {
        const closed = now >= 7600;
        return (
          <>
            <p className="text-xl font-semibold tracking-tight text-foreground">Le Petit Comptoir</p>
            <p className="mt-1 text-sm text-muted-foreground">{l.Tagline}</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-hover dark:text-brand">{l.HoursTitle}</p>
            <dl className="mt-2 max-w-[220px] text-sm">
              {row(l.Mon, closed ? l.Closed : l.HMon, flash(7600, 9200))}
              {row(l.TueFri, l.HTueFri)}
              {row(l.SatSun, l.HSatSun)}
            </dl>
          </>
        );
      }}
      panelBody={({ now }) => (
        <>
          <Bubble mine on={now >= 800}><Typed text={l.User1} now={now} start={800} /></Bubble>
          <span className={`flex gap-1 self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2.5 ${now >= 3600 && now < 4800 ? "" : "invisible"}`}>
            {[0, 150, 300].map((d) => (
              <span key={d} className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground motion-reduce:animate-none" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
          <Bubble on={now >= 4800}>{l.Assistant1}</Bubble>
          <Bubble mine on={now >= 6600}>{l.User2}</Bubble>
          <Bubble on={now >= 7600}>{l.Assistant2}</Bubble>
        </>
      )}
    />
  );
}
