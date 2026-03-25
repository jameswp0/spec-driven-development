# Spec Examples

Good and bad examples for reference.

## User Stories

**Bad:** "Users can manage tasks."

**Good:**

- UserStory-kanban-01: As a user, I can drag a task to a different column to change its status
- UserStory-kanban-02: As a user, I can see how many tasks are in each column

## Requirements

**Bad:** "The system should handle errors."

**Good:**

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | Dragging task to new column updates status immediately | Must |
| REQ-2 | Failed status update reverts card to original column | Must |
| REQ-3 | Column headers show task count | Should |

## Error Cases

**Bad:** "Errors are handled appropriately."

**Good:**

| Error | Cause | User Sees | Recovery |
|-------|-------|-----------|----------|
| Network failure | No connection | Toast: "Failed to update" | Card reverts, retry manually |
| Conflict | Task deleted elsewhere | Toast: "Task not found" | Card disappears |

## Edge Cases

**Bad:** No edge cases, or only one.

**Good:**

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty task title | Save button disabled, no API call made |
| Concurrent edit by two users | Last write wins, no conflict UI shown |
| Network drops mid-drag | Card returns to original column, toast: "Move failed" |
| Very long title (>200 chars) | Truncated in column header, full text in detail view |

## Known Issues

**Bad:** Missing feature prefix, vague description, no links.

**Good:**

| ID | Description | Severity | Status | Links |
|----|-------------|----------|--------|-------|
| BUG-kanban-01 | Drag-and-drop fails on iOS Safari 16 | High | Open | REQ-3, UserStory-kanban-02 |
| BUG-kanban-02 | Column count flickers when tasks reorder rapidly | Low | Open | REQ-2 |

## E2E @spec Reference

**Good:**

```typescript
/**
 * @spec app_spec/features/kanban.md:UserStory-kanban-01
 * USER STORY: As a user, I can drag a task to a different column to change its status
 * SPEC: kanban.md - REQ-1, REQ-2
 */
test("drag task from Todo to In Progress updates status", async ({ page }) => { ... });
```
