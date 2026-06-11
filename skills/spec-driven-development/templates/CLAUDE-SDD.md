# CLAUDE.md

<!--
  Spec-driven development starter. Copy into a new project root as CLAUDE.md
  (or merge the "Spec-Driven Workflow" sections into an existing CLAUDE.md),
  then replace the [placeholders]. Requires the spec-driven-development skill
  installed in ~/.claude/ (see that repo's INSTALL.md).
-->

## Project

[One or two sentences: what this project is and who it's for.]

## Spec-Driven Workflow (Core)

This project uses **spec-driven development**. Specs are the source of truth: code and tests conform to specs, not the other way around. The full methodology is in the `spec-driven-development` skill — follow it; this file only binds it to this project.

```
Spec → Implement → Test → Sync
```

**Non-negotiable rules:**

1. **No feature work without a spec.** Before building or changing a feature, the work item must be specced in `specs/future/` — a new feature uses the skill's `templates/feature.template.md`; a change to an existing feature uses `templates/future.template.md` (work-item scoped, e.g. `future/tasks-filtering.md`). Get it confirmed, then implement. When the work ships: merge it into `specs/features/`, then delete the future file (its Merge Checklist).
2. **Spec is truth in disputes.** If code and spec disagree, the code is wrong — fix the code. Never weaken a spec or a test to make an implementation pass. If intent genuinely changed, update the spec first (with a changelog entry), then the code.
3. **Sync after implementing.** When implementation deviates from the spec or adds behavior, update the spec in the same piece of work. A PR that changes behavior but not the spec is incomplete.
4. **Intent edits need confirmation.** Requirements, error cases, and edge cases are the user's intent. Propose drafts and wait for approval — never silently invent or auto-fill them (the skill's DRAFT rules).
5. **Trivial-change exemption.** Typos, comments, formatting, dependency bumps, and pure refactors with no behavior change don't need spec updates.

## Spec Location

- Overview: `specs/overview.md`
- Features (present tense — always true of the code): `specs/features/[feature].md`
- Unbuilt work (intent — never checked against code): `specs/future/[work-item].md`
- IDs: `UserStory-[feature]-##`, `REQ-##` (sequential per spec), `BUG-[feature]-##`

`specs/features/` divergence from code is always a bug. `ls specs/future/` is the open-work list. Tests reference `features/` paths only.

**Granularity:** one feature per file in `features/`; one mergeable work item per file in `future/` (sized to implement and merge in one cycle — split anything bigger). Stages/milestones are metadata (the work item's Milestone field and the overview's Pipeline table), never the file unit.

## When To Do What

| Situation | Action |
|-----------|--------|
| Existing codebase, no specs yet | Run the bootstrap workflow (skill's `workflows/bootstrap.md`) — creates overview + feature specs and binds this file |
| New project from a roadmap | Create `specs/overview.md` (with Pipeline table), then one granular work item per feature in `specs/future/` — next stage at full rigor, later stages thin |
| New feature requested | Write the spec in `specs/future/`, confirm, then implement |
| Starting a planned work item | Tighten its `specs/future/` spec to full rigor (stories, REQs, ≥3 errors/edges), confirm open questions, then implement |
| Just finished implementing | Run tests; merge the future spec into `specs/features/` (Merge Checklist), delete it; changelog entry |
| Test failing | Find the `@spec` reference; diagnose spec vs code vs test — fix the code unless intent changed |
| Bug found | Add to the feature spec's Known Issues (`BUG-[feature]-##`, severity, links) |
| Bug fixed | Remove the Known Issues row; add changelog entry |
| "What should I work on?" | Check `specs/future/` (the pipeline) first, then Future Considerations across specs; prioritize bugs > security > blockers > quick wins |
| Periodically / before release | Run the spec health check (`/sdd check specs`) |

## Tests Trace to Specs

- E2E tests carry an `@spec` header pointing to a real spec file and UserStory ID (format: skill's `references/e2e-test-format.md`)
- Unit tests cover REQ-* requirements; test names state specific behavior
- No mock-validating tests, no happy-path-only suites (skill's `references/test-anti-patterns.md`)

## Quality Gates (before committing spec changes)

```bash
# Mechanical validation (IDs, sections, tables, links, @spec refs)
node ~/.claude/skills/spec-driven-development/scripts/validate-specs.mjs specs

# Formatting
npx markdownlint-cli "specs/**/*.md" --config specs/.markdownlint.jsonc
npx prettier --write "specs/**/*.md"
```

The validator must exit 0 (no ERRORs). WARNs feed the health check's draft pass.

## Project Specifics

<!-- Fill in, or delete what doesn't apply. -->

- Build: `[command]`
- Test: `[command]`
- Lint: `[command]`
- Conventions: [anything Claude must know that specs don't cover]
