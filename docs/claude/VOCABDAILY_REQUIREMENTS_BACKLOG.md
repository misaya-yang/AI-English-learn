# VocabDaily Requirements Backlog

> This is the source of truth for Claude long-running development. Pick the highest priority incomplete item. Do one vertical slice per loop.

## Status Legend

- `todo`: not started
- `doing`: current loop only
- `done`: implemented, verified, committed
- `blocked`: requires user secret, external account setup, or product decision

## P0. Production And Revenue Safety

### OPS-01 Payment Provider Secrets

Status: blocked

Problem:

Stripe/Alipay real production secrets are missing.

Acceptance:

- Supabase secrets include `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO_MONTHLY`, and `STRIPE_PRICE_PRO_YEARLY`.
- `billing-create-checkout` can create a real provider checkout session.
- Missing config still returns 503.
- No mock success URL exists.

Do not do:

- Do not invent payment secrets.
- Do not make checkout succeed without provider config.
- Do not perform real financial transactions.

### OPS-02 Supabase Release Checklist

Status: todo

Acceptance:

- Add `docs/ops/SUPABASE_RELEASE_CHECKLIST.md`.
- Checklist covers migrations, functions, secrets, auth redirect URLs, RLS verification, and production smoke.
- Include exact commands for functions deploy and policy inspection.
- Include rollback notes.

### OPS-03 Production Smoke Script

Status: todo

Acceptance:

- Add or improve a smoke script that checks:
  - login page 200
  - Supabase Auth health 200
  - app shell loads
  - AI chat endpoint availability when authenticated or graceful unauthenticated fallback
  - pricing checkout fail-closed when provider secrets are missing
- Script must not require real user credentials unless explicitly provided through env vars.

## P1. AI Coach Learning Loop

### COACH-01 Feed Real Learner Context Into Chat

Status: todo

Problem:

`COACHING_POLICY` exists, but chat callers need to consistently pass level, target, due count, weak topics, burnout risk, recent errors, and learner mode.

Acceptance:

- `SendMessageOptions.learnerProfile` is populated from real dashboard/user data where available.
- Missing fields gracefully fallback.
- Tests prove `learningContext.weaknessTags` is canonical while legacy `weakTags` remains compatible.
- Coach prompt cites real learner context when present.

### COACH-02 Surface Coaching Actions In Chat UI

Status: todo

Acceptance:

- Chat UI displays a compact "Next step" or "Coach action" area when `coachingActions` exist.
- User can start a retry, schedule review, or open practice from an action.
- Empty/no-action responses degrade silently.
- Tests cover action display selection logic.

### COACH-03 Review Queue Integration

Status: todo

Problem:

Coach review items currently persist locally. They should appear in the Review/Practice loop.

Acceptance:

- Due coach review items appear in a dedicated section of Review or Practice.
- Completing a coach review marks it completed.
- Coach queue does not pollute due FSRS reviews unless explicitly converted.
- Tests cover due filtering, completion, and dedupe.

### COACH-04 Socratic Error Recovery

Status: todo

Acceptance:

- When a learner answers incorrectly, coach asks why, gives one clue, then invites a retry.
- Coach does not immediately dump the final answer unless the learner asks or fails retry.
- Generates `retry_with_hint` or `schedule_review` action.
- Tests cover wrong-answer prompt shaping and action parsing.

## P1. Daily Learning System

### LEARN-01 Today Mission Cockpit

Status: todo

Acceptance:

- Today hero shows:
  - mission title
  - reason
  - estimated minutes
  - source signal such as due backlog, weak topic, exam target, or streak recovery
  - next button
- Recovery mode appears when backlog/burnout risk is high.
- Refresh does not lose learned/hard/bookmark state.
- Browser smoke covers desktop and mobile.

### LEARN-02 Evidence Event Model

Status: todo

Acceptance:

- Define a small typed evidence event model for learning actions.
- Today/Practice/Review can write events.
- LearningPath can read derived completion from events.
- Tests cover event creation and derived state.

### LEARN-03 Practice Writes Mistakes

Status: todo

Acceptance:

- Wrong practice answers write mistake records or reinforcement items.
- Correct answers update per-word progress where relevant.
- Mistakes can feed coach context.
- Tests cover correct/wrong answer persistence.

### LEARN-04 Review Is Due-Only

Status: todo

Acceptance:

- Review page does not use random daily words as fake reviews.
- Due FSRS reviews and coach-created due reviews are visually distinct.
- Empty state offers reinforcement practice, not fake due reviews.
- Tests cover due filtering.

### LEARN-05 End-Of-Session Recap

Status: todo

Acceptance:

- After a session, user sees:
  - what improved
  - what needs review
  - one precise encouragement
  - next recommended action
- Recap can include coach actions.
- Tests cover recap generation inputs.

## P2. Product UI Modernization

### UI-01 Route Metadata Registry

Status: todo

Acceptance:

- Single registry drives route label, icon, nav group, mobile priority, page title, and search aliases.
- Dashboard sidebar and mobile bottom nav consume the registry.
- Tests cover route metadata completeness.

### UI-02 Learning Cockpit Shell

Status: todo

Acceptance:

- Today, Review, Practice, Chat, and LearningPath share a consistent mission-first shell.
- Above-the-fold answers "what now" within 5 seconds.
- Avoid generic card grids.
- Browser screenshots verify desktop and mobile.

### UI-03 Coach Mission Cards

Status: todo

Acceptance:

- Chat welcome recommendations become mission cards.
- Cards explain why they are recommended.
- Cards launch a specific coach/task prompt.
- Empty learner context falls back to beginner-friendly cards.

### UI-04 Auth And Conversion Polish

Status: todo

Acceptance:

- Home, Login, Register, Onboarding, and Pricing share visual language.
- Pricing does not imply payment works when provider secrets are missing.
- Login remains fast and accessible.

## P2. Architecture And Quality

### QA-01 Split Chat Runtime

Status: todo

Acceptance:

- Large chat runtime/page modules are split by responsibility.
- No behavioral regression.
- Tests remain green.

### QA-02 Coach Policy Drift Guard

Status: todo

Acceptance:

- Client and Supabase shared coaching policy remain byte-identical or generated from one source.
- Test fails if drift occurs.

### QA-03 Observability Hooks

Status: todo

Acceptance:

- Coach action persistence, review queue writes, and AI fallback states log safe structured events.
- No secrets in logs.

## Completion Promise

When all non-blocked P0/P1/P2 items are done, verified, committed, and documented, output:

```text
VOCABDAILY_ENTERPRISE_READY
```

