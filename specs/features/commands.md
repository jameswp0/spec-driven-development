# Feature: Commands

> The `/sdd` slash command: a single entry point that summarizes conversation context and launches the spec-driven-development agent.

---

## User Stories

- UserStory-commands-01: As a developer, I can type `/sdd bootstrap` in a Claude Code conversation so that the agent is launched with relevant context without me manually summarizing what I was working on
- UserStory-commands-02: As a developer, I can use one command for every SDD invocation so that I never have to choose between a quick alias and a context-rich variant — `/sdd` always summarizes context
- UserStory-commands-03: As a developer, I can pass any natural-language request after the command so that the agent handles the full range of SDD operations without me memorizing specific syntax

---

## Out of Scope

- Commands that run outside of Claude Code's slash command system
- Commands with subcommand syntax (e.g., `/sdd spec new`, `/sdd health check`) — natural language is used instead
- Automated triggering of commands without developer action
- A second command file — `commands/spec-driven-development.md` was removed in v2

---

## What It Does

- `/sdd` is the only command: `commands/sdd.md` restricts itself to the Task tool, summarizes the last 3-5 conversation turns as context, then launches the agent via `Task` with `subagent_type="spec-driven-development"`
- Passes the developer's request to the agent as `Request: $ARGUMENTS` alongside `Context: [summary]`
- At conversation start, passes `Context: (none — fresh conversation)` instead of inventing a summary
- The context summary covers: what the user was working on, what was just completed or attempted, and any errors, test failures, or issues mentioned

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | commands/sdd.md must use `allowed-tools: Task` frontmatter so the command always launches the agent and never answers inline | Must |
| REQ-2 | The command must instruct Claude to summarize the last 3-5 turns before calling the agent, including: what was being worked on, what was completed or attempted, any errors or test failures | Must |
| REQ-3 | The command must pass $ARGUMENTS as the Request field so the developer's natural language request reaches the agent | Must |
| REQ-4 | The command must pass `Context: (none — fresh conversation)` when there is no prior conversation to summarize | Must |
| REQ-5 | The command must specify `subagent_type="spec-driven-development"` so the correct agent is launched | Must |

---

## Architecture

### Component Diagram

```text
Developer types: /sdd "check specs"
    │
    ▼
commands/sdd.md
    │ [allowed-tools: Task]
    │ summarizes last 3-5 turns
    │ calls Task(subagent_type="spec-driven-development")
    │   Context: [summary]
    │   Request: "check specs"
    ▼
agents/spec-driven-development.md
    │ reads skill
    ▼
skills/spec-driven-development/SKILL.md
```

### Data Flow

```text
User types /sdd [request]
    → command file executes
    → Context summarized (or "(none — fresh conversation)")
    → Task tool called with subagent_type="spec-driven-development"
    → Agent launched in sub-thread
    → Agent processes request
    → Agent returns summary to main conversation
```

---

## States & Transitions

| State | Description | Transition |
|-------|-------------|------------|
| Not installed | sdd.md not in ~/.claude/commands/ | Developer copies command file |
| Available | sdd.md present in ~/.claude/commands/ | Tab-complete shows /sdd |
| Invoked | Developer typed /sdd | Command summarizes context, launches agent |
| Agent running | Sub-thread active | Agent completes, returns to main conversation |

---

## Error Cases

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Command not found | sdd.md not in ~/.claude/commands/ | /sdd not recognized as a slash command | Copy commands/sdd.md to ~/.claude/commands/ |
| Agent not launched | Task tool fails because agent not installed | Error or no response from /sdd | Ensure agents/spec-driven-development.md is installed |
| $ARGUMENTS empty | Developer types /sdd with no request | Agent launched but no request provided; agent may ask for clarification | Type /sdd followed by the request, e.g., /sdd bootstrap |
| Context summary too long | Many conversation turns before /sdd | Agent receives large context; may truncate | Invoke /sdd earlier in conversation, or use /sdd with explicit request |
| Wrong subagent_type | spec-driven-development agent not found under that name | Task fails to launch correct agent | Verify agent file name matches subagent_type exactly |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Developer uses /sdd at conversation start (no context to summarize) | Command passes `Context: (none — fresh conversation)`; agent proceeds with only the request |
| Developer types /sdd with multi-word request | $ARGUMENTS captures entire string; agent receives full request |
| Stale v1 /spec-driven-development command still installed | Old command may still work but is unmaintained; remove ~/.claude/commands/spec-driven-development.md and use /sdd |
| Request includes quotes or special characters | $ARGUMENTS passed as-is; agent handles natural language |

---

## Implementation

### File Map

| Path | Purpose |
|------|---------|
| `commands/sdd.md` | Single slash command: allowed-tools frontmatter, context summarization instructions, Task launch |

### Entry Points

- `/sdd [request]` → `commands/sdd.md` → `Task(subagent_type="spec-driven-development")`

---

## Key Decisions

### Decision 1: Single command

**Context:** v1 shipped two commands — a minimal `/sdd` alias and a full `/spec-driven-development` with context summarization. The two differed only in whether they summarized recent conversation turns, and developers had to remember which to use.

**Options Considered:**

1. Keep two commands — quick alias vs. context-rich, at the cost of a redundant file and a choice nobody wanted to make
2. One command that always summarizes context — context summarization is cheap, and a fresh conversation degrades gracefully to "(none)"

**Decision:** Merged into a single `/sdd` in v2; `commands/spec-driven-development.md` was deleted.

**Consequences:** One file to install and maintain. Every invocation gets context; fresh conversations pass an explicit "(none — fresh conversation)" marker instead of a fabricated summary.

### Decision 2: allowed-tools: Task on the command

**Context:** The command file could allow all tools, letting Claude decide when to use Task vs. answer directly.

**Decision:** Restrict to `allowed-tools: Task` so /sdd always launches the agent via Task and never answers inline.

**Consequences:** Predictable behavior — /sdd always delegates to the agent. Developers who want inline guidance use the skill (no command needed).

---

## Testing Notes

### Critical Paths

1. UserStory-commands-01: Type /sdd bootstrap mid-conversation → verify context summarized → agent launched → specs created → covers REQ-1, REQ-2, REQ-5
2. UserStory-commands-02: Type /sdd at conversation start → verify `Context: (none — fresh conversation)` passed → agent proceeds on request alone → covers REQ-2, REQ-4
3. UserStory-commands-03: Type /sdd [any natural language request] → verify $ARGUMENTS passed correctly → agent receives full request → covers REQ-3

### Not Worth Testing

- Automated tests (no runnable code in the command file)
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
| 2026-03-25 | Clarified automated tests not applicable (methodology-only repo) | Prevents spec agent from generating tests for this repo |
| 2026-03-25 | Added language tags to fenced code blocks; added blank line before Options Considered list | MD040, MD032 lint compliance |
| 2026-06-11 | Rewrote for single /sdd command with context summarization; removed all references to deleted commands/spec-driven-development.md | Spec synced to methodology v2 |
