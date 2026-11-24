import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { isReplayExcluded } from "./replay-policy.ts";

test("no session replay on pages with client data", () => {
  assert.equal(isReplayExcluded("houle.ai", "/fr/contact/"), true);
  assert.equal(isReplayExcluded("houle.ai", "/en/contact"), true);
  assert.equal(isReplayExcluded("demo.houle.ai", "/le-petit-comptoir/"), true);
  assert.equal(isReplayExcluded("houle.ai", "/fr/"), false);
  assert.equal(isReplayExcluded("houle.ai", "/fr/services/ai-consulting/"), false);
  assert.equal(isReplayExcluded("houle.ai", "/fr/ressources/contacts-et-crm/"), false);
});

test("PostHog loads late, masks inputs and follows consent", () => {
  const lazy = readFileSync(new URL("./posthog-lazy.ts", import.meta.url), "utf8");
  assert.match(lazy, /await import\("posthog-js"\)/, "posthog-js is imported dynamically");
  assert.match(lazy, /afterFirstInteraction\(/, "on the first interaction, or late for readers");
  assert.match(lazy, /requestIdleCallback/, "in idle time");
  assert.match(lazy, /maskAllInputs: true/);
  assert.match(lazy, /blockSelector: "\.ph-no-capture"/);
  assert.match(lazy, /hasEffectiveConsent\(\) \? "localStorage\+cookie" : "memory"/);
  assert.match(lazy, /disable_session_recording: true/, "replay only through syncSessionRecording");
  const form = readFileSync(new URL("../components/ui/contact-form.tsx", import.meta.url), "utf8");
  assert.match(form, /className="ph-no-capture /, "contact form is blocked from replay and autocapture");
});
