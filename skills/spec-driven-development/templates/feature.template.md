# Feature: [Feature Name]

> One-line description of what this feature enables.

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

### Sequence Diagram (for complex flows)

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

Shapes used by this feature. Field: type - description.

### [Model Name]

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| field1 | string | Description |
| field2 | number | Description |
| field3 | boolean | Description |
| createdAt | timestamp | When created |
| updatedAt | timestamp | When last modified |

### Relationships

```
Model A (1) ──────── (n) Model B
Model B (1) ──────── (n) Model C
```

---

## States & Transitions

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
| Timeout | Slow response | Toast: "Request timed out" | Auto-retry |
| Auth error | Session expired | Redirect to login | Re-authenticate |

---

## Edge Cases

Behaviors that aren't obvious. Document what happens.

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty input | Submit disabled, no error shown |
| Rapid clicks | Debounced, only first action fires |
| Concurrent edits | Last write wins, no conflict UI |
| Offline action | Queued, syncs when online |
| Refresh mid-action | State lost, user must retry |
| Very long content | Truncated with "show more" |

---

## API Endpoints

Endpoints this feature uses.

| Method | Endpoint | Request | Response | Description |
|--------|----------|---------|----------|-------------|
| GET | /resource | - | Resource[] | List all |
| GET | /resource/:id | - | Resource | Get one |
| POST | /resource | { field1, field2 } | Resource | Create |
| PATCH | /resource/:id | { field1? } | Resource | Update |
| DELETE | /resource/:id | - | - | Delete |

---

## Implementation

### File Dependency Graph

```
src/features/[feature]/
├── [MainComponent].tsx          [uses: useFeature, ChildComponent]
├── components/
│   ├── [ChildComponent].tsx     [uses: types]
│   └── [OtherComponent].tsx     [uses: hooks]
├── hooks/
│   ├── useFeature.ts           [uses: api, context]
│   └── useOtherHook.ts         [uses: types]
├── api/
│   ├── client.ts               [uses: fetch, types]
│   └── types.ts                [pure types]
└── store/
    ├── FeatureContext.tsx      [uses: reducer]
    └── reducer.ts              [uses: types]

backend/
├── handlers/
│   └── feature.go              [uses: models, services]
├── models/
│   └── feature.go              [uses: database]
└── services/
    └── feature_service.go      [uses: models, external APIs]
```

### Frontend Files

#### Core Components

| Component | File | Purpose | Props | State |
|-----------|------|---------|-------|-------|
| [Component] | `src/features/[feature]/Component.tsx` | [Purpose] | `prop: type` | none / `stateVar: type` |
| [Child] | `src/features/[feature]/components/Child.tsx` | [Purpose] | `prop: type` | `stateVar: type` |

#### Hooks & State Management

| Hook | File | Signature | Purpose | Returns |
|------|------|-----------|---------|---------|
| useFeature | `hooks/useFeature.ts` | `(params: Type) => ReturnType` | [Purpose] | `{ key: type }` |
| useOther | `hooks/useOther.ts` | `() => Type` | [Purpose] | `type` |

**Context:**
- Provider: `FeatureContext.tsx`
- State shape: `{ field: type }`
- Actions: `ACTION_TYPE`, `OTHER_ACTION`

#### API Layer

| Function | File | Signature | HTTP Details |
|----------|------|-----------|--------------|
| apiFunction | `api/client.ts` | `async (params: Type) => Promise<ReturnType>` | `METHOD /api/endpoint`<br>Body: `{ field: type }` |
| otherCall | `api/client.ts` | `async (id: string) => Promise<Type>` | `GET /api/resource/${id}` |

#### Type Definitions

| Type/Interface | File | Definition |
|----------------|------|------------|
| [Type] | `api/types.ts` | `{ field: type, other: type }` |
| [Interface] | `api/types.ts` | `{ method(): returnType }` |

### Backend Files

#### HTTP Handlers

| Handler | File | Route | Method | Request | Response |
|---------|------|-------|--------|---------|----------|
| HandleAction | `handlers/feature.go` | `/api/resource` | POST | `{ field: type }` | `Resource` (201) |
| HandleGet | `handlers/feature.go` | `/api/resource/:id` | GET | - | `Resource` (200) |

**Auth:** All routes require JWT token in `Authorization: Bearer <token>` header

#### Models

| Model | File | Purpose | Key Methods |
|-------|------|---------|-------------|
| [Model] | `models/feature.go` | [Purpose] | `Create() error`<br>`GetByID(id string) (*Model, error)`<br>`Update() error` |

**Model Struct:**

```go
type [Model] struct {
    ID        string
    Field     string
    CreatedAt time.Time
}
```

#### Services

| Service | File | Purpose | Key Functions |
|---------|------|---------|---------------|
| [Service] | `services/feature_service.go` | [Purpose] | `ProcessAction(ctx context.Context, params Type) (*Result, error)` |

### Database Schema

#### [table_name]

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| field_name | TEXT | NOT NULL |
| other_field | INTEGER | NOT NULL, DEFAULT 0 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- `idx_[table]_[column]` ON (column)
- `idx_[table]_[composite]` ON (col1, col2)

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

### Decision 2: [Choice Made]

**Context:** ...

**Decision:** ...

---

## Testing Notes

Guidance for testing this feature.

### Critical Paths (E2E Tests)

E2E tests for user stories that span multiple systems:

1. UserStory-[feature]-01: [Journey description] → covers REQ-1, REQ-2
2. UserStory-[feature]-02: [Journey description] → covers REQ-3, REQ-5

### Unit Tests

Requirements testable in isolation:

- REQ-4: [Can be unit tested because...]
- REQ-6: [Can be unit tested because...]

### Test Data Requirements

- [What seed data is needed]
- [What state must exist]

### Not Worth Testing

- [What's covered by lower-level tests]
- [What's too brittle for E2E]

---

## Known Issues

Active bugs and defects for this feature. Remove rows when fixed and verified.

| ID | Description | Severity | Status | Links |
|----|-------------|----------|--------|-------|
| BUG-[feature]-01 | [Brief description of the bug] | High/Medium/Low | Open | REQ-##, UserStory-[feature]-##, `test-file.spec.ts:line` |

> **Severity:** High = broken, no workaround. Medium = impaired, workaround exists. Low = minor, cosmetic.
> **Links:** Include relevant REQ-##, UserStory-[feature]-##, and/or test file:line references.

---

## Future Considerations

Known limitations or planned improvements. Not commitments.

- [ ] Potential enhancement 1
- [ ] Potential enhancement 2
- [ ] Known limitation to address

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| YYYY-MM-DD | Initial spec | Feature created |
| YYYY-MM-DD | Added X | Requirement change |
