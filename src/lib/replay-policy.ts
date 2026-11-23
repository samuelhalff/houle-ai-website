/**
 * Pages where PostHog session replay never runs, because they carry client
 * data: the contact page (the lead form). Lead forms embedded elsewhere carry
 * the `ph-no-capture` class, which blocks them from replay and autocapture;
 * so does any chat transcript. Same policy as ark-fid.ch. Dependency-free
 * for `node --test`.
 */
const EXCLUDED_HOST_PREFIXES = ["demo."];
const EXCLUDED_PATH = /(^|\/)(contact|agent|chat|admin|portal|onboarding)(\/|$)/;

export function isReplayExcluded(hostname: string, pathname: string): boolean {
  const host = (hostname || "").toLowerCase();
  if (EXCLUDED_HOST_PREFIXES.some((prefix) => host.startsWith(prefix))) return true;
  return EXCLUDED_PATH.test(pathname || "/");
}
