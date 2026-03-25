# Feature: Agent

> Autonomous spec worker that handles context-intensive operations (bootstrapping, health checks, spec writing sessions) away from the main conversation.

---

## User Stories

- UserStory-agent-01: As a developer, I can invoke the spec-driven-development agent for a bootstrapping session so that specs are generated for my entire codebase without cluttering my main conversation thread
- UserStory-agent-02: As a developer, I can run a full spec health check via the agent so that all spec files are validated, auto-fixed, and stray files are reported in one autonomous pass
- UserStory-agent-03: As a developer, I can ask the agent to write a spec for a specific feature so that I get a complete, verified spec without manually reading template files myself

---

## Out of Scope

- Pushing changes to git (agent reads/writes files only; commit is the developer's responsibility)
- Running test suites or build commands (spec work only)
- Modifying files outside the project's spec directory without explicit request

---

## What It Does

- Runs as a Claude Code sub-agent (launched via the `spec-driven-development` agent definition)
- Reads SKILL.md methodology and follows it for the requested operation
- Uses Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, WebSearch, WebFetch tools
- Detects intent from the request using the Quick Reference table in the agent definition
- For bootstrapping: explores project structure, identifies features, creates overview + feature specs
- For health checks: globs all spec files, verifies each against quality rules, auto-fixes violations
- Reports what was created, changed, and any issues found

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | Agent definition must include a tool list covering all tools needed for autonomous spec work: Read, Edit, Write, Glob, Grep, Bash, AskUserQuestion, WebSearch, WebFetch | Must |
| REQ-2 | Agent must check for existing specs (Glob: specs/**/*.md, app_spec/**/*.md) before generating new ones | Must |
| REQ-3 | Agent must read SKILL.md for methodology details rather than duplicating them in the agent definition | Must |
| REQ-4 | Agent definition must include a quick reference table mapping user intent to action and critical rules | Must |
| REQ-5 | Agent must follow CODE-RULE.1 (Read before Write) — read any file before editing it | Must |
| REQ-6 | Agent must use model: sonnet (not claude-3-haiku or older) for quality spec work | Must |
| REQ-7 | Agent description must accurately distinguish it from the skill: "sustained, autonomous spec work" vs. inline proactive guidance | Should |
| REQ-8 | Agent must confirm with user before deleting any stray files found during health check | Must |

---

## Architecture

### Component Diagram

```
Developer workspace
  └── Project with code files

    /sdd "bootstrap"
         │
         ▼
  commands/spec-driven-development.md
  (summarizes context, launches Task)
         │
         ▼
  agents/spec-driven-development.md   ← agent definition (thin orchestrator)
         │ defers to
         ▼
  ~/.claude/skills/spec-driven-development/SKILL.md  ← full methodology
         │
         │ uses tools
         ▼
  ┌──────────────────────────────────────────────────┐
  │  Project files (Read/Glob/Grep)                  │
  │  Project specs/ directory (Write/Edit)            │
  └──────────────────────────────────────────────────┘
```

### Data Flow

```
User invokes /sdd command
    → command summarizes conversation context
    → command calls Task tool with subagent_type="spec-driven-development"
    → agent starts fresh conversation thread
    → agent reads skill for methodology
    → agent detects intent from request
    → agent reads project code (Glob, Grep, Read)
    → agent writes/edits spec files
    → agent reports summary to parent conversation
```

---

## States & Transitions

### Agent Invocation States

| State | Description | Transition |
|-------|-------------|------------|
| Not installed | agents/spec-driven-development.md not in ~/.claude/agents/ | Developer copies agent file |
| Ready | Agent definition present, skill loaded | /sdd command or direct invocation |
| Running | Agent thread active, reading project files | Completes or errors |
| Complete | Spec files written, summary returned to main thread | Main conversation continues |

---

## Error Cases

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Agent not found | agents/spec-driven-development.md not installed | /sdd command fails silently or errors | Copy agents/spec-driven-development.md to ~/.claude/agents/ |
| Skill not loaded in agent | skills/ not installed at agent launch time | Agent lacks methodology; produces low-quality specs | Ensure full install: skill + agent + commands |
| Agent reads wrong spec directory | Project has app_spec/ but agent only checks specs/ | Agent creates duplicate specs/ directory | Agent should Glob both patterns before writing |
| Context overflow on large codebase | Too many files to read in one agent session | Agent truncates; some features may be missed | Run bootstrap feature-by-feature, not all at once |
| AskUserQuestion not used when request is vague | Agent assumes intent instead of asking | Wrong spec written for wrong feature | Agent definition instructs to clarify before writing |
| Stray file deleted without confirmation | Agent auto-deletes README.md or docs/ files | User loses documentation | REQ-8 enforces confirmation before any deletion |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Project has no code, only idea described in chat | Agent uses AskUserQuestion to gather requirements, writes spec from conversation |
| Spec already exists for the requested feature | Agent reads existing spec, identifies gaps, fills them rather than overwriting |
| Health check finds 0 violations | Agent reports "all specs pass quality checks" without making edits |
| Bootstrap requested on project with partial specs | Agent reads existing specs, identifies undocumented features, creates only missing specs |
| Agent invoked directly without /sdd command | Works correctly; /sdd just adds conversation context to the request |

---

## Implementation

### File Dependency Graph

```
agents/spec-driven-development.md       [skill: spec-driven-development]
    └── defers to:
        ~/.claude/skills/spec-driven-development/SKILL.md
```

### Agent Definition File

| File | Path | Purpose |
|------|------|---------|
| Agent definition | `agents/spec-driven-development.md` | YAML frontmatter + quick reference table |

### Agent Frontmatter

```yaml
name: spec-driven-development
description: [when to use this agent vs. skill inline guidance]
tools: Read, Edit, Write, Glob, Grep, Bash, AskUserQuestion, WebSearch, WebFetch
model: sonnet
skills: spec-driven-development
```

---

## Key Decisions

### Decision 1: Agent is thin orchestrator; skill has all details

**Context:** The agent could duplicate the methodology or defer to the skill.

**Options Considered:**
1. Agent contains full methodology (duplicates skill content)
2. Agent contains only quick reference + tool list; skill has details

**Decision:** Thin agent. Agent definition is ~37 lines. Skill is loaded automatically via `skills: spec-driven-development` frontmatter.

**Consequences:** Single source of truth for methodology. If skill is updated, agent behavior updates automatically without changing the agent file.

### Decision 2: Agent vs. skill for different workloads

**Context:** Both the skill and agent provide SDD guidance. The distinction needed to be clear.

**Decision:** Skill = proactive inline guidance for every conversation. Agent = sustained autonomous work that reads many files and writes many specs (bootstrapping, health check).

**Consequences:** Developers use the skill naturally without /sdd for everyday spec guidance. They invoke the agent specifically when a task is too large for inline guidance (reading 20 files to bootstrap 10 specs).

---

## Testing Notes

### Critical Paths

1. UserStory-agent-01: Install agent → invoke /sdd bootstrap → verify agent reads code + creates overview + feature specs → covers REQ-1, REQ-2, REQ-5
2. UserStory-agent-02: Run /sdd "check specs" → verify agent Globs all specs → auto-fixes violations → asks before deleting stray files → covers REQ-8, REQ-2
3. UserStory-agent-03: Run /sdd "write spec for [feature]" → verify agent reads existing code before writing → uses templates → covers REQ-5, REQ-6

### Not Worth Testing

- Automated tests (no runnable code — methodology-only repo)
- Whether Claude follows rules (behavioral)
- Agent response time

---

## Known Issues

No active bugs.

---

## Future Considerations

- [ ] Add `workflows/test-generation.md` and expose it via agent quick reference table
- [ ] Document how to invoke the agent directly (without /sdd command) for developers who prefer not using commands

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2026-03-24 | Initial spec | Bootstrap from existing codebase |
