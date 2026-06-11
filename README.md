# Spec-Driven Development

A Claude Code skill and agent for spec-driven development. Specs are the source of truth—write them before code, update them after implementation, use them to diagnose failures.

→ [Install](INSTALL.md)

## What's New in 2.0

See [CHANGELOG.md](CHANGELOG.md) for full details.

- **Two-tier feature template**: core sections are always required; optional sections (Architecture, Data Model, States & Transitions, API Endpoints, Implementation, Testing Notes) each have an "Include when" test and are deleted otherwise
- **File-map implementation docs**: Implementation sections list paths, purposes, and entry points only—signatures, props, and schemas are never mirrored into specs
- **Draft-vs-sync rule enforcement**: quality rules are grouped by phase (PROCESS, SYNC auto-fixed, DRAFT user-confirmed, REVIEW, TEST) so the agent knows what to fix silently and what to ask about
- **Deterministic validator**: a zero-dependency script (`scripts/validate-specs.mjs`) checks ID formats, required sections, table hygiene, and `@spec` references before any judgment-based review

## Why Specs as Source of Truth?

When code is the only source of truth, intent lives nowhere: the "why" is buried in commit
history, tests verify what the code does rather than what it should do, and whether something
is a bug or a feature becomes a matter of opinion. Specs fix this by making intent explicit and
versioned—user stories, requirements, and error cases that code, tests, and docs all derive from.
For AI-assisted development, this is the difference between an agent guessing at requirements and
building exactly what's specified—it replaces the vibe-coding patch loop with a deliberate
understand → spec → implement → test → sync cycle. Traceability comes free: every user story maps
to an E2E test and every requirement to a unit test, so a bug is an objective deviation from spec.

Full argument with diagrams: [docs/why.md](docs/why.md)

## What This Is

**Skill**: Methodology for writing and maintaining specs. Templates, workflows, quality checklists.

**Agent**: Executes the methodology at development lifecycle transitions. Invoked automatically or via `/sdd` command.

## Spec

See [`specs/overview.md`](specs/overview.md) for the full product spec — user stories, architecture, feature index, key decisions, and roadmap.

## The Core Loop

```
Spec → Implement → Test → Update spec if needed
```

- Write the spec first to clarify thinking
- Implement to match the spec
- Tests prove the spec is implemented correctly
- If reality diverges, update the spec

**Spec is source of truth.** If code doesn't match spec, the code is wrong.

## How It Works

### 1. The Core Cycle

```
        ┌───────────────────────────────────────────────────┐
        │                                                   │
        ▼                                                   │
    ┌───────┐      ┌───────┐      ┌──────┐      ┌──────┐    │
    │ SPEC  │─────▶│ CODE  │─────▶│ TEST │─────▶│ SYNC │────┘
    └───────┘      └───────┘      └──────┘      └──────┘
        │
        │  Spec defines:
        │  • UserStory-* ──▶ E2E tests
        │  • REQ-* ────────▶ Unit tests
        │  • Error cases ──▶ Edge tests
        │
        ▼
    ┌─────────────────────────────────────┐
    │  SPEC IS SOURCE OF TRUTH            │
    │                                     │
    │  Mismatch? Fix CODE, not spec/test  │
    └─────────────────────────────────────┘
```

### 2. Test Failure Diagnosis

```
                    TEST FAILING
                         │
                         ▼
                 ┌───────────────┐
                 │ Find @spec    │
                 │ reference     │
                 └───────┬───────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌──────────┐    ┌─────────┐
    │  SPEC   │    │   CODE   │    │  TEST   │
    │  WRONG  │    │   WRONG  │    │  WRONG  │
    │         │    │          │    │         │
    │ Intent  │    │ Doesn't  │    │ Doesn't │
    │ changed │    │ match    │    │ match   │
    └────┬────┘    └─────┬────┘    └─────┬───┘
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌──────────┐    ┌─────────┐
    │ Update  │    │ FIX CODE │    │ Fix     │
    │ spec,   │    │          │    │ test    │
    │ then    │    │ (never   │    │         │
    │ code/   │    │ weaken   │    │         │
    │ test    │    │ spec)    │    │         │
    └─────────┘    └──────────┘    └─────────┘
```

### 3. Bug Lifecycle

```
    DISCOVER                 TRACK                   RESOLVE
        │                      │                        │
        ▼                      ▼                        ▼
  ┌───────────┐         ┌───────────┐           ┌───────────┐
  │ Test fail │         │ Add to    │           │ Fix code  │
  │ User says │────────▶│ Known     │──────────▶│ Verify    │
  │ "broken"  │         │ Issues    │           │ Remove    │
  │ Code rev  │         │           │           │ Changelog │
  └───────────┘         │ BUG-*-##  │           └───────────┘
                        │ Severity  │
                        │ Links     │
                        └───────────┘
```

### 4. Skill + Agent Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  /sdd "tests failing, diagnose"                                │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                        AGENT                                   │
│                                                                │
│  Transition: "tests failing" ──▶ Diagnose operation            │
│                                                                │
│  Brief steps + output format + "see skill for details"         │
└──────────────────────────┬─────────────────────────────────────┘
                           │ defers to
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                        SKILL                                   │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐│
│  │ The Flow    │  │ Quality     │  │ Bug Tracking             ││
│  │             │  │ Checklist   │  │                          ││
│  │ Understand  │  │             │  │ When You Find a Bug      ││
│  │ Spec        │  │ 30+ items   │  │ When You Fix a Bug       ││
│  │ Implement   │  │             │  │ Severity Guide           ││
│  │ Test        │  │             │  │                          ││
│  │ Reflect     │  │             │  │                          ││
│  └─────────────┘  └─────────────┘  └──────────────────────────┘│
│                                                                │
│  Templates: overview.md, feature.md                            │
│  Workflows: bootstrap.md, todos.md                             │
│  References: e2e-test-format.md, examples.md                   │
└────────────────────────────────────────────────────────────────┘
```

## When to Use

| Transition | What Happens |
|------------|--------------|
| Before building a feature | Write spec first |
| After implementing | Update spec to match reality |
| Tests failing | Diagnose: is spec, code, or test wrong? |
| Bug reported | Log in spec's Known Issues |
| Bug fixed | Remove from Known Issues |
| "What to work on?" | Surface and prioritize todos |
| Checking quality | Run health check against specs |

The health check runs the bundled validator (`scripts/validate-specs.mjs`) first for deterministic checks, then reviews the judgment-based rules.

## Usage

### Via Command

`/sdd` is the single command. It summarizes the conversation context and passes it to the agent along with your request.

```
/sdd write spec for user authentication
/sdd what should I work on?
/sdd 5 tests are failing, diagnose each
```

### Automatic

The agent triggers automatically at lifecycle transitions when the skill is loaded.

## Spec Structure

**Overview spec** (one per project):
- System architecture
- Tech stack
- Data flow
- Cross-cutting concerns

**Feature specs** (one per feature):
- User stories (`UserStory-[feature]-##`)
- Requirements (`REQ-##`)
- Error cases
- Edge cases
- Known issues (`BUG-[feature]-##`)
- Future considerations (todos)
- Optional sections (Architecture, Data Model, States & Transitions, API Endpoints, Implementation, Testing Notes) only when they earn their place

## Key Concepts

### User Stories → E2E Tests

```
UserStory-chat-01: As a user, I can send a message and get an AI response
```

Becomes an E2E test with `@spec` header referencing the story.

### Requirements → Unit Tests

```
REQ-1: Message appears immediately (optimistic update)
REQ-2: AI response streams token by token
```

Each requirement is testable with clear pass/fail.

### Bug Tracking

Bugs live in feature specs under Known Issues:

| ID | Description | Severity | Status | Links |
|----|-------------|----------|--------|-------|
| BUG-chat-01 | SSE doesn't reconnect | High | Open | REQ-5 |

When fixed: remove row, add changelog entry.

### Todos

Todos live in feature specs under Future Considerations:

```markdown
- [ ] Add rate limiting to POST /messages
- [ ] Add index on messages.conversation_id
```

Quality criteria: atomic, actionable, scoped, testable.

## Files

```
skills/spec-driven-development/
├── SKILL.md                 # Core methodology
├── templates/
│   ├── overview.template.md # Project-level spec template
│   └── feature.template.md  # Feature spec template
├── workflows/
│   ├── bootstrap.md         # Generate specs for existing codebase
│   └── todos.md             # Todo analysis with YAGNI filtering
├── references/
│   ├── e2e-test-format.md    # E2E test header format
│   ├── examples.md           # Good/bad spec examples
│   ├── quality-checklist.md  # Full quality checklist
│   └── test-anti-patterns.md # LLM test anti-patterns
└── scripts/
    └── validate-specs.mjs    # Zero-dependency spec validator

agents/
└── spec-driven-development.md  # Agent definition

commands/
└── sdd.md                      # /sdd command
```

## Philosophy

1. **Spec first**: If the spec is hard to write, the feature isn't well understood
2. **Spec is truth**: Code and tests conform to spec, not the other way around
3. **No vague specs**: "Handles errors appropriately" is not a spec
4. **No happy path only**: Document errors, edge cases, failure modes
5. **Trace everything**: UserStory → E2E test, REQ → unit test

## License

MIT
