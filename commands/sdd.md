---
allowed-tools: Task
---

Launch the spec-driven-development agent.

Before calling Task, summarize the last 3-5 conversation turns as context. Include:
- What the user was working on
- What was just completed or attempted
- Any errors, test failures, or issues mentioned

If the conversation has just started, pass `Context: (none — fresh conversation)`.

Pass to the agent:
```
Context: [your summary of recent conversation]

Request: $ARGUMENTS
```

Use Task tool with subagent_type="spec-driven-development".
