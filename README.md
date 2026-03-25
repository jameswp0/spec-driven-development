# Spec-Driven Development

A Claude Code skill and agent for spec-driven development. Specs are the source of truth—write them before code, update them after implementation, use them to diagnose failures.

→ [Install](INSTALL.md)

## Why Specs as Source of Truth?

### The Problem with Code as Truth

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CODE AS SOURCE OF TRUTH                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Intent ──?──▶ Code ◀──?── Tests                                       │
│                  │                                                      │
│                  ▼                                                      │
│            ┌──────────┐                                                 │
│            │ Problems │                                                 │
│            └──────────┘                                                 │
│            • Intent lost in implementation details                      │
│            • "Why" buried in commit history                             │
│            • Tests verify behavior, not intent                          │
│            • AI hallucinates without clear requirements                 │
│            • Bugs vs features become opinion                            │
│            • New devs reverse-engineer purpose                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Solution: Spec as Single Source of Truth

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SPEC AS SOURCE OF TRUTH                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                         ┌──────────┐                                    │
│                         │   SPEC   │                                    │
│                         │          │                                    │
│                         │ Intent   │                                    │
│                         │ Stories  │                                    │
│                         │ REQs     │                                    │
│                         │ Errors   │                                    │
│                         └────┬─────┘                                    │
│                              │                                          │
│              ┌───────────────┼───────────────┐                          │
│              │               │               │                          │
│              ▼               ▼               ▼                          │
│         ┌────────┐      ┌────────┐      ┌────────┐                      │
│         │  CODE  │      │ TESTS  │      │  DOCS  │                      │
│         │        │      │        │      │        │                      │
│         │ Impl   │      │ Verify │      │ Explain│                      │
│         └────────┘      └────────┘      └────────┘                      │
│                                                                         │
│   • Intent explicit and versioned                                       │
│   • "Why" lives with "what"                                             │
│   • Tests prove spec is implemented                                     │
│   • AI has clear requirements to follow                                 │
│   • Bug = deviation from spec (objective)                               │
│   • New devs read spec first                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why This Matters for AI-Assisted Development

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    WITHOUT SPEC                │     WITH SPEC           │
├────────────────────────────────────────────────┼─────────────────────────┤
│                                                │                         │
│  User: "Add user auth"                         │  User: "Add user auth"  │
│           │                                    │           │             │
│           ▼                                    │           ▼             │
│  ┌─────────────────┐                           │  ┌─────────────────┐    │
│  │ AI guesses:     │                           │  │ AI reads spec:  │    │
│  │ • JWT? Session? │                           │  │                 │    │
│  │ • OAuth? Basic? │                           │  │ UserStory-01:   │    │
│  │ • What errors?  │                           │  │ "User can login │    │
│  │ • What fields?  │                           │  │  with email"    │    │
│  │                 │                           │  │                 │    │
│  │ Builds something│                           │  │ REQ-1: Password │    │
│  │ that might work │                           │  │ min 8 chars     │    │
│  └────────┬────────┘                           │  │                 │    │
│           │                                    │  │ Error: "Invalid │    │
│           ▼                                    │  │ credentials"    │    │
│  ┌─────────────────┐                           │  └────────┬────────┘    │
│  │ User: "No, I    │                           │           │             │
│  │ wanted..."      │                           │           ▼             │
│  │                 │                           │  ┌─────────────────┐    │
│  │ Rework cycle    │                           │  │ Builds exactly  │    │
│  │ begins          │                           │  │ what's specified│    │
│  └─────────────────┘                           │  └─────────────────┘    │
│                                                │                         │
│  Result: Multiple iterations,                  │  Result: First attempt  │
│  unclear if done, technical debt               │  matches intent, test-  │
│                                                │  able, maintainable     │
└────────────────────────────────────────────────┴─────────────────────────┘
```

### Vibe Coding Problems & How Specs Fix Them

Vibe coding without specs creates a patch loop that compounds debt with every iteration.

```
         VIBE CODING                                    SPEC-DRIVEN
              │                                              │
              ▼                                              ▼
┌─────────────────────────────┐                 ┌───────────────────────┐
│          BUILD              │                 │      UNDERSTAND       │◀─────┐
│                             │                 │                       │      │
│  "Make a login page"        │                 │  What problem?        │      │
│  AI generates code          │                 │  Who is it for?       │      │
│  Looks reasonable           │                 │  What's success?      │      │
└──────────────┬──────────────┘                 └───────────┬───────────┘      │
               │                                            │                  │
               ▼                                    unclear?─┴─clear           │
┌─────────────────────────────┐                        │         │             │
│         PROBLEM             │                        ▼         │             │
│                             │                   AskUser        │             │
│  "JWT isn't working"        │                   Research       │             │
│  "Sessions don't persist"   │                   Read code      │             │
│  "Wait, did we want OAuth?" │                        │         │             │
└──────────────┬──────────────┘                        └────┬────┘             │
               │                                            │                  │
               ▼                                            ▼                  │
┌─────────────────────────────┐                 ┌───────────────────────┐      │
│          PATCH              │                 │         SPEC          │◀───┐ │
│                             │                 │                       │    │ │
│  "Fix the JWT thing"        │                 │  UserStory-01: ...    │    │ │
│  AI adds more code          │                 │  REQ-01: ...          │    │ │
│  Doesn't know original goal │                 │  Errors: ...          │    │ │
└──────────────┬──────────────┘                 │  Architecture: ...    │    │ │
               │                                │  Decision: JWT because│    │ │
               │◀──────────────┐                └───────────┬───────────┘    │ │
               ▼               │                            │                │ │
┌─────────────────────────────┐│                    gaps?───┴───complete     │ │
│       ANOTHER PROBLEM       ││                      │           │          │ │
│                             ││                      └───────────│──────────┘ │
│  "Now sessions break"       ││                     back to      │            │
│  "Tests fail"               ││                     UNDERSTAND   │            │
│  "The other page broke"     ││                                  ▼            │
└──────────────┬──────────────┘│                 ┌───────────────────────┐     │
               │               │                 │       REFLECT         │     │
               └───────────────┘                 │                       │     │
              patch loop                         │  Could someone else   │     │
               │                                 │  build this from spec?│     │
               │                                 └───────────┬───────────┘     │
               ▼                                             │                 │
┌─────────────────────────────┐                      no──────┴──────yes        │
│      CONTEXT FILLS          │                      │               │         │
│                             │                 refine spec          │         │
│  50 messages deep           │                      │               │         │
│  AI forgets decisions       │                      └───────┬───────┘         │
│  "Let me try new approach"  │                              │                 │
│  Contradicts earlier code   │                              ▼                 │
└──────────────┬──────────────┘                 ┌───────────────────────┐      │
               │                                │      IMPLEMENT        │◀──┐  │
               │  (back to BUILD                │                       │   │  │
               │   with hidden debt)            │  Build to spec        │   │  │
               │                                │  Deviate? Update spec │   │  │
               │                                └───────────┬───────────┘   │  │
               │                                            │               │  │
               │                                            ▼               │  │
               │                                ┌───────────────────────┐   │  │
               │                                │         TEST          │   │  │
               │                                └───────────┬───────────┘   │  │
               │                                            │               │  │
               │                                    fail────┴────pass       │  │
               │                                     ▼             │        │  │
               │◀────────────────────┐        ┌───────────┐        │        │  │
               │                     │        │ DIAGNOSE  │        │        │  │
               ▼                     │        │           │        │        │  │
┌─────────────────────────────┐      │        │ Compare:  │        │        │  │
│      "WORKS"                │      │        │ spec/code │        │        │  │
│                             │      │        │ /test     │        │        │  │
│  "Looks right to me"        │      │        └─────┬─────┘        │        │  │
│  Demo passes                │      │              │              │        │  │
│  Tests pass (but test what  │      │        ┌─────┴─────┐        │        │  │
│   code does, not intent)    │      │        │           │        │        │  │
└──────────────┬──────────────┘      │      spec        code       │        │  │
               │                     │      wrong       wrong      │        │  │
               │                     │        │           │        │        │  │
               │  "Seems done"       │        │           └────────│────────┘  │
               │  Push to prod       │        │           fix code │           │
               │                     │        │                    │           │
               ▼                     │        └────────────────────│───────────┘
┌─────────────────────────────┐      │                  update spec│
│      PROD BUGS              │      │                             │
│                             │      │                             ▼
│  "Login doesn't work on     │      │                 ┌───────────────────────┐
│   mobile"                   │      │                 │        SYNC           │
│  "Edge case crashes app"    │      │                 │                       │
│  "That feature we shipped   │      │                 │  Implementation done  │
│   last month broke"         │      │                 │  Spec match reality?  │
└──────────────┬──────────────┘      │                 │  Update if diverged   │
               │                     │                 └───────────┬───────────┘
               ▼                     │                             │
┌─────────────────────────────┐      │                             ▼
│      FIREFIGHT              │      │                 ┌───────────────────────┐
│                             │      │                 │        DONE ✓         │
│  Hotfix login               │      │                 │                       │
│  → breaks registration      │      │                 │  All REQs pass        │
│  Fix registration           │      │                 │  Stories verified     │
│  → breaks password reset    │      │                 │  Spec is current      │
│  "Why is this so fragile?"  │      │                 └───────────┬───────────┘
└──────────────┬──────────────┘      │                             │
               │                     │                             │
               └─────────────────────┘                             ▼
                    back to BUILD                            next feature
                    (more debt each time)                          │
                                                                   │
                                                                   └──────────┐
                                                                              │
                                                                              ▼
                                                                   write next spec
```

### The Traceability Advantage

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  SPEC                    CODE                   TEST                    │
│                                                                         │
│  UserStory-auth-01 ─────▶ login.ts ────────────▶ login.spec.ts          │
│  "User can login"        handleLogin()          @spec UserStory-auth-01 │
│                                │                        │               │
│                                │                        │               │
│  REQ-1 ─────────────────▶ validates password ──▶ "REQ-1: min 8 chars"   │
│  "Password min 8 chars"                                                 │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  Bug reported: "Can login with 5 char password"                         │
│                          │                                              │
│                          ▼                                              │
│              ┌─────────────────────────┐                                │
│              │ Check: Does code match  │                                │
│              │ REQ-1? No.              │                                │
│              │                         │                                │
│              │ Fix CODE, not spec.     │                                │
│              │ This is a bug, not a    │                                │
│              │ feature request.        │                                │
│              └─────────────────────────┘                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

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

## Usage

### Via Command

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
- Architecture diagrams
- Error cases
- Edge cases
- Known issues (`BUG-[feature]-##`)
- Future considerations (todos)

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
└── references/
    ├── e2e-test-format.md   # E2E test header format
    └── examples.md          # Good/bad spec examples

agents/
└── spec-driven-development.md  # Agent definition

commands/
├── sdd.md                      # Short alias
└── spec-driven-development.md  # Full command
```

## Philosophy

1. **Spec first**: If the spec is hard to write, the feature isn't well understood
2. **Spec is truth**: Code and tests conform to spec, not the other way around
3. **No vague specs**: "Handles errors appropriately" is not a spec
4. **No happy path only**: Document errors, edge cases, failure modes
5. **Trace everything**: UserStory → E2E test, REQ → unit test

## License

MIT
