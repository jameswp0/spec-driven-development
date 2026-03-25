# Todo Analysis and Implementation

Use this workflow for serious todo work: analyzing backlog, mapping dependencies, filtering with design principles, determining implementation order.

For simple "implement this one todo" — just do it. This workflow is for the full backlog analysis.

## Step 1: Collect All Todos

Scan all sources:
- Use Glob (`specs/**/*.md` or `app_spec/**/*.md`) to find all spec files
- Use Grep for pattern `## Future Considerations` with context (`-A 20`) to extract todo sections

**ID scheme used in this workflow:**
- `B#` = Backend todo (numbered sequentially across all backend todos)
- `F#` = Frontend todo (numbered sequentially across all frontend todos)

These are analysis-session IDs for tracking work. They are not stored in specs — specs use the Future Considerations checklist directly.

**Build collection:**
```
## All Todos

### Backend (X todos)
| ID | Feature | Todo | Source |
|----|---------|------|--------|
| B1 | 01-auth | Add refresh token rotation | 01-authentication.md |
| B2 | 02-tasks | Add pagination to list endpoint | 02-task-crud.md |
| B3 | 02-tasks | Add index on conversation_id | 02-task-crud.md |
...

### Frontend (X todos)
| ID | Feature | Todo | Source |
|----|---------|------|--------|
| F1 | 01-chat | Handle SSE reconnection | 01-chat-interface.md |
| F2 | 03-kanban | Add drag preview on mobile | 03-kanban-board.md |
...
```

## Step 2: Map Dependencies

For each todo, identify:
- **Blocks:** What must complete before this can start?
- **Enables:** What does completing this unblock?
- **Related:** What touches the same code/concepts?

**Analysis approach:**
- Does todo A modify code that todo B depends on?
- Does todo A add infrastructure that todo B needs?
- Would doing A and B together be more efficient (same files)?

**Output dependency map:**
```
## Dependencies

B2 (pagination)
├── Blocks: F3 (infinite scroll needs paginated API)
└── Related: B3 (both touch task queries)

B3 (add index)
└── Independent (DB schema only)

F1 (SSE reconnection)
└── Independent (client-side only)

F3 (infinite scroll)
├── Blocked by: B2 (needs paginated API)
└── Related: F2 (both touch list rendering)
```

**Dependency matrix:**
| ID | Blocks | Blocked By | Related |
|----|--------|------------|---------|
| B2 | F3 | - | B3 |
| B3 | - | - | B2 |
| F1 | - | - | - |
| F3 | - | B2 | F2 |

## Step 3: Assess Complexity

For each todo, evaluate:

**Scope:** How many files affected?
- Low: 1-2 files
- Medium: 3-5 files
- High: 6+ files

**Risk:** What could go wrong?
- Low: Isolated change, well-understood pattern
- Medium: Touches shared code, needs testing
- High: Breaking changes, new patterns, external deps

**Clarity:** How well-defined is the work?
- High: Clear requirements, known approach
- Medium: Some design decisions needed
- Low: Needs investigation first

**Output assessment:**
| ID | Scope | Risk | Clarity | Notes |
|----|-------|------|---------|-------|
| B2 | Low | Low | High | Standard pagination pattern |
| B3 | Low | Low | High | Simple index addition |
| F1 | Medium | Medium | Medium | Need to handle edge cases |
| F3 | Medium | Low | High | After B2, straightforward |

## Step 4: Apply Design Principles

Review each todo against design principles. Flag concerns.

**Questions to ask:**

| Principle | Question |
|-----------|----------|
| YAGNI | Do we actually need this now? Who's asking for it? |
| KISS | Is there a simpler solution that solves 80% of the problem? |
| AHA | Are we abstracting too early? Do we have 3+ use cases? |
| DRY | Is this real duplication or coincidental similarity? |

**For each todo, mark:**
- ✅ Proceed — clearly needed, well-scoped
- ⚠️ Simplify — consider simpler approach
- ❌ Remove — YAGNI, premature abstraction, not actually needed

**Output principle review:**
```
## Design Principle Review

### ✅ Proceed As-Is
- B2 (pagination): Clear need, standard pattern
- B3 (add index): Performance data shows need
- F3 (infinite scroll): User-requested, blocked only by B2

### ⚠️ Consider Simplifying
- F1 (SSE reconnection):
  - Current: Full reconnection with state recovery
  - Simpler: Just show "reconnecting..." and reload on success
  - Recommendation: Start with simpler approach

### ❌ Recommend Removing
- F5 (offline support):
  - YAGNI: No users have requested this
  - Adds significant complexity
  - Can add later if needed
  - Recommendation: Remove from backlog

- B7 (query caching):
  - Premature optimization: No performance issues observed
  - AHA: Only one query pattern, not worth abstracting
  - Recommendation: Remove, revisit if perf issues arise
```

**Ask user:** "Review the principle analysis. Agree with removals/simplifications?"

## Step 5: Determine Implementation Order

With dependencies mapped and todos filtered, determine optimal order.

**Ordering factors:**
1. **Dependencies first:** Blockers before blocked items
2. **Quick wins early:** Build momentum
3. **Risk early:** Get feedback on risky changes fast
4. **Batch related:** Group items touching same files

**Output implementation order:**
```
## Implementation Order

### Phase 1: Foundation
| Order | ID | Todo | Rationale |
|-------|----|------|-----------|
| 1 | B3 | Add index on conversation_id | Quick win, no deps, improves B2 |
| 2 | B2 | Add pagination to list endpoint | Unblocks F3 |

### Phase 2: Features
| Order | ID | Todo | Rationale |
|-------|----|------|-----------|
| 3 | F1 | Handle SSE reconnection (simplified) | Independent, medium complexity |
| 4 | F3 | Add infinite scroll | Now unblocked by B2 |

### Phase 3: Polish
| Order | ID | Todo | Rationale |
|-------|----|------|-----------|
| 5 | F2 | Add drag preview on mobile | Low priority, isolated |

### Removed (YAGNI)
- F5: Offline support — not needed now
- B7: Query caching — premature optimization
```

## Step 6: Generate Implementation Plans

For each todo in order, create a mini-plan:

```
### Todo B2: Add pagination to list endpoint

**Approach:** Direct implementation
**Files:** handlers/tasks.go, models/task.go
**Dependencies:** None (B3 is nice-to-have, not required)

**Steps:**
1. Add `limit` and `offset` query params to ListTasks handler
2. Update TaskModel.List() to accept pagination params
3. Add `total` count to response for client pagination UI
4. Update API spec with new params
5. Update feature spec with pagination behavior

**Verification:**
- [ ] Endpoint accepts limit/offset params
- [ ] Response includes total count
- [ ] Default limit is 50
- [ ] Max limit is 100
- [ ] Spec updated
```

## Step 7: Execute or Export

Ask user: "Ready to implement? Options:"
1. **Start implementing** — Begin with first todo
2. **Export plan only** — Save plan for later execution
3. **Adjust order** — Reorder before starting

**If implementing:**
For each todo in order:
1. Announce: "Starting [ID]: [title]"
2. Execute the plan steps
3. Verify implementation
4. Update feature spec (mark todo complete, update any changed sections)
5. Report: "Completed [ID]"
6. Continue to next

**Track progress:**
| # | ID | Status | Notes |
|---|----|----|-------|
| 1 | B3 | ✅ Complete | Migration added |
| 2 | B2 | ✅ Complete | |
| 3 | F1 | 🔄 In Progress | |

## Step 8: Post-Implementation

After completing todos:

1. **Update feature specs:**
   - Remove completed todos
   - Update any changed behaviors
   - Add new decisions if applicable

2. **Verify specs still accurate:**
   - Run verification checklist on modified specs
   - Fix any drift from implementation

3. **Update overview spec Future Considerations (if applicable):**
   - If your overview spec has a roadmap section, update it to reflect completed work
   - Individual feature todos live in each feature spec's Future Considerations section

## Step 9: Report

```
## Todo Sprint Complete

### Summary
- Todos analyzed: 12
- Todos implemented: 5
- Todos simplified: 1
- Todos removed (YAGNI): 2
- Remaining: 4

### Completed
| ID | Todo | Files Changed |
|----|------|---------------|
| B3 | Add index on conversation_id | migrations/003_add_index.sql |
| B2 | Add pagination to list endpoint | handlers/tasks.go, models/task.go |
| F1 | Handle SSE reconnection | components/Chat/useStream.ts |
| F3 | Add infinite scroll | components/TaskList/index.tsx |
| F2 | Add drag preview on mobile | components/Kanban/DragItem.tsx |

### Design Principles Applied
| ID | Principle | How Applied |
|----|-----------|-------------|
| F1 | KISS | Used simple reconnect instead of full state recovery |
| B2 | YAGNI | Skipped cursor pagination, offset sufficient for now |

### Removed (YAGNI)
| ID | Original Todo | Reason |
|----|---------------|--------|
| F5 | Offline support | No user demand, high complexity |
| B7 | Query caching | No performance issues, premature |

### Specs Updated
- [spec-dir]/features/tasks.md
- [spec-dir]/features/chat.md
- [spec-dir]/features/kanban.md
- [spec-dir]/overview.md

### Remaining Backlog
| Priority | ID | Todo |
|----------|----|------|
| Medium | B4 | Add rate limiting to auth endpoints |
| Low | F6 | Add keyboard shortcuts help modal |
...
```

## When NOT to Use This Workflow

**Just do it directly when:**
- Single, obvious todo
- No dependencies to analyze
- Clear scope, known approach
- Quick fix

**Use this workflow when:**
- 5+ todos to analyze
- Unknown dependencies between items
- Need to prioritize across features
- Want to apply YAGNI/KISS filtering
- Planning a work session or sprint
