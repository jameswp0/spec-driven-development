# Spec-Driven Development

A Claude Code skill and agent for spec-driven development. Specs are the source of truth—write them before code, update them after implementation, use them to diagnose failures.

→ [Install](INSTALL.md)

## What's New

See [CHANGELOG.md](CHANGELOG.md) for full details.

**3.0 — Global IDs + spec primitives:** IDs are now global per type (`REQ-###`, `UserStory-###`, `BUG-###`) — unique across the whole spec set, never per-file — so folding, splitting, or renaming specs never changes an ID or breaks a reference. A stateless query layer (`scripts/spec-fns.mjs`) mints IDs, locates every definition/reference, and reports integrity findings live from the specs and code (no registry to keep in sync). Bugs are no longer deleted on fix — their Known Issues row is marked `resolved` so regression-test `@spec BUG-###` references keep resolving.

**2.1 — Spec lifecycle (opt-in):** `specs/features/` is present tense (always true of the code — divergence is always a bug); unbuilt work lives in `specs/future/` as work-item specs that merge into the base spec and are deleted when shipped. `ls specs/future/` is your progress tracker.

**2.0:**

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

This repo dogfoods its own methodology — its specs live in [`specs/`](specs/). Start with the [overview](specs/overview.md) (user stories, architecture, feature index, key decisions, roadmap), then the per-component feature specs:

- [Skill](specs/features/skill.md) — SDD methodology, loaded on invocation
- [Agent](specs/features/agent.md) — autonomous spec worker for heavy-lifting operations
- [Commands](specs/features/commands.md) — `/sdd` entry point with context summarization
- [Templates](specs/features/templates.md) — overview/feature/future templates + CLAUDE.md starter
- [Workflows](specs/features/workflows.md) — bootstrap, todo analysis, migrate guides
- [Validator](specs/features/validator.md) — zero-dependency mechanical spec validation

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
  │ "broken"  │         │ Issues    │           │ Mark      │
  │ Code rev  │         │           │           │ Resolved  │
  └───────────┘         │ BUG-###   │           │ Changelog │
                        │ Severity  │           └───────────┘
                        │ Links     │     (row kept: regression
                        └───────────┘      @spec refs still resolve)
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
│  Templates: overview.md, feature.md, future.md                 │
│  Workflows: bootstrap.md, todos.md, migrate.md                 │
│  References: e2e-test-format.md, examples.md                   │
│  Scripts: spec-fns.mjs (primitives), validate-specs.mjs        │
└────────────────────────────────────────────────────────────────┘
```

## When to Use

| Transition | What Happens |
|------------|--------------|
| Before building a feature | Write spec first |
| After implementing | Update spec to match reality |
| Tests failing | Diagnose: is spec, code, or test wrong? |
| Bug reported | Log in spec's Known Issues |
| Bug fixed | Mark Resolved in Known Issues |
| "What to work on?" | Surface and prioritize todos |
| Checking quality | Run health check against specs |

The health check runs the bundled primitives (`scripts/spec-fns.mjs health`) for identity/coverage findings and the validator (`scripts/validate-specs.mjs`) for deterministic format checks first, then reviews the judgment-based rules.

## Spec Primitives

Identity work — assigning IDs, finding references, checking integrity — is mechanical, so it belongs to a script, not to judgment. `scripts/spec-fns.mjs` is a zero-dependency, **stateless** query layer: the specs and code are the only source of truth, scanned live on every call. There is no database to keep in sync.

Two invariants:

- **Single home** — every ID is *defined* exactly once (one Requirements row, one User Stories item, one Known Issues row). Every other mention is a *link*.
- **Resolve by ID** — references point at an ID, not a path. The path in an `@spec` tag is advisory; the ID is identity, so folds and renames never break a reference.

Four functions:

| Call | Returns / does |
|------|----------------|
| `spec-fns.mjs next <type> [n]` | the next free global ID(s) — mint without scanning |
| `spec-fns.mjs loc <id>` | every location of an ID, tagged `def` / `ref` / `link` |
| `spec-fns.mjs health` | the worklist: `multi_home`, `dangling`, `uncovered` findings |
| `spec-fns.mjs sed <old=new ...>` | exact `sed` commands for a bulk ID rename |

The script **detects; you resolve.** See `workflows/migrate.md` to adopt global IDs in an existing spec set.

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
- User stories (`UserStory-###`, global)
- Requirements (`REQ-###`, global)
- Error cases
- Edge cases
- Known issues (`BUG-###`, global)
- Future considerations (todos)
- Optional sections (Architecture, Data Model, States & Transitions, API Endpoints, Implementation, Testing Notes) only when they earn their place

## Traceability

Every spec artifact becomes a specific kind of test that verifies specific code. The link is one `@spec <ID>` comment — the same ID everywhere it appears. One feature, traced from intent to code:

```
specs/features/chat.md            ← single home (intent)
  UserStory-003  send a message, get a streamed reply
    REQ-011      reply streams token by token

tests/e2e/chat.spec.ts            ← E2E proves the story
  // @spec UserStory-003
  test("sends a message, sees a streamed reply", ...)

tests/unit/stream.test.ts         ← unit proves the requirement
  // @spec REQ-011
  it("emits tokens incrementally", ...)

src/stream.ts                     ← code carries the same tag
  // @spec REQ-011
  export function streamReply() { ... }
```

Error cases and bugs link the same way — `@spec ERR-004` on an edge-case test, `@spec BUG-002` on a regression test — while decisions like `DEC-002` (why SSE over WebSocket) are rationale, with no test.

**Single home, resolve by ID.** Each ID is *defined* exactly once — `REQ-011` lives in one Requirements row. Every other mention (the test's `@spec`, the code, an overview link) is a *reference* that resolves by ID, not by path. So folding, splitting, or renaming specs never breaks a link — the v3 global-ID payoff.

Because the ID is the link, it's queryable. `spec-fns.mjs loc <id>` walks every occurrence live from specs + code:

```
$ spec-fns.mjs loc REQ-011
  def   specs/features/chat.md:42      ← the single home (intent)
  ref   tests/unit/stream.test.ts:10   ← the proof
  ref   src/stream.ts:7                ← the code
  link  specs/overview.md:88           ← every other mention
```

And it runs in reverse — which is what makes a bug objective instead of opinion:

```
test fails ─▶ read its @spec ID ─▶ loc <ID> ─▶ the intent it broke
                                               + every other reference
```

A failing test points at a specific, traceable line of intent. A bug is a deviation from that line — not a matter of opinion.

## Key Concepts

### User Stories → E2E Tests

```
UserStory-001: As a user, I can send a message and get an AI response
```

Becomes an E2E test with `@spec` header referencing the story by ID.

### Requirements → Unit Tests

```
REQ-001: Message appears immediately (optimistic update)
REQ-002: AI response streams token by token
```

Each requirement is testable with clear pass/fail.

### Bug Tracking

Bugs live in feature specs under Known Issues:

| ID | Description | Severity | Status | Links |
|----|-------------|----------|--------|-------|
| BUG-001 | SSE doesn't reconnect | High | Open | REQ-005 |

When fixed: set Status to `Resolved` (keep the row so regression-test `@spec BUG-###` references still resolve), add changelog entry.

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
│   ├── feature.template.md  # Feature spec template
│   ├── future.template.md   # Work-item delta template (spec lifecycle)
│   └── CLAUDE-SDD.md        # CLAUDE.md starter for new projects
├── workflows/
│   ├── bootstrap.md         # Generate specs for existing codebase
│   ├── todos.md             # Todo analysis with YAGNI filtering
│   └── migrate.md           # Convert per-feature IDs to global IDs
├── references/
│   ├── e2e-test-format.md    # E2E test header format
│   ├── examples.md           # Good/bad spec examples
│   ├── quality-checklist.md  # Full quality checklist
│   └── test-anti-patterns.md # LLM test anti-patterns
└── scripts/
    ├── spec-fns.mjs          # Stateless ID/reference/integrity primitives
    └── validate-specs.mjs    # Zero-dependency spec format validator

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
