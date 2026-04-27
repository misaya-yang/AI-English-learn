# Claude Code Ralph Prompt

This file is now a compatibility entry point.

Use the unified long-run prompt instead:

```bash
claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
```

For continuous autonomous execution:

```bash
while :; do claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md; done
```

For phase-specific execution:

```bash
PHASE=COACH claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
PHASE=LEARN claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
PHASE=UI claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
PHASE=UIR claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
PHASE=OPS claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
```

Claude must obey these files, in order:

1. `docs/claude/HARNESS_ENGINE_RULES.md`
2. `docs/claude/UI_MODERNIZATION_BRIEF.md`
3. `docs/claude/VOCABDAILY_ENTERPRISE_PRD.md`
4. `docs/claude/VOCABDAILY_REQUIREMENTS_BACKLOG.md`
5. `docs/claude/CLAUDE_LONGRUN_PROMPT.md`

For focused UI redesign prompts, use:

```bash
cat docs/claude/CLAUDE_UI_REDESIGN_PROMPTS.md
```

The old long prompt was replaced because it allowed too much conversational terminal output. The new prompt forces harness mode: select, inspect, test, implement, verify, commit, record, continue.
