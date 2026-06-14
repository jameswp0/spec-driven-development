# Full Quality Checklist

Before finishing any spec work, verify the following items. These map to CODE-RULE.1–8, REVIEW-RULE.1–3, and TEST-RULE.1–9 from the Quality Rules section in SKILL.md.

## Content (All Specs)

- [ ] No empty sections or placeholders (CODE-RULE.5)
- [ ] No vague descriptions ("handles errors appropriately") (CODE-RULE.6)
- [ ] Active voice ("API returns" not "data is returned")
- [ ] Spec is understandable without prior context (clear "What It Does", scannable structure)
- [ ] Core sections present; optional sections either pass their *Include when* test or are deleted
- [ ] Changelog entry added for changes

## Feature Specs — User Stories

- [ ] User stories have unique IDs (UserStory-###, global; mint with `spec-fns.mjs next userstory`)
- [ ] Format: "As a user, I can [action] so that [benefit]"
- [ ] Out of scope documented — what Claude will not build for this feature

## Feature Specs — Requirements

- [ ] Requirements have unique IDs (REQ-###, global; mint with `spec-fns.mjs next req`)
- [ ] Each requirement has Priority (Must/Should/Could)
- [ ] Requirements are testable (clear pass/fail)

## Feature Specs — Error & Edge Cases

- [ ] Error cases table: Error, Cause, User Sees, Recovery
- [ ] At least 3 error cases documented (CODE-RULE.7)
- [ ] Edge cases table: Scenario, Expected Behavior
- [ ] At least 3 edge cases documented (CODE-RULE.8)

## Feature Specs — Architecture (if included)

- [ ] Included only when the feature spans more than one component or system
- [ ] Component diagram present
- [ ] Data flow documented

## Feature Specs — Implementation (if included)

- [ ] File map only: Path + one-line Purpose, plus Entry Points — no mirrored signatures, props, types, or schemas
- [ ] All file paths in the file map exist in the codebase (CODE-RULE.3)
- [ ] No placeholder file paths (`path/to/file.ts`, `handlers/example.go`) (CODE-RULE.4)
- [ ] No example/dummy data in tables (rows must contain real values from the codebase)
- [ ] Table columns complete (no empty cells) (CODE-RULE.5)
- [ ] Entry points match actual routes/handlers/commands

## Feature Specs — Testing (if included)

- [ ] Critical paths identified
- [ ] "Not Worth Testing" documented

## Feature Specs — Known Issues

- [ ] Bugs have unique IDs (BUG-###, global; mint with `spec-fns.mjs next bug`)
- [ ] Each bug has Severity (High/Medium/Low) and Status (Open/Resolved)
- [ ] Fixed bugs set to Resolved — row kept so regression `@spec BUG-###` refs still resolve (with changelog entry)
- [ ] Links column has relevant refs (REQ-###, UserStory-###, test file:line)

## Traceability

- [ ] Each UserStory-* maps to E2E test (or documented why not) (TEST-RULE.5)
- [ ] Each REQ-* covered by test
- [ ] Test count is manageable

## Freshness

- [ ] Spec matches current implementation — re-read code if uncertain
- [ ] No outdated references

## Spec Organization (Link Hygiene)

- [ ] Every feature spec is linked from the overview's Features table
- [ ] Every Features-table link resolves to an existing file
- [ ] No orphan files inside the spec directory

## Markdown Formatting

- [ ] Headings use ATX style (`#` not underlines)
- [ ] Lists use consistent markers (`-` preferred)
- [ ] Code blocks have language identifiers (```typescript, ```bash)
- [ ] Tables are properly aligned
- [ ] No trailing whitespace
- [ ] Single blank line between sections
- [ ] No bare URLs (use `[text](url)` format)
- [ ] Consistent indentation (2 spaces for nested lists)
