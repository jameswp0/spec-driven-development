#!/usr/bin/env node
/**
 * validate-specs.mjs — mechanical validation of spec-driven-development spec directories.
 *
 * Deterministic checks only; judgment calls (stale content, vague wording) belong
 * to the LLM spec health check.
 *
 * Layout validated: <spec-dir>/overview.md plus <spec-dir>/features/*.md
 *
 * Rules:
 *   1. ERROR  userstory-format   `- UserStory-...` lines must match `UserStory-[a-z0-9-]+-\d\d:`
 *             userstory-mixed    WARN if one file mixes feature codes
 *   2. ERROR  userstory-dup      duplicate UserStory IDs within or across files
 *   3. ERROR  req-format/req-dup REQ IDs in Requirements tables must match REQ-\d+, no duplicates
 *             WARN  req-gap      non-sequential REQ numbering (gaps)
 *   4. WARN   bug-format         Known Issues IDs not matching BUG-[a-z0-9-]+-\d\d
 *   5. ERROR  missing-section    required feature sections: User Stories, Out of Scope,
 *                                Requirements, Error Cases, Edge Cases, Changelog
 *   6. WARN   few-rows           fewer than 3 data rows in Error Cases / Edge Cases tables
 *   7. WARN   empty-cell         empty markdown table cells (separator rows ignored)
 *   8. ERROR  broken-link        overview.md Features table links must resolve to existing files
 *   9. WARN   orphan-spec        files in features/ not linked from overview's Features table
 *  10. ERROR  broken-spec-ref    @spec references in test files must point to an existing spec
 *                                file containing the referenced UserStory ID(s)
 *
 * Usage: node validate-specs.mjs [spec-dir] [--json]
 *   spec-dir defaults to `specs/`, falling back to `app_spec/` (relative to cwd).
 *   --json prints findings as a JSON array of {level, file, line, rule, message}.
 *   Exit code 1 if any ERROR, else 0.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const USERSTORY_ID = /^UserStory-([a-z0-9-]+)-\d\d$/;
const REQUIRED_SECTIONS = [
  "## User Stories",
  "## Out of Scope",
  "## Requirements",
  "## Error Cases",
  "## Edge Cases",
  "## Changelog",
];

const findings = [];

function add(level, file, line, rule, message) {
  findings.push({ level, file: relative(process.cwd(), file), line, rule, message });
}

// --- Markdown helpers -------------------------------------------------------

// Reads a file into lines, with a parallel array marking lines inside ``` fences.
function loadDoc(file) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  const inFence = [];
  let fence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      fence = !fence;
      inFence.push(true); // fence delimiters themselves are ignored too
    } else {
      inFence.push(fence);
    }
  }
  return { file, lines, inFence };
}

// Returns [start, end) line range of the section with the given `## Heading`,
// or null if absent. End is the next `## ` heading or EOF.
function sectionRange(doc, heading) {
  for (let i = 0; i < doc.lines.length; i++) {
    if (doc.inFence[i] || doc.lines[i].trim() !== heading) continue;
    let end = doc.lines.length;
    for (let j = i + 1; j < doc.lines.length; j++) {
      if (!doc.inFence[j] && /^## /.test(doc.lines[j])) { end = j; break; }
    }
    return [i + 1, end];
  }
  return null;
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

const isSeparatorRow = (cells) => cells.every((c) => /^:?-+:?$/.test(c));

// Groups consecutive `|` lines into tables: [{ rows: [{line, cells}] }]
// Rows are data rows only (header + separator stripped).
function tablesIn(doc, start, end) {
  const tables = [];
  let current = null;
  for (let i = start; i < end; i++) {
    if (!doc.inFence[i] && /^\s*\|/.test(doc.lines[i])) {
      const cells = splitRow(doc.lines[i]);
      if (!current) {
        current = { allRows: [] };
        tables.push(current);
      }
      current.allRows.push({ line: i, cells });
    } else {
      current = null;
    }
  }
  for (const t of tables) {
    t.rows = t.allRows.slice(1).filter((r) => !isSeparatorRow(r.cells));
  }
  return tables;
}

// --- Per-file checks --------------------------------------------------------

function checkFeatureSpec(doc, storyIndex) {
  // Rule 5: required sections
  for (const heading of REQUIRED_SECTIONS) {
    if (!sectionRange(doc, heading)) {
      add("ERROR", doc.file, null, "missing-section", `missing required section "${heading}"`);
    }
  }

  // Rules 1 + 2: UserStory ID format, mixed feature codes, duplicates
  const codes = new Set();
  for (let i = 0; i < doc.lines.length; i++) {
    if (doc.inFence[i]) continue;
    const m = doc.lines[i].match(/^\s*- (UserStory-[^\s:]*)(:?)/);
    if (!m) continue;
    const [, id, colon] = m;
    const idMatch = id.match(USERSTORY_ID);
    if (!idMatch || colon !== ":") {
      add("ERROR", doc.file, i + 1, "userstory-format",
        `"${id}" does not match UserStory-[a-z0-9-]+-NN: format`);
    } else {
      codes.add(idMatch[1]);
    }
    const seen = storyIndex.get(id);
    if (seen) {
      add("ERROR", doc.file, i + 1, "userstory-dup",
        `duplicate UserStory ID "${id}" (first defined at ${seen.file}:${seen.line})`);
    } else {
      storyIndex.set(id, { file: relative(process.cwd(), doc.file), line: i + 1 });
    }
  }
  if (codes.size > 1) {
    add("WARN", doc.file, null, "userstory-mixed",
      `file mixes feature codes: ${[...codes].sort().join(", ")}`);
  }

  // Rule 3: REQ IDs
  const reqRange = sectionRange(doc, "## Requirements");
  if (reqRange) {
    const numbers = [];
    const seen = new Set();
    for (const table of tablesIn(doc, ...reqRange)) {
      for (const row of table.rows) {
        const id = row.cells[0] ?? "";
        const m = id.match(/^REQ-(\d+)$/);
        if (!m) {
          add("ERROR", doc.file, row.line + 1, "req-format",
            `requirement ID "${id}" does not match REQ-<number>`);
          continue;
        }
        if (seen.has(id)) {
          add("ERROR", doc.file, row.line + 1, "req-dup", `duplicate requirement ID "${id}"`);
        }
        seen.add(id);
        numbers.push(Number(m[1]));
      }
    }
    const sorted = [...new Set(numbers)].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        add("WARN", doc.file, null, "req-gap",
          `non-sequential REQ numbering: gap between REQ-${sorted[i - 1]} and REQ-${sorted[i]}`);
      }
    }
  }

  // Rule 4: BUG IDs in Known Issues tables
  const bugRange = sectionRange(doc, "## Known Issues");
  if (bugRange) {
    for (const table of tablesIn(doc, ...bugRange)) {
      for (const row of table.rows) {
        const id = row.cells[0] ?? "";
        if (!/^BUG-[a-z0-9-]+-\d\d$/.test(id)) {
          add("WARN", doc.file, row.line + 1, "bug-format",
            `bug ID "${id}" does not match BUG-[a-z0-9-]+-NN`);
        }
      }
    }
  }

  // Rule 6: minimum rows in Error Cases / Edge Cases
  for (const heading of ["## Error Cases", "## Edge Cases"]) {
    const range = sectionRange(doc, heading);
    if (!range) continue;
    const rowCount = tablesIn(doc, ...range).reduce((n, t) => n + t.rows.length, 0);
    if (rowCount < 3) {
      add("WARN", doc.file, null, "few-rows",
        `"${heading}" table has ${rowCount} data row(s); expected at least 3`);
    }
  }
}

// Rule 7: empty table cells anywhere in any spec file
function checkEmptyCells(doc) {
  for (const table of tablesIn(doc, 0, doc.lines.length)) {
    for (const row of table.allRows) {
      if (isSeparatorRow(row.cells)) continue;
      row.cells.forEach((cell, idx) => {
        if (cell === "") {
          add("WARN", doc.file, row.line + 1, "empty-cell", `empty table cell (column ${idx + 1})`);
        }
      });
    }
  }
}

// Rules 8 + 9: overview Features table links resolve; no orphan feature specs
function checkOverviewLinks(doc, featureFiles) {
  const range = sectionRange(doc, "## Features");
  if (!range) {
    add("WARN", doc.file, null, "missing-section", 'overview.md has no "## Features" section');
    return;
  }
  const linked = new Set();
  for (const table of tablesIn(doc, ...range)) {
    for (const row of table.rows) {
      for (const m of row.cells.join(" ").matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const target = m[1].split("#")[0];
        if (!target || /^[a-z]+:\/\//i.test(target)) continue;
        const resolved = resolve(dirname(doc.file), target);
        if (existsSync(resolved)) {
          linked.add(resolved);
        } else {
          add("ERROR", doc.file, row.line + 1, "broken-link",
            `Features table link "${m[1]}" does not resolve to an existing file`);
        }
      }
    }
  }
  for (const file of featureFiles) {
    if (!linked.has(resolve(file))) {
      add("WARN", file, null, "orphan-spec",
        `not linked from overview.md's Features table`);
    }
  }
}

// Rule 10: @spec references in test files
function checkSpecRefs(root) {
  const testFiles = [];
  (function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(spec|test)\.(ts|tsx|js|jsx)$/.test(entry.name)) testFiles.push(full);
    }
  })(root);
  if (testFiles.length === 0) return; // skip silently

  const specCache = new Map();
  for (const testFile of testFiles) {
    const lines = readFileSync(testFile, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      const m = line.match(/@spec\s+([^\s:]+):(\S.*)/);
      if (!m) return;
      const specPath = resolve(root, m[1]);
      if (!specCache.has(specPath)) {
        specCache.set(specPath, existsSync(specPath) ? readFileSync(specPath, "utf8") : null);
      }
      const specContent = specCache.get(specPath);
      if (specContent === null) {
        add("ERROR", testFile, i + 1, "broken-spec-ref",
          `@spec path "${m[1]}" does not exist`);
        return;
      }
      for (const id of m[2].split(",").map((s) => s.trim()).filter(Boolean)) {
        if (!specContent.includes(id)) {
          add("ERROR", testFile, i + 1, "broken-spec-ref",
            `UserStory ID "${id}" not found in ${m[1]}`);
        }
      }
    });
  }
}

// --- Main -------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const dirArg = args.find((a) => !a.startsWith("--"));

  let specDir;
  if (dirArg) {
    specDir = resolve(dirArg);
  } else {
    specDir = ["specs", "app_spec"].map((d) => resolve(d)).find((d) => existsSync(d));
  }
  if (!specDir || !existsSync(specDir)) {
    console.error(`validate-specs: spec directory not found (tried ${dirArg ?? "specs/, app_spec/"})`);
    process.exit(1);
  }

  const overviewPath = join(specDir, "overview.md");
  const featuresDir = join(specDir, "features");
  const featureFiles = existsSync(featuresDir)
    ? readdirSync(featuresDir).filter((f) => f.endsWith(".md")).sort().map((f) => join(featuresDir, f))
    : [];

  const checkedFiles = [];
  const storyIndex = new Map();

  if (existsSync(overviewPath)) {
    const doc = loadDoc(overviewPath);
    checkedFiles.push(overviewPath);
    checkEmptyCells(doc);
    checkOverviewLinks(doc, featureFiles);
  } else {
    add("ERROR", overviewPath, null, "missing-overview", "overview.md not found in spec directory");
  }

  for (const file of featureFiles) {
    const doc = loadDoc(file);
    checkedFiles.push(file);
    checkFeatureSpec(doc, storyIndex);
    checkEmptyCells(doc);
  }
  if (featureFiles.length === 0) {
    add("WARN", featuresDir, null, "no-features", "no feature specs found in features/");
  }

  checkSpecRefs(process.cwd());

  // --- Report ---
  if (json) {
    console.log(JSON.stringify(findings, null, 2));
  } else {
    const byFile = new Map();
    for (const f of findings) {
      if (!byFile.has(f.file)) byFile.set(f.file, []);
      byFile.get(f.file).push(f);
    }
    for (const [file, list] of [...byFile.entries()].sort()) {
      console.log(file);
      list.sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
      for (const f of list) {
        const loc = f.line ? `line ${f.line}: ` : "";
        console.log(`  ${f.level.padEnd(5)} ${loc}${f.message} [${f.rule}]`);
      }
      console.log("");
    }
    const errors = findings.filter((f) => f.level === "ERROR").length;
    const warnings = findings.length - errors;
    console.log(`${errors} errors, ${warnings} warnings across ${checkedFiles.length} files`);
  }

  process.exit(findings.some((f) => f.level === "ERROR") ? 1 : 0);
}

main();
