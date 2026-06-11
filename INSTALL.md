# Install

## Global (all projects)

```bash
cp -r skills/spec-driven-development ~/.claude/skills/
cp agents/spec-driven-development.md ~/.claude/agents/
cp commands/sdd.md ~/.claude/commands/
```

The `cp -r skills/spec-driven-development` copy includes the `scripts/` directory (the spec validator).

## Project-local

```bash
cp -r skills/spec-driven-development .claude/skills/
cp agents/spec-driven-development.md .claude/agents/
cp commands/sdd.md .claude/commands/
```

## Update

Re-run the same `cp` commands. No other steps required.

## Verify

Start a Claude Code session and run:

```
/sdd what should I work on?
```

The agent should respond with spec-driven guidance.

Optionally verify the validator: `node ~/.claude/skills/spec-driven-development/scripts/validate-specs.mjs specs`
