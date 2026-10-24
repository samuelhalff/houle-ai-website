"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { claimNext, runClaimed, claimAndPush, pickStaleArticle, cutoffDate, finalize } = require("./refresh-next-article");

function tmpQueue(obj) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rq-"));
  const file = path.join(dir, "q.json");
  fs.writeFileSync(file, JSON.stringify(obj));
  return file;
}
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const quiet = () => {};
const TODAY = "2026-10-24";

test("cutoffDate is 12 months back", () => {
  assert.equal(cutoffDate(TODAY), "2025-10-24");
});

const statusOf = (dir) => JSON.parse(fs.readFileSync(path.join(dir, ".refresh-run.json"), "utf8"));
function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "rn-"));
}
// claim + run, local only (no git)
function runIn(dir, queue, run, extra = {}) {
  const queueFile = path.join(dir, "q.json");
  const statusFile = path.join(dir, ".refresh-run.json");
  fs.writeFileSync(queueFile, JSON.stringify(queue));
  const claim = claimNext({ queueFile, statusFile, articles: [], today: TODAY, log: quiet, ...extra });
  const out = claim.status === "claimed" ? runClaimed({ statusFile, runRefresh: run, log: quiet }) : claim;
  return { out, claim, queueFile };
}

test("successful refresh leaves the slug in progress (never done before finalize)", () => {
  const dir = tmpDir();
  const calls = [];
  const { out, queueFile } = runIn(dir, { queue: ["a", "b"], done: [], failed: [] }, (s) => (calls.push(s), { ok: true }));
  assert.deepEqual(calls, ["a"]);
  assert.equal(out.status, "started");
  assert.deepEqual(read(queueFile), { queue: ["a", "b"], done: [], failed: [], attempts: { a: 1 } });
  assert.deepEqual(statusOf(dir), { slug: "a", phase: "refresh", ok: true, reason: "" });
});

test("failed or thrown refresh writes ok:false status and stays queued for finalize", () => {
  for (const run of [() => ({ ok: false, reason: "boom" }), () => { throw new Error("boom"); }]) {
    const dir = tmpDir();
    const { out, queueFile } = runIn(dir, { queue: ["a"], done: [], failed: [] }, run);
    assert.equal(out.status, "failed");
    assert.deepEqual(statusOf(dir), { slug: "a", phase: "refresh", ok: false, reason: "boom" });
    assert.deepEqual(read(queueFile).queue, ["a"]);
  }
});

test("claim writes a claimed status (a killed refresh step is finalized as failed)", () => {
  const dir = tmpDir();
  const { claim } = runIn(dir, { queue: ["a"], done: [], failed: [] }, () => assert.fail("not run"), {});
  // runIn ran refresh; re-claim on a fresh dir and inspect the status before refresh
  const d2 = tmpDir();
  const queueFile = path.join(d2, "q.json");
  fs.writeFileSync(queueFile, JSON.stringify({ queue: ["a"], done: [], failed: [] }));
  claimNext({ queueFile, statusFile: path.join(d2, ".refresh-run.json"), articles: [], today: TODAY, log: quiet });
  assert.equal(statusOf(d2).phase, "claimed");
  assert.equal(statusOf(d2).ok, false);
  assert.equal(claim.status, "claimed");
});

test("attempt cap: a slug already started twice is failed, not run again", () => {
  const dir = tmpDir();
  const { out, queueFile } = runIn(dir, { queue: ["a", "b"], done: [], failed: [], attempts: { a: 2 } }, () => assert.fail("must not run"));
  assert.equal(out.status, "capped");
  const q = read(queueFile);
  assert.deepEqual(q.queue, ["b"]);
  assert.equal(q.failed[0].slug, "a");
  assert.match(q.failed[0].reason, /attempt cap/);
  assert.ok(!fs.existsSync(path.join(dir, ".refresh-run.json")));
});

test("empty queue auto-fills with oldest stale live article, skipping blocked and failed", () => {
  const articles = [
    { slug: "old-blocked", date: "2024-01-01" },
    { slug: "old-failed", date: "2024-02-01" },
    { slug: "old-ok", date: "2024-03-01", updated: "2024-03-02" },
    { slug: "old-but-updated", date: "2024-01-05", updated: "2026-09-01" },
    { slug: "recent", date: "2026-05-01" },
  ];
  const f = tmpQueue({ queue: [], done: [], failed: [{ slug: "old-failed", reason: "x" }] });
  const out = claimNext({ queueFile: f, statusFile: path.join(path.dirname(f), ".refresh-run.json"), articles, blocked: new Set(["old-blocked"]), today: TODAY, log: quiet });
  assert.equal(out.slug, "old-ok");
  assert.equal(out.status, "claimed");
  assert.deepEqual(read(f).queue, ["old-ok"]);
});

test("nothing to do: no claim, queue untouched", () => {
  const f = tmpQueue({ queue: [], done: [], failed: [] });
  const out = claimNext({ queueFile: f, articles: [{ slug: "recent", date: "2026-05-01" }], today: TODAY, log: quiet });
  assert.equal(out.status, "nothing");
  assert.deepEqual(read(f), { queue: [], done: [], failed: [] });
});

test("pickStaleArticle ignores missing/invalid dates", () => {
  assert.equal(pickStaleArticle([{ slug: "x" }, { slug: "y", date: "bad" }], { today: TODAY }), null);
});

// ---- finalize, exercised against real git repos (bare remote + clone) ----
const GIT_ENV = { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };
const sh = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", env: GIT_ENV });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
};
const LOCALES = ["fr", "en", "de", "es", "pt"];

function makeRepo(queue) {
  const base = tmpDir();
  const remote = path.join(base, "remote.git");
  const work = path.join(base, "work");
  sh(base, "init", "--bare", "-b", "main", remote);
  fs.mkdirSync(work);
  sh(work, "init", "-b", "main");
  sh(work, "remote", "add", "origin", remote);
  for (const l of LOCALES) {
    fs.mkdirSync(path.join(work, "src", "translations", l), { recursive: true });
    fs.writeFileSync(path.join(work, "src", "translations", l, "ressources.json"), JSON.stringify({ Articles: [{ slug: "a", content: "old" }] }));
  }
  fs.mkdirSync(path.join(work, "data"));
  fs.writeFileSync(path.join(work, "data", "refresh-queue.json"), JSON.stringify(queue));
  fs.writeFileSync(path.join(work, ".gitignore"), ".refresh-run.json\n");
  sh(work, "add", "-A");
  sh(work, "commit", "-m", "init");
  sh(work, "push", "origin", "main");
  return { base, remote, work };
}
const edit = (work, text = "NEW") => {
  for (const l of LOCALES) fs.writeFileSync(path.join(work, "src", "translations", l, "ressources.json"), JSON.stringify({ Articles: [{ slug: "a", content: text }] }));
};
const setStatus = (work, status) => fs.writeFileSync(path.join(work, ".refresh-run.json"), JSON.stringify(status));
const remoteFile = (remote, rel) => spawnSync("git", ["--git-dir", remote, "show", `main:${rel}`], { encoding: "utf8" }).stdout;
const fin = (work, env, extra = {}) =>
  finalize({ root: work, env, today: TODAY, log: quiet, sleep: () => {}, validate: () => null, ...extra });
const QUEUE0 = { queue: ["a", "b"], done: [], failed: [], attempts: { a: 1 } };

test("finalize on success: slug done, translations kept and pushed", () => {
  const { work, remote } = makeRepo(QUEUE0);
  edit(work);
  setStatus(work, { slug: "a", phase: "refresh", ok: true, reason: "" });
  const out = fin(work, { JOB_OK: "true" });
  assert.equal(out.status, "done");
  assert.match(remoteFile(remote, "src/translations/fr/ressources.json"), /NEW/);
  assert.deepEqual(JSON.parse(remoteFile(remote, "data/refresh-queue.json")), { queue: ["b"], done: [{ slug: "a", date: TODAY }], failed: [] });
});

test("finalize on validation failure: files restored, slug failed, never re-queued", () => {
  const { work, remote } = makeRepo(QUEUE0);
  edit(work);
  setStatus(work, { slug: "a", phase: "refresh", ok: true, reason: "" });
  fs.writeFileSync(path.join(work, ".refresh-validate.log"), "Refreshed article \"a\" failed validation:\n- fr: 800 words (min 1200)\n");
  const out = fin(work, { JOB_OK: "false", FAIL_REASON: "validation failure" });
  assert.equal(out.status, "failed");
  assert.match(fs.readFileSync(path.join(work, "src/translations/en/ressources.json"), "utf8"), /old/);
  assert.match(remoteFile(remote, "src/translations/en/ressources.json"), /old/);
  const q = JSON.parse(remoteFile(remote, "data/refresh-queue.json"));
  assert.deepEqual(q.queue, ["b"]);
  assert.equal(q.failed[0].slug, "a");
  assert.match(q.failed[0].reason, /800 words/);
  assert.deepEqual(q.done, []);
  // next run picks b, never a again
  assert.ok(!q.queue.includes("a"));
});

test("finalize when refresh failed or step timed out (status ok:false) restores and fails", () => {
  const { work, remote } = makeRepo(QUEUE0);
  edit(work);
  setStatus(work, { slug: "a", phase: "refresh", ok: false, reason: "refresh step did not complete (timeout or crash)" });
  const out = fin(work, { JOB_OK: "true" });
  assert.equal(out.status, "failed");
  assert.match(remoteFile(remote, "src/translations/fr/ressources.json"), /old/);
  assert.match(JSON.parse(remoteFile(remote, "data/refresh-queue.json")).failed[0].reason, /timeout/);
});

test("finalize with no recorded run does nothing", () => {
  const { work } = makeRepo(QUEUE0);
  assert.equal(fin(work, { JOB_OK: "true" }).status, "nothing");
});

const claimIn = (work, extra = {}) => claimAndPush({ root: work, articles: [], today: TODAY, log: quiet, sleep: () => {}, ...extra });
const headMsg = (cwd, ref = "HEAD") => sh(cwd, "log", "-1", "--format=%s", ref);

test("claim is committed + pushed ([skip ci]) before any model call, and survives a lost runner", () => {
  const { work, remote } = makeRepo({ queue: ["a", "b"], done: [], failed: [], attempts: {} });
  const out = claimIn(work);
  assert.equal(out.status, "claimed");
  assert.deepEqual(JSON.parse(remoteFile(remote, "data/refresh-queue.json")).attempts, { a: 1 });
  assert.match(spawnSync("git", ["--git-dir", remote, "log", "-1", "--format=%s", "main"], { encoding: "utf8" }).stdout, /claim refresh of a.*\[skip ci\]/);
  // runner dies; a fresh checkout sees the attempt
  const fresh = path.join(path.dirname(work), "fresh");
  sh(path.dirname(work), "clone", remote, fresh);
  assert.equal(claimIn(fresh).attempt, 2);
  const fresh2 = path.join(path.dirname(work), "fresh2");
  sh(path.dirname(work), "clone", remote, fresh2);
  const capped = claimIn(fresh2);
  assert.equal(capped.status, "capped");
  const q = JSON.parse(remoteFile(remote, "data/refresh-queue.json"));
  assert.equal(q.failed[0].slug, "a");
  assert.deepEqual(q.queue, ["b"]);
  assert.match(spawnSync("git", ["--git-dir", remote, "log", "-1", "--format=%s", "main"], { encoding: "utf8" }).stdout, /\[skip ci\]/);
});

test("claim that cannot be pushed aborts without a model call and leaves nothing changed", () => {
  const { work } = makeRepo({ queue: ["a"], done: [], failed: [], attempts: {} });
  sh(work, "remote", "set-url", "origin", path.join(work, "nope.git"));
  const head = sh(work, "rev-parse", "HEAD");
  let sleeps = 0;
  const out = claimIn(work, { sleep: () => sleeps++ });
  assert.equal(out.status, "aborted");
  assert.equal(sleeps, 2);
  assert.equal(sh(work, "rev-parse", "HEAD"), head);
  assert.equal(sh(work, "status", "--porcelain"), "");
  assert.ok(!fs.existsSync(path.join(work, ".refresh-run.json")));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(work, "data", "refresh-queue.json"), "utf8")), { queue: ["a"], done: [], failed: [], attempts: {} });
});

test("commit messages: failure is [skip ci], success is not", () => {
  const ok = makeRepo(QUEUE0);
  edit(ok.work);
  setStatus(ok.work, { slug: "a", phase: "refresh", ok: true, reason: "" });
  fin(ok.work, { JOB_OK: "true" });
  assert.doesNotMatch(headMsg(ok.work), /skip ci/);
  const bad = makeRepo(QUEUE0);
  setStatus(bad.work, { slug: "a", phase: "refresh", ok: false, reason: "x" });
  fin(bad.work, { JOB_OK: "true" });
  assert.match(headMsg(bad.work), /failed \[skip ci\]$/);
});

test("success path rebases onto moved origin and re-validates against origin/main", () => {
  const { work, remote, base } = makeRepo(QUEUE0);
  const other = path.join(base, "other");
  sh(base, "clone", remote, other);
  fs.writeFileSync(path.join(other, "README"), "x");
  sh(other, "add", "-A");
  sh(other, "commit", "-m", "other");
  sh(other, "push", "origin", "main");
  edit(work);
  setStatus(work, { slug: "a", phase: "refresh", ok: true, reason: "" });
  const seen = [];
  const out = fin(work, { JOB_OK: "true" }, { validate: (slug, ref) => (seen.push([slug, ref]), null) });
  assert.equal(out.status, "done");
  assert.deepEqual(seen, [["a", "origin/main"]]);
  assert.match(remoteFile(remote, "README"), /x/);
});

test("validation failing after rebase drops the translations and records the failure", () => {
  const { work, remote, base } = makeRepo(QUEUE0);
  const other = path.join(base, "other");
  sh(base, "clone", remote, other);
  fs.writeFileSync(path.join(other, "README"), "x");
  sh(other, "add", "-A");
  sh(other, "commit", "-m", "other");
  sh(other, "push", "origin", "main");
  edit(work);
  setStatus(work, { slug: "a", phase: "refresh", ok: true, reason: "" });
  const out = fin(work, { JOB_OK: "true" }, { validate: () => "broken link" });
  assert.equal(out.status, "failed");
  assert.match(remoteFile(remote, "src/translations/fr/ressources.json"), /old/);
  const q = JSON.parse(remoteFile(remote, "data/refresh-queue.json"));
  assert.equal(q.failed[0].slug, "a");
  assert.match(q.failed[0].reason, /broken link/);
  assert.deepEqual(q.done, []);
});

test("push that never succeeds exits non-zero after 3 bounded attempts", () => {
  const { work } = makeRepo(QUEUE0);
  sh(work, "remote", "set-url", "origin", path.join(work, "nope.git"));
  edit(work);
  setStatus(work, { slug: "a", phase: "refresh", ok: true, reason: "" });
  let sleeps = 0;
  assert.throws(() => fin(work, { JOB_OK: "true" }, { sleep: () => sleeps++ }), /push failed after 3 attempts/);
  assert.equal(sleeps, 2);
});
