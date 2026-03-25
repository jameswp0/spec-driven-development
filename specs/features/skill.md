# Feature: Skill

> Inline methodology loaded into Claude's context for every conversation, providing proactive spec-driven development guidance.

---

## User Stories

- UserStory-skill-01: As a developer, I can have the SDD methodology available in every conversation so that Claude proactively guides me through spec-first workflows without me needing to invoke a separate agent
- UserStory-skill-02: As a developer, I can read the quality rules so that I know exactly what violations the agent will auto-fix versus flag for manual attention
- UserStory-skill-03: As a developer, I can follow the spec health check procedure so that all spec files in my project are validated and auto-fixed in one pass

---

## Out of Scope

- Storing or executing code at runtime — the skill is a static Markdown file
- Automatic triggering based on file changes — the agent must be explicitly invoked
- Enforcing rules outside of what Claude can do with Read/Edit/Write/Glob/Grep tools

---

## What It Does

- Loads the full SDD methodology inline into Claude's conversation context via `~/.claude/skills/spec-driven-development/SKILL.md`
- Defines 19 quality rules (CODE-RULE.1–13, TEST-RULE.1–9) that prevent AI hallucination in specs and tests
- Provides intent detection table so Claude routes requests to the right action without overthinking
- Documents the 5-step flow: Understand → Spec → Implement → Test → Reflect
- Defines the Spec Health Check procedure (3 steps: Glob all specs, verify each, report stray files)
- Provides bug tracking and todo quality criteria inline
- Points to templates, workflows, and references for detailed guidance

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | SKILL.md must be self-contained: all rules, intent detection, and the flow must be readable without opening any other file | Must |
| REQ-2 | Quality rules must distinguish between process rules (enforced during execution), auto-fixed rules (enforced in health check), and out-of-scope rules | Must |
| REQ-3 | The Spec Health Check procedure must specify exactly which Glob patterns to use and which files are exempt from stray-file detection | Must |
| REQ-4 | Each quality rule must include: what it checks, why it exists, how it's enforced, and which checklist item it maps to | Must |
| REQ-5 | The skill must document the difference between Overview spec user stories (no IDs, product-level) and Feature spec user stories (UserStory-* IDs, testable) | Must |
| REQ-6 | The skill must include a table of contents linking to all major sections | Should |
| REQ-7 | The skill must provide proactive bug detection triggers so Claude tracks bugs without waiting for explicit "report bug" requests | Should |
| REQ-8 | The skill must defer detailed format examples to references/ files rather than duplicating content inline | Could |

---

## Architecture

### Component Diagram

```text
~/.claude/skills/spec-driven-development/
├── SKILL.md                    ← loaded into every conversation context
├── templates/
│   ├── overview.template.md    ← read before creating overview spec
│   └── feature.template.md     ← read before creating feature spec
├── workflows/
│   ├── bootstrap.md            ← read for bootstrap operations
│   └── todos.md                ← read for todo analysis
└── references/
    ├── e2e-test-format.md      ← read for E2E test header format
    ├── examples.md             ← read for good/bad spec examples
    ├── quality-checklist.md    ← full quality checklist
    └── test-anti-patterns.md   ← LLM test anti-patterns
```

### Data Flow

```text
Claude Code loads ~/.claude/skills/spec-driven-development/SKILL.md
    → methodology available inline in context
    → user makes request
    → Claude detects intent via Intent Detection table
    → Claude follows The Flow or referenced workflow
    → Claude reads templates/workflows/references as needed
```

---

## States & Transitions

### Skill Availability

| State | Description | Transition |
|-------|-------------|------------|
| Not installed | Files not in ~/.claude/skills/ | Developer runs cp install commands |
| Installed | SKILL.md present in skills directory | Claude Code loads it on conversation start |
| Active | SKILL.md loaded into conversation context | Available for all requests |
| Outdated | Installed version older than repo | Developer re-runs cp install commands |

---

## Error Cases

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Skill not loaded | SKILL.md not found in ~/.claude/skills/ | Claude doesn't follow SDD methodology; no proactive spec guidance | Run install cp commands from README |
| References not found | SKILL.md points to references/ but those files are missing | Claude can't follow detailed format instructions; may hallucinate test format | Ensure full `cp -r` was used, not just SKILL.md |
| Skill loaded but templates missing | templates/ directory not copied | Claude can't use template structure; creates ad-hoc specs without consistent format | Re-copy the full skills/spec-driven-development/ directory |
| Outdated quality rules | User installed old version without CODE-RULE.11-edge | Edge case enforcement missing; health checks incomplete | Re-copy from latest repo version |
| Conflicting spec location | Project has both specs/ and app_spec/ directories | Agent finds duplicate specs; may process wrong directory | Standardize on one location; document in CLAUDE.md |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Skill too large for context window | Claude truncates; most critical rules (CODE-RULE.1, The Flow) are at top of file so they survive truncation |
| Developer asks spec question without /sdd command | Skill provides inline guidance directly without launching agent |
| Project uses app_spec/ but developer says specs/ | Agent Globs both patterns, finds the correct directory, proceeds without error |
| SKILL.md modified locally by developer | Claude uses the modified version; changes respected as long as file remains valid Markdown |
| Multiple skills loaded simultaneously | Claude resolves intent using all loaded skills; SDD skill takes precedence for spec-related requests |

---

## Implementation

### File Dependency Graph

```text
skills/spec-driven-development/
├── SKILL.md                        [references: templates/, workflows/, references/]
├── templates/
│   ├── overview.template.md        [standalone]
│   └── feature.template.md         [standalone]
├── workflows/
│   ├── bootstrap.md                [references: templates/]
│   └── todos.md                    [standalone]
└── references/
    ├── e2e-test-format.md          [standalone]
    ├── examples.md                 [standalone]
    ├── quality-checklist.md        [standalone]
    └── test-anti-patterns.md       [standalone]
```

### Frontend Files

Not applicable — this feature is a Markdown file, not a software component.

### Key Content Sections in SKILL.md

| Section | Purpose | Lines (approx) |
|---------|---------|----------------|
| First: Read Templates | Routing table for which file to read before each task | 10 |
| Quality Rules | 19 rules with what/why/enforced/checklist mapping | 120 |
| Principle | Core philosophy statement | 10 |
| Intent Detection | Routing table + Spec Health Check procedure | 30 |
| The Flow | 5-step methodology | 60 |
| Process Notes + Quality Checklist | Quick checklist | 20 |
| E2E Test Format | Pointer to references/e2e-test-format.md | 5 |
| Failure Modes | Vague descriptions, happy path bias, premature completion | 15 |
| Todos | Quality criteria for future considerations | 20 |
| Bug Tracking | Find/fix flow + severity guide + proactive detection | 40 |
| Test Health Check | 5-step validation procedure | 35 |
| Implementation Documentation | What to document and when | 10 |
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

**Consequences:** Skill is verbose (~500 lines) but Claude has everything it needs without reading secondary files for every request. Speeds up common operations.

### Decision 2: No-gos section removed; acceptance criteria moved inline

**Context:** Early versions had a separate "No-Gos" section in the spec template. Recent commits removed it and moved the concept into the user stories note.

**Decision:** Rather than a separate section, the feature template now includes an inline note on user stories: "Before implementation: could Claude satisfy the story text while building the wrong thing? If yes, tighten the requirements or add a no-go above."

**Consequences:** Spec authors think about no-gos at the point where they write user stories, not in a disconnected section.

---

## Testing Notes

### Critical Paths

1. UserStory-skill-01: Install skill → start conversation → verify SDD methodology is available without /sdd → covers REQ-1, REQ-2
2. UserStory-skill-02: Read quality rules → identify a CODE-RULE violation → verify auto-fix categorization is correct → covers REQ-2, REQ-4
3. UserStory-skill-03: Run spec health check → verify Glob patterns find all specs → auto-fix applied → stray files reported → covers REQ-3

### Not Worth Testing

- Automated tests (no runnable code — methodology-only repo)
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
