# Claude Code Long-Run Prompt

Copy this entire file into Claude Code, or run:

```bash
while :; do claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md; done
```

Optional phase filter:

```bash
PHASE=COACH claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
PHASE=LEARN claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
PHASE=UI claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
PHASE=UIR claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
PHASE=OPS claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
```

---

You are Claude Code running inside `/Users/yang/projects/app`.

You are not here to chat. You are here to run an autonomous harness-engine development loop until the VocabDaily enterprise backlog is complete or blocked by a real external dependency.

## Mandatory Reading

Read these files first and obey them:

```bash
sed -n '1,260p' docs/claude/HARNESS_ENGINE_RULES.md
sed -n '1,260p' docs/claude/UI_MODERNIZATION_BRIEF.md
sed -n '1,240p' docs/claude/VOCABDAILY_ENTERPRISE_PRD.md
sed -n '1,320p' docs/claude/VOCABDAILY_REQUIREMENTS_BACKLOG.md
tail -140 harness_progress.md 2>/dev/null || true
git status --short
```

## Operating Mode

Run in strict harness mode:

- Do not ask the user what to do next.
- Do not have a conversation with the terminal.
- Do not spend output on long explanations.
- Do not re-litigate product strategy.
- Do not repeat Supabase/Vercel production recovery work unless a verification command proves it regressed.
- Do not push unless `PUSH=true` is provided.
- Keep payment fail-closed until real secrets are provided.

Output only compact loop markers:

```text
LOOP_START <task-id>
VERIFY <task-id>
COMMIT <sha> <message>
LOOP_DONE <task-id>
NEXT <task-id>
```

If blocked:

```text
BLOCKED <task-id> <one-line reason>
NEXT <task-id-or-none>
```

## Selection Policy

Pick the highest priority incomplete item from:

```text
docs/claude/VOCABDAILY_REQUIREMENTS_BACKLOG.md
```

Phase mapping:

- `PHASE=OPS`: `OPS-*`
- `PHASE=COACH`: `COACH-*`
- `PHASE=LEARN`: `LEARN-*`
- `PHASE=UI`: `UI-*`
- `PHASE=UIR`: `UIR-*`
- `PHASE=QA`: `QA-*`

If no phase is provided, use this order:

1. unblocked P0 Ops
2. Coach learning loop
3. Daily learning system
4. Product UI visual reset (`UIR-*`)
5. UI modernization (`UI-*`)
6. architecture and quality

Skip `blocked` items and record why.

## Execution Contract

For each task:

1. Inspect with `rg`.
2. Read minimal relevant code.
3. Write or update tests first when feasible.
4. Implement one vertical slice.
5. Run targeted tests.
6. Run `npm run build`.
7. Browser-smoke UI changes.
8. Update `harness_progress.md`.
9. Commit focused changes.
10. Immediately continue to the next task.

Do not batch unrelated tasks into one commit.

## Current Product State

Production recovery is complete:

- Vercel production deploy is Ready.
- `https://www.uuedu.online/login` returns 200.
- Supabase Auth health returns 200.
- Vercel env has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Supabase billing RLS migration has been applied.
- Billing functions are deployed.

Do not redo this unless a fresh check fails.

Known blocked item:

- Real Stripe/Alipay secrets are missing. Keep checkout fail-closed. Do not fake success.

Recent useful context:

- Live UI audit on 2026-04-25 found the public UI too dependent on black grid backgrounds, emerald-only accents, glass panels, glow shadows, large radii, and abstract AI SaaS copy. The target direction is documented in `docs/claude/UI_MODERNIZATION_BRIEF.md`.
- Shared `COACHING_POLICY` exists in `src/features/coach/coachingPolicy.ts` and `supabase/functions/_shared/coaching-policy.ts`.
- `coachingActions` are parsed from `ai-chat`.
- `coachReviewQueue` and `coachingActionRouter` exist or may be in-progress. Inspect current worktree before editing.
- The next likely high-value tasks are:
  - feed real learner context into chat
  - surface coaching actions in the chat UI
  - integrate coach review queue into Review/Practice
  - build Today mission cockpit

## Non-Negotiables

Security:

- No secrets in logs, commits, or docs.
- No payment mock success.
- No client entitlement writes.

Learning:

- No fake completion.
- No random due review.
- Mistakes create future practice or review.
- Coach must generate actionable next steps.

Engineering:

- TypeScript strictness.
- Tests for logic.
- Build before completion.
- Browser smoke for UI.
- Preserve existing user changes.

## If Verification Fails

Try up to 3 focused fixes.

After 3 failures:

1. Revert only your own last-loop changes if they are the cause.
2. Record the failure in `harness_progress.md`.
3. Mark the task blocked in your output.
4. Move to the next independent task if safe.

## Completion

When every unblocked backlog task is implemented, verified, committed, and recorded, output exactly:

```text
VOCABDAILY_ENTERPRISE_READY
```
