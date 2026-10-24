#!/usr/bin/env node
"use strict";
// Autonomous article refresh, three phases (every run must end in a committed terminal queue state):
//   --claim     picks the next slug, records attempts[slug] and COMMITS + PUSHES that queue-only
//               claim ("[skip ci]") BEFORE any model call, so the attempt cap survives killed
//               runners and failed final pushes. If the claim cannot be pushed (3 bounded tries)
//               the run aborts with exit 0 and the model is never called. A slug already at the
//               cap is marked failed and that terminal state is pushed (queue-only).
//   --refresh   runs `ai-ressources-update.js --refresh=<slug> --apply` for the claimed slug,
//               writes .refresh-run.json ({slug, phase, ok, reason}); slug stays "in progress".
//   --finalize  runs in an `if: always()` workflow step after
//       the validators: success -> slug moves to `done`, translations kept; anything else ->
//       translations restored, slug moves to `failed` (never re-queued). Then commit + bounded push.
// Queue empty -> auto-fills with the oldest live article last touched (updated ?? date) > 12 months ago.
// `attempts` in the queue file caps how often a slug may be started (MAX_ATTEMPTS).
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const QUEUE_PATH = path.join(ROOT, "data", "refresh-queue.json");
const FR_PATH = path.join(ROOT, "src", "translations", "fr", "ressources.json");
const STATUS_PATH = path.join(ROOT, ".refresh-run.json");
const MAX_AGE_MONTHS = 12;
const MAX_ATTEMPTS = 2;
const MAX_PUSH_TRIES = 3;
const TRANSLATION_DIR = "src/translations";
const QUEUE_REL = "data/refresh-queue.json";
// Queue-only commits (claims, terminal failures) must not trigger CI/deploy; the success commit must.
const SKIP_CI = "[skip ci]";

function loadQueue(file = QUEUE_PATH) {
  const base = { queue: [], done: [], failed: [], attempts: {} };
  if (!fs.existsSync(file)) return base;
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  return {
    queue: Array.isArray(raw.queue) ? raw.queue : [],
    done: Array.isArray(raw.done) ? raw.done : [],
    failed: Array.isArray(raw.failed) ? raw.failed : [],
    attempts: raw.attempts && typeof raw.attempts === "object" ? raw.attempts : {},
  };
}

function saveQueue(state, file = QUEUE_PATH) {
  state = { ...state };
  if (!Object.keys(state.attempts || {}).length) delete state.attempts;
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`);
}

function cutoffDate(today, months = MAX_AGE_MONTHS) {
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}

/** Oldest live article with (updated ?? date) before the cutoff, or null. */
function pickStaleArticle(articles, { today, blocked = new Set(), exclude = new Set() }) {
  const cutoff = cutoffDate(today);
  const candidates = articles
    .filter((a) => a && a.slug && !blocked.has(a.slug) && !exclude.has(a.slug))
    .map((a) => ({ slug: a.slug, stamp: String(a.updated || a.date || "") }))
    .filter((a) => /^\d{4}-\d{2}-\d{2}$/.test(a.stamp) && a.stamp < cutoff)
    .sort((x, y) => x.stamp.localeCompare(y.stamp) || x.slug.localeCompare(y.slug));
  return candidates.length ? candidates[0].slug : null;
}

function loadBlockedSlugs(root = ROOT) {
  const blocked = new Set();
  const cons = path.join(root, "src", "data", "articles-consolidated.json");
  if (fs.existsSync(cons)) Object.keys(JSON.parse(fs.readFileSync(cons, "utf8"))).forEach((s) => blocked.add(s));
  const red = path.join(root, "src", "data", "articles-redirected-to-ark.json");
  if (fs.existsSync(red)) {
    Object.keys(JSON.parse(fs.readFileSync(red, "utf8"))).forEach((k) => blocked.add(k.slice(k.indexOf("/") + 1)));
  }
  return blocked;
}

function defaultRunRefresh(slug) {
  const res = spawnSync(
    process.execPath,
    [path.join(__dirname, "ai-ressources-update.js"), `--refresh=${slug}`, "--apply"],
    { cwd: ROOT, encoding: "utf8", env: process.env, maxBuffer: 64 * 1024 * 1024 },
  );
  process.stdout.write(res.stdout || "");
  process.stderr.write(res.stderr || "");
  if (res.status === 0) return { ok: true };
  const text = `${res.stderr || ""}\n${res.stdout || ""}`.trim().split("\n").filter(Boolean);
  const reason = (text.reverse().find((l) => /refresh|error/i.test(l)) || text[0] || `exit ${res.status}`).slice(0, 500);
  return { ok: false, reason };
}

function writeStatus(file, status) {
  fs.writeFileSync(file, `${JSON.stringify(status)}\n`);
}

function readStatus(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function markFailed(state, slug, today, reason) {
  state.queue = state.queue.filter((s) => s !== slug);
  delete state.attempts[slug];
  state.failed.push({ slug, date: today, reason: String(reason || "unknown").slice(0, 500) });
}

function markDone(state, slug, today) {
  state.queue = state.queue.filter((s) => s !== slug);
  delete state.attempts[slug];
  state.done.push({ slug, date: today });
}

/**
 * Phase 1a (local part of --claim): pick the slug and record the attempt in the queue file.
 * Returns { status: "nothing"|"claimed"|"capped", slug?, attempt?, reason? }. A "capped" slug is
 * already marked failed in the queue file (terminal; the caller must push it).
 */
function claimNext({ queueFile = QUEUE_PATH, statusFile = STATUS_PATH, articles, blocked = new Set(), today, log = console.log }) {
  const state = loadQueue(queueFile);
  if (!state.queue.length) {
    const exclude = new Set(state.failed.map((f) => (typeof f === "string" ? f : f.slug)));
    const stale = pickStaleArticle(articles, { today, blocked, exclude });
    if (!stale) {
      log("Nothing to do: queue empty and no live article older than 12 months.");
      return { status: "nothing" };
    }
    log(`Queue empty: auto-filling with ${stale}`);
    state.queue.push(stale);
  }
  const slug = state.queue[0];
  const attempt = (state.attempts[slug] || 0) + 1;
  if (attempt > MAX_ATTEMPTS) {
    const reason = `attempt cap reached (${MAX_ATTEMPTS})`;
    markFailed(state, slug, today, reason);
    saveQueue(state, queueFile);
    fs.rmSync(statusFile, { force: true });
    log(`Refresh skipped for ${slug}: ${reason}`);
    return { status: "capped", slug, reason };
  }
  state.attempts[slug] = attempt;
  saveQueue(state, queueFile);
  // A run killed by the step timeout leaves this "claimed" record: finalize treats it as failed.
  writeStatus(statusFile, { slug, phase: "claimed", ok: false, reason: "refresh step did not complete (timeout or crash)" });
  log(`Claimed ${slug} (attempt ${attempt}/${MAX_ATTEMPTS})`);
  return { status: "claimed", slug, attempt };
}

/** Phase 2 (--refresh), dependency-injected for tests. Never marks `done`. */
function runClaimed({ statusFile = STATUS_PATH, runRefresh = defaultRunRefresh, log = console.log } = {}) {
  const claimed = readStatus(statusFile);
  if (!claimed || claimed.phase !== "claimed" || !claimed.slug) {
    log("Refresh: no claimed slug, nothing to do.");
    return { status: "nothing" };
  }
  const { slug } = claimed;
  let result;
  try {
    result = runRefresh(slug);
  } catch (err) {
    result = { ok: false, reason: String(err && err.message ? err.message : err).slice(0, 500) };
  }
  writeStatus(statusFile, { slug, phase: "refresh", ok: Boolean(result.ok), reason: result.ok ? "" : result.reason || "unknown" });
  if (result.ok) log(`Refreshed ${slug} (pending validation)`);
  else log(`Refresh failed for ${slug}: ${result.reason}`);
  return { status: result.ok ? "started" : "failed", slug, reason: result.reason };
}

function defaultGit(root) {
  return (args, { allowFail = false } = {}) => {
    const res = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    if (res.status !== 0 && !allowFail) {
      throw new Error(`git ${args.join(" ")} failed: ${(res.stderr || res.stdout || "").trim().slice(0, 300)}`);
    }
    return { ok: res.status === 0, out: (res.stdout || "").trim() };
  };
}

function defaultValidate(root) {
  return (slug, base) => {
    const res = spawnSync(
      process.execPath,
      [path.join(__dirname, "validate-refreshed-article.js"), `--slug=${slug}`, `--base=${base}`],
      { cwd: root, encoding: "utf8", env: process.env },
    );
    return res.status === 0 ? null : (res.stderr || res.stdout || "validation failed").trim().slice(0, 500);
  };
}

function commitPaths(git, message, paths) {
  git(["config", "--local", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
  git(["config", "--local", "user.name", "github-actions[bot]"]);
  git(["add", ...paths]);
  if (git(["diff", "--cached", "--quiet"], { allowFail: true }).ok) return false;
  git(["commit", "-m", message, "--author=samuelhalff <660062+samuelhalff@users.noreply.github.com>"]);
  return true;
}

/**
 * Bounded fetch/rebase/push (MAX_PUSH_TRIES). With `validate` (success path) the result is
 * re-validated after each rebase. Throws on exhaustion, or with code REVALIDATE.
 */
function pushBounded({ git, slug, validate, sleep, log }) {
  let lastErr = "";
  for (let i = 1; i <= MAX_PUSH_TRIES; i++) {
    const fetched = git(["fetch", "origin", "main"], { allowFail: true });
    if (fetched.ok) {
      const rebased = git(["rebase", "origin/main"], { allowFail: true });
      if (!rebased.ok) {
        git(["rebase", "--abort"], { allowFail: true });
        lastErr = "rebase conflict";
      } else {
        if (validate) {
          const problem = validate(slug, "origin/main");
          if (problem) throw Object.assign(new Error(problem), { code: "REVALIDATE" });
        }
        if (git(["push", "origin", "HEAD:main"], { allowFail: true }).ok) return true;
        lastErr = "push rejected";
      }
    } else lastErr = "fetch failed";
    log(`push attempt ${i}/${MAX_PUSH_TRIES} failed (${lastErr})`);
    if (i < MAX_PUSH_TRIES) sleep();
  }
  throw new Error(`push failed after ${MAX_PUSH_TRIES} attempts (${lastErr})`);
}

const defaultSleep = () => spawnSync("sleep", ["5"]);

/**
 * --claim: claim locally, then commit + push the queue-only claim ("[skip ci]") before any model
 * call. If the push cannot be completed the claim is undone locally and status is "aborted": the
 * caller must exit 0 without running the model. Returns { status: "nothing"|"claimed"|"capped"|"aborted", slug? }.
 */
function claimAndPush({ root = ROOT, today, articles, blocked = new Set(), git = defaultGit(root), sleep = defaultSleep, log = console.log } = {}) {
  const queueFile = path.join(root, QUEUE_REL);
  const statusFile = path.join(root, ".refresh-run.json");
  const out = claimNext({ queueFile, statusFile, articles, blocked, today, log });
  if (out.status === "nothing") return out;
  const message =
    out.status === "capped"
      ? `chore(ressources): refresh queue, ${out.slug} failed (attempt cap) ${SKIP_CI}`
      : `chore(ressources): claim refresh of ${out.slug} (attempt ${out.attempt}) ${SKIP_CI}`;
  const committed = commitPaths(git, message, [QUEUE_REL]);
  try {
    if (committed) pushBounded({ git, slug: out.slug, sleep, log });
  } catch (err) {
    // Not durable: undo the claim so nothing changed, and tell the caller not to call the model.
    if (committed) git(["reset", "--hard", "HEAD~1"], { allowFail: true });
    else git(["checkout", "--", QUEUE_REL], { allowFail: true });
    fs.rmSync(statusFile, { force: true });
    log(`Claim not pushed (${err.message}); aborting without calling the model.`);
    return { status: "aborted", slug: out.slug, reason: err.message };
  }
  return out;
}

/**
 * Phase 2. Terminal in every case: slug ends in `done` or `failed`, and the result is committed
 * and pushed (bounded fetch/rebase/push loop). Returns { status: "done"|"failed"|"nothing", slug, pushed }.
 * Throws only when the final push cannot be completed.
 */
function finalize({
  root = ROOT,
  env = process.env,
  today,
  git = defaultGit(root),
  validate = defaultValidate(root),
  sleep = defaultSleep,
  log = console.log,
} = {}) {
  const queueFile = path.join(root, QUEUE_REL);
  const statusFile = path.join(root, ".refresh-run.json");
  const status = readStatus(statusFile);
  if (!status || !status.slug) {
    log("Finalize: no refresh run recorded, nothing to do.");
    return { status: "nothing", pushed: false };
  }
  const slug = status.slug;
  let failReason = null;
  if (!status.ok) failReason = `refresh: ${status.reason || "unknown"}`;
  else if (String(env.JOB_OK) !== "true") {
    failReason = env.FAIL_REASON || "validation step failed";
    try {
      const lines = fs.readFileSync(path.join(root, ".refresh-validate.log"), "utf8").trim().split("\n");
      const detail = lines.find((l) => l.startsWith("- ")) || lines.find((l) => /failed|error/i.test(l));
      if (detail) failReason = `${failReason}: ${detail.replace(/^- /, "")}`;
    } catch {
      // no validator log
    }
  }

  /** Failure path: translations restored, queue-only commit. Re-usable after a reset to origin. */
  const failPath = (reason) => {
    git(["checkout", "--", TRANSLATION_DIR], { allowFail: true });
    const state = loadQueue(queueFile);
    if (!state.failed.some((f) => f && f.slug === slug)) markFailed(state, slug, today, reason);
    saveQueue(state, queueFile);
    log(`Finalize: ${slug} failed (${reason})`);
    const committed = commitPaths(git, `chore(ressources): refresh queue, ${slug} failed ${SKIP_CI}`, [QUEUE_REL]);
    if (committed) pushBounded({ git, slug, sleep, log });
    return { status: "failed", slug, reason, pushed: committed };
  };

  if (failReason) return failPath(failReason);

  const state = loadQueue(queueFile);
  markDone(state, slug, today);
  saveQueue(state, queueFile);
  commitPaths(git, `chore(ressources): refresh article ${slug}`, [QUEUE_REL, `${TRANSLATION_DIR}/*/ressources.json`]);
  try {
    pushBounded({ git, slug, validate, sleep, log });
  } catch (err) {
    if (err.code !== "REVALIDATE") throw err;
    // Origin moved and the rebased result no longer validates: drop our commit, record the failure.
    git(["reset", "--hard", "origin/main"]);
    return failPath(`validation after rebase: ${err.message}`);
  }
  log(`Finalize: ${slug} done`);
  return { status: "done", slug, pushed: true };
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  if (process.argv.includes("--finalize")) {
    try {
      const out = finalize({ today });
      if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `status=${out.status}\nslug=${out.slug || ""}\n`);
    } catch (err) {
      console.error(`::error::finalize failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }
  const emit = (out) => {
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `status=${out.status}\nslug=${out.slug || ""}\n`);
  };
  if (process.argv.includes("--refresh")) {
    const out = runClaimed({});
    emit(out);
    if (out.status === "failed") console.log(`::warning::refresh failed for ${out.slug}: ${out.reason}`);
    return;
  }
  if (process.argv.includes("--claim")) {
    const articles = JSON.parse(fs.readFileSync(FR_PATH, "utf8")).Articles || [];
    const out = claimAndPush({ articles, blocked: loadBlockedSlugs(), today });
    emit(out);
    if (out.status === "aborted") console.log(`::warning::claim for ${out.slug} not pushed (${out.reason}); model not called`);
    return;
  }
  console.error("usage: refresh-next-article.js --claim | --refresh | --finalize");
  process.exit(2);
}

if (require.main === module) main();

module.exports = { loadQueue, saveQueue, cutoffDate, pickStaleArticle, loadBlockedSlugs, claimNext, runClaimed, claimAndPush, finalize, MAX_ATTEMPTS };
