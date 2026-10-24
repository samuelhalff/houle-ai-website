"use strict";
// Minimal TypeScript loader for node:test files, so the real src/lib helpers run unmodified.
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const loaded = new Map();

function loadTs(file) {
  if (loaded.has(file)) return loaded.get(file).exports;
  const out = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const mod = { exports: {} };
  loaded.set(file, mod);
  const localRequire = (spec) => {
    if (spec.startsWith(".")) {
      const base = path.resolve(path.dirname(file), spec);
      if (fs.existsSync(base + ".ts")) return loadTs(base + ".ts");
      return require(base);
    }
    if (spec === "react") return { cache: (fn) => fn }; // server-only memoisation
    return require(spec);
  };
  new Function("exports", "require", "module", "__filename", "__dirname", out)(
    mod.exports,
    localRequire,
    mod,
    file,
    path.dirname(file),
  );
  return mod.exports;
}

module.exports = { loadTs };
