# E2E Test Format

E2E tests trace back to spec user stories via an `@spec` tag.

## The `@spec` tag

A test references intent **by ID**. The ID is identity — it resolves to exactly one home. A file path, if included, is advisory: the tooling keeps it honest and never depends on it.

```typescript
/**
 * @journey [user flow: action → result → outcome]
 * @risk [what breaks if this fails]
 * @why-e2e [what integration is proven]
 * @spec UserStory-###, REQ-###, REQ-###
 */
test("description", async ({ page }) => { ... });
```

- IDs are **global** (`UserStory-###`, `REQ-###`, and where used `ERR-###` / `EDGE-###`). List as many as the test covers, comma-separated; continuation lines inside the comment block are read.
- A path may be added for human context (`@spec specs/features/chat.md UserStory-007`) but is optional and advisory — resolution is by ID.
- **No ranges.** `REQ-001..006` is meaningless under global IDs (the numbers are unrelated). List the exact IDs.
- **No `SPEC:` / copied-text mirror.** Which REQs a test covers, and the story text, are derived from the IDs — don't hand-maintain a second copy in the comment.

## Resolution & validation

`scripts/spec-fns.mjs health` resolves every `@spec` ID against the spec set:

- defined nowhere → `dangling` (error: renamed, deleted, or typo)
- defined in two places → `multi_home` (single-home violation)
- still living in `specs/future/` → `pending_merge` (fine while building; clears when the work item merges into `features/`)
- a defined story/requirement with no `@spec` reference → `uncovered` (unless its Verify is `manual`/`none`)

## Key rules

- Reference by ID; never depend on the path.
- One ID = one home. Mint new IDs with `spec-fns.mjs next`, never hand-assign.
- Every test answers: "What breaks if this fails?"
