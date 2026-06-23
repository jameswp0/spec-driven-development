# Why Specs as Source of Truth?

The extended rationale behind the summary in the [README](../README.md) — full argument with diagrams.

## The Problem with Code as Truth

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

## The Solution: Spec as Single Source of Truth

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

## Why This Matters for AI-Assisted Development

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    WITHOUT SPEC                │     WITH SPEC           │
├────────────────────────────────────────────────┼─────────────────────────┤
│                                                │                         │
│  User: "Add user auth"                         │  User: "Add user auth"  │
│           │                                    │           │             │
│           ▼                                    │           ▼             │
│  ┌─────────────────┐                           │  ┌──────────────────┐   │
│  │ AI guesses:     │                           │  │ AI reads spec:   │   │
│  │ • JWT? Session? │                           │  │                  │   │
│  │ • OAuth? Basic? │                           │  │ UserStory-001:   │   │
│  │ • What errors?  │                           │  │ "User can login  │   │
│  │ • What fields?  │                           │  │  with email"     │   │
│  │                 │                           │  │                  │   │
│  │ Builds something│                           │  │ REQ-001: Password│   │
│  │ that might work │                           │  │ min 8 chars      │   │
│  └────────┬────────┘                           │  │                  │   │
│           │                                    │  │ Error: "Invalid  │   │
│           ▼                                    │  │ credentials"     │   │
│  ┌─────────────────┐                           │  └────────┬─────────┘   │
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

## Vibe Coding Problems & How Specs Fix Them

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
│  "Fix the JWT thing"        │                 │  UserStory-001: ...   │    │ │
│  AI adds more code          │                 │  REQ-001: ...         │    │ │
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

## The Traceability Advantage

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  SPEC                    CODE                   TEST                    │
│                                                                         │
│  UserStory-001 ─────────▶ login.ts ────────────▶ login.spec.ts          │
│  "User can login"        handleLogin()          @spec UserStory-001     │
│                                │                        │               │
│                                │                        │               │
│  REQ-001 ───────────────▶ validates password ──▶ "REQ-001: min 8 chars" │
│  "Password min 8 chars"                                                 │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  Bug reported: "Can login with 5 char password"                         │
│                          │                                              │
│                          ▼                                              │
│              ┌─────────────────────────┐                                │
│              │ Check: Does code match  │                                │
│              │ REQ-001? No.            │                                │
│              │                         │                                │
│              │ Fix CODE, not spec.     │                                │
│              │ This is a bug, not a    │                                │
│              │ feature request.        │                                │
│              └─────────────────────────┘                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
