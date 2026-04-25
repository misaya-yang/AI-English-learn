# Claude Operator Runbook

## Recommended Command

Use this for the long autonomous run:

```bash
while :; do claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md; done
```

## Safer Phase Commands

Coach work:

```bash
PHASE=COACH claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
```

Learning loop work:

```bash
PHASE=LEARN claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
```

UI modernization:

```bash
PHASE=UI claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
```

Ops and reliability:

```bash
PHASE=OPS claude --dangerously-skip-permissions < docs/claude/CLAUDE_LONGRUN_PROMPT.md
```

## What Good Output Looks Like

Claude should output compact loop markers, not long terminal conversation:

```text
LOOP_START COACH-01
VERIFY COACH-01
npm test -- --run src/features/chat/runtime/requestPayload.test.ts: pass 8/8
npm run build: pass
COMMIT abc1234 feat(coach): feed learner context into chat
LOOP_DONE COACH-01
NEXT COACH-02
```

## Stop Conditions

Stop the loop if Claude outputs:

```text
BLOCKED
```

or:

```text
VOCABDAILY_ENTERPRISE_READY
```

## Human Checklist Before Running

Run:

```bash
git status --short
```

If there are uncommitted changes from another agent, either let Claude build on them or commit/stash them intentionally. Do not reset.

## Human Checklist After Several Loops

Run:

```bash
git log --oneline -10
npm test -- --run
npm run build
```

If ready to deploy:

```bash
git push origin main
npx -y vercel ls --scope team_d4j6KzK7l1DhVO2Y6yRGjS6W
```

If Supabase functions changed:

```bash
supabase functions deploy ai-chat --project-ref zjkbktdmwencnouwfrij
```

If migrations changed:

```bash
supabase db push --linked
```

If `supabase db push` asks for a database password and it is unavailable, use Supabase SQL Editor and record that manual application in `harness_progress.md`.

## Do Not Let Claude Do These Without Human Confirmation

- Add real payment secrets.
- Execute real financial transactions.
- Delete production data.
- Disable RLS.
- Push to `main` unless you set `PUSH=true` or explicitly asked it to deploy.
- Bypass MFA/CAPTCHA/security warnings.

