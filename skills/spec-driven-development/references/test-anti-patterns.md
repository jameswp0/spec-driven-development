# Test Anti-Patterns

Patterns that produce tests that appear to work but test nothing.

These patterns indicate LLM-generated code that hasn't verified reality. Avoid them when writing tests.

---

## Critical Anti-Patterns

### Circular Mocking (TEST-RULE.4)

**Pattern:** `mock.mockReturnValue(X)` followed by `expect(...).toBe(X)`

**Problem:** Test validates the mock, not the actual function behavior.

**Example:**

❌ **Bad:**

```typescript
const mock = jest.fn().mockReturnValue(42);
const result = calculateTotal(mock);
expect(result).toBe(42);  // Testing mock, not calculateTotal
```

✅ **Good:**

```typescript
const result = calculateTotal([10, 20, 12]);
expect(result).toBe(42);  // Testing actual calculation
```

**Why it matters:** Circular mocks always pass, even if the real function is broken.

---

### Vague Test Names (TEST-RULE.3)

**Pattern:** Test names with "work", "handle", "data", "correctly"

**Problem:** Doesn't describe specific behavior being tested.

**Examples:**

❌ **Bad:**

```typescript
it('should work', ...)
it('handles data', ...)
it('works correctly', ...)
it('processes input', ...)
```

✅ **Good:**

```typescript
it('should return sum of array elements', ...)
it('should throw error when array is empty', ...)
it('should filter out negative numbers before summing', ...)
it('should round result to 2 decimal places', ...)
```

**Why it matters:** Vague names don't document behavior. When test fails, you can't tell what broke.

---

### Placeholder Imports (TEST-RULE.1, TEST-RULE.2)

**Pattern:** Import paths with `path/to/`, `example`, `component`

**Problem:** File doesn't exist; test will fail on import.

**Examples:**

❌ **Bad:**

```typescript
import { helper } from './path/to/helper'
import { Component } from '../components/Example'
import { utils } from './utils'  // Doesn't exist
```

✅ **Good:**

```typescript
import { formatCurrency } from '@/lib/formatters'
import { Button } from '@/components/Button'
import { sum } from '@/utils/math'  // All verified with grep/glob
```

**Verification before writing:**

Use Grep to confirm exports exist before importing:
- Pattern `export.*function formatCurrency` in `src/`
- Pattern `export.*const Button` in `src/`

**Why it matters:** Placeholder imports mean the test was written without reading the codebase.

---

### Weak Assertions (TEST-RULE.4)

**Pattern:** `toBeTruthy()`, `toBeDefined()`, `toHaveLength()`

**Problem:** Doesn't verify specific expected value.

**Examples:**

❌ **Bad:**

```typescript
expect(result).toBeTruthy()       // What is the expected value?
expect(user).toBeDefined()        // What fields should user have?
expect(items).toHaveLength(3)     // What items? Why 3?
```

✅ **Good:**

```typescript
expect(result).toBe(42)
expect(user).toEqual({ id: '123', name: 'Alice', role: 'admin' })
expect(items).toEqual([item1, item2, item3])
```

**Why it matters:** Weak assertions pass even when function returns wrong value. `toBeTruthy()` accepts any non-zero number, any non-empty string, any object.

---

## LLM Anti-Patterns (TEST-RULE.6-9)

These indicate LLM test generation bias:

### Happy Path Bias (TEST-RULE.6)

**Pattern:** All tests cover success cases, <3 error cases tested

**Problem:** LLMs default to testing success. Real code fails often.

**Fix:** For every success test, write 2+ failure tests.

**Example:**

❌ **Incomplete:**

```typescript
it('should save user', ...)
it('should update user', ...)
it('should delete user', ...)
```

✅ **Complete:**

```typescript
it('should save user with valid data', ...)
it('should reject user with missing email', ...)
it('should reject user with invalid email format', ...)
it('should handle database connection failure during save', ...)
it('should handle duplicate email error', ...)
```

---

### Over-Mocking (TEST-RULE.7)

**Pattern:** >50% of test is mock setup

**Problem:** Over-mocked tests don't test real behavior.

**Example:**

❌ **Over-mocked:**

```typescript
const mockA = jest.fn()
const mockB = jest.fn()
const mockC = jest.fn()
const mockD = jest.fn().mockReturnValue(mockA)
mockA.mockReturnValue(mockB)
mockB.mockImplementation(() => mockC)
// ... 20 lines of mock setup

const result = functionUnderTest()
expect(result).toBe(expected)  // Testing mocks, not function
```

✅ **Minimal mocking:**

```typescript
const result = functionUnderTest(realInput)
expect(result).toBe(expected)  // Testing actual logic
```

**Rule of thumb:** If mock setup > actual test logic, you're over-mocking.

---

### Copy-Paste Tests (TEST-RULE.8)

**Pattern:** Multiple tests with identical structure, only variable names differ

**Problem:** Copy-paste tests don't test different behaviors.

**Example:**

❌ **Copy-pasted:**

```typescript
it('should process user', () => {
  const result = process(user)
  expect(result.status).toBe('success')
})

it('should process admin', () => {
  const result = process(admin)
  expect(result.status).toBe('success')
})

it('should process guest', () => {
  const result = process(guest)
  expect(result.status).toBe('success')
})
```

✅ **Parameterized or distinct:**

```typescript
it.each([
  ['user', user, 'success'],
  ['admin', admin, 'success'],
  ['guest', guest, 'limited']
])('should process %s with %s status', (role, input, expectedStatus) => {
  const result = process(input)
  expect(result.status).toBe(expectedStatus)
})
```

Or write distinct tests if behavior actually differs.

---

### Missing Edge Cases (TEST-RULE.9)

**Pattern:** No tests for null, undefined, empty array, empty string

**Problem:** LLMs forget edge cases. Real code receives edge cases constantly.

**Required edge case tests:**

```typescript
it('should handle null input', ...)
it('should handle undefined input', ...)
it('should handle empty array', ...)
it('should handle empty string', ...)
it('should handle very large numbers', ...)
it('should handle special characters in strings', ...)
```

---

## Detection

### Manual Code Review

Scan test files for these patterns using the Grep tool:

- Detect vague test names: pattern `it\('should work` in `tests/`
- Detect placeholder imports: pattern `path/to` in `tests/`
- Detect weak assertions: pattern `toBeTruthy\(\)` in `tests/`
- Detect weak assertions: pattern `toBeDefined\(\)` in `tests/`

### Test Health Check

Run `Test Health Check` capability to auto-detect violations:

- Scans for circular mocking patterns
- Flags vague test names
- Verifies all imports exist
- Checks for @spec references
- Detects LLM anti-patterns (happy path bias, over-mocking, copy-paste, missing edge cases)

See SKILL.md "Test Health Check" section for details.

---

## Prevention

Before writing tests:

1. **Read the code** (CODE-RULE.1)
   - Know what functions exist
   - Know their signatures
   - Know their actual behavior

2. **Verify imports** (TEST-RULE.1)
   - Use Grep with pattern `export.*function [name]` in `src/` to confirm the function exists before importing

3. **Write specific test names** (TEST-RULE.3)
   - Describe observable behavior
   - Use "should [action] when [condition]" format

4. **Assert actual values** (TEST-RULE.4)
   - Don't test mocks
   - Use `.toBe()`, `.toEqual()` with specific expected values
   - Avoid `.toBeTruthy()`, `.toBeDefined()`

5. **Test failures first** (TEST-RULE.6)
   - Write error cases before success cases
   - Force yourself to think about what breaks

---

## Summary

**Forbidden patterns indicate:**

- ❌ LLM guessed instead of reading code
- ❌ Test validates mocks, not real behavior
- ❌ Test will pass even if function is broken
- ❌ Imports don't exist

**Good tests:**

- ✅ Import verified functions
- ✅ Test real behavior, not mocks
- ✅ Assert specific expected values
- ✅ Cover error cases and edge cases
- ✅ Have descriptive names

**Verification:**

- Auto-fixes placeholder imports
- Reports circular mocking, vague names, LLM anti-patterns
- Run Test Health Check after generating tests (SKILL.md → "Test Health Check" for the full process)
