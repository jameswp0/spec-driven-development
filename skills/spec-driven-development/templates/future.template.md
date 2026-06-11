# Change: [Work Item Name]

> One line: what this adds or changes, and to which feature(s).

> **Lifecycle:** this file lives in `specs/future/` while unbuilt. When implementation ships and tests pass: run the Merge Checklist below, then **delete this file** — git history is the archive.
>
> Work-item scoped, never feature-scoped: `future/tasks-filtering.md`, not `future/tasks.md`. For a brand-new feature, use `feature.template.md` instead (saved under `future/`, moved to `features/` on ship).

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

New stories only — reference existing stories in prose, never re-list them (the validator's duplicate-ID index spans `features/` and `future/`).

- UserStory-[feature]-##: As a [user type], I can [action] so that [benefit]

> Continue numbering from the base spec's highest story ID.

---

## Out of Scope

What this work item explicitly does NOT include.

- [Excluded functionality]

---

## Requirements

New or modified requirements. IDs are scoped to this work item and renumbered into the base sequence on merge.

| ID | Requirement | Priority | Action |
|----|-------------|----------|--------|
| REQ-1 | [Testable statement] | Must | New |
| REQ-2 | [Testable statement] | Must | Modifies base REQ-# |

---

## Error Cases

For the new/changed behavior only.

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| [Error] | [Cause] | [What user sees] | [Recovery] |
| [Error] | [Cause] | [What user sees] | [Recovery] |
| [Error] | [Cause] | [What user sees] | [Recovery] |

---

## Edge Cases

For the new/changed behavior only.

| Scenario | Expected Behavior |
|----------|-------------------|
| [Scenario] | [Behavior] |
| [Scenario] | [Behavior] |
| [Scenario] | [Behavior] |

---

## Key Decisions

### Decision 1: [Choice Made]

**Context:** What problem were we solving?

**Decision:** Chose [option] because [reason].

**Consequences:** What this means for the base feature.

---

## Merge Checklist (run when shipping)

- [ ] All new stories have passing `@spec` tests referencing the BASE spec path (never this file)
- [ ] Stories/REQs/errors/edges merged into base spec(s); REQ IDs renumbered into the base sequence
- [ ] Changelog entry added to base spec(s)
- [ ] Overview Pipeline (and Features, if applicable) tables updated
- [ ] This file deleted

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| YYYY-MM-DD | Initial proposal | [Why this work item exists] |
