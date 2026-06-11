# [Project Name]

> One-line description of what this project does.

---

## Purpose

2-3 sentences explaining the core problem this solves and for whom.

---

## User Stories (Product Level)

High-level stories that span features. What can users accomplish?

- As a [user type], I can [goal] so that [benefit]
- As a [user type], I can [goal] so that [benefit]
- As a [user type], I can [goal] so that [benefit]

---

## Out of Scope

What this project explicitly does NOT include. Prevents scope creep across all feature specs.

- [Excluded functionality or system capability]
- [Excluded functionality or system capability]

---

## System Architecture

### High-Level Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Frontend   │────▶│   Backend   │────▶│  Database   │
│  (Browser)  │◀────│  (Next.js)  │◀────│    (Go)     │◀────│  (SQLite)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │
                           │ (API calls)
                           ▼
                    ┌─────────────┐
                    │ External AI │
                    │   (Claude)  │
                    └─────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Technology |
|-------|----------------|------------|
| Client | User interaction, rendering | Browser |
| Frontend | UI, state management, API calls | [Framework] |
| Backend | Business logic, persistence, auth | [Language/Framework] |
| Database | Data storage | [Database] |
| External | AI/ML, third-party services | [Services] |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Framework | x.x.x | Core framework |
| UI Library | x.x.x | Component library |
| State | x.x.x | State management |
| Styling | x.x.x | CSS solution |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Language | x.x.x | Core language |
| Framework | x.x.x | HTTP framework |
| Database | x.x.x | Data persistence |
| ORM | x.x.x | Database access |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Hosting | Where it runs |
| CI/CD | Build/deploy pipeline |
| Monitoring | Observability |

---

## Data Flow

### Read Flow

```
User Action → Frontend Component → Context/Hook → API Client → Backend → Database
                                                                    ↓
User sees data ← Component renders ← Context updates ← Response ←──┘
```

### Write Flow

```
User Action → Frontend Component → Context/Hook → API Client → Backend → Database
                   │                                              ↓
                   └── Optimistic Update ──────────────────── Confirm/Rollback
```

### Authentication Flow

```
User Login → Frontend → Backend validates → JWT issued → Stored in [cookie/storage]
                                                              ↓
Subsequent requests include token → Backend validates → Authorized
```

---

## Cross-Cutting Concerns

### Authentication

- Method: [JWT/Session/OAuth]
- Storage: [Cookie/LocalStorage]
- Expiry: [Duration]
- Refresh: [Strategy]

### Error Handling

| Layer | Strategy |
|-------|----------|
| Frontend | [Toast notifications, inline errors, error boundaries] |
| API | [Standard error response format] |
| Backend | [Logging, error codes] |

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### State Management

- Strategy: [Context/Redux/Zustand/etc.]
- Persistence: [What persists where]
- Sync: [How frontend stays in sync with backend]

### Caching

| What | Where | TTL | Invalidation |
|------|-------|-----|--------------|
| [Data type] | [Location] | [Duration] | [When cleared] |

---

## API Overview

### Base URLs

| Environment | URL |
|-------------|-----|
| Development | http://localhost:XXXX |
| Production | https://api.example.com |

### Authentication

All API requests require: [Header/Cookie description]

### Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (not allowed) |
| 404 | Not found |
| 500 | Server error |

### Endpoints Summary

| Domain | Endpoints | Spec |
|--------|-----------|------|
| [Feature] | GET/POST/PATCH/DELETE /resource | [Link to feature spec] |
| [Feature] | GET/POST /other | [Link to feature spec] |

---

## Data Model Overview

### Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  User    │──(1:n)│  Entity  │──(1:n)│  Child   │
└──────────┘       └──────────┘       └──────────┘
                        │
                      (n:m)
                        │
                   ┌──────────┐
                   │  Other   │
                   └──────────┘
```

### Core Entities

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| User | System user | id, email, name |
| Entity | Main object | id, title, status |
| Child | Belongs to entity | id, entityId, content |

---

## Features

| Feature | Description | Spec |
|---------|-------------|------|
| [Feature 1] | One-line description | [features/feature1.md](features/feature1.md) |
| [Feature 2] | One-line description | [features/feature2.md](features/feature2.md) |
| [Feature 3] | One-line description | [features/feature3.md](features/feature3.md) |

---

## Pipeline

> **Optional** — *Include when* the project uses the `specs/future/` lifecycle (SKILL.md → Spec Lifecycle). Delete otherwise.

Unbuilt work items. Rows are removed when the work item merges into its base spec.

| Work Item | Target Feature | Spec |
|-----------|----------------|------|
| [Work item] | [Feature 1] | [future/work-item.md](future/work-item.md) |

---

## Development

### Prerequisites

- [Dependency 1] (version)
- [Dependency 2] (version)

### Setup

```bash
# Clone
git clone [repo]
cd [project]

# Install
[install commands]

# Configure
cp .env.example .env.local
# Edit .env.local with your values

# Run
[run command]
```

### Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint code |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VAR_NAME` | Yes | What it's for |
| `OPTIONAL_VAR` | No | What it's for (default: X) |

---

## Deployment

### Environments

| Environment | URL | Branch | Auto-deploy |
|-------------|-----|--------|-------------|
| Development | localhost | - | - |
| Staging | staging.example.com | develop | Yes |
| Production | example.com | main | Manual |

### Deploy Process

1. [Step 1]
2. [Step 2]
3. [Step 3]

---

## Key Decisions

Major architectural decisions that affect the whole system.

### Decision 1: [Choice]

**Context:** Why this decision was needed.

**Decision:** What was chosen.

**Consequences:** Impact on the system.

[Link to ADR if separate]

---

## Constraints & Limitations

Known limitations of the current system.

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| [Constraint] | [What it affects] | [How we work around it] |

---

## Future Roadmap

High-level future direction. Not commitments.

- [ ] [Major feature/improvement]
- [ ] [Major feature/improvement]
- [ ] [Major feature/improvement]

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| YYYY-MM-DD | Initial spec | Project created |
