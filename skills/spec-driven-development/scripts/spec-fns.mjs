#!/usr/bin/env node
// Four building-block primitives. NO stored state — specs+code are the only truth,
// scanned live on every call. The LLM does the editing; this answers the questions
// the LLM can't reliably answer itself.
//
//   node spec-fns.mjs next  <type> [n]      get_next_id  -> mint
//   node spec-fns.mjs loc   <id>            get_id_loc   -> resolve / where
//   node spec-fns.mjs health                health_check -> LLM worklist
//   node spec-fns.mjs sed   <old=new ...>   gen_sed_update -> bulk rewrite cmds

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

// The ONE bit of structure the script must know: per-type id token + definition slot.
const TYPES = {
  req:       { prefix: "REQ",       token: /\bREQ-\d+\b/g,
               def: /^\|\s*(REQ-\d+)\s*\|/ },
  userstory: { prefix: "UserStory", token: /\bUserStory-(?:[a-z0-9-]+-)?\d+\b/g,
               def: /^\s*[-*]\s*(UserStory-(?:[a-z0-9-]+-)?\d+):/ },
  bug:       { prefix: "BUG",       token: /\bBUG-(?:[a-z0-9-]+-)?\d+\b/g,
               def: /^\|\s*(BUG-(?:[a-z0-9-]+-)?\d+)\s*\|/ },
};
const numOf = (id) => Number(id.match(/(\d+)$/)[0]);
const typeOf = (id) => id.startsWith("UserStory") ? "userstory" : id.startsWith("BUG") ? "bug" : "req";

// ---- scan the world once ---------------------------------------------------
function corpus() {
  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith(".") || e.name === "node_modules") continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else {
        const isSpec = /specs\/.*\.md$/.test(full);
        const isCode = /\.(ts|js|svelte|tsx|jsx)$/.test(e.name);
        if (!isSpec && !isCode) continue;
        files.push({
          path: relative(ROOT, full), isSpec,
          isTest: /\.(spec|test|e2e)\./.test(e.name) || full.includes("/e2e/"),
          lines: readFileSync(full, "utf8").split("\n"),
        });
      }
    }
  };
  walk(ROOT);
  return files;
}

// classify every occurrence of an id: def (slot) | ref (code) | link (spec, non-slot)
function locate(id, files) {
  const t = TYPES[typeOf(id)];
  const hits = [];
  for (const f of files) {
    f.lines.forEach((line, i) => {
      if (!line.includes(id)) return;
      const dm = line.match(t.def);
      const kind = dm && dm[1] === id ? "def" : f.isSpec ? "link" : "ref";
      hits.push({ file: f.path, line: i + 1, kind });
    });
  }
  return hits;
}

// ---- 1. get_next_id --------------------------------------------------------
function getNextId(type, n = 1, files = corpus()) {
  const t = TYPES[type];
  let max = 0;
  for (const f of files) for (const line of f.lines)
    for (const m of line.matchAll(t.token)) max = Math.max(max, numOf(m[0]));
  return Array.from({ length: n }, (_, k) => `${t.prefix}-${String(max + 1 + k).padStart(3, "0")}`);
}

// ---- 2. get_id_loc ---------------------------------------------------------
function getIdLoc(id, files = corpus()) { return locate(id, files); }

// ---- 3. health_check -------------------------------------------------------
function health(files = corpus()) {
  const defs = new Map();    // id -> [{file,line}]
  const refs = new Map();    // id -> [{file,line}] (inside @spec blocks, multi-line aware)
  const verify = new Map();  // id -> 'unit'|'e2e'|'manual'|'none' (from the Verify column)
  const ranges = [];         // {file,line,text} — @spec ranges (disallowed under global ids)
  const commentish = (l) => /^\s*(\/\/|\*|\/\*|#|<!--)/.test(l);
  const VERIFY = /^(unit|e2e|manual|none)$/i;
  for (const f of files) {
    let active = false; // inside an @spec comment block (spans continuation lines)
    f.lines.forEach((line, i) => {
      for (const t of Object.values(TYPES)) {
        const dm = line.match(t.def);
        if (!dm) continue;
        (defs.get(dm[1]) ?? defs.set(dm[1], []).get(dm[1])).push({ file: f.path, line: i + 1 });
        const cell = line.split("|").map((c) => c.trim()).find((c) => VERIFY.test(c));
        if (cell) verify.set(dm[1], cell.toLowerCase());
      }
      const hasSpec = line.includes("@spec");
      if (hasSpec) active = true;
      else if (active && !commentish(line)) active = false; // a non-comment line ends the block
      if (active) {
        for (const m of line.matchAll(/\b(?:REQ|UserStory|BUG|ERR|EDGE|DEC)-\d+\.\.\d+/g))
          ranges.push({ file: f.path, line: i + 1, text: m[0] });
        let found = 0;
        for (const t of Object.values(TYPES))
          for (const m of line.matchAll(t.token)) {
            found++;
            (refs.get(m[0]) ?? refs.set(m[0], []).get(m[0])).push({ file: f.path, line: i + 1 });
          }
        if (!hasSpec && commentish(line) && found === 0) active = false; // blank/prose comment ends the block
      }
    });
  }
  const isFuture = (locs) => locs.length > 0 && locs.every((l) => l.file.includes("/future/"));
  const findings = [];
  for (const [id, locs] of defs)
    if (locs.length > 1)
      findings.push({ problem: "multi_home", id, locs, ask: `Defined in ${locs.length} places — which is the real home? (a future/ + features/ split means an unmerged work item).` });
  for (const r of ranges)
    findings.push({ problem: "range", id: r.text, locs: [{ file: r.file, line: r.line }], ask: `Ranges aren't allowed under global ids (the numbers are unrelated) — list the exact ids.` });
  for (const [id, locs] of refs) {
    const home = defs.get(id);
    if (!home) { findings.push({ problem: "dangling", id, locs, ask: `Referenced but defined nowhere — renamed? deleted? typo? Repoint or remove.` }); continue; }
    if (isFuture(home)) findings.push({ problem: "pending_merge", id, locs, ask: `Test references a future/ id — fine while building; clears when the work item merges into features/.` });
  }
  for (const [id, locs] of defs) {
    if (locs.length !== 1 || isFuture(locs) || typeOf(id) === "bug") continue;
    const v = verify.get(id);
    if (v === "manual" || v === "none") continue; // reported separately, not a gap
    if (!(refs.get(id) ?? []).length)
      findings.push({ problem: "uncovered", id, locs, ask: `Defined intent with no test @spec — add a test or set Verify to manual/none.` });
  }
  const manual = [...verify].filter(([, v]) => v === "manual" || v === "none").map(([id]) => id);
  return { defs, refs, findings, manual };
}

// ---- 4. gen_sed_update -----------------------------------------------------
function genSed(pairs, files = corpus()) {
  const cmds = [];
  for (const [oldId, newId] of pairs) {
    const byFile = new Map();
    for (const h of locate(oldId, files)) (byFile.get(h.file) ?? byFile.set(h.file, []).get(h.file)).push(h.line);
    for (const [file, lines] of byFile)
      cmds.push(`sed -i '' 's/\\b${oldId}\\b/${newId}/g' "${file}"   # lines ${lines.join(",")}`);
  }
  return cmds;
}

// ---- CLI -------------------------------------------------------------------
const [, , cmd, ...rest] = process.argv;
if (cmd === "next") {
  console.log(getNextId(rest[0], Number(rest[1]) || 1).join(" "));
} else if (cmd === "loc") {
  const hits = getIdLoc(rest[0]);
  const byKind = (k) => hits.filter((h) => h.kind === k);
  console.log(`${rest[0]}:  ${byKind("def").length} def · ${byKind("ref").length} ref · ${byKind("link").length} link`);
  for (const h of hits.slice(0, 24)) console.log(`  ${h.kind.padEnd(4)} ${h.file}:${h.line}`);
  if (hits.length > 24) console.log(`  … +${hits.length - 24} more`);
} else if (cmd === "health") {
  const { defs, refs, findings, manual } = health();
  const by = (p) => findings.filter((f) => f.problem === p);
  console.log(`indexed: ${defs.size} defined ids · ${refs.size} referenced ids`);
  console.log(`findings: ${by("multi_home").length} multi_home · ${by("dangling").length} dangling · ${by("range").length} range · ${by("pending_merge").length} pending_merge · ${by("uncovered").length} uncovered`);
  console.log(`verify: ${manual.length} ids rely on manual/none (reported, not counted as gaps)\n`);
  for (const p of ["multi_home", "dangling", "range", "pending_merge", "uncovered"]) {
    const items = by(p);
    if (!items.length) continue;
    console.log(`── ${p} (${items.length}) ──`);
    for (const f of items.slice(0, 8))
      console.log(`  ${f.id}  [${[...new Set(f.locs.map((l) => l.file))].slice(0, 3).join(", ")}${f.locs.length > 3 ? " …" : ""}]\n     ↳ ${f.ask}`);
    if (items.length > 8) console.log(`  … +${items.length - 8} more`);
    console.log();
  }
} else if (cmd === "sed") {
  console.log(genSed(rest.map((p) => p.split("="))).join("\n"));
} else {
  console.log("usage: next <type> [n] | loc <id> | health | sed <old=new ...>");
}
