# Feature: Workflows

> Step-by-step guides for complex operations that require multiple reads, decisions, and outputs: bootstrapping a codebase and analyzing todos.

---

## User Stories

- UserStory-workflows-01: As a developer, I can follow the bootstrap workflow to generate specs for an existing codebase so that I get a structured overview + feature specs without manually reading every template section instruction
- UserStory-workflows-02: As a developer, I can follow the todo analysis workflow to prioritize my backlog so that I know what to work on next based on dependencies, severity, and YAGNI filtering
- UserStory-workflows-03: As a developer, I can use the bootstrap workflow's check-for-existing-specs step so that running bootstrap on a partially-documented codebase fills gaps rather than overwriting existing work

---

## Out of Scope

- Workflows for operations covered inline in SKILL.md (spec health check, bug tracking) — those are simple enough to not need a separate workflow file
- Automated execution of workflows (they are read by Claude, not run as scripts)
- Language-specific or framework-specific bootstrap variants

---

## What It Does

### bootstrap.md

A 6-step workflow for generating specs for an existing codebase:

1. Check for existing specs (skip if found, fill gaps if partial)
2. Understand the project (ask user or read README/package.json)
3. Identify features (think in user terms, explore routes/endpoints)
4. Create overview spec (fill from Step 1-2 understanding)
5. Create feature specs (one per feature, all 5 spec elements)
6. Verify and report (checklist + summary table)

### todos.md

A workflow for analyzing and prioritizing todos across all feature specs:

- Read all future considerations sections
- Map dependencies (what blocks what)
- Filter YAGNI candidates (do we actually need this?)
- Prioritize: bugs > security > blocking > quick wins
- Return prioritized, actionable list

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | bootstrap.md must include a pre-check step that reads existing specs before generating new ones | Must |
| REQ-2 | bootstrap.md must instruct the agent to think in user terms when identifying features (what can users do, not what files exist) | Must |
| REQ-3 | bootstrap.md must produce a report at the end showing: specs created, features documented, user story count, requirement count, error case count | Must |
| REQ-4 | bootstrap.md must reference the templates — agent reads templates before filling them, not from memory | Must |
| REQ-5 | todos.md must apply YAGNI filtering — question todos that add complexity without clear user value | Must |
| REQ-6 | todos.md must output a prioritized list with rationale, not just a ranked list | Must |
| REQ-7 | Both workflows must be concise enough to read in under 2 minutes — complex detail belongs in templates or SKILL.md | Should |

---

## Architecture

### Component Diagram

```text
skills/spec-driven-development/workflows/
├── bootstrap.md    ← read by agent for bootstrapping operations
└── todos.md        ← read by agent for todo analysis

Each workflow references:
├── templates/overview.template.md  (bootstrap.md → Step 3)
└── templates/feature.template.md   (bootstrap.md → Step 4)
```

### Data Flow: Bootstrap

```text
Developer: /sdd bootstrap
    → agent reads bootstrap.md
    → Step 1: Glob specs/**/*.md → check existing
    → Step 2: AskUserQuestion or Read README
    → Step 3: Glob pages/**,app/**,*.go to find features
    → Step 4: Read overview.template.md → Write specs/overview.md
    → Step 5: for each feature: Read feature.template.md → Write specs/features/[feature].md
    → Step 6: Report summary table
```

### Data Flow: Todo Analysis

```text
Developer: /sdd what should I work on?
    → agent reads todos.md
    → Glob specs/**/*.md → Read each spec's Future Considerations
    → Map dependencies between todos
    → Apply YAGNI filter
    → Return prioritized list with rationale
```

---

## States & Transitions

### Bootstrap Workflow States

| State | Description | Transition |
|-------|-------------|------------|
| Pre-check | Check for existing specs | Found → fill gaps / Not found → proceed |
| Understanding | Gather project purpose and users | Complete → feature identification |
| Feature identification | Discover features from code or user | Confirmed with user → spec creation |
| Spec creation | Write overview + feature specs | All features written → verify |
| Verification | Run quality checklist on new specs | Passes → report |
| Complete | Report delivered | Developer reviews specs |

---

## Error Cases

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Bootstrap creates duplicate specs | Agent doesn't check existing specs before writing | Duplicate specs/overview.md and app_spec/overview.md | REQ-1 enforces pre-check; agent must read existing before writing |
| Features identified from files, not users | Agent lists "auth.go, chat.go, tasks.go" as features | Technical features, not user capabilities | REQ-2 enforces user-terms framing; agent asks "what can users do?" |
| Bootstrap report missing counts | Agent skips Step 6 report | No summary of what was created | REQ-3 enforces report; agent must produce table at end |
| Todo analysis with no todos | All feature specs have empty Future Considerations | "No todos found" without actionable guidance | Agent should note what sections were checked and confirm specs exist |
| YAGNI filter removes valid todo | Agent over-filters and removes important work | Developer misses needed improvement | Agent explains rationale; developer can override |
| Bootstrap runs on project with no code | Nothing to explore | Agent asks for project description | AskUserQuestion triggers; spec written from conversation |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Project has 20+ features | Bootstrap creates specs one at a time; agent may ask developer which features to prioritize first |
| Bootstrap finds app_spec/ with 3 of 8 features documented | Agent reads existing 3, identifies 5 missing, creates only the 5 missing specs |
| Todo analysis finds circular dependencies | Agent flags the cycle and asks developer to break it |
| All todos are YAGNI candidates | Agent reports this explicitly; asks if any are actually needed |
| Bootstrap on a non-web project (CLI tool, library) | Agent adapts: no frontend routes, looks for exported functions/CLi commands instead |

---

## Implementation

### File Dependency Graph

```text
skills/spec-driven-development/workflows/
├── bootstrap.md        [references: templates/overview.template.md, templates/feature.template.md]
└── todos.md            [standalone; reads specs/**/*.md at runtime]
```

### bootstrap.md Structure

| Step | Description | Agent Actions |
|------|-------------|---------------|
| Before You Start | Check existing specs | Glob specs/**/*.md, app_spec/**/*.md |
| Step 1: Understand | Project purpose and users | AskUserQuestion or Read README, package.json |
| Step 2: Identify Features | What can users do? | Glob pages/**, app/**, Grep GET\|POST\|PUT\|DELETE |
| Step 3: Create Overview | Fill overview template | Read overview.template.md → Write specs/overview.md |
| Step 4: Create Feature Specs | One per feature | Read feature.template.md → Write specs/features/[name].md |
| Step 5: Verify | Quality checklist | Check each spec for completeness |
| Step 6: Report | Summary table | Print features, user story count, requirement count, error count |

### todos.md Structure

| Step | Description | Agent Actions |
|------|-------------|---------------|
| Step 1: Gather | Read all future considerations | Glob specs/**/*.md → Read each → extract todos |
| Step 2: Dependencies | Map blocking relationships | Identify which todos require others first |
| Step 3: YAGNI filter | Question low-value todos | Ask: do we actually need this? |
| Step 4: Prioritize | Order by impact | bugs > security > blocking > quick wins |
| Step 5: Report | Actionable prioritized list | Print todos with rationale and priority |

---

## Key Decisions

### Decision 1: Separate workflow files vs. inline in SKILL.md

**Context:** Bootstrap and todo analysis could be documented inline in SKILL.md.

**Options Considered:**

1. Inline in SKILL.md — always loaded, no extra reads
2. Separate workflow files — loaded only when needed

**Decision:** Separate files. Bootstrap is multi-step and detailed (6 steps with substeps). Putting it inline would bloat the skill beyond what's needed for everyday use.

**Consequences:** Agent must read the workflow file explicitly. SKILL.md includes pointers to workflows/ and instructs when to read them.

### Decision 2: Tips section at the end of bootstrap.md

**Context:** New spec authors make common mistakes (over-documenting, aiming for perfection).

**Decision:** Include a "Tips" section at the end of bootstrap.md with three principles: don't try to document everything, user perspective first, good enough > perfect.

**Consequences:** Sets expectations and prevents analysis paralysis during bootstrapping.

---

## Testing Notes

### Critical Paths

1. UserStory-workflows-01: Run /sdd bootstrap → verify Step 1 checks existing specs → Steps 3-5 create valid specs using templates → Step 6 produces report → covers REQ-1, REQ-2, REQ-3, REQ-4
2. UserStory-workflows-02: Run /sdd "what should I work on?" → verify all future considerations sections read → YAGNI filter applied → prioritized list returned → covers REQ-5, REQ-6
3. UserStory-workflows-03: Run /sdd bootstrap with partial specs → verify only missing specs created → existing specs not overwritten → covers REQ-1

### Not Worth Testing

- Automated tests (no runnable code — methodology-only repo)
- Quality of Claude's YAGNI judgment (behavioral)
- Completeness of generated specs (covered by spec health check)

---

## Known Issues

No active bugs.

---

## Future Considerations

- [ ] Add a `workflows/test-generation.md` for generating full test suites from feature specs
- [ ] Add a `workflows/spec-review.md` for peer-reviewing a spec before implementation

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2026-03-24 | Initial spec | Bootstrap from existing codebase |
| 2026-03-25 | Clarified automated tests not applicable (methodology-only repo) | Prevents spec agent from generating tests for this repo |
| 2026-03-25 | Added language tags to fenced code blocks; added blank line before Options Considered list | MD040, MD032 lint compliance |
