/**
 * Runs `fn` once: on the first user interaction, or `fallbackMs` after the
 * load event for visitors who only read. Keeps third-party analytics out of
 * the first-paint work.
 */
const EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

export function afterFirstInteraction(fn: () => void, fallbackMs = 15000): void {
  if (typeof window === "undefined") return;
  let done = false;
  let timer: number | undefined;
  const run = () => {
    if (done) return;
    done = true;
    for (const e of EVENTS) window.removeEventListener(e, run);
    if (timer !== undefined) window.clearTimeout(timer);
    fn();
  };
  for (const e of EVENTS) window.addEventListener(e, run, { passive: true, once: true });
  const arm = () => {
    timer = window.setTimeout(run, fallbackMs);
  };
  if (document.readyState === "complete") arm();
  else window.addEventListener("load", arm, { once: true });
}
