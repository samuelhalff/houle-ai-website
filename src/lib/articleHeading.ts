// The article page renders its own H1 from the title. Some Markdown bodies
// repeat the title as a leading "# Heading"; drop that line (and only that
// line) when it matches the title, so a real section heading is never lost.

const normalize = (s: string): string =>
  s
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f]+/g, " ")
    .trim();

export function headingMatchesTitle(heading: string, title: string): boolean {
  const h = normalize(heading);
  const t = normalize(title);
  if (!h || !t) return false;
  if (h === t) return true;
  // Containment only counts when the two are of similar length.
  const [short, long] = h.length <= t.length ? [h, t] : [t, h];
  if (long.includes(short) && short.length / long.length >= 0.6) return true;
  const hw = new Set(h.split(" "));
  const tw = new Set(t.split(" "));
  let common = 0;
  hw.forEach((w) => {
    if (tw.has(w)) common++;
  });
  return common / (hw.size + tw.size - common) >= 0.6;
}

export function stripLeadingTitleH1(content: string, title: string): string {
  const m = content.match(/^(?:[ \t]*\n)*[ ]{0,3}#[ \t]+([^\n]*)(\n+|$)/);
  if (!m || !headingMatchesTitle(m[1], title)) return content;
  return content.slice(m[0].length);
}
