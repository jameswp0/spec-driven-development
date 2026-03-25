# Spec-Driven Development

> A Claude Code skill and agent that installs spec-driven development methodology into any project.

---

## Purpose

Developers using AI assistants (Claude Code) without explicit specs get inconsistent results: the AI guesses intent, builds the wrong thing, and each conversation starts over with no shared understanding. This tool provides a spec-first workflow that gives Claude a clear source of truth — user stories, testable requirements, error cases — so it builds exactly what's intended and tests prove the spec is met.

---

## User Stories (Product Level)

- As a developer, I can install the skill and agent into my Claude Code config so that the SDD methodology is available in all my projects
- As a developer, I can invoke the `/sdd` command so that the agent handles spec work without cluttering my main conversation
- As a developer, I can write a feature spec before building so that Claude has a clear source of truth to implement against
- As a developer, I can run a spec health check so that stale, incomplete, or placeholder-filled specs are found and auto-fixed
- As a developer, I can bootstrap specs for an existing codebase so that undocumented projects get structured documentation quickly
- As a developer, I can track bugs in feature specs so that known issues are visible, linked to requirements, and removed when fixed

---

## Out of Scope

- Runtime code execution or test running (this repo contains only methodology files)
- CI/CD integration or automated spec validation pipelines
- A web UI or standalone app — the product is Claude Code config files
- Version management or package registry distribution

---

## System Architecture

### High-Level Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│  Developer's ~/.claude/ config directory                         │
│                                                                  │
│  ┌─────────────────────┐    ┌──────────────────────────────────┐ │
│  │  skills/            │    │  agents/                         │ │
│  │  spec-driven-       │◀───│  spec-driven-development.md      │ │
│  │  development/       │    │  (defers to skill for details)   │ │
│  │  SKILL.md           │    └──────────────────────────────────┘ │
│  │  templates/         │                                         │
│  │  workflows/         │    ┌──────────────────────────────────┐ │
│  │  references/        │    │  commands/                       │ │
│  └─────────────────────┘    │  sdd.md                          │ │
│                             │  spec-driven-development.md      │ │
│                             └──────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
         │ installed by developer via cp commands
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│  Claude Code conversation                                        │
│                                                                  │
│  User types /sdd "bootstrap"                                     │
│       │                                                          │
│       ▼                                                          │
│  command → launches agent → reads skill → follows methodology    │
│                                    │                             │
│                                    ▼                             │
│                            reads project code                    │
│                            writes specs/                         │
└──────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Technology |
|-------|----------------|------------|
| Skill (SKILL.md) | Inline methodology: quality rules, flow, bug tracking, test health check | Markdown loaded into Claude's context |
| Agent definition | Orchestration: intent detection, quick reference table, tool list | Markdown with YAML frontmatter |
| Commands | Entry points: pass context + request to agent via Task tool | Markdown with allowed-tools frontmatter |
| Templates | Blank spec structures for overview and feature specs | Markdown |
| Workflows | Step-by-step guides for complex operations (bootstrap, todo analysis) | Markdown |
| References | Lookup tables: E2E format, examples, quality checklist, test anti-patterns | Markdown |

---

## Tech Stack

### Distribution Format

| Component | Format | Install Location |
|-----------|--------|-----------------|
| Skill | `skills/spec-driven-development/SKILL.md` + supporting files | `~/.claude/skills/spec-driven-development/` |
| Agent | `agents/spec-driven-development.md` | `~/.claude/agents/` |
| Commands | `commands/sdd.md`, `commands/spec-driven-development.md` | `~/.claude/commands/` |

### No Runtime Dependencies

This project contains only Markdown files. There is no build step, no package manager, no compiled output.

---

## Data Flow

### Skill Load Flow

```
Claude Code starts conversation
    → loads ~/.claude/skills/spec-driven-development/SKILL.md into context
    → methodology available inline for proactive guidance
```

### Command Invocation Flow

```
User: /sdd "bootstrap"
    → commands/spec-driven-development.md runs
    → summarizes recent conversation context
    → launches spec-driven-development agent via Task tool
    → agent reads skill for methodology details
    → agent reads project code (Glob, Grep, Read)
    → agent writes spec files to project's specs/ directory
```

### Spec Health Check Flow

```
User: /sdd "check specs"
    → agent invoked
    → Glob finds all specs/**/*.md files
    → for each spec: Read → verify paths exist → auto-fix violations
    → reports fixed items and violations requiring manual attention
```

---

## Cross-Cutting Concerns

### No Authentication

All files are static Markdown. No auth, no API, no credentials.

### Error Handling

Errors are handling concerns of the agent (Claude) at runtime, not this repo. The skill documents what to do when tests fail, specs diverge from code, or bugs are found.

### Versioning Strategy

Files are versioned via git. Users who install by `cp` get a snapshot; they re-copy to update.

---

## Features

| Feature | Description | Spec |
|---------|-------------|------|
| Skill | Inline methodology loaded into every conversation | [features/skill.md](features/skill.md) |
| Agent | Autonomous spec worker for heavy-lifting operations | [features/agent.md](features/agent.md) |
| Commands | `/sdd` and `/spec-driven-development` slash command entry points | [features/commands.md](features/commands.md) |
| Templates | Blank spec structures (overview, feature) | [features/templates.md](features/templates.md) |
| Workflows | Complex operation guides: bootstrap, todo analysis | [features/workflows.md](features/workflows.md) |

---

## Development

### Prerequisites

- No build tools required
- Git for version control
- A text editor

### Setup

```bash
git clone https://github.com/[owner]/spec-driven-development
cd spec-driven-development
```

### Installation

```bash
cp -r skills/spec-driven-development ~/.claude/skills/
cp agents/spec-driven-development.md ~/.claude/agents/
cp commands/sdd.md ~/.claude/commands/
cp commands/spec-driven-development.md ~/.claude/commands/
```

### Commands

| Command | Purpose |
|---------|---------|
| `cp -r skills/spec-driven-development ~/.claude/skills/` | Install skill |
| `cp agents/spec-driven-development.md ~/.claude/agents/` | Install agent |
| `cp commands/*.md ~/.claude/commands/` | Install commands |

---

## Key Decisions

### Decision 1: Skill provides inline methodology; agent handles heavy lifting

**Context:** Claude Code supports both skills (loaded inline into every conversation) and agents (invoked for autonomous sub-tasks). We needed to decide how to split the methodology.

**Decision:** The skill (SKILL.md) contains the full methodology inline — quality rules, intent detection, the flow, bug tracking — so it's available proactively in every conversation without invoking the agent. The agent definition is thin: it defers to the skill for details and adds only the quick reference table and tool list needed for autonomous operation.

**Consequences:** The skill is verbose (loaded into every conversation context) but always available. The agent is used for context-intensive work (bootstrapping, health checks across many files) that would clutter a main conversation.

### Decision 2: No runtime code — methodology-only distribution

**Context:** We could have built a CLI tool, VS Code extension, or npm package.

**Decision:** Distribute as Markdown files only, copied into `~/.claude/` config.

**Consequences:** Zero install friction (just `cp`), no dependency management, works immediately. Tradeoff: no automatic updates — users must re-copy to get new versions.

### Decision 3: Spec location convention (`specs/` or `app_spec/`)

**Context:** Projects vary in their directory structure. The skill needed a consistent location to read and write specs.

**Decision:** Support both `specs/` and `app_spec/` as valid locations, with the agent checking both via Glob. Project teams choose one and document it in CLAUDE.md.

**Consequences:** Flexible for existing projects. The agent always Globs both paths before assuming no specs exist.

---

## Constraints & Limitations

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| No automatic updates | Users on old versions until they re-copy | Document version in README; add changelog |
| Skill loaded into every conversation | Adds token overhead in all conversations | Skill is concise; most content deferred to references/ |
| No enforcement mechanism | Rules are followed only if Claude follows them | Quality rules explicitly marked as auto-fixed or enforced in health check |

---

## Future Roadmap

- [ ] Add a git-hook workflow for automatically running spec health check before commit
- [ ] Add a `workflows/test-generation.md` for generating full test suites from specs
- [ ] Provide a project-local install option with `.claude/` directory support documented

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2026-03-24 | Initial spec | Bootstrap from existing codebase |
