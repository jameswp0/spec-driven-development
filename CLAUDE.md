# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the **spec-driven-development** skill and agent for Claude Code. It provides templates, workflows, and methodology for creating and maintaining product specifications with user stories, testable requirements, and architecture documentation.

## Repository Structure

```
spec-driven-development/
├── skills/spec-driven-development/   # The main skill
│   ├── SKILL.md                     # Skill definition and methodology
│   ├── templates/                   # Spec templates
│   │   ├── overview.template.md     # Project-level overview spec
│   │   └── feature.template.md      # Individual feature spec
│   └── workflows/                   # Complex operation guides
│       ├── bootstrap.md             # Generate specs for existing codebases
│       └── todos.md                 # Todo analysis and prioritization
├── agents/spec-driven-development.md # Agent definition
└── research/                         # Research and drafts
```

## Core Concepts

### Spec-Driven Development Flow

```
Spec → Implement → Tests → Update spec if needed
```

- **User stories (UserStory-*)** define what users can do → become E2E tests
- **Requirements (REQ-*)** define testable behavior → become unit tests
- **Error cases** define failure handling → become edge case tests

### Spec Types

- **Overview spec**: One per project. System architecture, tech stack, data flow, cross-cutting concerns.
- **Feature specs**: One per feature. User stories, requirements, states, errors, decisions.

### ID Conventions

- User stories: `UserStory-[feature-code]-##` (e.g., `UserStory-chat-01`)
- Requirements: `REQ-##` (sequential within feature)
- Bugs: `BUG-[feature]-##` (e.g., `BUG-chat-03`)

### E2E Test Reference Format

E2E tests must trace back to specs:

```typescript
/**
 * @spec app_spec/frontend/components/[feature].md:UserStory-[code]-##
 * USER STORY: [Full user story text copied from spec]
 * SPEC: [filename] - REQ-1, REQ-2, ...
 */
```

## Key Workflows

### When to Read Templates First

| Task | Read First |
|------|------------|
| Creating/updating overview spec | `templates/overview.template.md` |
| Creating/updating feature spec | `templates/feature.template.md` |
| Bootstrapping new project | `workflows/bootstrap.md` |
| Analyzing todos | `workflows/todos.md` |

### Intent Detection

| User Says | Action |
|-----------|--------|
| "add feature", "build", "implement X" | Write spec first, then implement |
| "document", "create spec" | Create spec using template |
| "verify", "check spec" | Compare spec to reality, fix discrepancies |
| "bootstrap", "generate specs" | Use `workflows/bootstrap.md` |
| "todos", "what to work on" | Use `workflows/todos.md` |
| "add tests", "generate tests" | Generate tests from spec user stories and requirements |

## Quality Checklist Summary

### Feature Specs Must Have

- User stories with unique IDs and format: "As a user, I can [action] so that [benefit]"
- Requirements with unique IDs (REQ-##) and Priority (Must/Should/Could)
- At least 3 error cases with: Error, Cause, User Sees, Recovery
- At least 3 edge cases with: Scenario, Expected Behavior
- Component diagram and data flow documentation

### Bug Tracking

- Bugs live in feature specs under "Known Issues"
- Severity: High (broken, no workaround), Medium (impaired, workaround exists), Low (minor, cosmetic)
- Remove rows when fixed (add changelog entry)

### Markdown Formatting

```bash
# Lint all specs
npx markdownlint-cli app_spec/**/*.md --config app_spec/.markdownlint.jsonc

# Auto-fix with prettier
npx prettier --write "app_spec/**/*.md"
```

## Test Constraints

- 100 tests max total, 5 per feature area
- E2E tests must include `@spec` reference pointing to valid UserStory IDs
