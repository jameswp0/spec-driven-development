---
name: spec-driven-development
description: Spec-driven development methodology. Write specs before building, update after implementing, check against when tests fail, log bugs in, surface todos when idle. Use when bootstrapping a codebase, running a spec health check, generating tests from requirements, or writing a feature spec. Specs define intent before code exists and connect intent, code, and tests.
---

> **Spec location:** Typically `specs/` or `app_spec/`. Adapt paths to your project.

## Contents

- [First: Read Templates](#first-read-templates)
- [Quality Rules](#quality-rules)
- [Principle](#principle)
- [Intent Detection](#intent-detection) · [Spec Health Check](#spec-health-check)
- [The Flow](#the-flow)
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

**Overview spec**: One per project. System architecture, tech stack, data flow, cross-cutting concerns.

**Feature specs**: One per feature. User stories, requirements, states, errors, decisions.

Templates show the ideal structure. Use them as a guide, not a rigid checklist — include what's useful, skip what's not relevant.

---

## Quality Rules

The agent enforces 19 quality rules to prevent AI guessing instead of verifying reality. These rules map to the Quality Checklist below.

### Code & Spec Quality Rules

**CRITICAL - Process Rules (enforced during execution):**

**CODE-RULE.1: Read Before Write**
- **What:** Must Read file before Edit/Write
- **Why:** Prevents inventing signatures or paths
- **Enforced:** Required before any Edit/Write operation
- **Checklist:** "All file paths in tables exist in codebase"

**CODE-RULE.9: Match Existing Patterns**
- **What:** Must Grep for patterns before introducing new ones
- **Why:** Maintains codebase consistency
- **Enforced:** Required before documenting new patterns
- **Checklist:** "Patterns match existing codebase"

**AUTO-FIXED - Validation Rules (enforced in health check):**

> **What "auto-fix" means:** During the Spec Health Check, the agent reads the affected file, makes the correction in-place using Edit, and reports what was changed. Auto-fixed items do not require user confirmation (unlike stray file deletion, which always requires confirmation).

**CODE-RULE.2: Verify Existence**
- **What:** Glob/Grep confirms files/functions exist before referencing
- **Why:** Prevents references to non-existent code
- **Enforced:** Auto-fixed in health check Step 2
- **Checklist:** "All file paths in tables exist in codebase"

**CODE-RULE.3: Extract Actual Signatures**
- **What:** Read and copy real signatures from code
- **Why:** Prevents invented function signatures
- **Enforced:** Auto-fixed in health check Step 2
- **Checklist:** "Component/Handler signatures match actual code"

> **Note:** CODE-RULE.4 is intentionally absent — the numbering was reserved for a rule that was removed during revision (file timestamp checking, which breaks on git checkout).

**CODE-RULE.5: Validate Schema**
- **What:** Read migrations, sync database schema
- **Why:** Ensures schema docs match reality
- **Enforced:** Auto-fixed in health check Step 2
- **Checklist:** "Database schema matches migrations"

**CODE-RULE.6: No Placeholder Paths**
- **What:** Replace `path/to/file` with actual verified paths
- **Why:** Prevents fake documentation
- **Enforced:** Auto-fixed in health check Step 3
- **Checklist:** "No placeholder file paths"

**CODE-RULE.7: No Empty Cells**
- **What:** Parse tables, fill missing values
- **Why:** Ensures complete documentation
- **Enforced:** Auto-fixed in health check Step 3
- **Checklist:** "Table columns complete (no empty cells)"

**CODE-RULE.8: No Vague Descriptions**
- **What:** Replace "handles errors" with specific behavior
- **Why:** Makes specs actionable and testable
- **Enforced:** Auto-fixed in health check Step 3
- **Checklist:** "No vague descriptions"

**CODE-RULE.10: Minimum 3 Errors**
- **What:** Add error cases if <3
- **Why:** Ensures thorough error coverage
- **Enforced:** Auto-fixed in health check Step 3
- **Checklist:** "At least 3 error cases documented"

**CODE-RULE.11-edge: Minimum 3 Edge Cases**
- **What:** Add edge cases if <3
- **Why:** Ensures behavior under unusual inputs is specified
- **Enforced:** Auto-fixed in health check Step 2
- **Checklist:** "At least 3 edge cases documented"

**OUT OF SCOPE - Code Review Rules (not enforced by spec agent):**

- **CODE-RULE.11: Justify Dependencies** — every new dependency must be justified; enforced in code review
- **CODE-RULE.12: Simplest First** — choose simplest solution that works; enforced by architectural judgment
- **CODE-RULE.13: Delete Before Adding** — remove dead code before adding new; enforced by code reviewer

### Test Quality Rules

**CRITICAL - Anti-LLM Failure Rules:**

**TEST-RULE.4: Assert Actual Output**
- **What:** Tests capture real behavior, not mocked returns
- **Why:** Prevents circular testing (testing mocks instead of code)
- **Enforced:** Reported in Test Health Check
- **Example:** See `references/test-anti-patterns.md`

**TEST-RULE.5: E2E @spec References**
- **What:** Tests link to valid UserStory IDs
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

## Intent Detection

| Situation | Action |
|-----------|--------|
| Starting new feature | Write spec first, then implement |
| Documenting existing code | Create spec using template |
| Checking if spec matches code | Compare to reality, fix discrepancies |
| Codebase has no specs | Use `workflows/bootstrap.md` |
| Deciding what to work on | Use `workflows/todos.md` |
| Spec may be outdated | Update to reflect current state |
| Before committing specs | Run markdown lint |
| Need test coverage | Generate tests from requirements |
| Just finished implementing | Run tests, update spec |
| Something is broken | Add to Known Issues |
| Bug was fixed | Remove from Known Issues, add changelog |

Don't overthink routing. Understand what they need, do it.

### Spec Health Check

When user says "check specs", "health", or after significant work:

1. Use Glob (`specs/**/*.md`, `app_spec/**/*.md`) to find all spec files
2. For each spec: verify file paths exist (CODE-RULE.2), extract actual signatures (CODE-RULE.3), fix placeholder paths (CODE-RULE.6), fill empty cells (CODE-RULE.7), make descriptions specific (CODE-RULE.8), ensure ≥3 error cases (CODE-RULE.10), ensure ≥3 edge cases (CODE-RULE.11-edge)
3. Use Glob to identify stray `.md`/`.txt` files outside `specs/`/`app_spec/` — report what was found and **confirm with user before deleting**. Exceptions (never flag): `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE.md`, `docs/**`

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

## Process Notes

- If a section doesn't apply, delete it. No empty sections or placeholders.
- When documenting existing code, read the code first. Don't invent.
- When designing new features, write the spec first. Then implement.

## Quality Checklist

> **Full checklist:** [references/quality-checklist.md](references/quality-checklist.md)

Critical items before finishing:

- [ ] No empty sections or placeholders (CODE-RULE.7)
- [ ] No vague descriptions — specific and observable (CODE-RULE.8)
- [ ] User stories have unique IDs in correct format: `UserStory-[feature]-##`
- [ ] Requirements have unique IDs (`REQ-##`, sequential within this feature spec) and Priority (Must/Should/Could)
- [ ] At least 3 error cases: Error, Cause, User Sees, Recovery (CODE-RULE.10)
- [ ] At least 3 edge cases: Scenario, Expected Behavior
- [ ] All file paths verified to exist in codebase (CODE-RULE.2, 6)
- [ ] Component/Handler signatures match actual code (CODE-RULE.3)
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
2. Add to spec's Known Issues table
3. Assign ID: BUG-[feature]-## (sequential)
4. Link to REQ if it violates a requirement
5. Add changelog entry: "Added BUG-[feature]-##: [description]"

### When You Fix a Bug

1. Verify the fix works
2. Remove row from Known Issues table
3. Add changelog entry: "Fixed BUG-[feature]-##: [description]"

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
| Test fails unexpectedly | Check Known Issues. If not listed, ask: "Should I log this as BUG-[feature]-##?" |
| User says "broken", "doesn't work", "wrong" | Start bug logging flow |
| Implementation can't meet a REQ | Ask: "REQ-## can't be met as specified. Log as bug or update spec?" |
| Spot defect during code review | "Found issue: [description]. Add to Known Issues?" |
| Feature worked before, now doesn't | "Regression detected. Log as BUG-[feature]-##?" |

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

4. **TEST-RULE.5:** Validate @spec references
   - Verifies spec files and UserStory IDs exist
   - Reports broken references

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

Document public APIs (exported functions, components, hooks), entry points (handlers, routes), file organization, and database schema. Skip private/internal functions, standard patterns, and helper utilities.

Update when: after implementing a feature, after refactoring, when docs are stale.

**Full format with examples:** `templates/feature.template.md` → Implementation section.

---

## Workflows

Most spec work is straightforward. For complex operations:

**Bootstrap:** `workflows/bootstrap.md`
Generate specs for an existing codebase.

**Todo analysis:** `workflows/todos.md`
Dependency mapping, YAGNI filtering, prioritization.

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
