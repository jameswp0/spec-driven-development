---
name: spec-driven-development
description: Spec-driven development methodology. Write specs before building, update after implementing, check against when tests fail, log bugs in, surface todos when idle. Use when bootstrapping a codebase, running a spec health check, generating tests from requirements, or writing a feature spec. Specs define intent before code exists and connect intent, code, and tests.
version: 3.0.0
---

> **Spec location:** Typically `specs/` or `app_spec/`. Adapt paths to your project.

## Contents

- [First: Read Templates](#first-read-templates)
- [Quality Rules](#quality-rules)
- [Principle](#principle) · [Spec Primitives](#spec-primitives)
- [Intent Detection](#intent-detection) · [Spec Health Check](#spec-health-check)
- [The Flow](#the-flow) · [Spec Lifecycle](#spec-lifecycle-presentfuture)
- [Process Notes](#process-notes) · [Quality Checklist](#quality-checklist)
- [E2E Test Format](#e2e-test-format) · [Failure Modes](#failure-modes) · [Examples](#examples)
- [Todos](#todos-future-considerations) · [Bug Tracking](#bug-tracking)
- [Test Health Check](#test-health-check)
- [Implementation Documentation](#implementation-documentation)
- [Workflows](#workflows) · [Markdown Formatting](#markdown-formatting) · [When Done](#when-done)

---

## First: Read Templates

| Task | Read First |
|------|------------|
| Creating/updating overview spec | `templates/overview.template.md` |
| Creating/updating feature spec | `templates/feature.template.md` |
| Documenting implementation details | `templates/feature.template.md` - Implementation section |
| Bootstrapping new project | `workflows/bootstrap.md` |
| Analyzing todos | `workflows/todos.md` |
| Migrating to global IDs | `workflows/migrate.md` |

**Overview spec**: One per project. System architecture, tech stack, data flow, cross-cutting concerns.

**Feature specs**: One per feature. User stories, requirements, states, errors, decisions.

Templates are two-tier: **core sections** are required in every spec; **optional sections** carry an *Include when* test — add them only when the test passes, delete them otherwise. A simple feature with a complete core is a complete spec.

---

## Quality Rules

20 rules prevent AI guessing instead of verifying reality. They map to the Quality Checklist below and are grouped by **how they are enforced**:

| Group | Ground truth | Enforcement |
|-------|-------------|-------------|
| PROCESS | — | Followed during execution, every time |
| SYNC | The codebase | Auto-fixed in health check without confirmation |
| DRAFT | The user's intent | Drafted in health check; applied only after user confirms |
| REVIEW | — | Code-review concerns; out of the spec agent's scope |
| TEST | Code + spec | Test Health Check (see below) |

The spec agent enforces 17 rules: CODE-RULE.1–8 and TEST-RULE.1–9.

> **Why SYNC and DRAFT are different:** SYNC rules correct facts the codebase already proves (a path exists or it doesn't) — safe to auto-fix. DRAFT rules govern *intent*. If the agent silently sharpened vague wording, filled empty cells, or added error cases to meet a minimum, the AI would be writing the requirements it is supposed to be constrained by. So the health check drafts the content, shows it, and the user approves or edits before it lands in the spec.

> **v2 renumbering:** v1 numbering had a gap (CODE-RULE.4) and a collision (11 vs 11-edge). Mapping: old 1→1, 9→2, 2→3, 6→4, 7→5, 8→6, 10→7, 11-edge→8. Old 3 (Extract Signatures) and 5 (Validate Schema) are retired — specs hold a file map, not mirrored signatures/schemas (see Implementation Documentation), so existence checking (CODE-RULE.3) is the only sync needed. Old 11/12/13 → REVIEW-RULE.1/2/3.

### PROCESS rules (enforced during execution)

**CODE-RULE.1: Read Before Write**
- **What:** Must Read a file before Edit/Write
- **Why:** Prevents inventing content or paths
- **Checklist:** "All file paths referenced in spec exist in codebase"

**CODE-RULE.2: Match Existing Patterns**
- **What:** Must Grep for patterns before introducing new ones
- **Why:** Maintains codebase consistency
- **Checklist:** "Patterns match existing codebase"

### SYNC rules (auto-fixed in health check)

**CODE-RULE.3: Verify References**
- **What:** Every file path, route, and named symbol referenced in a spec exists in the codebase (Glob/Grep to confirm)
- **Why:** Prevents references to non-existent code
- **Checklist:** "All file paths referenced in spec exist in codebase"

**CODE-RULE.4: No Placeholder Paths**
- **What:** Replace `path/to/file` with actual verified paths
- **Why:** Prevents fake documentation
- **Checklist:** "No placeholder file paths"

### DRAFT rules (proposed in health check; user confirms before the spec is edited)

**CODE-RULE.5: No Empty Cells**
- **What:** Parse tables, draft missing values; cells derivable from code may be auto-filled under CODE-RULE.3
- **Why:** Ensures complete documentation without inventing intent
- **Checklist:** "Table columns complete (no empty cells)"

**CODE-RULE.6: No Vague Descriptions**
- **What:** Draft a specific replacement for "handles errors"-style wording
- **Why:** Makes specs actionable and testable
- **Checklist:** "No vague descriptions"

**CODE-RULE.7: Minimum 3 Error Cases**
- **What:** If <3, draft candidate error cases for the user to accept, edit, or reject
- **Why:** Ensures thorough error coverage — without quota-filling the spec with invented failures
- **Checklist:** "At least 3 error cases documented"

**CODE-RULE.8: Minimum 3 Edge Cases**
- **What:** If <3, draft candidate edge cases for the user to accept, edit, or reject
- **Why:** Ensures behavior under unusual inputs is specified
- **Checklist:** "At least 3 edge cases documented"

### REVIEW rules (out of scope for the spec agent)

- **REVIEW-RULE.1: Justify Dependencies** — every new dependency must be justified; enforced in code review
- **REVIEW-RULE.2: Simplest First** — choose simplest solution that works; enforced by architectural judgment
- **REVIEW-RULE.3: Delete Before Adding** — remove dead code before adding new; enforced by code reviewer

### Test Quality Rules

**CRITICAL - Anti-LLM Failure Rules:**

**TEST-RULE.4: Assert Actual Output**
- **What:** Tests capture real behavior, not mocked returns
- **Why:** Prevents circular testing (testing mocks instead of code)
- **Enforced:** Reported in Test Health Check
- **Example:** See `references/test-anti-patterns.md`

**TEST-RULE.5: E2E @spec References**
- **What:** Tests link to valid spec IDs (UserStory, REQ, …), resolved by ID
- **Why:** Ensures traceability from spec to test
- **Enforced:** Validated in Test Health Check
- **Format:** See `references/e2e-test-format.md`

**APPLIED FROM CODE RULES:**

**TEST-RULE.1: Verify Test Imports Exist**
- **What:** All test imports must exist (utilities, fixtures, components)
- **Why:** Prevents placeholder imports in tests
- **Enforced:** Auto-fixed in Test Health Check

**TEST-RULE.2: No Placeholder Import Paths**
- **What:** No `'./path/to/component'` placeholders
- **Why:** Ensures tests reference real files
- **Enforced:** Auto-fixed in Test Health Check

**TEST-RULE.3: No Vague Test Names**
- **What:** No "should work", "handles data"
- **Why:** Test names should describe specific behavior
- **Enforced:** Flagged in Test Health Check

**LLM ANTI-PATTERNS (detected in Test Health Check):**

- **TEST-RULE.6: No Happy Path Bias** — flag if <3 error cases tested (LLMs default to success cases)
- **TEST-RULE.7: No Over-Mocking** — flag if >50% of test is mock setup (over-mocked tests skip real behavior)
- **TEST-RULE.8: No Copy-Paste Tests** — detect identical structure with different names (doesn't test different behavior)
- **TEST-RULE.9: Test Edge Cases** — check for null/undefined/empty array tests (LLMs forget edge cases)

> **Note:** These rules force verification of reality before documentation. Violations indicate AI guessing rather than reading code.

---

## Principle

Specs define what to build and how to test it.

**User stories** answer: what can users do?

**Requirements** answer: what's testable? Each REQ maps to a test case.

**Architecture** answers: how do the pieces fit together?

Write specs before implementation to clarify thinking. Update specs after implementation if reality diverged. A spec that doesn't match reality is useless.

---

## Spec Primitives

Identity work — assigning IDs, finding references, checking integrity — is mechanical, so it belongs to a script, not to your judgment. `scripts/spec-fns.mjs` is a zero-dependency, **stateless** query layer: the specs and code are the only source of truth, scanned live on every call. There is no database to keep in sync. You author intent and edit files; the script answers the questions you cannot answer reliably by hand.

**Two invariants:**

- **Single home** — every ID is *defined* exactly once: a Requirements row, a User Stories list item, a Known Issues row. Any other mention is a *link* and does not count as a definition.
- **Resolve by ID** — references point at an ID, not a path. The path in an `@spec` tag is advisory (the script keeps it honest); the ID is identity, so folds and renames never break a reference.

**IDs are global per type** — `REQ-###`, `UserStory-###`, `BUG-###` (and, where used, `ERR-###`, `EDGE-###`, `DEC-###`). The number is unique across the whole spec set, never per-file.

**The four functions:**

| Call | Returns / does |
|------|----------------|
| `node [skill-dir]/scripts/spec-fns.mjs next <type> [n]` | the next free global ID(s) — mint without scanning |
| `node [skill-dir]/scripts/spec-fns.mjs loc <id>` | every location of an ID, tagged `def` / `ref` / `link` |
| `node [skill-dir]/scripts/spec-fns.mjs health` | the worklist: `multi_home`, `dangling`, `uncovered` findings |
| `node [skill-dir]/scripts/spec-fns.mjs sed <old=new ...>` | exact, exhaustive `sed` commands for a bulk ID change |

**When to call each:**

| Workflow | Call |
|----------|------|
| Add a story or requirement | `next` → write the definition, tag the test with `@spec <id>` |
| Fold or split a spec | *nothing* — move the markdown block; IDs and references resolve unchanged |
| Retire intent | `loc` → review the affected code/tests, then edit |
| Bug fixed | edit the Known Issues row's status to `resolved` (keep the row) |
| Rename / dedup / migrate IDs | `sed` → review and run the emitted commands |
| Health check / CI | `health` → resolve each finding |

The script **detects; you resolve.** `multi_home` and `dangling` are judgment calls (which definition is the real home? was this renamed, deleted, or a typo?). `uncovered` means the intent has no test — add one, or set its verify-mode.

---

## Intent Detection

| Situation | Action |
|-----------|--------|
| Starting new feature | Write spec first, then implement (under the lifecycle convention: write it in `specs/future/`, merge on ship) |
| Documenting existing code | Create spec using template |
| Checking if spec matches code | Compare to reality, fix discrepancies |
| Codebase has no specs | Use `workflows/bootstrap.md` |
| Adopting global IDs / "migrate specs" | Use `workflows/migrate.md` |
| Deciding what to work on | Use `workflows/todos.md` |
| Spec may be outdated | Update to reflect current state |
| Before committing specs | Run markdown lint |
| Need test coverage | Generate tests from requirements |
| Just finished implementing | Run tests, update spec |
| Something is broken | Add to Known Issues |
| Bug was fixed | Mark its Known Issues row `resolved` (keep the row), add changelog |

Don't overthink routing. Understand what they need, do it.

### Spec Health Check

When user says "check specs", "health", or after significant work:

1. **Run the primitives:** `node [skill-dir]/scripts/spec-fns.mjs health` reports `multi_home` (an ID defined in more than one place), `dangling` (a reference resolving to no definition), and `uncovered` (defined intent with no test). It detects; you resolve. `multi_home`/`dangling` are judgment calls — investigate why (renamed? deleted? incomplete merge? typo?), then fix the home or repoint the reference. (If Node is unavailable, reproduce these checks with Glob/Grep.)
2. **Sync pass (auto-fix):** for each spec under `features/`, verify the file paths and entry points it names still exist; never code-check `future/` specs — they describe unbuilt intent. Under the lifecycle convention, `features/` divergence is always a bug.
3. **Draft pass (confirm before applying):** for vague descriptions (CODE-RULE.6), empty intent cells (CODE-RULE.5), and fewer than 3 error/edge cases (CODE-RULE.7–8), and for each `uncovered` finding — draft the missing content (or add a test / set verify-mode), present it to the user, and apply only what they approve.
4. **Lifecycle hygiene (if `future/` exists):** a `multi_home` finding spanning `future/` and `features/` means a work item shipped without its future file being deleted — run its Merge Checklist and delete it (confirm with user).

---

## The Flow

Spec first, then code, then tests.

```
Spec → Implement → Tests → Update spec if needed
```

- **User stories (UserStory-*)** define what users can do → become E2E tests
- **Requirements (REQ-*)** define testable behavior → become unit tests
- **Error cases** define failure handling → become edge case tests

Writing the spec first forces clarity. If the spec is hard to write, the feature isn't well understood yet. Use `AskUserQuestion` to clarify requirements before writing.

### 1. Understand

Before writing anything:
- What problem does this solve?
- Who is it for?
- What's the expected behavior?

Use `AskUserQuestion` if the request is vague. Don't assume.

### 2. Spec

Create the spec using `templates/feature.template.md`:
- Start with user stories (what can users do?)
- Add requirements (testable statements)
- Sketch the architecture (how pieces connect)
- Document states, errors, edge cases
- Capture key decisions with rationale
- Document what is explicitly not in scope (Out of Scope section)

> **Overview vs Feature user stories:** Overview specs use unstructured user stories (no `UserStory-*` IDs) — they are product-level summaries, not testable specs. Only feature spec user stories get IDs and map to E2E tests.

### 3. Implement

Build to match the spec. If you deviate, update the spec.

### 4. Test

Generate tests from the spec:
- Unit tests from requirements (REQ-*)
- E2E tests from user stories (UserStory-*)
- Edge case tests from error cases

**Constraints:** E2E tests must include `@spec` reference. Keep test count manageable—prefer fewer, meaningful tests.

**Avoid forbidden patterns:** See `references/test-anti-patterns.md` for patterns that produce tests that appear to work but test nothing.

Tests prove the spec is implemented correctly.

### 5. Reflect

Pause at natural breakpoints:
- After spec draft: "Is this clear enough to implement?"
- After implementation: "Did reality match the spec? What changed?"

If something feels wrong, backtrack. Fixing a spec is cheaper than fixing code.

---

## Spec Lifecycle (Present/Future)

An opt-in convention that splits specs by tense. Adopt it when you want `features/` to be literally true of the code at every commit; without it, specs may run ahead of code inside `features/` (the default v2 behavior).

```
specs/
├── features/   PRESENT — always true of the code; divergence is always a bug
└── future/     INTENT — one file per WORK ITEM (not per feature); never code-checked
```

**Rules:**

1. **`features/` never diverges from code.** Under this convention there is no "spec is just ahead" state — any mismatch found by the sync pass is a bug to fix (in code, or in spec with a changelog entry if intent changed).
2. **All unbuilt work lives in `future/`, granularly.** New feature → full spec via `templates/feature.template.md`, saved under `future/`. Change to an existing feature → a work-item delta via `templates/future.template.md` (e.g. `future/tasks-filtering.md`, never a shadow `future/tasks.md`). Work items are sized to implement and merge in one cycle — split any item that grows beyond that. **Readiness gradient:** the item you're about to build needs full content rigor (stories, REQs, ≥3 errors/edges); distant roadmap items may start thin (missing-section WARNs in `future/` are tolerated for exactly this) and are tightened to full rigor before implementation starts. Only code-existence checks are ever waived.
3. **Shipping = merging.** When implementation lands and tests pass: move the delta's stories/REQs/errors/edges into the base spec (IDs are global and move unchanged — no renumbering), add a changelog entry, update the overview's Pipeline/Features tables, and **delete the future file**. Git history is the archive — completed proposals cannot go stale because completing them destroys them.

**Conventions:** deltas list only NEW stories (reference existing ones in prose — single-home spans both directories); tests reference intent by ID, and a ref resolving to a `future/` home is `pending_merge` (fine while building; it clears when the work item merges into `features/`); `ls specs/future/` is the open-work list, and the optional overview `## Pipeline` table indexes it.

---

## Process Notes

- If a section doesn't apply, delete it. No empty sections or placeholders.
- When documenting existing code, read the code first. Don't invent.
- When designing new features, write the spec first. Then implement.

## Quality Checklist

> **Full checklist:** [references/quality-checklist.md](references/quality-checklist.md)

Critical items before finishing:

- [ ] No empty sections or placeholders (CODE-RULE.5)
- [ ] No vague descriptions — specific and observable (CODE-RULE.6)
- [ ] User stories have unique IDs in correct format: `UserStory-###` (global; mint with `spec-fns.mjs next userstory`)
- [ ] Requirements have unique IDs (`REQ-###`, global; mint with `spec-fns.mjs next req`) and Priority (Must/Should/Could)
- [ ] At least 3 error cases: Error, Cause, User Sees, Recovery (CODE-RULE.7)
- [ ] At least 3 edge cases: Scenario, Expected Behavior (CODE-RULE.8)
- [ ] All file paths verified to exist in codebase (CODE-RULE.3, 4)
- [ ] Implementation section is a file map only — no mirrored signatures/schemas
- [ ] Each UserStory-* maps to E2E test (TEST-RULE.5)
- [ ] Spec matches current implementation; changelog entry added

---

## E2E Test Format

E2E tests must trace to spec user stories via `@spec` header pointing to valid UserStory IDs.

Format details: [references/e2e-test-format.md](references/e2e-test-format.md)

---

## Failure Modes

### Vague Descriptions
Bad: "Errors are handled appropriately."
Good: Specific errors with causes, user experience, and recovery.

### Happy Path Only
Bad: "User submits form. Data saved. Success shown."
Good: Include validation failures, network errors, edge cases.

### Premature Completion
Bad: Declaring done with thin sections or 1-2 error cases.
Good: If it feels light, dig deeper. Each feature has more errors and edge cases than you initially think.

---

## Examples

See [references/examples.md](references/examples.md) for good/bad examples of user stories, requirements, and error cases.

---

## Todos (Future Considerations)

Todos live in feature specs under "Future Considerations".

### Quality Criteria

Every todo must be:
- **Atomic:** One action, not "Add X and update Y"
- **Actionable:** Starts with verb (Add, Update, Remove, Fix)
- **Scoped:** References specific thing (which endpoint? which component?)
- **Testable:** Clear done state

**Bad:** "Improve error handling" / "Make it faster" / "Add tests"

**Good:** "Add rate limiting (10 req/min) to POST /tasks" / "Add index on tasks.conversation_id"

### Analyzing Todos

If user asks "what should I work on?":

1. Read all feature spec todos
2. Identify dependencies (what blocks what)
3. Prioritize: bugs > security > blocking issues > quick wins
4. Question YAGNI candidates — do we actually need this?

For complex analysis, use `workflows/todos.md`.

---

## Bug Tracking

Bugs live in feature specs under "Known Issues".

### When You Find a Bug

1. Identify which feature spec it belongs to
2. Add to spec's Known Issues table (include a status column — `open`)
3. Assign ID: `BUG-###` (global; mint with `spec-fns.mjs next bug`)
4. Link to REQ if it violates a requirement
5. Add changelog entry: "Added BUG-###: [description]"

### When You Fix a Bug

1. Verify the fix works
2. Set the Known Issues row's status to `resolved` — keep the row so regression-test `@spec BUG-###` references still resolve (removing it orphans them)
3. Add changelog entry: "Fixed BUG-###: [description]"

### Severity Guide

| Severity | Meaning | Example |
|----------|---------|---------|
| High | Feature broken, no workaround | SSE streaming never connects |
| Medium | Feature impaired, workaround exists | Edit fails but delete+recreate works |
| Low | Minor issue, cosmetic, edge case | Character counter flickers at limit |

### Proactive Bug Detection

Don't wait for explicit "report bug". Trigger bug tracking when:

| Situation | Action |
|-----------|--------|
| Test fails unexpectedly | Check Known Issues. If not listed, ask: "Should I log this as BUG-###?" |
| User says "broken", "doesn't work", "wrong" | Start bug logging flow |
| Implementation can't meet a REQ | Ask: "REQ-### can't be met as specified. Log as bug or update spec?" |
| Spot defect during code review | "Found issue: [description]. Add to Known Issues?" |
| Feature worked before, now doesn't | "Regression detected. Log as BUG-###?" |

---

## Test Health Check

After generating tests, run Test Health Check to validate test quality and prevent LLM-generated bad tests.

**When to run:**
- After generating tests from specs
- User says "check tests", "test health", "validate tests"
- Before committing test files

**What it validates:**

1. **TEST-RULE.1-2:** Verify all test imports exist, no placeholder paths
   - Auto-fixes broken imports

2. **TEST-RULE.3:** Flag vague test names
   - Reports violations for manual fix

3. **TEST-RULE.4:** Detect circular mocking and weak assertions
   - Scans for `mock.mockReturnValue(X); expect(...).toBe(X)` patterns
   - Reports violations with file:line
   - See `references/test-anti-patterns.md` for complete patterns

4. **TEST-RULE.5:** Validate @spec references — `scripts/spec-fns.mjs health`
   - Resolves every @spec ID (UserStory, REQ, …) to its single home
   - Reports `dangling` (no home), `multi_home` (duplicate), and `pending_merge` (future/) references

5. **TEST-RULE.6-9:** Detect LLM anti-patterns
   - Happy path bias (<3 error cases)
   - Over-mocking (>50% mock setup)
   - Copy-paste tests (identical structure)
   - Missing edge cases (null/undefined/empty)

**Output:**
- Auto-fixed issues (imports, paths)
- Violations requiring manual attention (circular mocks, vague names)
- LLM anti-pattern warnings

**Purpose:** Prevent tests that look valid but test nothing (mocks instead of code).

---

## Implementation Documentation

The spec records **where and why**; the code records **what and how**.

Document a **file map** (path + one-line purpose) and the feature's **entry points** (routes, handlers, commands). Do not mirror signatures, props, types, or schemas into the spec — they drift the moment code changes, and the code is already their source of truth.

Update when: files are added, moved, or removed; entry points change. To answer "where is this requirement implemented" without a hand-maintained list, `scripts/spec-fns.mjs loc <id>` returns every `@spec` back-reference live (they travel with the code, so they can't drift).

**Format:** `templates/feature.template.md` → Implementation section.

---

## Workflows

Most spec work is straightforward. For complex operations:

**Bootstrap:** `workflows/bootstrap.md`
Generate specs for an existing codebase.

**Todo analysis:** `workflows/todos.md`
Dependency mapping, YAGNI filtering, prioritization.

**Migrate:** `workflows/migrate.md`
Convert per-feature IDs to global IDs (single-home + resolve-by-id), via the `spec-fns.mjs` primitives.

---

## Markdown Formatting

Run before committing any spec changes:

```bash
# Lint all specs (adapt path: specs/ or app_spec/)
npx markdownlint-cli {specs,app_spec}/**/*.md --config {specs,app_spec}/.markdownlint.jsonc

# Auto-fix with prettier
npx prettier --write "{specs,app_spec}/**/*.md"
```

**Common issues to fix:**
- Missing language on code blocks → add `typescript`, `bash`, etc.
- Inconsistent list markers → use `-` throughout
- Trailing whitespace → trim lines
- Multiple blank lines → reduce to single blank line
- Bare URLs → wrap in `[text](url)` format

**Project config:** `specs/.markdownlint.jsonc` or `app_spec/.markdownlint.jsonc` disables:
- MD013 (line length) — tables often exceed 80 chars
- MD060 (table spacing) — compact tables are fine
- MD012 (multiple blank lines) — allowed for visual separation

---

## When Done

Summarize concisely:
- What was created/updated
- Key numbers (features documented, error cases, etc.)
- Implementation files added/modified
- Any issues found and fixed

**Return actionable todos** when appropriate:
- After writing a spec → return implementation todos
- After generating test plan → return test todos to write
- After analyzing priorities → return prioritized work items
