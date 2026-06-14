# Spec Examples

Good and bad examples for reference.

## User Stories

**Bad:** "Users can manage tasks."

**Good:**

- UserStory-001: As a user, I can drag a task to a different column to change its status
- UserStory-002: As a user, I can see how many tasks are in each column

## Requirements

**Bad:** "The system should handle errors."

**Good:**

| ID | Requirement | Priority | Verify |
|----|-------------|----------|--------|
| REQ-001 | Dragging task to new column updates status immediately | Must | e2e |
| REQ-002 | Failed status update reverts card to original column | Must | e2e |
| REQ-003 | Column headers show task count | Should | unit |

## Error Cases

**Bad:** "Errors are handled appropriately."

**Good:**

| ID | Error | Cause | User Sees | Recovery |
|----|-------|-------|-----------|----------|
| ERR-001 | Network failure | No connection | Toast: "Failed to update" | Card reverts, retry manually |
| ERR-002 | Conflict | Task deleted elsewhere | Toast: "Task not found" | Card disappears |

## Edge Cases

**Bad:** No edge cases, or only one.

**Good:**

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EDGE-001 | Empty task title | Save button disabled, no API call made |
| EDGE-002 | Concurrent edit by two users | Last write wins, no conflict UI shown |
| EDGE-003 | Network drops mid-drag | Card returns to original column, toast: "Move failed" |
| EDGE-004 | Very long title (>200 chars) | Truncated in column header, full text in detail view |

## Known Issues

**Bad:** Vague description, no links, or deleting the row when fixed (orphans regression tests).

**Good:**

| ID | Description | Severity | Status | Links |
|----|-------------|----------|--------|-------|
| BUG-001 | Drag-and-drop fails on iOS Safari 16 | High | Open | REQ-003, UserStory-002 |
| BUG-002 | Column count flickered when tasks reorder rapidly | Low | Resolved | REQ-002 |

## E2E @spec Reference

**Good:**

```typescript
/**
 * @spec UserStory-001, REQ-001, REQ-002
 */
test("drag task from Todo to In Progress updates status", async ({ page }) => { ... });
```
