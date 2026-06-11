# Feature: Skill

> The SDD methodology packaged as a Claude Code skill: discoverable in every conversation via its frontmatter description, with the full methodology loaded when spec work begins.

---

## User Stories

- UserStory-skill-01: As a developer, I can have the SDD methodology discoverable in every conversation so that Claude loads and follows the spec-first workflow whenever spec work comes up, without me needing to invoke a separate agent
- UserStory-skill-02: As a developer, I can read the quality rules so that I know exactly which violations are auto-fixed against the codebase, which are drafted for my confirmation, and which are out of the spec agent's scope
- UserStory-skill-03: As a developer, I can follow the spec health check procedure so that all spec files in my project are mechanically validated, sync-fixed, and draft-fixed (with my approval) in one pass

---

## Out of Scope

- Executing code at runtime — SKILL.md is a static Markdown file; the bundled validator script is a dev-time tool, documented in [validator.md](validator.md)
- Automatic triggering based on file changes — the skill activates on conversation intent, the agent on explicit invocation
- Enforcing judgment rules outside of what Claude can do with Read/Edit/Write/Glob/Grep tools

---

## What It Does

- Ships as `~/.claude/skills/spec-driven-development/SKILL.md` with `version: 2.0.0` frontmatter; Claude Code loads only the frontmatter description into context until the skill is invoked (progressive disclosure), then reads the full methodology
- Defines 20 quality rules grouped by how they are enforced: PROCESS (CODE-RULE.1–2, followed during execution), SYNC (CODE-RULE.3–4, auto-fixed in health check — the codebase is ground truth), DRAFT (CODE-RULE.5–8, drafted and applied only after user confirmation — the user's intent is ground truth), REVIEW (REVIEW-RULE.1–3, out of the spec agent's scope), and TEST (TEST-RULE.1–9, Test Health Check)
- The spec agent enforces 17 of the 20 rules: CODE-RULE.1–8 and TEST-RULE.1–9
- Provides intent detection table so Claude routes requests to the right action without overthinking
- Documents the 5-step flow: Understand → Spec → Implement → Test → Reflect
- Defines the 4-step Spec Health Check: (1) mechanical pass via `scripts/validate-specs.mjs`, (2) sync auto-fix pass, (3) draft-and-confirm pass, (4) link hygiene
- Points to two-tier templates: core sections required in every spec, optional sections gated by *Include when* tests
- Provides bug tracking and todo quality criteria inline

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | SKILL.md must be self-contained: all rules, intent detection, and the flow must be readable without opening any other file | Must |
| REQ-2 | Quality rules must be grouped by enforcement: PROCESS (followed during execution), SYNC (auto-fixed, codebase is ground truth), DRAFT (drafted, user confirms, intent is ground truth), REVIEW (out of the spec agent's scope), TEST (Test Health Check) | Must |
| REQ-3 | The Spec Health Check must specify four steps — mechanical validator run (`scripts/validate-specs.mjs`, with manual Glob/Grep fallback if Node is unavailable), sync auto-fix, draft-and-confirm, link hygiene — with no stray-file detection or exemption list | Must |
| REQ-4 | Each quality rule must include: what it checks, why it exists, how it's enforced, and (for CODE rules) which checklist item it maps to | Must |
| REQ-5 | The skill must document the difference between Overview spec user stories (no IDs, product-level) and Feature spec user stories (UserStory-* IDs, testable) | Must |
| REQ-6 | The skill must include a table of contents linking to all major sections | Should |
| REQ-7 | The skill must provide proactive bug detection triggers so Claude tracks bugs without waiting for explicit "report bug" requests | Should |
| REQ-8 | The skill must defer detailed format examples to references/ files rather than duplicating content inline | Could |

---

## Architecture

### Component Diagram

```text
~/.claude/skills/spec-driven-development/
├── SKILL.md                    ← description always visible; body loaded on invocation
├── templates/
│   ├── overview.template.md    ← read before creating overview spec
│   └── feature.template.md     ← two-tier; read before creating feature spec
├── workflows/
│   ├── bootstrap.md            ← read for bootstrap operations
│   └── todos.md                ← read for todo analysis
├── scripts/
│   └── validate-specs.mjs      ← run as health check step 1
└── references/
    ├── e2e-test-format.md      ← read for E2E test header format
    ├── examples.md             ← read for good/bad spec examples
    ├── quality-checklist.md    ← full quality checklist
    └── test-anti-patterns.md   ← LLM test anti-patterns
```

### Data Flow

```text
Claude Code indexes the SKILL.md frontmatter description (always in context)
    → user makes a spec-related request
    → skill is invoked; full SKILL.md body loaded
    → Claude detects intent via Intent Detection table
    → Claude follows The Flow or referenced workflow
    → Claude reads templates/workflows/references (and runs scripts/) as needed
```

---

## States & Transitions

### Skill Availability

| State | Description | Transition |
|-------|-------------|------------|
| Not installed | Files not in ~/.claude/skills/ | Developer runs cp install commands |
| Discoverable | SKILL.md present; frontmatter description in context | Spec-related request invokes the skill |
| Active | Full SKILL.md body loaded into conversation context | Methodology followed for the request |
| Outdated | Installed version older than repo (check `version` frontmatter) | Developer re-runs cp install commands |

---

## Error Cases

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Skill not loaded | SKILL.md not found in ~/.claude/skills/ | Claude doesn't follow SDD methodology; no proactive spec guidance | Run install cp commands from README |
| References not found | SKILL.md points to references/ but those files are missing | Claude can't follow detailed format instructions; may hallucinate test format | Ensure full `cp -r` was used, not just SKILL.md |
| Skill loaded but templates missing | templates/ directory not copied | Claude can't use template structure; creates ad-hoc specs without consistent format | Re-copy the full skills/spec-driven-development/ directory |
| Outdated quality rules | v1 install retains old numbering (CODE-RULE.9–13, 11-edge) which v2 renumbered into PROCESS/SYNC/DRAFT/REVIEW groups | Rule references in health check output don't match the installed skill | Re-copy the v2.0.0 skill; the v2 renumbering map in SKILL.md translates old IDs |
| Validator missing or Node unavailable | scripts/ not copied, or no Node.js 18+ on the machine | Health check step 1 can't run the mechanical pass | Re-copy full skill directory or install Node; SKILL.md specifies a manual Glob/Grep fallback |
| Conflicting spec location | Project has both specs/ and app_spec/ directories | Agent finds duplicate specs; may process wrong directory | Standardize on one location; document in CLAUDE.md |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Skill not yet invoked in a conversation | Only the frontmatter description occupies context; zero methodology overhead until spec work starts |
| Developer asks spec question without /sdd command | Skill provides inline guidance directly without launching agent |
| Project uses app_spec/ but developer says specs/ | Agent Globs both patterns, finds the correct directory, proceeds without error |
| SKILL.md modified locally by developer | Claude uses the modified version; changes respected as long as file remains valid Markdown |
| Multiple skills loaded simultaneously | Claude resolves intent using all loaded skills; SDD skill takes precedence for spec-related requests |

---

## Implementation

### File Dependency Graph

```text
skills/spec-driven-development/
├── SKILL.md                        [references: templates/, workflows/, references/, scripts/]
├── templates/
│   ├── overview.template.md        [standalone]
│   └── feature.template.md         [standalone; two-tier]
├── workflows/
│   ├── bootstrap.md                [references: templates/]
│   └── todos.md                    [standalone]
├── scripts/
│   └── validate-specs.mjs          [standalone; see features/validator.md]
└── references/
    ├── e2e-test-format.md          [standalone]
    ├── examples.md                 [standalone]
    ├── quality-checklist.md        [standalone]
    └── test-anti-patterns.md       [standalone]
```

### Key Content Sections in SKILL.md

| Section | Purpose | Lines (approx) |
|---------|---------|----------------|
| First: Read Templates | Routing table + two-tier template explanation | 15 |
| Quality Rules | 20 rules (17 enforced) grouped by enforcement, with v2 renumbering map | 110 |
| Principle | Core philosophy statement | 10 |
| Intent Detection | Routing table + 4-step Spec Health Check (validator, sync, draft, link hygiene) | 30 |
| The Flow | 5-step methodology | 60 |
| Process Notes + Quality Checklist | Quick checklist | 20 |
| E2E Test Format | Pointer to references/e2e-test-format.md | 5 |
| Failure Modes | Vague descriptions, happy path bias, premature completion | 15 |
| Todos | Quality criteria for future considerations | 20 |
| Bug Tracking | Find/fix flow + severity guide + proactive detection | 40 |
| Test Health Check | 5-step validation procedure | 35 |
| Implementation Documentation | File map + entry points; no mirrored signatures | 10 |
| Workflows | Pointers to bootstrap.md and todos.md | 10 |
| Markdown Formatting | Lint/prettier commands | 15 |
| When Done | Summary format + actionable todos | 15 |

---

## Key Decisions

### Decision 1: Full methodology inline vs. pointer-only

**Context:** The skill could be a single pointer file ("see workflow X") or contain the full methodology inline.

**Options Considered:**

1. Pointer-only — skill is tiny, always reads referenced files
2. Inline — skill contains all rules and flow, references for details only

**Decision:** Inline for core methodology (rules, flow, intent detection, bug tracking). Pointers only for format examples and templates (which change less often and are detailed).

**Consequences:** SKILL.md is verbose (~490 lines), but progressive disclosure means only the frontmatter description costs context until the skill is invoked. Once invoked, Claude has everything it needs without reading secondary files for every request.

### Decision 2: No-gos section removed; acceptance criteria moved inline

**Context:** Early versions had a separate "No-Gos" section in the spec template. Recent commits removed it and moved the concept into the user stories note.

**Decision:** Rather than a separate section, the feature template now includes an inline note on user stories: "Before implementation: could Claude satisfy the story text while building the wrong thing? If yes, tighten the requirements or add a no-go above."

**Consequences:** Spec authors think about no-gos at the point where they write user stories, not in a disconnected section.

### Decision 3: Generative fixes are drafted, not auto-applied

**Context:** The v1 health check auto-fixed every violation, including filling empty cells, sharpening vague wording, and padding error/edge tables to the minimum of 3.

**Options Considered:**

1. Auto-fix everything — fast, but the AI invents requirements, error cases, and intent
2. Draft and confirm — DRAFT-rule fixes (CODE-RULE.5–8) are proposed; the user approves or edits before they land

**Decision:** Draft and confirm. SYNC rules (CODE-RULE.3–4) stay auto-fixed because the codebase already proves the correct value; DRAFT rules govern intent, so the agent must not invent the intent it is constrained by.

**Consequences:** Health checks pause for user input when intent gaps are found. Specs never contain silently AI-invented requirements.

---

## Testing Notes

### Critical Paths

1. UserStory-skill-01: Install skill → make a spec-related request → verify the skill is invoked and the methodology followed without /sdd → covers REQ-1, REQ-2
2. UserStory-skill-02: Read quality rules → identify a violation in each group → verify SYNC is auto-fixed, DRAFT is confirmed first, REVIEW is declined as out of scope → covers REQ-2, REQ-4
3. UserStory-skill-03: Run spec health check → verify validator runs first → sync fixes applied → draft fixes presented for approval → link hygiene reported → covers REQ-3

### Not Worth Testing

- Automated tests of the methodology text (the validator script has its own spec: [validator.md](validator.md))
- Whether Claude actually follows the rules (behavioral, not structural)
- File size of SKILL.md (not a spec concern)

---

## Known Issues

No active bugs.

---

## Future Considerations

- [ ] Add a "Quick Reference" card section at the top of SKILL.md for most-used rules (top 5)
- [ ] Add explicit guidance for mono-repo projects with multiple spec directories
- [ ] Document behavior when skill is installed project-locally vs. globally

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2026-03-24 | Initial spec | Bootstrap from existing codebase |
| 2026-03-25 | Clarified automated tests not applicable (methodology-only repo) | Prevents spec agent from generating tests for this repo |
| 2026-03-25 | Updated SKILL.md line count approximation from ~400 to ~500 | Health check found stale approximation (actual: 494 lines) |
| 2026-03-25 | Added language tags to fenced code blocks; added blank line before Options Considered list | MD040, MD032 lint compliance |
| 2026-06-11 | Corrected quality rule count phrasing (22 rules total, 19 enforced; CODE-RULE.11–13 out of scope) | Health check found internal inconsistency |
| 2026-06-11 | Updated for methodology v2: 20 rules grouped by enforcement (17 enforced), 4-step health check with validator, two-tier templates, draft-and-confirm decision, progressive disclosure of skill loading | Spec synced to SKILL.md 2.0.0 |
