# Harness Engine Rules For Claude Code

> Goal: stop terminal monologues and force a real harness loop: select, inspect, test, implement, verify, commit, record, continue.

## 1. Prime Directive

You are not in a conversation. You are running an autonomous engineering loop.

Do not chat with the terminal.
Do not narrate obvious actions.
Do not ask the user what to do next unless blocked by a secret, account permission, CAPTCHA, payment, destructive action, or legal/safety boundary.

Your job is to ship verified increments.

## 2. Allowed Output

During each loop, output only these blocks:

```text
LOOP_START <task-id>
```

```text
BLOCKED <task-id> <one-line reason>
```

```text
VERIFY <task-id>
<command>: <pass|fail> <short evidence>
```

```text
COMMIT <sha> <message>
```

```text
LOOP_DONE <task-id>
NEXT <next-task-id>
```

If using Claude Code interactively, keep all prose under 10 lines per loop. The progress file is where detail belongs.

## 3. Required Loop

Every loop must follow this exact order:

1. `SELECT`
   - Read `docs/claude/VOCABDAILY_REQUIREMENTS_BACKLOG.md`.
   - Read the bottom of `harness_progress.md`.
   - Pick the highest priority `todo` item that is not blocked.
   - If `PHASE=COACH|LEARN|UI|OPS|QA` is provided, only pick that phase.
   - If `PHASE=UIR` is provided, only pick `UIR-*` visual reset tasks.

2. `INSPECT`
   - Run targeted `rg`.
   - Read only relevant files and line ranges.
   - Preserve existing user/agent changes.

3. `TEST FIRST`
   - For pure logic/services, write or update Vitest first.
   - For UI, define a browser smoke target first.
   - If test-first is impractical, write the verification command before implementation.

4. `IMPLEMENT`
   - Make a small vertical slice.
   - Do not refactor unrelated code.
   - Do not change payment semantics except to stay fail-closed.
   - Do not leak secrets.

5. `VERIFY`
   - Run targeted tests.
   - Run `npm run build`.
   - For UI changes, run local browser smoke on desktop and mobile width.
   - For Supabase function changes, record deploy command.

6. `COMMIT`
   - Commit only after verification passes.
   - Use focused messages:
     - `feat(coach): ...`
     - `fix(ops): ...`
     - `feat(learn): ...`
     - `refactor(chat): ...`

7. `RECORD`
   - Append to `harness_progress.md`.
   - Include:
     - Changed
     - Verified
     - Deploy
     - Risks
     - Next

8. `CONTINUE`
   - Start the next loop automatically.
   - Stop only when blocked or `VOCABDAILY_ENTERPRISE_READY`.

## 4. Verification Gates

Never claim completion without fresh command output.

Minimum per loop:

```bash
npm run build
```

Add relevant tests:

```bash
npm test -- --run path/to/test.ts
```

For broad changes:

```bash
npm test -- --run
```

For UI:

```bash
npm run dev -- --host 127.0.0.1 --port 4173
```

Then use a browser to verify the changed route.

## 5. Context Budget Rules

Read these first:

```bash
git status --short
sed -n '1,220p' docs/claude/VOCABDAILY_ENTERPRISE_PRD.md
sed -n '1,260p' docs/claude/VOCABDAILY_REQUIREMENTS_BACKLOG.md
tail -120 harness_progress.md
```

Do not read whole files unless necessary.
Prefer `rg -n` and `sed -n`.

## 6. Git Rules

- Never reset or revert user changes.
- If unrelated untracked files exist, ignore them.
- If a file you need has user changes, read it carefully and build on it.
- Commit only your task changes.
- Do not push unless the prompt explicitly sets `PUSH=true`.

## 7. Deployment Rules

Vercel:

- Git push deploys frontend only.
- Check deployment with `vercel ls` or `vercel inspect`.

Supabase:

- Migrations require `supabase db push` or SQL Editor.
- Edge Functions require `supabase functions deploy <name>`.
- Secrets require explicit user confirmation and real values.

Billing:

- Missing Stripe/Alipay config must return 503.
- No mock success.
- No client entitlement writes.

## 8. Product Quality Rules

Learning:

- No fake progress.
- No random due review.
- Mistakes become review/reinforcement.
- Completion must be derived from evidence where possible.

Coach:

- No generic praise.
- No answer dumping.
- Ask, hint, retry, then explain.
- Always create a next action when useful.

UI:

- Mission-first layout.
- No generic dashboard card piles.
- Mobile must be checked.
- Loading, empty, error, and success states matter.
- Do not rely on black grid backgrounds, glass panels, emerald glow, or giant rounded corners as the default product identity.
- Public/auth surfaces should follow `docs/claude/UI_MODERNIZATION_BRIEF.md`: light-first, learning-first, semantic color, smaller radius, concrete copy.
- The UI should read as an English learning product before it reads as an AI product.

Ops:

- Fail closed.
- Write release notes.
- Never log secrets.

## 9. Blockers

Stop and emit `BLOCKED` only for:

- missing payment secrets
- account login/MFA requiring user action
- destructive data deletion
- external payment/financial transaction
- CAPTCHA
- production action requiring explicit confirmation
- repeated verification failure after 3 focused attempts

Do not stop for ordinary implementation choices. Make a reasonable decision and record it.

## 10. Completion

When all unblocked backlog items are done:

```text
VOCABDAILY_ENTERPRISE_READY
```
