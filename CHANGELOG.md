# Changelog

## 2.0.0 — 2026-06-11

Methodology v2. Breaking changes to rule numbering and template structure.

### Changed

- **Two-tier feature template.** Core sections (User Stories, Out of Scope, What It Does, Requirements, Error Cases, Edge Cases, Key Decisions, Known Issues, Future Considerations, Changelog) are required; everything else is optional with an explicit *Include when* test. Simple features get short specs.
- **Implementation section is now a file map.** Path + purpose + entry points only. Signatures, props, types, and schemas are no longer mirrored into specs — the code is their source of truth.
- **Quality rules renumbered and re-grouped** by enforcement: PROCESS / SYNC (auto-fix, codebase is ground truth) / DRAFT (user confirms, intent is ground truth) / REVIEW (out of scope) / TEST. Mapping from v1: 1→1, 9→2, 2→3, 6→4, 7→5, 8→6, 10→7, 11-edge→8; old 3 (Extract Signatures) and 5 (Validate Schema) retired; old 11/12/13 → REVIEW-RULE.1/2/3.
- **Generative fixes now require confirmation.** Health-check fixes for vague descriptions, empty intent cells, and <3 error/edge cases are drafted and user-approved, never silently applied.
- **Single command.** `/sdd` now includes context summarization; `commands/spec-driven-development.md` removed.

### Added

- `scripts/validate-specs.mjs` — zero-dependency deterministic validator (ID formats/uniqueness, core sections, table completeness, Features-table links, orphan specs, `@spec` test references). Health check runs it first; the model handles only judgment calls.
- `version` field in SKILL.md frontmatter.

### Removed

- Stray-file detection/deletion from the health check, replaced with spec-directory link hygiene (orphan specs, broken Features-table links). A spec tool offering to delete root-level markdown files was risk without value.

## 1.x

Pre-changelog era. See git history.
