# Feature: Commands

> Slash command entry points that give developers a natural way to invoke the spec-driven-development agent from any conversation.

---

## User Stories

- UserStory-commands-01: As a developer, I can type `/sdd bootstrap` in a Claude Code conversation so that the agent is launched with relevant context without me manually summarizing what I was working on
- UserStory-commands-02: As a developer, I can use the short `/sdd` alias or the full `/spec-driven-development` command interchangeably so that I have a convenient entry point regardless of how much I type
- UserStory-commands-03: As a developer, I can pass any natural-language request after the command so that the agent handles the full range of SDD operations without me memorizing specific syntax

---

## Out of Scope

- Commands that run outside of Claude Code's slash command system
- Commands with subcommand syntax (e.g., `/sdd spec new`, `/sdd health check`) — natural language is used instead
- Automated triggering of commands without developer action

---

## What It Does

- `/sdd` (short alias): Invokes the agent by calling `sdd.md`, which passes `$ARGUMENTS` to the agent directly
- `/spec-driven-development` (full command): Summarizes the last 3-5 conversation turns as context, then launches the agent via `Task` tool with `subagent_type="spec-driven-development"`
- Both commands pass the developer's request to the agent as `Request: $ARGUMENTS`
- The full command adds context (`Context: [summary]`) so the agent understands what the developer was working on before invoking SDD

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | The full command (spec-driven-development.md) must use `allowed-tools: Task` frontmatter to restrict it to only launching the agent | Must |
| REQ-2 | The full command must instruct Claude to summarize the last 3-5 turns before calling the agent, including: what was being worked on, what was completed or attempted, any errors or test failures | Must |
| REQ-3 | Both commands must pass $ARGUMENTS as the Request field so the developer's natural language request reaches the agent | Must |
| REQ-4 | The short command (sdd.md) must be a minimal wrapper — no frontmatter restrictions, just invokes the agent | Should |
| REQ-5 | Command instructions must specify `subagent_type="spec-driven-development"` so the correct agent is launched | Must |

---

## Architecture

### Component Diagram

```
Developer types: /sdd "bootstrap"
    │
    ▼
commands/sdd.md
    │ passes $ARGUMENTS to agent
    ▼
agents/spec-driven-development.md
    │ reads skill
    ▼
skills/spec-driven-development/SKILL.md
```

```
Developer types: /spec-driven-development "check specs"
    │
    ▼
commands/spec-driven-development.md
    │ [allowed-tools: Task]
    │ summarizes last 3-5 turns
    │ calls Task(subagent_type="spec-driven-development")
    │   Context: [summary]
    │   Request: "check specs"
    ▼
agents/spec-driven-development.md
```

### Data Flow

```
User types /sdd [request]
    → command file executes
    → Context (optional) + Request assembled
    → Task tool called with agent name
    → Agent launched in sub-thread
    → Agent processes request
    → Agent returns summary to main conversation
```

---

## States & Transitions

| State | Description | Transition |
|-------|-------------|------------|
| Not installed | commands/*.md not in ~/.claude/commands/ | Developer copies command files |
| Available | Commands present in ~/.claude/commands/ | Tab-complete shows /sdd and /spec-driven-development |
| Invoked | Developer typed /sdd or /spec-driven-development | Command runs, launches agent |
| Agent running | Sub-thread active | Agent completes, returns to main conversation |

---

## Error Cases

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Command not found | commands/*.md not in ~/.claude/commands/ | /sdd not recognized as a slash command | Copy command files from commands/ to ~/.claude/commands/ |
| Agent not launched | Task tool fails because agent not installed | Error or no response from /sdd | Ensure agents/spec-driven-development.md is installed |
| $ARGUMENTS empty | Developer types /sdd with no request | Agent launched but no request provided; agent may ask for clarification | Type /sdd followed by the request, e.g., /sdd bootstrap |
| Context summary too long | Many conversation turns before /sdd | Agent receives large context; may truncate | Invoke /sdd earlier in conversation, or use /sdd with explicit request |
| Wrong subagent_type | spec-driven-development agent not found | Task fails to launch correct agent | Verify agent file name matches subagent_type exactly |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Developer uses /sdd at conversation start (no context to summarize) | Full command passes empty or minimal context; agent proceeds with only the request |
| Developer types /sdd with multi-word request | $ARGUMENTS captures entire string; agent receives full request |
| Both /sdd and /spec-driven-development installed | Both work correctly; /sdd is the quick alias for frequent use |
| Developer installs only sdd.md, not spec-driven-development.md | /sdd works but without automatic context summarization |
| Request includes quotes or special characters | $ARGUMENTS passed as-is; agent handles natural language |

---

## Implementation

### File Dependency Graph

```
commands/
├── sdd.md                      [minimal wrapper → agents/spec-driven-development.md]
└── spec-driven-development.md  [allowed-tools: Task → agents/spec-driven-development.md]
```

### Command Files

| File | Path | Key Content |
|------|------|-------------|
| Short alias | `commands/sdd.md` | 3-line file: invoke agent, context instruction, pass $ARGUMENTS |
| Full command | `commands/spec-driven-development.md` | YAML frontmatter (allowed-tools: Task), context summarization instructions, Task tool call |

### commands/sdd.md Content

```
Invoke the spec-driven-development agent.

Context: Summarize what the user was just working on.

Request: $ARGUMENTS
```

### commands/spec-driven-development.md Structure

```yaml
---
allowed-tools: Task
---

Launch the spec-driven-development agent.

Before calling Task, summarize the last 3-5 conversation turns as context.
Include: what was being worked on, what was completed or attempted, any errors.

Pass to the agent:
  Context: [your summary]
  Request: $ARGUMENTS

Use Task tool with subagent_type="spec-driven-development".
```

---

## Key Decisions

### Decision 1: Two commands — short alias and full with context

**Context:** A single command could serve both use cases, but the context summarization step adds meaningful overhead for quick invocations.

**Options Considered:**
1. One command that always summarizes context
2. Two commands: minimal (/sdd) and context-rich (/spec-driven-development)

**Decision:** Two commands. /sdd is the quick alias for developers who are already thinking about what they want. /spec-driven-development adds the context summarization for situations where the agent needs to understand recent work.

**Consequences:** Developers naturally gravitate to /sdd for frequent use. The longer command name acts as a signal to use it when context matters (e.g., invoking after a test failure that was just diagnosed).

### Decision 2: allowed-tools: Task on the full command

**Context:** The full command file could allow all tools, letting Claude decide when to use Task vs. answer directly.

**Decision:** Restrict to `allowed-tools: Task` so the full command always launches the agent via Task and never answers inline.

**Consequences:** Predictable behavior — /spec-driven-development always delegates to the agent. Developers who want inline guidance use the skill (no command needed).

---

## Testing Notes

### Critical Paths

1. UserStory-commands-01: Type /spec-driven-development bootstrap → verify context summarized → agent launched → specs created → covers REQ-1, REQ-2, REQ-5
2. UserStory-commands-02: Type /sdd check specs → verify agent launched → results returned → covers REQ-3, REQ-4
3. UserStory-commands-03: Type /sdd [any natural language request] → verify $ARGUMENTS passed correctly → agent receives full request → covers REQ-3

### Not Worth Testing

- Claude's summarization quality (behavioral)
- Whether Task tool succeeds (Claude Code platform concern)

---

## Known Issues

No active bugs.

---

## Future Considerations

- [ ] Add a /sdd-health shortcut that always runs health check without arguments
- [ ] Document whether project-local commands (.claude/commands/) override global commands

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2026-03-24 | Initial spec | Bootstrap from existing codebase |
