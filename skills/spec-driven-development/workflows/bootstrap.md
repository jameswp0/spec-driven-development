# Bootstrap: Generate Specs from Existing Code

Use this workflow when creating specs for an existing codebase that has no documentation.

## Before You Start: Check for Existing Specs

Use Glob to check for existing spec files: `specs/**/*.md` and `app_spec/**/*.md`.

**If specs exist:**
- Read them before generating new ones
- Identify gaps (missing features, thin sections, placeholder text)
- Use this workflow to fill gaps, not overwrite existing work
- Skip steps already completed

**If no specs exist:**
- Proceed from Step 1

## Step 1: Understand the Project

Ask user: "What does this project do? Who is it for?"

If they can't answer clearly, explore:
- Use Read to check `README.md`
- Use Read to check `package.json`, `go.mod`, or `Cargo.toml`

**Output:**
```
## Project Understanding

**Purpose:** [What problem it solves]
**Users:** [Who uses it]
**Tech:** [Key technologies]
```

## Step 2: Identify Features

Features = things users can do. Not code modules.

**Ask:** "What can users do with this app?"

If unclear, explore the UI/API:
- Use Glob with patterns `src/app/**`, `pages/**`, `app/**`, `src/pages/**` to find frontend routes
- Use Grep for pattern `GET|POST|PUT|DELETE` in `*.go` and `*.ts` files

**Think in user terms:**
- "User can send a chat message" → Chat feature
- "User can create a task" → Task management feature
- "User can drag tasks between columns" → Kanban feature

**Output:**
```
## Discovered Features

| Feature | What Users Can Do |
|---------|-------------------|
| Chat | Send messages, see AI responses, view history |
| Tasks | Create, edit, delete, change status |
| Kanban | Drag tasks between columns, see overview |
```

**Ask user:** "Does this capture the main features? Any to add or remove?"

## Step 3: Create Overview Spec

Copy `templates/overview.template.md` to `[spec-dir]/overview.md` (check project structure: `specs/` or `app_spec/`).

Fill in:
| Section | Source |
|---------|--------|
| Purpose | Step 1 understanding |
| User Stories | High-level from Step 2 |
| System Architecture | Explore code structure |
| Tech Stack | package.json, go.mod, etc. |
| Features table | Link to feature specs (create next) |
| Development | README, scripts |

**Focus on:** Architecture diagrams, data flow, cross-cutting concerns (auth, errors).

**Don't obsess over:** Every file path, every endpoint. Keep it high-level.

## Step 4: Create Feature Specs

For each feature from Step 2, create a spec using `templates/feature.template.md`.

The template is two-tier: fill the **core sections** for every feature; add **optional sections** (Architecture, Data Model, States, API Endpoints, Implementation, Testing Notes) only where their *Include when* test passes. Simple features get short specs — that's correct, not lazy.

**For each feature:**

1. **User Stories** - What can users do?
   ```
   - UserStory-chat-01: As a user, I can send a message and get an AI response
   - UserStory-chat-02: As a user, I can see my conversation history
   ```

2. **Requirements** - Testable statements
   ```
   | ID | Requirement | Priority |
   |----|-------------|----------|
   | REQ-1 | Message appears immediately (optimistic) | Must |
   | REQ-2 | AI response streams token by token | Must |
   ```

3. **Architecture** - How pieces connect
   ```
   User → ChatInput → API → Backend → Claude API
   ```

4. **States & Errors** - What can go wrong
   ```
   | Error | Cause | User Sees | Recovery |
   |-------|-------|-----------|----------|
   | Network fail | No internet connection | "Connection lost" | Retry button |
   ```

5. **Decisions** - Why it works this way
   ```
   SSE over WebSockets: simpler, HTTP-compatible
   ```

**Write to:** `specs/features/[feature-name].md` (adapt to project structure)

## Step 5: Verify

For each spec:
- [ ] User stories make sense
- [ ] Requirements are testable
- [ ] Architecture matches reality
- [ ] Error cases covered
- [ ] No empty sections

## Step 6: Report

```
## Bootstrap Complete

**Created:**
- Overview: [spec-dir]/overview.md
- Features: X specs

**Features Documented:**
| Feature | User Stories | Requirements | Errors |
|---------|--------------|--------------|--------|
| Chat | 4 | 6 | 5 |
| Tasks | 5 | 8 | 4 |
| Kanban | 3 | 5 | 3 |

**Next Steps:**
1. Review specs for accuracy
2. Fill gaps as you find them
```

## Tips

**Don't try to document everything.** Start with the main features. Add detail as needed.

**User perspective first.** "What can users do?" not "What files exist?"

**Good enough > perfect.** A useful spec now beats a perfect spec never.
