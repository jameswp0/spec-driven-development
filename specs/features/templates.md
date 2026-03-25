# Feature: Templates

> Blank spec structures that ensure every overview and feature spec is consistent, complete, and usable as source of truth.

---

## User Stories

- UserStory-templates-01: As a developer, I can copy the overview template to create a project-level spec so that I don't miss any of the required sections (architecture, tech stack, data flow, cross-cutting concerns)
- UserStory-templates-02: As a developer, I can copy the feature template to create a feature spec so that I have the correct structure for user stories, requirements, error cases, edge cases, and implementation documentation
- UserStory-templates-03: As a developer, I can read the feature template's Implementation section so that I know the exact format for documenting components, hooks, handlers, and database schema

---

## Out of Scope

- Template validation or linting tooling (templates are read by Claude, not executed)
- Language-specific templates (templates are framework-agnostic)
- Auto-population of templates from code scanning (that's the bootstrap workflow's job)

---

## What It Does

- Provides `overview.template.md`: a complete project-level spec template with all sections pre-structured (purpose, user stories, architecture diagrams, tech stack, data flow, cross-cutting concerns, features table, development setup, deployment, decisions, constraints, roadmap, changelog)
- Provides `feature.template.md`: a complete feature spec template with user story format, requirements table, architecture diagrams, data model, state machine, error cases, edge cases, API endpoints, implementation tables (components, hooks, handlers, schema), decisions, testing notes, known issues, future considerations, changelog
- Both templates include instructional comments that guide spec authors on what content belongs in each section
- The feature template includes the `UserStory-[feature]-##` format reminder and acceptance criteria note

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | overview.template.md must include all required overview sections: Purpose, User Stories, System Architecture, Tech Stack, Data Flow, Cross-Cutting Concerns, Features table, Development, Key Decisions, Changelog | Must |
| REQ-2 | feature.template.md must include all required feature sections: User Stories (with ID format), Out of Scope, Requirements (with ID and Priority columns), Architecture, Error Cases (with 4 columns), Edge Cases, Implementation, Known Issues, Future Considerations, Changelog | Must |
| REQ-3 | The feature template's Implementation section must include tables for: Frontend components, Hooks, API layer, Type definitions, Backend handlers, Models, Services, Database schema | Must |
| REQ-4 | Both templates must use placeholder text (e.g., [Feature Name], [field1]) that makes the structure clear without implying real content | Must |
| REQ-5 | The feature template must include the UserStory ID format reminder (`UserStory-[feature]-##`) and the acceptance criteria note about tightening requirements | Must |
| REQ-6 | The overview template architecture section must include an ASCII diagram with component boxes and arrows | Should |
| REQ-7 | The feature template must include State Machine and State Descriptions sections within States & Transitions | Should |

---

## Architecture

### Component Diagram

```
skills/spec-driven-development/
└── templates/
    ├── overview.template.md    ← used for: specs/overview.md or app_spec/overview.md
    └── feature.template.md     ← used for: specs/features/*.md or app_spec/features/*.md
```

### Data Flow

```
Developer or agent wants to create a new spec
    → reads overview.template.md or feature.template.md (as instructed by SKILL.md)
    → fills in sections with real content from codebase
    → saves to project's spec directory
```

---

## States & Transitions

| State | Description | Transition |
|-------|-------------|------------|
| Template | Blank structure with placeholder text | Developer/agent reads and fills in |
| Draft spec | Template filled with real content | Developer reviews for completeness |
| Accepted spec | Passes quality checklist | Used as implementation source of truth |

---

## Error Cases

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Template sections skipped | Developer/agent deletes sections without filling them | Spec missing error cases, edge cases, or architecture | Re-read template; fill missing sections or explicitly justify omission |
| Placeholder text left in spec | Template placeholder not replaced with real content | Spec contains [Feature Name], path/to/file, or similar fake content | Run spec health check; CODE-RULE.6 and CODE-RULE.7 catch this |
| Wrong template used | Feature spec created with overview template structure | Spec missing UserStory IDs, Requirements table | Start over with feature.template.md |
| Template out of date | Project uses old template lacking Out of Scope or Known Issues sections | Spec misses important sections | Re-copy latest templates from repo |
| Implementation section too detailed | Agent documents every private function, not just public API | Spec becomes a code mirror, not a spec | Implementation section guidance: document public APIs only |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Feature has no backend (frontend-only) | Backend sections in template are deleted; template instructs "delete if not applicable" |
| Feature has no database schema | Database schema section deleted; no empty section left |
| Project uses Go, not TypeScript | Template TypeScript examples replaced with Go equivalents; template is language-agnostic |
| Overview spec has no external services | External AI row in tech stack deleted; layer responsibilities table adjusted |
| Feature is very simple (1 user story, 2 requirements) | Template used but thin; that's acceptable if the feature is genuinely simple |

---

## Implementation

### File Dependency Graph

```
skills/spec-driven-development/templates/
├── overview.template.md        [standalone; referenced by SKILL.md and bootstrap.md]
└── feature.template.md         [standalone; referenced by SKILL.md and bootstrap.md]
```

### Template Structure: overview.template.md

| Section | Purpose |
|---------|---------|
| Purpose | 2-3 sentences on core problem and users |
| User Stories (Product Level) | High-level stories without UserStory-* IDs |
| Out of Scope | What the project explicitly excludes |
| System Architecture | High-level ASCII diagram + Layer Responsibilities table |
| Tech Stack | Frontend, Backend, Infrastructure tables with version columns |
| Data Flow | Read flow, Write flow, Authentication flow |
| Cross-Cutting Concerns | Auth, Error handling, State management, Caching |
| API Overview | Base URLs, auth header, common response codes, endpoints summary |
| Data Model Overview | ERD diagram + Core Entities table |
| Features | Table linking to feature specs |
| Development | Prerequisites, Setup, Commands, Environment Variables |
| Deployment | Environments table, Deploy Process |
| Key Decisions | ADR-style decisions with context, options, decision, consequences |
| Constraints & Limitations | Known limitations table |
| Future Roadmap | Unchecked todo list |
| Changelog | Date/Change/Reason table |

### Template Structure: feature.template.md

| Section | Purpose |
|---------|---------|
| User Stories | UserStory-[feature]-## format with ID format note and acceptance criteria note |
| Out of Scope | Explicit exclusions for this feature |
| What It Does | High-level behavior bullets |
| Requirements | REQ-## table with Priority (Must/Should/Could) |
| Architecture | Component Diagram, Data Flow, Sequence Diagram (optional) |
| Data Model | Field tables + Relationships diagram |
| States & Transitions | State machine ASCII art + State Descriptions table |
| Error Cases | 4-column table: Error, Cause, User Sees, Recovery |
| Edge Cases | 2-column table: Scenario, Expected Behavior |
| API Endpoints | Method, Endpoint, Request, Response, Description |
| Implementation | File dependency graph + component/hook/handler/schema tables |
| Key Decisions | ADR-style per decision |
| Testing Notes | Critical Paths (E2E), Unit Tests, Test Data, Not Worth Testing |
| Known Issues | BUG-[feature]-## table with severity |
| Future Considerations | Unchecked todo list |
| Changelog | Date/Change/Reason table |

---

## Key Decisions

### Decision 1: Include implementation section in feature template

**Context:** Implementation details (component signatures, handler routes, schema) could be in a separate document.

**Decision:** Include in the feature spec as a dedicated Implementation section. The spec is the single source of truth — implementation details belong with the feature's user stories and requirements.

**Consequences:** Feature specs are larger but self-contained. When a test fails, the developer reads one file to understand intent (user stories/REQs) and implementation (handler, component).

### Decision 2: Use ASCII art for diagrams, not Mermaid

**Context:** Mermaid diagrams are not reliably rendered in all Markdown viewers. Claude renders ASCII art as plain text.

**Decision:** Use ASCII art box-and-arrow diagrams for architecture, state machines, ERDs.

**Consequences:** Diagrams work in any viewer but require manual ASCII art construction. Claude is capable of generating them.

---

## Testing Notes

### Critical Paths

1. UserStory-templates-01: Create overview spec using template → verify all required sections present → covers REQ-1, REQ-6
2. UserStory-templates-02: Create feature spec using template → verify user story IDs, requirements, error cases, edge cases present → covers REQ-2, REQ-5
3. UserStory-templates-03: Read implementation section → verify component/hook/handler/schema tables present → covers REQ-3

### Not Worth Testing

- Automated tests (no runnable code — methodology-only repo)
- Whether placeholder text is visually obvious (subjective)
- Template file size

---

## Known Issues

No active bugs.

---

## Future Considerations

- [ ] Add a minimal template variant for simple features (fewer sections, faster to fill)
- [ ] Add a GraphQL API variant of the API Endpoints section

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2026-03-24 | Initial spec | Bootstrap from existing codebase |
