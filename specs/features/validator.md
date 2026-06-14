# Feature: Validator

> Zero-dependency Node script that mechanically validates a spec directory, so deterministic checks never depend on model judgment.

---

## User Stories

- UserStory-015: As a developer, I can run the validator against my spec directory so that mechanical defects (ID formats, missing sections, broken links) are caught deterministically before any model-based review
- UserStory-016: As a developer, I can get findings as JSON via `--json` so that I can wire the validator into scripts or CI without parsing human-readable output
- UserStory-017: As a developer, I can rely on the exit code (1 on any ERROR, 0 otherwise) so that the spec health check or a pre-commit hook can gate on validation

---

## Out of Scope

- Judgment calls — stale content, vague wording, and intent gaps belong to the LLM spec health check (steps 2–3)
- Auto-fixing — the validator reports findings; it never edits files
- Markdown style linting — handled by markdownlint/prettier
- Validating overview.md content beyond the Features and Pipeline tables (links and empty cells)

---

## What It Does

- Validates the layout `<spec-dir>/overview.md` + `<spec-dir>/features/*.md` with deterministic structural checks (ID format, required sections, table completeness, placeholder paths, Features/Pipeline links); `@spec` resolution is delegated to `spec-fns.mjs`
- Scans `<spec-dir>/future/*.md` work items with a relaxed lifecycle profile: missing core sections are WARN (not ERROR), all other content checks apply, and their UserStory IDs join the global duplicate index
- Classifies every finding as ERROR (must fix) or WARN (input to the health check's sync/draft passes)
- Prints findings grouped by file with line numbers and rule names, or as a JSON array with `--json`
- Resolves the spec directory from the positional argument, falling back to `specs/`, then `app_spec/`
- Parses Markdown fence-aware: content inside ``` or ~~~ fences (ASCII diagrams, example tables, sample IDs) is ignored
- Runs as step 1 of the SKILL.md Spec Health Check; the model handles only the judgment passes that follow

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-032 | The script must run on Node 18+ with zero dependencies beyond `node:fs` and `node:path` built-ins — no package.json, no install step | Must |
| REQ-033 | ID format checks: UserStory IDs must match `UserStory-<number>` and REQ IDs `REQ-<number>`, each with no in-file duplicates (ERROR); Known Issues bug IDs match `BUG-<number>` (WARN). No numbering-gap check — IDs are global and sequential corpus-wide, so per-file gaps are expected. Cross-file single-home, resolve-by-id, and coverage are handled by `spec-fns.mjs` (health), not this validator | Must |
| REQ-034 | Structure checks: each feature spec must contain the required sections (User Stories, Out of Scope, Requirements, Error Cases, Edge Cases, Changelog — ERROR if missing); Error Cases and Edge Cases tables with fewer than 3 data rows are WARN; empty table cells anywhere are WARN; backticked paths containing "path/to" are WARN (bare prose mentions are not flagged) | Must |
| REQ-035 | Link hygiene checks: every overview Features-table link must resolve to an existing file (ERROR); feature specs not linked from the Features table are reported as orphans (WARN) | Must |
| REQ-036 | `@spec` resolution is delegated to `spec-fns.mjs` (health) — this validator does not parse `@spec`. Existence, single-home, and `future/` (`pending_merge`) are reported there, by ID, across all file types | Must |
| REQ-037 | Exit code must be 1 if any ERROR finding exists, 0 otherwise | Must |
| REQ-038 | `--json` must print findings as a JSON array of `{level, file, line, rule, message}` objects instead of the human-readable report | Must |
| REQ-039 | Spec directory resolution: use the positional argument if given; otherwise try `specs/` then `app_spec/` relative to cwd; if none exists, print an error and exit 1 | Must |
| REQ-040 | All parsing must skip lines inside ``` or ~~~ code fences so diagrams and examples never trigger findings | Must |
| REQ-041 | Files under `<spec-dir>/future/` must be scanned with a relaxed profile: missing core sections are WARN (not ERROR); all other content checks (IDs, rows, cells, placeholder paths) apply; future UserStory IDs join the global duplicate-ID index | Must |
| REQ-042 | `future/` references from tests are NOT errors — they are `spec-fns.mjs` `pending_merge` (warn-until-merge), clearing when the work item ships. This validator does not flag them | Must |
| REQ-043 | If overview.md has a `## Pipeline` section, its table links must resolve to existing files (ERROR) and future files not linked from it are WARN (`pipeline-orphan`); with no Pipeline section, future files produce no orphan findings | Should |

---

## Architecture

### Data Flow

```text
Spec Health Check — step 1
    → node skills/spec-driven-development/scripts/validate-specs.mjs [spec-dir]
    → resolve spec dir (arg → specs/ → app_spec/)
    → load overview.md + features/*.md + future/*.md (fence-aware; future/ gets the relaxed profile)
    → run structural checks (IDs, sections, tables, placeholder paths, Features/Pipeline links)
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
| Malformed ID | A UserStory/REQ ID doesn't match the global `-<number>` format | ERROR `userstory-format` / `req-format` with file and line | Fix the ID (mint with `spec-fns.mjs next`) |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| ASCII diagrams or example tables inside code fences | Ignored — fence-aware parsing skips all fenced lines, including the fence delimiters |
| Prose mentions "path/to" without backticks (e.g. describing the rule itself) | Not flagged — `placeholder-path` matches backticked occurrences only |
| @spec references in code | Not parsed here — resolution is `spec-fns.mjs health`'s job (dangling / multi_home / pending_merge) |
| features/ directory missing or empty | WARN `no-features`; overview checks still run |
| REQ numbering has a gap | No finding — IDs are global and sequential corpus-wide, so per-file gaps are expected |
| A REQ or UserStory ID is defined in two files | Not flagged here — cross-file single-home is `spec-fns.mjs health`'s job (`multi_home`), not this validator |
| future/ file omits core sections (tight delta) | WARN `missing-section`, not ERROR — the relaxed lifecycle profile tolerates section-less deltas |
| @spec reference points into future/ | Not flagged here — it's `spec-fns.mjs` `pending_merge` (warn-until-merge) |
| Overview has no Pipeline section but future/ files exist | No orphan findings for future files — `pipeline-orphan` applies only when a Pipeline section exists |

---

## Implementation

### File Map

| Path | Purpose |
|------|---------|
| `skills/spec-driven-development/scripts/validate-specs.mjs` | The entire validator: fence-aware Markdown helpers, 13 checks, report/JSON output |

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
| 2026-06-11 | Added check 11: placeholder-path (backticked "path/to", WARN) | Gap found during v2 behavioral testing |
| 2026-06-11 | Added REQ-041–12 and checks 12–13: relaxed future/ profile, future-spec-ref ERROR, Pipeline links + pipeline-orphan; 13 checks total | Merged spec-lifecycle work item (lifecycle's first execution) |
| 2026-06-14 | v3: UserStory/REQ/BUG id checks accept global `-<number>` format (REQ-033); retired rules 10 + 12 (@spec resolution + future-spec-ref) — delegated to `spec-fns.mjs` health, which resolves by ID and treats future/ refs as `pending_merge` (warn-until-merge), not errors (REQ-036, REQ-042) | Surfaced migrating st-clone: old BUG regex rejected `BUG-###`, and `future-spec-ref` ERROR contradicted the warn-until-merge decision |
