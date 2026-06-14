# Change: [Work Item Name]

> One line: what this adds or changes, and to which feature(s).

> **Lifecycle:** this file lives in `specs/future/` while unbuilt. When implementation ships and tests pass: run the Merge Checklist below, then **delete this file** — git history is the archive.
>
> Work-item scoped, never feature-scoped: `future/tasks-filtering.md`, not `future/tasks.md`. For a brand-new feature, use `feature.template.md` instead (saved under `future/`, moved to `features/` on ship).
>
> **Granular:** sized to implement and merge in one cycle — split anything bigger. Distant roadmap items may start thin; tighten to full rigor before implementation starts.

---

## Target

- **Type:** Change to existing feature
- **Base spec(s):** `specs/features/[feature].md`
- **Milestone:** [optional — delete if unused]

---

## Why

[1–3 sentences: the problem or motivation. If this is hard to write, the change isn't understood yet.]

---

## User Stories

New stories only — reference existing stories in prose, never re-list them (single-home spans `features/` and `future/`).

- UserStory-###: As a [user type], I can [action] so that [benefit]

> Mint with `scripts/spec-fns.mjs next userstory`. The ID is global and **never changes** — including on merge.

---

## Out of Scope

What this work item explicitly does NOT include.

- [Excluded functionality]

---

## Requirements

New or modified requirements. IDs are global (mint with `scripts/spec-fns.mjs next req`) and **never change on merge** — the row moves into the base spec keeping its ID.

| ID | Requirement | Priority | Verify | Action |
|----|-------------|----------|--------|--------|
| REQ-### | [Testable statement] | Must | unit | New |
| REQ-### | [Testable statement] | Must | e2e | Modifies REQ-### (existing) |

---

## Error Cases

For the new/changed behavior only.

| ID | Error | Cause | User Sees | Recovery |
|----|-------|-------|-----------|----------|
| ERR-### | [Error] | [Cause] | [What user sees] | [Recovery] |
| ERR-### | [Error] | [Cause] | [What user sees] | [Recovery] |
| ERR-### | [Error] | [Cause] | [What user sees] | [Recovery] |

---

## Edge Cases

For the new/changed behavior only.

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EDGE-### | [Scenario] | [Behavior] |
| EDGE-### | [Scenario] | [Behavior] |
| EDGE-### | [Scenario] | [Behavior] |

---

## Key Decisions

### DEC-###: [Choice Made]

**Context:** What problem were we solving?

**Decision:** Chose [option] because [reason].

**Consequences:** What this means for the base feature.

---

## Merge Checklist (run when shipping)

- [ ] All new stories have passing `@spec` tests (referenced by ID; the path is advisory, and `pending_merge` warnings clear on merge)
- [ ] Stories/REQs/errors/edges moved into base spec(s) — IDs are global and unchanged (no renumbering)
- [ ] Changelog entry added to base spec(s)
- [ ] Overview Pipeline (and Features, if applicable) tables updated
- [ ] This file deleted

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| YYYY-MM-DD | Initial proposal | [Why this work item exists] |
