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
- As a developer, I can run a spec health check so that stale, incomplete, or placeholder-filled specs are found mechanically and fixed — sync fixes applied automatically, intent fixes confirmed with me
- As a developer, I can bootstrap specs for an existing codebase so that undocumented projects get structured documentation quickly
- As a developer, I can track bugs in feature specs so that known issues are visible, linked to requirements, and removed when fixed

---

## Out of Scope

- Runtime or production code — the only executable is a zero-dependency dev-time validator script
- CI/CD integration or automated spec validation pipelines (the validator is runnable in CI, but no pipeline config ships here)
- A web UI or standalone app — the product is Claude Code config files
- Version management or package registry distribution

---

## System Architecture

### High-Level Diagram

```text
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
│  │  scripts/           │    │  sdd.md                          │ │
│  └─────────────────────┘    └──────────────────────────────────┘ │
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
| Skill (SKILL.md) | Methodology: quality rules, flow, bug tracking, test health check (description always visible; body loaded on invocation) | Markdown skill with frontmatter |
| Agent definition | Orchestration: slim quick reference, tool list; defers to skill | Markdown with YAML frontmatter |
| Command (sdd.md) | Single entry point: summarizes context, passes request to agent via Task tool | Markdown with allowed-tools frontmatter |
| Templates | Two-tier blank spec structures for overview and feature specs | Markdown |
| Workflows | Step-by-step guides for complex operations (bootstrap, todo analysis) | Markdown |
| Scripts | Mechanical spec validation (health check step 1) | Zero-dependency Node 18+ script |
| References | Lookup tables: E2E format, examples, quality checklist, test anti-patterns | Markdown |

---

## Tech Stack

### Distribution Format

| Component | Format | Install Location |
|-----------|--------|-----------------|
| Skill | `skills/spec-driven-development/SKILL.md` + supporting files | `~/.claude/skills/spec-driven-development/` |
| Agent | `agents/spec-driven-development.md` | `~/.claude/agents/` |
| Command | `commands/sdd.md` | `~/.claude/commands/` |
| Validator script | `skills/spec-driven-development/scripts/validate-specs.mjs` (ships inside the skill) | `~/.claude/skills/spec-driven-development/scripts/` |

### No Runtime Dependencies

This project is Markdown plus one zero-dependency dev script (`scripts/validate-specs.mjs`, Node 18+ built-ins only). There is no build step, no package manager, no compiled output.

---

## Data Flow

### Skill Load Flow

```text
Claude Code starts conversation
    → SKILL.md frontmatter description indexed into context (progressive disclosure)
    → spec-related request invokes the skill
    → full SKILL.md body loaded; methodology followed
```

### Command Invocation Flow

```text
User: /sdd "bootstrap"
    → commands/sdd.md runs
    → summarizes recent conversation context (or "(none — fresh conversation)")
    → launches spec-driven-development agent via Task tool
    → agent reads skill for methodology details
    → agent reads project code (Glob, Grep, Read)
    → agent writes spec files to project's specs/ directory
```

### Spec Health Check Flow

```text
User: /sdd "check specs"
    → agent invoked
    → step 1: node [skill-dir]/scripts/validate-specs.mjs [spec-dir]
              (mechanical: ID formats, sections, tables, links, @spec refs)
    → step 2: sync pass — verify references, replace placeholders (auto-fix)
    → step 3: draft pass — vague wording, empty intent cells, <3 error/edge
              cases drafted and applied only after user confirms
    → step 4: link hygiene — Features-table links resolve, no orphan specs
    → reports validator findings, auto-fixes, and confirmed drafts
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
| Skill | SDD methodology discoverable in every conversation, loaded on invocation | [features/skill.md](features/skill.md) |
| Agent | Autonomous spec worker for heavy-lifting operations | [features/agent.md](features/agent.md) |
| Commands | `/sdd` slash command entry point with context summarization | [features/commands.md](features/commands.md) |
| Templates | Two-tier blank spec structures (overview, feature) plus CLAUDE.md starter for new projects | [features/templates.md](features/templates.md) |
| Workflows | Complex operation guides: bootstrap, todo analysis | [features/workflows.md](features/workflows.md) |
| Validator | Zero-dependency mechanical spec validation script | [features/validator.md](features/validator.md) |

---

## Development

### Prerequisites

- No build tools required
- Git for version control
- A text editor

### Setup

```bash
git clone https://github.com/jameswp0/spec-driven-development
cd spec-driven-development
```

### Installation

```bash
cp -r skills/spec-driven-development ~/.claude/skills/
cp agents/spec-driven-development.md ~/.claude/agents/
cp commands/sdd.md ~/.claude/commands/
```

### Commands

| Command | Purpose |
|---------|---------|
| `cp -r skills/spec-driven-development ~/.claude/skills/` | Install skill |
| `cp agents/spec-driven-development.md ~/.claude/agents/` | Install agent |
| `cp commands/sdd.md ~/.claude/commands/` | Install command |
| `node skills/spec-driven-development/scripts/validate-specs.mjs specs` | Validate this repo's own specs |

---

## Key Decisions

### Decision 1: Skill provides inline methodology; agent handles heavy lifting

**Context:** Claude Code supports both skills (loaded inline into every conversation) and agents (invoked for autonomous sub-tasks). We needed to decide how to split the methodology.

**Decision:** The skill (SKILL.md) contains the full methodology inline — quality rules, intent detection, the flow, bug tracking — so it's available proactively in every conversation without invoking the agent. The agent definition is thin: it defers to the skill for details and adds only the quick reference table and tool list needed for autonomous operation.

**Consequences:** The skill body is verbose, but progressive disclosure keeps the cost low: Claude Code holds only the frontmatter description in context until the skill is invoked, then loads the full methodology. The agent is used for context-intensive work (bootstrapping, health checks across many files) that would clutter a main conversation.

### Decision 2: No runtime code — methodology-only distribution, with one dev-script exception

**Context:** We could have built a CLI tool, VS Code extension, or npm package.

**Decision:** Distribute as Markdown files copied into `~/.claude/` config. v2 adds exactly one executable — `scripts/validate-specs.mjs` — as a deliberate exception, because mechanical checks (ID regexes, duplicate detection, link resolution) have a single correct answer and are cheaper and more reliable in code than in model judgment. The script uses only Node 18+ built-ins so the `cp`-install story is unchanged.

**Consequences:** Zero install friction (just `cp`), no dependency management, works immediately; the health check gains a deterministic first pass. Tradeoff: no automatic updates — users must re-copy to get new versions.

### Decision 3: Spec location convention (`specs/` or `app_spec/`)

**Context:** Projects vary in their directory structure. The skill needed a consistent location to read and write specs.

**Decision:** Support both `specs/` and `app_spec/` as valid locations, with the agent checking both via Glob. Project teams choose one and document it in CLAUDE.md.

**Consequences:** Flexible for existing projects. The agent always Globs both paths before assuming no specs exist.

---

## Constraints & Limitations

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| No automatic updates | Users on old versions until they re-copy | Version in SKILL.md frontmatter; CHANGELOG.md documents breaking changes |
| Skill body loaded only on invocation (progressive disclosure) | Until invoked, only the frontmatter description influences behavior — guidance depends on the description triggering | Description written to match spec-related requests; /sdd command bypasses triggering entirely |
| Judgment rules have no mechanical enforcement | Vague-wording and intent rules are followed only if the model follows them | Mechanical rules are now enforced deterministically by validate-specs.mjs; DRAFT rules require explicit user confirmation, limiting silent drift |

---

## Future Roadmap

- [ ] Add a git-hook workflow for automatically running spec health check before commit
- [ ] Add a `workflows/test-generation.md` for generating full test suites from specs

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2026-03-24 | Initial spec | Bootstrap from existing codebase |
| 2026-03-25 | Documented project-local install in INSTALL.md | Reduces install friction |
| 2026-03-25 | Added language tags to fenced code blocks | MD040 lint compliance |
| 2026-06-11 | Methodology v2 sync: added Validator feature, scripts/ layer, single /sdd command, validator step in health check flow, progressive-disclosure skill loading, amended no-runtime-code decision and constraints | Spec synced to v2.0.0 release |
| 2026-06-11 | Templates feature now includes CLAUDE-SDD.md starter for new projects | New CLAUDE.md starter binds SDD workflow into new projects |
