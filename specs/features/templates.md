# Feature: Templates

> Blank spec structures that ensure every overview and feature spec is consistent, complete, and usable as source of truth.

---

## User Stories

- UserStory-templates-01: As a developer, I can copy the overview template to create a project-level spec so that I don't miss any of the required sections (architecture, tech stack, data flow, cross-cutting concerns)
- UserStory-templates-02: As a developer, I can copy the feature template to create a feature spec so that I fill the required core sections and add optional sections only when their *Include when* test passes
- UserStory-templates-03: As a developer, I can read the feature template's Implementation section so that I know to document a file map (path + purpose) and entry points — and to leave signatures, props, types, and schemas in the code
- UserStory-templates-04: As a developer, I can copy the CLAUDE-SDD.md starter into a new project as CLAUDE.md so that spec-driven development is bound into every Claude session's workflow from day one

---

## Out of Scope

- Template validation or linting tooling (the validator script checks filled specs, not the templates themselves)
- Language-specific templates (templates are framework-agnostic)
- Auto-population of templates from code scanning (that's the bootstrap workflow's job)

---

## What It Does

- Provides `overview.template.md`: a complete project-level spec template with all sections pre-structured (purpose, user stories, architecture diagrams, tech stack, data flow, cross-cutting concerns, features table, development setup, deployment, decisions, constraints, roadmap, changelog)
- Provides `feature.template.md`: a two-tier feature spec template — **core sections** required in every spec (User Stories, Out of Scope, What It Does, Requirements, Error Cases, Edge Cases, Key Decisions, Known Issues, Future Considerations, Changelog) and **optional sections** each gated by an explicit *Include when* test (Architecture, Data Model, States & Transitions, API Endpoints, Implementation, Testing Notes)
- The Implementation section is a file map (path + one-line purpose) plus entry points — no mirrored signatures, props, types, or schemas
- Both spec templates include instructional comments that guide spec authors on what content belongs in each section
- The feature template includes the `UserStory-[feature]-##` format reminder and acceptance criteria note
- Provides `CLAUDE-SDD.md`: a CLAUDE.md starter for new projects that binds the SDD workflow — spec-first rule, spec-is-truth, sync-after-implementing, DRAFT confirmation, intent routing table, and validator/lint quality gates — with placeholders for project specifics

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | overview.template.md must include all required overview sections: Purpose, User Stories, System Architecture, Tech Stack, Data Flow, Cross-Cutting Concerns, Features table, Development, Key Decisions, Changelog | Must |
| REQ-2 | feature.template.md must declare the core sections required in every spec: User Stories (with ID format), Out of Scope, What It Does, Requirements (with ID and Priority columns), Error Cases (with 4 columns), Edge Cases, Key Decisions, Known Issues, Future Considerations, Changelog | Must |
| REQ-3 | Each optional section (Architecture, Data Model, States & Transitions, API Endpoints, Implementation, Testing Notes) must carry an explicit *Include when* test, and the Implementation section must be a file map (Path + Purpose) plus Entry Points — no component/hook/handler/schema tables | Must |
| REQ-4 | Both templates must use placeholder text (e.g., [Feature Name], [field1]) that makes the structure clear without implying real content | Must |
| REQ-5 | The feature template must include the UserStory ID format reminder (`UserStory-[feature]-##`) and the acceptance criteria note about tightening requirements | Must |
| REQ-6 | The overview template architecture section must include an ASCII diagram with component boxes and arrows | Should |
| REQ-7 | The feature template's optional States & Transitions section must include State Machine and State Descriptions subsections | Should |
| REQ-8 | CLAUDE-SDD.md must state the non-negotiable workflow rules (no feature work without a spec, spec is truth in disputes, sync after implementing, intent edits need confirmation, trivial-change exemption), an intent routing table, and the validator + markdownlint quality-gate commands | Must |

---

## Architecture

### Component Diagram

```text
skills/spec-driven-development/
└── templates/
    ├── overview.template.md    ← used for: specs/overview.md or app_spec/overview.md
    ├── feature.template.md     ← used for: specs/features/*.md or app_spec/features/*.md
    └── CLAUDE-SDD.md           ← copied to a new project's root as CLAUDE.md
```

### Data Flow

```text
Developer or agent wants to create a new spec
    → reads overview.template.md or feature.template.md (as instructed by SKILL.md)
    → fills core sections; runs each optional section's Include-when test
    → keeps optional sections that pass, deletes the rest
    → saves to project's spec directory
```

---

## States & Transitions

| State | Description | Transition |
|-------|-------------|------------|
| Template | Blank structure with placeholder text and Include-when tests | Developer/agent reads and fills in |
| Draft spec | Core filled; optional sections kept or deleted per their tests | Developer reviews for completeness |
| Accepted spec | Passes quality checklist and validator | Used as implementation source of truth |

---

## Error Cases

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Core sections skipped | Developer/agent deletes core sections without filling them | Spec missing error cases, edge cases, or requirements; validator reports missing-section ERRORs | Re-read template; fill all core sections |
| Optional section padded | Section added even though its Include-when test fails | Boilerplate Architecture/Data Model sections with no real content | Delete the section; a complete core is a complete spec |
| Placeholder text left in spec | Template placeholder not replaced with real content | Spec contains [Feature Name], path/to/file, or similar fake content | Run spec health check; CODE-RULE.4 (placeholder paths) and CODE-RULE.6 (vague descriptions) catch this |
| Wrong template used | Feature spec created with overview template structure | Spec missing UserStory IDs, Requirements table | Start over with feature.template.md |
| Template out of date | Project uses v1 template lacking two-tier markers and file-map Implementation | Specs accumulate signature/schema tables that drift from code | Re-copy latest templates from repo |
| Implementation section mirrors code | Agent documents signatures, props, types, or schemas | Spec becomes a code mirror that drifts on every change | v2 template restricts Implementation to file map + entry points |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Feature has no backend (frontend-only) | API Endpoints fails its Include-when test and is deleted; no empty section left |
| Feature has no persisted entities | Data Model fails its Include-when test ("owns persisted entities or non-obvious data shapes") and is deleted |
| Project uses Go, not TypeScript | Template TypeScript examples replaced with Go equivalents; template is language-agnostic |
| Overview spec has no external services | External AI row in tech stack deleted; layer responsibilities table adjusted |
| Feature is very simple (1 user story, 2 requirements) | Core-only spec with no optional sections — complete by design, not thin |
| Project already has a CLAUDE.md | CLAUDE-SDD.md's workflow sections are merged into the existing file rather than replacing it; project-specific content is preserved |

---

## Implementation

### File Dependency Graph

```text
skills/spec-driven-development/templates/
├── overview.template.md        [standalone; referenced by SKILL.md and bootstrap.md]
├── feature.template.md         [standalone; referenced by SKILL.md and bootstrap.md]
└── CLAUDE-SDD.md               [standalone; copied into user projects as CLAUDE.md]
```

### Template Structure: CLAUDE-SDD.md

| Section | Purpose |
|---------|---------|
| Project | One-two sentence project description placeholder |
| Spec-Driven Workflow (Core) | The core loop and five non-negotiable rules (spec-first, spec is truth, sync, DRAFT confirmation, trivial exemption) |
| Spec Location | Spec directory layout and ID conventions |
| When To Do What | Intent routing table binding situations to SDD actions |
| Tests Trace to Specs | @spec headers, REQ coverage, anti-pattern pointers |
| Quality Gates | Validator and markdownlint/prettier commands to run before committing spec changes |
| Project Specifics | Build/test/lint command placeholders |

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

| Section | Tier | Purpose |
|---------|------|---------|
| User Stories | Core | UserStory-[feature]-## format with ID format note and acceptance criteria note |
| Out of Scope | Core | Explicit exclusions for this feature |
| What It Does | Core | High-level behavior bullets |
| Requirements | Core | REQ-## table with Priority (Must/Should/Could) |
| Architecture | Optional — feature spans more than one component or system | Component Diagram, Data Flow, Sequence Diagram (when 3+ systems in one flow) |
| Data Model | Optional — feature owns persisted entities or non-obvious data shapes | Field tables + Relationships diagram |
| States & Transitions | Optional — more than two states or non-obvious transitions | State machine ASCII art + State Descriptions table |
| Error Cases | Core | 4-column table: Error, Cause, User Sees, Recovery |
| Edge Cases | Core | 2-column table: Scenario, Expected Behavior |
| API Endpoints | Optional — feature exposes or consumes HTTP endpoints | Method, Endpoint, Request, Response, Description |
| Implementation | Optional — add after implementation | File Map (Path + Purpose) + Entry Points only |
| Key Decisions | Core | ADR-style per decision |
| Testing Notes | Optional — test strategy isn't obvious from Requirements and stories | Critical Paths (E2E), Unit Tests, Not Worth Testing |
| Known Issues | Core | BUG-[feature]-## table with severity |
| Future Considerations | Core | Unchecked todo list |
| Changelog | Core | Date/Change/Reason table |

---

## Key Decisions

### Decision 1: File map over signature mirror

**Context:** v1's Implementation section mirrored component signatures, hooks, handler routes, and database schema into the spec. Those tables drifted the moment code changed and duplicated what the code already states authoritatively.

**Options Considered:**

1. Keep mirroring signatures/schemas — self-contained spec, but constant drift and double maintenance
2. File map + entry points only — spec records *where and why*; code records *what and how*

**Decision:** File map. The Implementation section holds path + one-line purpose plus the feature's entry points (routes, handlers, commands), nothing more.

**Consequences:** Specs stay correct longer with less maintenance; existence of paths is mechanically checkable (CODE-RULE.3, validator). Readers open the code for signatures — which is where they were going anyway.

### Decision 2: Two tiers to prevent ceremony fatigue

**Context:** v1 treated every template section as expected, so simple features accumulated boilerplate Architecture, Data Model, and States sections just to look complete — and authors learned to pad rather than think.

**Options Considered:**

1. One flat template, all sections expected — uniform but heavy for small features
2. Separate "minimal" and "full" template variants — two files to keep in sync
3. One template, two tiers — core required, optional sections gated by *Include when* tests

**Decision:** Two tiers in a single template. Each optional section states the test for its own inclusion; if the test fails, the section is deleted.

**Consequences:** Simple features get short specs that are complete by definition. The Include-when test makes "should this section exist?" an explicit, reviewable judgment instead of a habit.

### Decision 3: Use ASCII art for diagrams, not Mermaid

**Context:** Mermaid diagrams are not reliably rendered in all Markdown viewers. Claude renders ASCII art as plain text.

**Decision:** Use ASCII art box-and-arrow diagrams for architecture, state machines, ERDs.

**Consequences:** Diagrams work in any viewer but require manual ASCII art construction. Claude is capable of generating them.

---

## Testing Notes

### Critical Paths

1. UserStory-templates-01: Create overview spec using template → verify all required sections present → covers REQ-1, REQ-6
2. UserStory-templates-02: Create feature spec using template → verify core sections filled and failing optional sections deleted → covers REQ-2, REQ-3, REQ-5
3. UserStory-templates-03: Read implementation section → verify file map + entry points format, no signature/schema tables → covers REQ-3

### Not Worth Testing

- Automated tests of template text (the validator checks filled specs, not templates)
- Whether placeholder text is visually obvious (subjective)
- Template file size

---

## Known Issues

No active bugs.

---

## Future Considerations

- [ ] Add a GraphQL API variant of the API Endpoints section

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2026-03-24 | Initial spec | Bootstrap from existing codebase |
| 2026-03-25 | Clarified automated tests not applicable (methodology-only repo) | Prevents spec agent from generating tests for this repo |
| 2026-03-25 | Added language tags to fenced code blocks | MD040 lint compliance |
| 2026-06-11 | Documented two-tier template (core/optional with Include-when tests), file-map-only Implementation section, new Key Decisions; removed minimal-variant todo (delivered by two-tier design) | Spec synced to methodology v2 template |
| 2026-06-11 | Added CLAUDE-SDD.md starter (UserStory-templates-04, REQ-8) | New CLAUDE.md starter binds SDD workflow into new projects |
