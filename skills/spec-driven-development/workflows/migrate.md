# Migrate: Per-Feature IDs → Global IDs

Use this workflow to adopt the global-ID model on an existing project whose specs
use per-feature / per-file IDs (`UserStory-[feature]-NN`, per-file `REQ-NN`). The
goal: every ID is unique across the whole spec set (single home), so `@spec`
references resolve by identity and folds/renames never break them.

**Mechanical work is `scripts/spec-fns.mjs`'s; the judgment tail is yours.** There
is no fully-automatic migrator on purpose — ambiguous references need a human/agent
decision.

## Before You Start

- Commit or stash first — the migration is a bulk rewrite; git is your undo.
- Run `node [skill-dir]/scripts/spec-fns.mjs health`. Many `multi_home` REQ findings
  (the same `REQ-N` defined in N files) is the signal you need this. Note `dangling`
  and `range` findings too — they get resolved here.

## Step 1: Survey the ambiguity risk

A per-file REQ rewrite is only safe if no spec references **another** spec's REQ by
bare number. Check it: for each feature spec, do its prose `REQ-N` mentions stay
within its own REQ range? If a file with 5 REQs mentions `REQ-9`, that's a cross-file
reference — flag it for manual handling in Step 3.

## Step 2: Assign global numbers

- **UserStory / BUG** are already slug-unique → one global token replace each
  (`UserStory-chat-01` → `UserStory-007`).
- **REQ** is per-file → assign a global number per file, continuing one counter across
  files in a stable (alphabetical) order. `node [skill-dir]/scripts/spec-fns.mjs next req`
  tells you the next free global number to start from.

## Step 3: Rewrite

- Generate exact commands with `spec-fns.mjs sed <old=new ...>` and review them.
- UserStory/BUG: global replace (unique tokens). REQ: per file, `\b`-bounded,
  highest number first so prefixes never collide.
- Add a `Status` column to Known Issues and a `Verify` column to Requirements while
  you're in each spec (the v3 template shape).

## Step 4: Resolve the judgment tail

`spec-fns.mjs` flags what it can't decide mechanically:

- **Multi-spec `@spec` lines** where both named specs define the cited number — read
  the test, pick the right home, rewrite that one ref.
- **Fold-rot danglers** — references to IDs that were renumbered or deleted in a past
  restructure. Use `spec-fns.mjs loc <id>` and the surrounding code to repoint or remove.
- **Ranges** (`@spec REQ-1..6`) — replace with the explicit list of IDs.

## Step 5: Verify

- `spec-fns.mjs health` → `0 multi_home`, `0 dangling`, `0 range`.
- `validate-specs.mjs <spec-dir>` → `0 errors`.
- Spot-check a few `@spec` references resolve to one home.

## Step 6: Sync the bindings

- Update the project's `CLAUDE.md` / `AGENTS.md` to v3 conventions (or re-derive from
  `templates/CLAUDE-SDD.md`): global IDs, bug status-transition, the dual
  `spec-fns` + `validate-specs` gate.
- Add a changelog entry to each touched spec.

## Notes

- **Sequential IDs** can collide across branches; repair after a merge with
  `spec-fns.mjs sed`. No counter is stored — IDs come from a live scan.
- Tests that reference a `future/` ID surface as `pending_merge` (expected while
  building); they clear when the work item merges into `features/`.
