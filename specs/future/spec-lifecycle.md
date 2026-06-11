# Change: Spec Lifecycle — Present-Tense features/ and Mergeable future/ Deltas

> Splits specs by tense: `specs/features/` is always true of the code; unbuilt work lives in `specs/future/` as work-item specs that merge into the base specs when shipped.

> **Lifecycle note:** this file itself follows the convention it proposes. It lives in `specs/future/` while unbuilt; when the implementation ships, its content merges into `specs/features/{skill,validator,templates,workflows}.md` and `specs/overview.md`, and this file is deleted. Git history is the archive.

---

## Target

- **Type:** Change to existing features
- **Base specs:** `specs/features/skill.md`, `specs/features/validator.md`, `specs/features/templates.md`, `specs/features/workflows.md`, `specs/overview.md`

---

## Why

v2's sync pass has a soundness hole: spec-first requires specs to run ahead of code, so "spec says X, code lacks X" is ambiguous between *intended-ahead* and *drift*. Splitting by tense removes the ambiguity — divergence in `features/` becomes always-a-bug, and `future/` is never checked against code. As a side effect, `ls specs/future/` becomes the progress tracker, and "done" becomes mechanical (delta merged, tests pass, file deleted).

---

## User Stories (new)

- UserStory-lifecycle-01: As a developer, I can write a work-item spec in `specs/future/` so that planned work is specified with full rigor before any code exists, without weakening the guarantee that `specs/features/` matches the code
- UserStory-lifecycle-02: As a developer, I can merge a shipped work item into its base feature spec and delete the future file so that completed proposals cannot go stale
- UserStory-lifecycle-03: As a developer, I can run the validator and have `future/` specs checked for content rigor but not code existence so that proposals aren't flagged for describing unbuilt behavior

---

## Out of Scope

- Migrating other projects automatically — the convention is opt-in; the status quo (spec runs ahead inside `features/`) remains valid
- Archive directory for merged proposals — git history is the archive; no `specs/archive/`
- Tracking in-flight implementation status inside future files (no status fields — presence in `future/` is the only state bit)
- Milestone table implementation (separate work item; composes with this one)

---

## Requirements (new or modified)

| ID | Requirement | Priority | Action |
|----|-------------|----------|--------|
| REQ-L1 | SKILL.md must define the lifecycle: `features/` is present tense (divergence is always a bug under this convention); all unbuilt work lives in `future/` (new feature → feature template; change → future template); shipping = merge rows into base spec + changelog + delete the future file | Must | New (skill) |
| REQ-L2 | The health check sync pass must apply code-existence checks to `features/` only, never to `future/`; lifecycle hygiene must flag future items whose stories already have passing `@spec` tests as "should be merged" | Must | Modifies skill REQ-3 |
| REQ-L3 | The validator must scan `<spec-dir>/future/*.md` with a relaxed profile: missing core sections are WARN (not ERROR); all other content checks (IDs, rows, cells, placeholder paths) apply; future stories join the global duplicate-ID index | Must | New (validator) |
| REQ-L4 | The validator must ERROR on `@spec` test references that point into `future/` — tests verify present behavior and may only reference `features/` specs | Must | New (validator check 12) |
| REQ-L5 | If the overview has a `## Pipeline` section, its links must resolve (ERROR) and future files not linked from it are WARN; with no Pipeline section, future files produce no orphan findings | Should | New (validator check 13) |
| REQ-L6 | A `templates/future.template.md` must exist for change-type work items: Target, Why, new User Stories, Out of Scope, new/modified Requirements (with Action column), Error Cases, Edge Cases, Key Decisions, Merge Checklist, Changelog | Must | New (templates) |
| REQ-L7 | `overview.template.md` must gain an optional Pipeline section (Include when: project uses the `specs/future/` lifecycle) listing work items with links | Should | Modifies templates REQ-1 |
| REQ-L8 | CLAUDE-SDD.md must route "new feature requested" to writing a spec under `specs/future/` first, and "finished implementing" to the merge-and-delete step | Must | Modifies templates REQ-8 |
| REQ-L9 | `workflows/bootstrap.md` must direct bootstrap output to `features/` only (it documents existing code); `workflows/todos.md` must include `specs/future/` as a backlog source | Should | Modifies workflows |

> ID convention note: REQ-L# IDs are scoped to this work item; on merge, each row is renumbered into its base spec's sequence.

---

## Error Cases

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Forgotten merge | Work shipped but future file not merged/deleted | Health check / lifecycle hygiene flags: stories in future item already have passing tests | Run the merge checklist; delete the file |
| Test references a future spec | E2E written against `future/x.md` path | Validator ERROR `future-spec-ref` with test file and line | Point `@spec` at the base spec in `features/` (merge first if needed) |
| Duplicate story ID across tenses | Delta re-declares an existing story instead of referencing it in prose | Validator ERROR `userstory-dup` with both locations | Delta lists only NEW stories; reference existing ones in prose |
| Shadow feature file | A full `future/chat.md` duplicating an existing `features/chat.md` | Two specs describe one feature; merge becomes a rewrite | Deltas must be work-item scoped (`chat-filtering.md`), not feature-scoped |
| features/ drifts from code | Code changed without spec sync | Health check sync pass reports divergence — unambiguous bug under this convention | Fix code or sync spec (with changelog); no "maybe it's intended" state |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Project doesn't adopt the convention | No `future/` directory; validator and health check behave exactly as v2; specs may run ahead in `features/` |
| Brand-new feature (no base spec) | Full feature spec written in `future/` using feature.template.md; "merge" = move the file into `features/` + add Features-table row |
| Delta modifies a requirement without adding stories | No User Stories section needed beyond the heading; missing-section is WARN in future/, acceptable for tight deltas |
| Work item abandoned | Delete the future file with an overview changelog entry; no other cleanup needed — nothing else references it |
| Two deltas target the same base feature | Allowed; both merge independently; validator's global dup index prevents ID collisions between them |

---

## Key Decisions

### Decision 1: Delta granularity is the work item, not the feature

**Context:** A `future/` mirror per feature (e.g. `future/chat.md` shadowing `features/chat.md`) creates split-brain for brownfield work — two files jointly describing one feature indefinitely.

**Decision:** `future/` files are work-item scoped (RFC/PEP model): a new feature is a full spec; a change is a delta naming what it adds/modifies. Merging destroys the file, so dual-read is bounded by implementation time.

**Consequences:** `features/` keeps the one-file-per-feature property at every commit; the contract during active work is base + named delta, explicit and temporary.

### Decision 2: Deletion over archiving

**Context:** Merged proposals could move to `specs/archive/` for history.

**Decision:** Delete on merge. Git history preserves every proposal; an archive directory is a second copy that no check keeps honest.

**Consequences:** No stale-proposal class of drift can exist. Reviewing past proposals = `git log -- specs/future/`.

---

## Merge Checklist (run when shipping)

- [ ] All new stories have passing `@spec` tests referencing the BASE spec path
- [ ] Stories/REQs/errors/edges merged into base spec(s), REQ IDs renumbered into base sequence
- [ ] Changelog entries added to base spec(s)
- [ ] Overview Pipeline/Features tables updated
- [ ] This file deleted

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2026-06-11 | Initial proposal | Sync-pass ambiguity (intended-ahead vs drift) needs a structural fix |
