# Changelog

## 3.0.0 — unreleased (in progress)

Identity model: global IDs + a stateless primitives layer. Breaking.

### Added

- **`scripts/spec-fns.mjs`** — four zero-dependency, **stateless** primitives the LLM composes (specs+code are the only source of truth, scanned live; no registry): `next <type>` (mint the next global ID), `loc <id>` (every def/ref/link location), `health` (worklist: `multi_home`, `dangling`, `range`, `pending_merge`, `uncovered`, plus a manual-verify count), `sed <old=new>` (exact bulk-rewrite commands). Mechanical work is the script's; judgment stays with the model. Encodes the locked decisions: `@spec` ranges are flagged (`range`), `future/` references are `pending_merge` (warn-until-merge, not dangling), and `verify: manual/none` items are reported as a count, excluded from `uncovered`.
- SKILL.md **Spec Primitives** section + the two invariants (single home; resolve by ID). Health check rewritten to run `health` and resolve findings.
- Feature template: `Verify` column on Requirements (`unit`/`e2e`/`manual`/`none`); ID columns on Error/Edge cases (`ERR-###`/`EDGE-###`); `DEC-###` on decisions.

### Changed

- **IDs are global per type** (`REQ-###`, `UserStory-###`, `BUG-###`, `ERR-###`, `EDGE-###`, `DEC-###`) — unique across the whole spec set, never per-file. Folds/renames never change an ID or break a reference (references resolve by ID; the `@spec` path is advisory).
- **Bugs are not deleted on fix** — set the Known Issues row's Status to `Resolved` so regression-test `@spec BUG-###` references keep resolving.
- Validator: dropped the per-file numbering-gap WARN (gaps are expected under global IDs); cross-file identity checks delegated to `spec-fns.mjs`.

### Decisions (locked)

- Sequential IDs (collisions repaired by `sed`), not opaque. `@spec` ranges dropped. TDD: tests may reference `future/` IDs, flagged warn-until-merge. `verify: manual/none` reported as a visible count, not silently green.

### Migrated

- This repo's own `specs/` are on global IDs (20 UserStory + 52 REQ); `validate-specs.mjs` UserStory parsing updated to `UserStory-<number>` and its feature-code/gap WARNs removed. `spec-fns health` and `validate-specs` both green.

### Pending

- Migrate st-clone (the real project) to global IDs with `spec-fns.mjs` + `sed`.

## 2.1.0 — 2026-06-11

Spec lifecycle: split specs by tense (opt-in convention).

### Added

- **`specs/future/` lifecycle.** `specs/features/` is present tense — always true of the code, divergence is always a bug. Unbuilt work lives in `specs/future/` as work-item specs (new feature = full spec; change = delta via the new `templates/future.template.md`). Shipping = merge into the base spec + changelog + delete the future file; git history is the archive. Fixes the v2 sync-pass ambiguity between intended-ahead and drift. `ls specs/future/` is the open-work list.
- Validator: future profile (missing sections WARN, not ERROR; all other content checks apply; story IDs join the global duplicate index), check 12 `future-spec-ref` (tests must not reference `future/` specs), check 13 Pipeline table links + `pipeline-orphan`.
- `overview.template.md`: optional Pipeline section indexing future work items.
- Health check step 5: lifecycle hygiene — flags shipped-but-unmerged future items.
- CLAUDE-SDD.md, bootstrap, and todos workflows route through the lifecycle, including roadmap-to-pipeline setup, the granularity rule (one mergeable work item per `future/` file; stages are metadata), and the readiness gradient (next item at full rigor; distant items thin, tightened before implementation).
- Bootstrap step 6 binds the workflow: creates the project's CLAUDE.md from the CLAUDE-SDD starter (placeholders filled from bootstrap findings) or merges its sections into an existing CLAUDE.md with user confirmation; the starter routes "existing codebase, no specs" back to bootstrap.

## 2.0.0 — 2026-06-11

Methodology v2. Breaking changes to rule numbering and template structure.

### Changed

- **Two-tier feature template.** Core sections (User Stories, Out of Scope, What It Does, Requirements, Error Cases, Edge Cases, Key Decisions, Known Issues, Future Considerations, Changelog) are required; everything else is optional with an explicit *Include when* test. Simple features get short specs.
- **Implementation section is now a file map.** Path + purpose + entry points only. Signatures, props, types, and schemas are no longer mirrored into specs — the code is their source of truth.
- **Quality rules renumbered and re-grouped** by enforcement: PROCESS / SYNC (auto-fix, codebase is ground truth) / DRAFT (user confirms, intent is ground truth) / REVIEW (out of scope) / TEST. Mapping from v1: 1→1, 9→2, 2→3, 6→4, 7→5, 8→6, 10→7, 11-edge→8; old 3 (Extract Signatures) and 5 (Validate Schema) retired; old 11/12/13 → REVIEW-RULE.1/2/3.
- **Generative fixes now require confirmation.** Health-check fixes for vague descriptions, empty intent cells, and <3 error/edge cases are drafted and user-approved, never silently applied.
- **Single command.** `/sdd` now includes context summarization; `commands/spec-driven-development.md` removed.

### Added

- `scripts/validate-specs.mjs` — zero-dependency deterministic validator (ID formats/uniqueness, core sections, table completeness, placeholder paths, Features-table links, orphan specs, `@spec` test references). Health check runs it first; the model handles only judgment calls.
- `version` field in SKILL.md frontmatter.

### Removed

- Stray-file detection/deletion from the health check, replaced with spec-directory link hygiene (orphan specs, broken Features-table links). A spec tool offering to delete root-level markdown files was risk without value.

## 1.x

Pre-changelog era. See git history.
