# Feature: [Feature Name]

> One-line description of what this feature enables.

> **How to use this template — two tiers:**
>
> - **CORE sections** (required for every feature spec): User Stories, Out of Scope, What It Does, Requirements, Error Cases, Edge Cases, Key Decisions, Known Issues, Future Considerations, Changelog.
> - **OPTIONAL sections** (marked with an *Include when* test): add only when the test passes; otherwise delete the section entirely.
>
> A simple feature with a complete core is a complete spec. Don't pad optional sections to look thorough.

---

## User Stories

- UserStory-[feature]-01: As a [user type], I can [action] so that [benefit]
- UserStory-[feature]-02: As a [user type], I can [action] so that [benefit]
- UserStory-[feature]-03: As a [user type], I can [action] so that [benefit]

> **Format:** `UserStory-[feature]-[##]` (use a short lowercase feature code, e.g. `chat`, `kanban`) enables E2E tests to reference specific stories via `@spec` headers.

> **Acceptance criteria:** The Requirements, Error Cases, and Edge Cases sections below are the acceptance criteria for these stories. Before implementation: could Claude satisfy the story text while building the wrong thing? If yes, tighten the requirements or add a no-go above.

---

## Out of Scope

What this feature explicitly does NOT include. Claude will not infer exclusions — if it is not listed here, it is potentially in scope.

- [Excluded functionality]
- [Excluded functionality]

---

## What It Does

High-level behavior description. What the user experiences.

- Bullet point of key behavior
- Bullet point of key behavior
- Bullet point of key behavior

---

## Requirements

Testable statements. Each should map to a test case.

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | [Testable statement] | Must |
| REQ-2 | [Testable statement] | Must |
| REQ-3 | [Testable statement] | Should |
| REQ-4 | [Testable statement] | Could |

---

## Architecture

> **Optional** — *Include when* the feature spans more than one component or system. Delete otherwise.

### Component Diagram

```
┌─────────────────────────────────────────┐
│ ParentComponent                         │
│  ├─ ChildComponent                      │
│  │   └─ GrandchildComponent             │
│  └─ SiblingComponent                    │
└─────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component → Context/Hook → API → Backend → Database
                                      ↓
                              Response → UI Update
```

### Sequence Diagram

> *Include when* three or more systems participate in a single flow.

```
User        Frontend        API         Backend
  │            │             │             │
  │─── action ─▶│             │             │
  │            │─── request ──▶│             │
  │            │             │─── query ───▶│
  │            │             │◀── result ───│
  │            │◀── response ─│             │
  │◀── update ─│             │             │
```

---

## Data Model

> **Optional** — *Include when* the feature owns persisted entities or non-obvious data shapes. Delete otherwise.

Shapes used by this feature. Field: type - description.

### [Model Name]

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| field1 | string | Description |
| createdAt | timestamp | When created |

### Relationships

```
Model A (1) ──────── (n) Model B
```

---

## States & Transitions

> **Optional** — *Include when* the feature has more than two states or non-obvious transitions. Delete otherwise.

### State Machine

```
┌─────────┐    action    ┌──────────┐    success   ┌───────────┐
│  Idle   │ ───────────▶ │ Loading  │ ───────────▶ │  Success  │
└─────────┘              └──────────┘              └───────────┘
     ▲                        │
     │                        │ failure
     │                        ▼
     │                   ┌──────────┐
     └─────── retry ──── │  Error   │
                         └──────────┘
```

### State Descriptions

| State | Description | Allowed Transitions |
|-------|-------------|---------------------|
| Idle | Initial/resting state | → Loading |
| Loading | Operation in progress | → Success, Error |
| Success | Operation completed | → Idle |
| Error | Operation failed | → Idle (retry) |

---

## Error Cases

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Network failure | No connection | Toast: "Connection lost" | Auto-retry 3x, then manual |
| Validation error | Invalid input | Inline error message | Fix input, resubmit |
| Server error | Backend failure | Toast: "Something went wrong" | Retry button |

---

## Edge Cases

Behaviors that aren't obvious. Document what happens.

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty input | Submit disabled, no error shown |
| Rapid clicks | Debounced, only first action fires |
| Concurrent edits | Last write wins, no conflict UI |

---

## API Endpoints

> **Optional** — *Include when* the feature exposes or consumes HTTP endpoints. Delete otherwise.

| Method | Endpoint | Request | Response | Description |
|--------|----------|---------|----------|-------------|
| GET | /resource | - | Resource[] | List all |
| POST | /resource | { field1, field2 } | Resource | Create |

---

## Implementation

> **Optional** — add after implementation. Delete until then.
>
> **File map only.** The spec records *where and why*; the code records *what and how*. Do not mirror signatures, props, types, or schemas into the spec — they drift the moment code changes, and the code is already their source of truth.

### File Map

| Path | Purpose |
|------|---------|
| `src/features/[feature]/[Main].tsx` | [One-line purpose] |
| `src/features/[feature]/hooks/useFeature.ts` | [One-line purpose] |
| `backend/handlers/[feature].go` | [One-line purpose] |

### Entry Points

Where this feature starts — routes, handlers, commands, scheduled jobs.

- `[METHOD /api/route]` → `backend/handlers/[feature].go`
- `[/page-route]` → `src/features/[feature]/[Main].tsx`

---

## Key Decisions

Architectural choices and their rationale.

### Decision 1: [Choice Made]

**Context:** What problem were we solving?

**Options Considered:**

1. Option A - pros/cons
2. Option B - pros/cons

**Decision:** Chose Option A because [reason].

**Consequences:** What this means for the codebase.

---

## Testing Notes

> **Optional** — *Include when* the test strategy isn't obvious from the Requirements and user stories. Delete otherwise.

### Critical Paths (E2E Tests)

E2E tests for user stories that span multiple systems:

1. UserStory-[feature]-01: [Journey description] → covers REQ-1, REQ-2

### Unit Tests

Requirements testable in isolation:

- REQ-4: [Can be unit tested because...]

### Not Worth Testing

- [What's covered by lower-level tests]
- [What's too brittle for E2E]

---

## Known Issues

Active bugs and defects for this feature. Remove rows when fixed and verified. If none: "No active bugs."

| ID | Description | Severity | Status | Links |
|----|-------------|----------|--------|-------|
| BUG-[feature]-01 | [Brief description of the bug] | High/Medium/Low | Open | REQ-##, UserStory-[feature]-##, `test-file.spec.ts:line` |

> **Severity:** High = broken, no workaround. Medium = impaired, workaround exists. Low = minor, cosmetic.
> **Links:** Include relevant REQ-##, UserStory-[feature]-##, and/or test file:line references.

---

## Future Considerations

Known limitations or planned improvements. Not commitments.

- [ ] Potential enhancement 1
- [ ] Known limitation to address

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| YYYY-MM-DD | Initial spec | Feature created |
