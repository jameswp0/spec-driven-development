# Feature: Workflows

> Step-by-step guides for complex operations that require multiple reads, decisions, and outputs: bootstrapping a codebase and analyzing todos.

---

## User Stories

- UserStory-018: As a developer, I can follow the bootstrap workflow to generate specs for an existing codebase so that I get a structured overview + feature specs without manually reading every template section instruction
- UserStory-019: As a developer, I can follow the todo analysis workflow to prioritize my backlog so that I know what to work on next based on dependencies, severity, and YAGNI filtering
- UserStory-020: As a developer, I can use the bootstrap workflow's check-for-existing-specs step so that running bootstrap on a partially-documented codebase fills gaps rather than overwriting existing work
- UserStory-021: As a developer, I can follow the migrate workflow to convert an existing project's per-feature IDs to global IDs so that `@spec` references resolve by identity and stop breaking on folds and renames

---

## Out of Scope

- Workflows for operations covered inline in SKILL.md (spec health check, bug tracking) — those are simple enough to not need a separate workflow file
- Automated execution of workflows (they are read by Claude, not run as scripts)
- Language-specific or framework-specific bootstrap variants

---

## What It Does

### bootstrap.md

A 7-step workflow for generating specs for an existing codebase:

1. Check for existing specs (skip if found, fill gaps if partial)
2. Understand the project (ask user or read README/package.json)
3. Identify features (think in user terms, explore routes/endpoints)
4. Create overview spec (fill from Step 1-2 understanding)
5. Create feature specs (one per feature; two-tier — core sections always, optional sections only where their *Include when* test passes) and verify against the checklist
6. Bind the workflow: create CLAUDE.md from `templates/CLAUDE-SDD.md` (placeholders filled from Steps 1–2 findings), or merge its workflow sections into an existing CLAUDE.md with user confirmation
7. Report (summary table including the CLAUDE.md outcome)

Bootstrap documents *existing* code, so output goes to `features/` only — aspirational items go to Future Considerations, or to `specs/future/` work items if the project uses the lifecycle convention.

### todos.md

A workflow for analyzing and prioritizing todos across all feature specs:

- Read all future considerations sections
- If `specs/future/` exists, include each work item there as a backlog entry (feature-sized, already specced — usually outranks loose todos)
- Map dependencies (what blocks what)
- Filter YAGNI candidates (do we actually need this?)
- Prioritize: bugs > security > blocking > quick wins
- Return prioritized, actionable list

### migrate.md

A 6-step workflow for adopting global IDs on a project with per-feature/per-file IDs:

1. Survey the cross-file reference ambiguity risk (do prose `REQ-N` mentions stay within each file's range?)
2. Assign global numbers (UserStory/BUG by unique token; REQ per-file off one counter)
3. Rewrite via `spec-fns.mjs sed`; add Status/Verify columns
4. Resolve the judgment tail (multi-spec `@spec` lines, fold-rot danglers, ranges)
5. Verify (`spec-fns.mjs health` clean; `validate-specs.mjs` 0 errors)
6. Sync the project's CLAUDE.md/AGENTS.md bindings

The mechanical bulk is `spec-fns.mjs`'s; the ambiguous tail is left to judgment — there is no fully-automatic migrator.

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-044 | bootstrap.md must include a pre-check step that reads existing specs before generating new ones | Must |
| REQ-045 | bootstrap.md must instruct the agent to think in user terms when identifying features (what can users do, not what files exist) | Must |
| REQ-046 | bootstrap.md must produce a report at the end showing: specs created, features documented, user story count, requirement count, error case count | Must |
| REQ-047 | bootstrap.md must reference the templates — agent reads templates before filling them, not from memory | Must |
| REQ-048 | todos.md must apply YAGNI filtering — question todos that add complexity without clear user value | Must |
| REQ-049 | todos.md must output a prioritized list with rationale, not just a ranked list | Must |
| REQ-050 | Each workflow must be concise enough to read in under 2 minutes — complex detail belongs in templates or SKILL.md | Should |
| REQ-051 | bootstrap.md must direct bootstrap output to `features/` only (it documents existing code); todos.md must include `specs/future/` work items as a backlog source when the directory exists | Should |
| REQ-052 | bootstrap.md must include a workflow-binding step: create CLAUDE.md from `templates/CLAUDE-SDD.md` with placeholders filled from bootstrap findings, or merge the starter's workflow sections into an existing CLAUDE.md only with user confirmation | Must |
| REQ-053 | migrate.md must guide per-feature→global ID migration using the `spec-fns.mjs` primitives (next/loc/sed/health), and must leave the ambiguous tail — multi-spec `@spec` lines, fold-rot danglers, ranges — to human/agent judgment rather than auto-resolving | Must |

---

## Architecture

### Component Diagram

```text
skills/spec-driven-development/workflows/
├── bootstrap.md    ← read by agent for bootstrapping operations
├── todos.md        ← read by agent for todo analysis
└── migrate.md      ← read by agent for global-ID migration

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
    → Step 6: Read templates/CLAUDE-SDD.md → create or merge project CLAUDE.md
    → Step 7: Report summary table
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
| Bootstrap creates duplicate specs | Agent doesn't check existing specs before writing | Duplicate specs/overview.md and app_spec/overview.md | REQ-044 enforces pre-check; agent must read existing before writing |
| Features identified from files, not users | Agent lists "auth.go, chat.go, tasks.go" as features | Technical features, not user capabilities | REQ-045 enforces user-terms framing; agent asks "what can users do?" |
| Bootstrap report missing counts | Agent skips the final report step | No summary of what was created | REQ-046 enforces report; agent must produce table at end |
| Existing CLAUDE.md overwritten | Binding step replaces instead of merging | User loses their project instructions | REQ-052: merge sections and confirm with user before editing an existing CLAUDE.md |
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
├── todos.md            [standalone; reads specs/**/*.md at runtime]
└── migrate.md          [references: scripts/spec-fns.mjs; per-feature→global ID migration]
```

### bootstrap.md Structure

| Step | Description | Agent Actions |
|------|-------------|---------------|
| Before You Start | Check existing specs | Glob specs/**/*.md, app_spec/**/*.md |
| Step 1: Understand | Project purpose and users | AskUserQuestion or Read README, package.json |
| Step 2: Identify Features | What can users do? | Glob pages/**, app/**, Grep GET\|POST\|PUT\|DELETE |
| Step 3: Create Overview | Fill overview template | Read overview.template.md → Write specs/overview.md |
| Step 4: Create Feature Specs | One per feature; fill core sections, add optional sections only when their Include-when test passes; output to features/ only (bootstrap documents existing code) | Read feature.template.md → Write specs/features/[name].md |
| Step 5: Verify | Quality checklist | Check each spec for completeness |
| Step 6: Bind the Workflow | CLAUDE.md from CLAUDE-SDD starter | Copy template + fill placeholders from findings, or merge sections (confirm with user first) |
| Step 7: Report | Summary table | Print features, user story count, requirement count, error count, CLAUDE.md outcome |

### todos.md Structure

| Step | Description | Agent Actions |
|------|-------------|---------------|
| Step 1: Gather | Read all future considerations; include specs/future/ work items if present | Glob specs/**/*.md → Read each → extract todos and future/ work items |
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

**Decision:** Separate files. Bootstrap is multi-step and detailed (7 steps with substeps). Putting it inline would bloat the skill beyond what's needed for everyday use.

**Consequences:** Agent must read the workflow file explicitly. SKILL.md includes pointers to workflows/ and instructs when to read them.

### Decision 2: Tips section at the end of bootstrap.md

**Context:** New spec authors make common mistakes (over-documenting, aiming for perfection).

**Decision:** Include a "Tips" section at the end of bootstrap.md with three principles: don't try to document everything, user perspective first, good enough > perfect.

**Consequences:** Sets expectations and prevents analysis paralysis during bootstrapping.

---

## Testing Notes

### Critical Paths

1. UserStory-018: Run /sdd bootstrap → verify Step 1 checks existing specs → Steps 3-5 create valid specs using templates → Step 6 binds CLAUDE.md → Step 7 produces report → covers REQ-044, REQ-045, REQ-046, REQ-047, REQ-052
2. UserStory-019: Run /sdd "what should I work on?" → verify all future considerations sections read → YAGNI filter applied → prioritized list returned → covers REQ-048, REQ-049
3. UserStory-020: Run /sdd bootstrap with partial specs → verify only missing specs created → existing specs not overwritten → covers REQ-044

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
| 2026-06-11 | Documented two-tier template usage in bootstrap Step 4 | Spec synced to methodology v2 bootstrap.md |
| 2026-06-11 | Added REQ-051: bootstrap outputs to features/ only; todos workflow scans specs/future/ as a backlog source | Merged spec-lifecycle work item (lifecycle's first execution) |
| 2026-06-11 | Added REQ-052 and Step 6: bootstrap binds the workflow via CLAUDE-SDD starter (create or merge with confirmation); report is now Step 7 | Bootstrapped projects got specs but no CLAUDE.md binding — next session wasn't spec-driven |
| 2026-06-13 | Added migrate.md workflow (UserStory-021, REQ-053): per-feature→global ID migration via spec-fns.mjs, ambiguous tail left to judgment; REQ-050 generalized to "each workflow" | v3 global-ID model needs a first-class, repeatable migration path |
