# E2E Test Format

E2E tests must trace back to spec user stories.

## File-Level Header

```typescript
/**
 * @journey [user flow: action → result → outcome]
 * @risk [what breaks if this fails]
 * @why-e2e [what integration is proven]
 * @spec [spec-dir]/features/[feature].md:UserStory-[feature]-##,UserStory-[feature]-##
 */
```

## Individual Test Header

```typescript
/**
 * @spec [spec-dir]/features/[feature].md:UserStory-[feature]-##
 * USER STORY: [Full user story text copied from spec]
 * SPEC: [filename] - REQ-1, REQ-2, ...
 *
 * [Why this integration matters]
 */
test("description", async ({ page }) => { ... });
```

> **`[spec-dir]`** is your project's spec directory: `specs/` or `app_spec/`. Use the actual path.
>
> **Required field:** `@spec` is validated by the Test Health Check (TEST-RULE.5). `@journey`, `@risk`, and `@why-e2e` are recommended context fields — include them when the reason for the E2E test isn't obvious from the test description alone.

## Key Rules

- `@spec` references must point to valid spec files and UserStory IDs
- USER STORY text must match the spec exactly
- REQ-* IDs identify which requirements the test covers
- Every test must answer: "What breaks if this fails?"
