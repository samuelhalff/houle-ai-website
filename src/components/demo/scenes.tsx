"use client";

import type { ReactNode } from "react";
import DemoFrame, { Bubble, Typed, FLASH_CLASS, FLASH_ON } from "@/src/components/demo/DemoFrame";

type L = { labels: Record<string, string> };
const hl = (on: boolean) => `${FLASH_CLASS} ${on ? FLASH_ON : "bg-transparent"}`;
const on = (shown: boolean) => `transition-opacity duration-300 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`;
const Title = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-brand-hover dark:text-brand">{children}</p>
);
const Chip = ({ active, children }: { active: boolean; children: ReactNode }) => (
  <span className={`inline-block self-start rounded-full border px-3 py-1 text-xs font-medium text-foreground ${hl(active)}`}>{children}</span>
);
/** Two texts in one grid cell: the box keeps the size of the longer one (no layout shift). */
const Swap = ({ a, b, showB }: { a: ReactNode; b: ReactNode; showB: boolean }) => (
  <span className="grid">
    <span className={`[grid-area:1/1] ${showB ? "invisible" : ""}`}>{a}</span>
    <span className={`[grid-area:1/1] ${showB ? "" : "invisible"}`}>{b}</span>
  </span>
);

export function OutlookDemo({ labels: l }: L) {
  return (
    <DemoFrame
      labels={l as never}
      panelVariant="pane"
      windowBody={({ now, flash }) => (
        <>
          <p className="text-sm font-semibold text-foreground">{l.MailSubject}</p>
          <p className="text-xs text-muted-foreground">Claire Berger · Atelier Morel</p>
          <p className="mt-2 text-sm leading-6 text-foreground/80">{l.MailBody}</p>
          <div className={`mt-4 min-h-[8.5rem] rounded-lg border p-3 text-sm ${hl(flash(4400, 9200))}`}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l.ReplyTitle}</p>
            <p className="mt-1 leading-6 text-foreground">{now >= 4400 && <Typed text={l.Draft} now={now} start={4400} ms={35} />}</p>
          </div>
        </>
      )}
      panelBody={({ now }) => (
        <>
          <Title>{l.PaneTitle}</Title>
          <p className="min-h-[4.5rem] rounded-lg bg-muted p-3 text-xs leading-5 text-foreground">
            {now >= 800 && <Typed text={l.Prompt} now={now} start={800} ms={45} />}
          </p>
          <Chip active={now >= 3600 && now < 4800}>{l.Action}</Chip>
        </>
      )}
    />
  );
}

export function WordDemo({ labels: l }: L) {
  const bar = (w: string) => <span className={`block h-2 rounded bg-foreground/10 ${w}`} />;
  return (
    <DemoFrame
      labels={l as never}
      panelVariant="pane"
      windowBody={({ now, flash }) => (
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">{l.DocTitle}</p>
          {bar("w-full")}
          {bar("w-4/5")}
          <p className={`rounded-md px-2 py-1.5 text-sm leading-6 text-foreground ${hl(now >= 800 && now < 7400 ? true : flash(7400, 9000))}`}>
            <Swap a={l.Clause} b={l.Rewrite} showB={now >= 7400} />
          </p>
          {bar("w-full")}
          {bar("w-3/5")}
        </div>
      )}
      panelBody={({ now }) => (
        <>
          <Title>{l.PaneTitle}</Title>
          <Chip active={now >= 1600 && now < 2800}>{l.Action}</Chip>
          <div className="min-h-[9rem] rounded-lg bg-muted p-3 text-xs leading-5 text-foreground">
            <p className={`mb-1 text-[10px] uppercase tracking-wider text-muted-foreground ${on(now >= 2600)}`}>{l.Hint}</p>
            {now >= 2600 && <Typed text={l.Rewrite} now={now} start={2800} ms={45} />}
          </div>
          <Chip active={now >= 6600 && now < 7800}>{l.Apply}</Chip>
        </>
      )}
    />
  );
}

export function SwissGptDemo({ labels: l }: L) {
  return (
    <DemoFrame
      labels={l as never}
      panelVariant="pane"
      windowBody={({ now }) => (
        <div className="flex min-h-[10rem] flex-col justify-end gap-2">
          <Bubble mine on={now >= 800}><Typed text={l.Question} now={now} start={800} /></Bubble>
          <span className={`flex gap-1 self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2.5 ${now >= 3200 && now < 4600 ? "" : "invisible"}`}>
            {[0, 150, 300].map((d) => (
              <span key={d} className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground motion-reduce:animate-none" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
          <Bubble on={now >= 4600}>{l.Answer}</Bubble>
          <p className={`self-start text-xs text-muted-foreground ${on(now >= 6600)}`}>{l.SourceLabel}: {l.Doc1}</p>
        </div>
      )}
      panelBody={({ now }) => (
        <>
          <Title>{l.SourcesTitle}</Title>
          {[l.Doc1, l.Doc2, l.Doc3].map((d, i) => (
            <p key={d} className={`rounded-md border px-3 py-2 text-xs text-foreground ${hl(i === 0 && now >= 6600 && now < 9000)}`}>{d}</p>
          ))}
          <p className="mt-auto pt-6 text-[11px] text-muted-foreground">{l.Tag}</p>
        </>
      )}
    />
  );
}

export function AgentsDemo({ labels: l }: L) {
  const rows = [
    { req: l.Req1, tag: l.Tag1 },
    { req: l.Req2, tag: l.Tag2 },
    { req: l.Req3, tag: l.Tag3 },
  ];
  const at = (i: number) => 1500 + i * 2400;
  return (
    <DemoFrame
      labels={l as never}
      panelVariant="pane"
      windowBody={({ now, flash }) => (
        <>
          <Title>{l.InboxTitle}</Title>
          <div className="mt-3 space-y-2">
            {rows.map((r, i) => (
              <div key={r.req} className={`flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-md border px-3 py-2 text-sm ${hl(flash(at(i), at(i) + 1600))}`}>
                <span className="text-foreground">{r.req}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${i === 2 ? "border border-brand text-brand-hover dark:text-brand" : "bg-muted text-foreground"} ${on(now >= at(i))}`}>{r.tag}</span>
              </div>
            ))}
          </div>
          <p className={`mt-3 text-xs text-muted-foreground ${on(now >= 7800)}`}>{l.Review}</p>
        </>
      )}
      panelBody={({ now }) => (
        <>
          <Title>{l.RulesTitle}</Title>
          {[l.Rule1, l.Rule2, l.Rule3].map((r, i) => (
            <p key={r} className={`rounded-md border px-3 py-2 text-xs text-foreground ${hl(now >= at(i) - 700 && now < at(i) + 900)}`}>{r}</p>
          ))}
        </>
      )}
    />
  );
}

export function ConsultingDemo({ labels: l }: L) {
  const steps = [l.Step1, l.Step2, l.Step3, l.Step4, l.Step5];
  const uses = [l.Use1, l.Use2, l.Use3];
  return (
    <DemoFrame
      labels={l as never}
      panelVariant="pane"
      windowBody={({ now, flash }) => (
        <ol className="space-y-1.5">
          {steps.map((s, i) => {
            const t = 1000 + i * 1800;
            return (
              <li key={s} className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm ${hl(flash(t, t + 1400))}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${now >= t ? "border-brand bg-brand-hover text-white dark:bg-brand dark:text-background" : "text-transparent"} transition-colors motion-reduce:transition-none`}>✓</span>
                <span className="text-foreground">{s}</span>
              </li>
            );
          })}
        </ol>
      )}
      panelBody={({ now, flash }) => (
        <>
          <Title>{l.ShortTitle}</Title>
          {uses.map((u, i) => {
            const t = 3200 + i * 1800;
            return (
              <div key={u} className={`rounded-md border px-3 py-2 text-xs ${hl(flash(t, t + 1400))}`}>
                <p className="text-foreground">{u}</p>
                <p className={`mt-0.5 text-muted-foreground ${on(now >= t)}`}>{i === 2 ? `– ${l.Skip}` : `✓ ${l.Keep}`}</p>
              </div>
            );
          })}
        </>
      )}
    />
  );
}

export function MicrosoftDemo({ labels: l }: L) {
  const steps = [l.Step1, l.Step2, l.Step3];
  const at = (i: number) => 1000 + i * 2600;
  return (
    <DemoFrame
      labels={l as never}
      panelVariant="pane"
      windowBody={({ now }) => (
        <>
          <Title>{l.FlowTitle}</Title>
          <div className="mt-3 flex flex-col items-stretch gap-1.5">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-col items-stretch gap-1.5">
                {i > 0 && <span aria-hidden="true" className="self-center text-xs text-muted-foreground">↓</span>}
                <p className={`rounded-lg border px-3 py-2 text-sm text-foreground ${hl(now >= at(i) && now < at(i) + 2200)}`}>{s}</p>
              </div>
            ))}
          </div>
        </>
      )}
      panelBody={({ now, flash }) => (
        <>
          <Title>{l.LibTitle}</Title>
          <div className={`rounded-md border px-3 py-2 text-xs ${hl(flash(at(1), at(1) + 1600) || flash(at(2), at(2) + 1600))}`}>
            <p className="text-foreground">Offre-Atelier-Morel.docx</p>
            <p className="mt-0.5 text-muted-foreground">
              <Swap a={l.Pending} b={l.Approved} showB={now >= at(2)} />
            </p>
            <p className={`mt-0.5 text-muted-foreground ${on(now >= at(2) + 800)}`}>{l.Notified}</p>
          </div>
        </>
      )}
    />
  );
}
