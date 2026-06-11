# Feature: Validator

> Zero-dependency Node script that mechanically validates a spec directory, so deterministic checks never depend on model judgment.

---

## User Stories

- UserStory-validator-01: As a developer, I can run the validator against my spec directory so that mechanical defects (ID formats, missing sections, broken links) are caught deterministically before any model-based review
- UserStory-validator-02: As a developer, I can get findings as JSON via `--json` so that I can wire the validator into scripts or CI without parsing human-readable output
- UserStory-validator-03: As a developer, I can rely on the exit code (1 on any ERROR, 0 otherwise) so that the spec health check or a pre-commit hook can gate on validation

---

## Out of Scope

- Judgment calls — stale content, vague wording, and intent gaps belong to the LLM spec health check (steps 2–3)
- Auto-fixing — the validator reports findings; it never edits files
- Markdown style linting — handled by markdownlint/prettier
- Validating overview.md content beyond the Features table (links and empty cells)

---

## What It Does

- Validates the layout `<spec-dir>/overview.md` + `<spec-dir>/features/*.md` with 10 deterministic checks
- Classifies every finding as ERROR (must fix) or WARN (input to the health check's sync/draft passes)
- Prints findings grouped by file with line numbers and rule names, or as a JSON array with `--json`
- Resolves the spec directory from the positional argument, falling back to `specs/`, then `app_spec/`
- Parses Markdown fence-aware: content inside ``` or ~~~ fences (ASCII diagrams, example tables, sample IDs) is ignored
- Runs as step 1 of the SKILL.md Spec Health Check; the model handles only the judgment passes that follow

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | The script must run on Node 18+ with zero dependencies beyond `node:fs` and `node:path` built-ins — no package.json, no install step | Must |
| REQ-2 | ID checks: UserStory IDs must match `UserStory-[a-z0-9-]+-NN:` with no duplicates within or across files (ERROR) and no mixed feature codes per file (WARN); REQ IDs must match `REQ-<number>` with no duplicates (ERROR) and no numbering gaps (WARN); Known Issues bug IDs must match `BUG-[a-z0-9-]+-NN` (WARN) | Must |
| REQ-3 | Structure checks: each feature spec must contain the required sections (User Stories, Out of Scope, Requirements, Error Cases, Edge Cases, Changelog — ERROR if missing); Error Cases and Edge Cases tables with fewer than 3 data rows are WARN; empty table cells anywhere are WARN | Must |
| REQ-4 | Link hygiene checks: every overview Features-table link must resolve to an existing file (ERROR); feature specs not linked from the Features table are reported as orphans (WARN) | Must |
| REQ-5 | `@spec` references in test files (`*.spec.*` / `*.test.*` under the working directory, excluding node_modules and dotfiles) must point to an existing spec file containing the referenced UserStory ID(s) (ERROR) | Must |
| REQ-6 | Exit code must be 1 if any ERROR finding exists, 0 otherwise | Must |
| REQ-7 | `--json` must print findings as a JSON array of `{level, file, line, rule, message}` objects instead of the human-readable report | Must |
| REQ-8 | Spec directory resolution: use the positional argument if given; otherwise try `specs/` then `app_spec/` relative to cwd; if none exists, print an error and exit 1 | Must |
| REQ-9 | All parsing must skip lines inside ``` or ~~~ code fences so diagrams and examples never trigger findings | Must |

---

## Architecture

### Data Flow

```text
Spec Health Check — step 1
    → node skills/spec-driven-development/scripts/validate-specs.mjs [spec-dir]
    → resolve spec dir (arg → specs/ → app_spec/)
    → load overview.md + features/*.md (fence-aware)
    → run checks 1–10 (IDs, sections, tables, links, @spec refs)
    → findings reported (grouped by file, or --json)
    → ERRORs fixed mechanically; WARNs feed health check steps 2–3
```

---

## Error Cases

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Spec directory not found | No argument given and neither `specs/` nor `app_spec/` exists in cwd | `validate-specs: spec directory not found (tried ...)` on stderr; exit 1 | Run from project root, or pass the spec directory as an argument |
| overview.md missing | Spec directory has no overview.md | ERROR finding `missing-overview`; exit 1 | Create overview.md from `templates/overview.template.md` |
| Node unavailable or too old | Node.js not installed, or version below 18 | Shell error or syntax error before any findings | Install Node 18+, or fall back to the manual Glob/Grep checks per SKILL.md health check step 1 |
| Malformed table row | Table row with an empty or missing cell outside a code fence | WARN finding `empty-cell` with file, line, and column number | Fill the cell with real content (or a draft-pass value confirmed by the user) |
| Broken @spec reference | Test header points to a missing spec file or unknown UserStory ID | ERROR finding `broken-spec-ref` with test file and line | Fix the path/ID in the test header, or add the missing user story to the spec |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| ASCII diagrams or example tables inside code fences | Ignored — fence-aware parsing skips all fenced lines, including the fence delimiters |
| Project has no test files | The @spec check (rule 10) is skipped silently; no warning emitted |
| Comma-separated IDs in one @spec header | Each ID is validated individually against the referenced spec file |
| features/ directory missing or empty | WARN `no-features`; overview checks still run |
| REQ numbering has a gap (REQ-3 then REQ-5) | WARN `req-gap`, not an error — flagged for the health check, never blocks |
| One file mixes UserStory feature codes | WARN `userstory-mixed` listing the codes found |

---

## Implementation

### File Map

| Path | Purpose |
|------|---------|
| `skills/spec-driven-development/scripts/validate-specs.mjs` | The entire validator: fence-aware Markdown helpers, 10 checks, report/JSON output |

### Entry Points

- `node skills/spec-driven-development/scripts/validate-specs.mjs [spec-dir] [--json]` — run from the project root (invoked as Spec Health Check step 1; path is `[skill-dir]/scripts/validate-specs.mjs` when installed)

---

## Key Decisions

### Decision 1: Deterministic checks only; judgment stays with the model

**Context:** The v1 health check asked the model to perform every check, including purely mechanical ones (ID regexes, duplicate detection, link resolution) — slow, token-hungry, and occasionally wrong.

**Options Considered:**

1. Keep everything in the model — no tooling, but non-deterministic results for deterministic questions
2. Script everything including style/wording — overreaches into judgment calls that need context
3. Script only what has a single correct answer; leave stale content and vague wording to the LLM passes

**Decision:** Option 3. The script reports; it never edits. WARNs are explicitly inputs to health check steps 2–3.

**Consequences:** Health check step 1 is fast, repeatable, and CI-friendly. The model's effort concentrates on sync and draft passes where judgment is actually required.

### Decision 2: Zero dependencies, single file

**Context:** This repo distributes by `cp -r` into `~/.claude/`; any npm dependency would break that install story and add supply-chain surface.

**Options Considered:**

1. Use a Markdown parser library — robust parsing, but requires package.json and npm install
2. Single .mjs file using only Node 18+ built-ins — hand-rolled but sufficient for the constrained spec layout

**Decision:** Single file, `node:fs` and `node:path` only. This is the deliberate, sole exception to the repo's "no runtime code" rule.

**Consequences:** The validator ships inside the skill directory and works wherever Node 18+ exists, with no install step. Parsing is simpler than a full Markdown AST, which is acceptable because the spec layout is template-constrained.

---

## Known Issues

No active bugs.

---

## Future Considerations

- [ ] Add a CI example (GitHub Actions step) running the validator with `--json`
- [ ] Extend the @spec scan beyond `.ts/.tsx/.js/.jsx` test files (e.g., `.py`, `.rb`)

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2026-06-11 | Initial spec | validate-specs.mjs shipped in methodology v2 |
