// Server-safe: translation keys (under "Demo") needed by each hero scene.
const BASE = ["Label", "Pause", "Play", "Fiction"] as const;
export const DEMO_KEYS = {
  chat: [...BASE, "Tagline", "HoursTitle", "Mon", "TueFri", "SatSun", "HMon", "HTueFri", "HSatSun", "Closed", "User1", "Assistant1", "User2", "Assistant2"],
  outlook: [...BASE, "MailSubject", "MailBody", "PaneTitle", "Prompt", "Action", "Check1", "Check2", "Check3", "Draft", "Attachment", "ReplyTitle"],
  word: [...BASE, "DocTitle", "Clause", "Rewrite", "PaneTitle", "Action", "Hint", "Apply"],
  swissGpt: [...BASE, "Question", "Answer", "SourceLabel", "SourcesTitle", "Doc1", "Doc2", "Doc3", "Tag"],
  agents: [...BASE, "InboxTitle", "Req1", "Req2", "Req3", "Tag1", "Tag2", "Tag3", "RulesTitle", "Rule1", "Rule2", "Rule3", "Review"],
  consulting: [...BASE, "Step1", "Step2", "Step3", "Step4", "Step5", "ShortTitle", "Use1", "Use2", "Use3", "Keep", "Skip"],
  microsoft: [...BASE, "FlowTitle", "Step1", "Step2", "Step3", "LibTitle", "Pending", "Approved", "Notified"],
} as const;

/** Builds the labels object for a scene from the page's translation function. */
export function demoLabels(s: (key: string) => string, keys: readonly string[]): Record<string, string> {
  return Object.fromEntries(keys.map((k) => [k, s(`Demo.${k}`)]));
}
