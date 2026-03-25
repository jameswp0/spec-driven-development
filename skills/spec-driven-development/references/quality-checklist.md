# Full Quality Checklist

Before finishing any spec work, verify the following items. These map to CODE-RULE.1-13 and TEST-RULE.1-9 from the Quality Rules section in SKILL.md.

## Content (All Specs)

- [ ] No empty sections or placeholders (CODE-RULE.7)
- [ ] No vague descriptions ("handles errors appropriately") (CODE-RULE.8)
- [ ] Active voice ("API returns" not "data is returned")
- [ ] Spec is understandable without prior context (clear "What It Does", scannable structure)
- [ ] Changelog entry added for changes

## Feature Specs — User Stories

- [ ] User stories have unique IDs (UserStory-[feature]-##)
- [ ] Format: "As a user, I can [action] so that [benefit]"
- [ ] Out of scope documented — what Claude will not build for this feature

## Feature Specs — Requirements

- [ ] Requirements have unique IDs (REQ-##, sequential within this feature spec)
- [ ] Each requirement has Priority (Must/Should/Could)
- [ ] Requirements are testable (clear pass/fail)

## Feature Specs — Error & Edge Cases

- [ ] Error cases table: Error, Cause, User Sees, Recovery
- [ ] At least 3 error cases documented (CODE-RULE.10)
- [ ] Edge cases table: Scenario, Expected Behavior
- [ ] At least 3 edge cases documented (CODE-RULE.11-edge)

## Feature Specs — Architecture

- [ ] Component diagram present
- [ ] Data flow documented
- [ ] Data model with fields and types

## Feature Specs — Implementation

- [ ] Implementation section present (or explicitly deleted if not applicable)
- [ ] File dependency graph shows actual file structure (CODE-RULE.2)
- [ ] All file paths in tables exist in codebase (CODE-RULE.2)
- [ ] Component/Handler signatures match actual code (CODE-RULE.3)
- [ ] Type definitions match actual types (CODE-RULE.3)
- [ ] Database schema matches migrations (CODE-RULE.5)
- [ ] No placeholder file paths (`path/to/file.ts`, `handlers/example.go`) (CODE-RULE.6)
- [ ] No example/dummy data in tables (rows must contain real values from the codebase, not placeholders like "example.com", "test@email.com", or "placeholder value")
- [ ] Table columns complete (no empty cells except optional State/Side Effects) (CODE-RULE.7)
- [ ] Functions include return types/signatures
- [ ] HTTP routes match actual endpoints

## Feature Specs — Testing

- [ ] Critical paths identified
- [ ] "Not Worth Testing" documented

## Feature Specs — Known Issues

- [ ] Bugs have unique IDs (BUG-[feature]-##)
- [ ] Each bug has Severity (High/Medium/Low) and Status (Open/Fixed)
- [ ] Fixed bugs removed (with changelog entry)
- [ ] Links column has relevant refs (REQ-##, UserStory-[feature]-##, test file:line)

## Traceability

- [ ] Each UserStory-* maps to E2E test (or documented why not) (TEST-RULE.5)
- [ ] Each REQ-* covered by test
- [ ] Test count is manageable

## Freshness

- [ ] Spec matches current implementation — re-read code if uncertain
- [ ] No outdated references

## Project Organization

- [ ] All .md files in specs/ (or app_spec/), or legitimate exceptions: README.md, CLAUDE.md, CONTRIBUTING.md, CHANGELOG.md, LICENSE.md, docs/**
- [ ] No .txt files in project root or source directories
- [ ] Stray .md/.txt files identified and confirmed with user before deleting

## Markdown Formatting

- [ ] Headings use ATX style (`#` not underlines)
- [ ] Lists use consistent markers (`-` preferred)
- [ ] Code blocks have language identifiers (```typescript, ```bash)
- [ ] Tables are properly aligned
- [ ] No trailing whitespace
- [ ] Single blank line between sections
- [ ] No bare URLs (use `[text](url)` format)
- [ ] Consistent indentation (2 spaces for nested lists)
