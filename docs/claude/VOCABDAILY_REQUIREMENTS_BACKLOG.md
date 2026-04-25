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

Status: done

Last verified: 2026-04-25 — see harness_progress.md

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

Status: done

Last verified: 2026-04-25 — see `docs/claude/COACH_AUDIT_2026-04-25.md`.

Problem:

`COACHING_POLICY` exists, but chat callers need to consistently pass level, target, due count, weak topics, burnout risk, recent errors, and learner mode.

Acceptance:

- `SendMessageOptions.learnerProfile` is populated from real dashboard/user data where available.
- Missing fields gracefully fallback.
- Tests prove `learningContext.weaknessTags` is canonical while legacy `weakTags` remains compatible.
- Coach prompt cites real learner context when present.

### COACH-02 Surface Coaching Actions In Chat UI

Status: done

Last verified: 2026-04-25 — see `docs/claude/COACH_AUDIT_2026-04-25.md`.

Acceptance:

- Chat UI displays a compact "Next step" or "Coach action" area when `coachingActions` exist.
- User can start a retry, schedule review, or open practice from an action.
- Empty/no-action responses degrade silently.
- Tests cover action display selection logic.

### COACH-03 Review Queue Integration

Status: done

Last verified: 2026-04-25 — see `docs/claude/COACH_AUDIT_2026-04-25.md`.

Problem:

Coach review items currently persist locally. They should appear in the Review/Practice loop.

Acceptance:

- Due coach review items appear in a dedicated section of Review or Practice.
- Completing a coach review marks it completed.
- Coach queue does not pollute due FSRS reviews unless explicitly converted.
- Tests cover due filtering, completion, and dedupe.

### COACH-04 Socratic Error Recovery

Status: done

Last verified: 2026-04-25 — see `docs/claude/COACH_AUDIT_2026-04-25.md`.

Acceptance:

- When a learner answers incorrectly, coach asks why, gives one clue, then invites a retry.
- Coach does not immediately dump the final answer unless the learner asks or fails retry.
- Generates `retry_with_hint` or `schedule_review` action.
- Tests cover wrong-answer prompt shaping and action parsing.

## P1. Daily Learning System

### LEARN-01 Today Mission Cockpit

Status: done

Last verified: 2026-04-25 — see harness_progress.md

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

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Acceptance:

- Define a small typed evidence event model for learning actions.
- Today/Practice/Review can write events.
- LearningPath can read derived completion from events.
- Tests cover event creation and derived state.

### LEARN-03 Practice Writes Mistakes

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Acceptance:

- Wrong practice answers write mistake records or reinforcement items.
- Correct answers update per-word progress where relevant.
- Mistakes can feed coach context.
- Tests cover correct/wrong answer persistence.

### LEARN-04 Review Is Due-Only

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Acceptance:

- Review page does not use random daily words as fake reviews.
- Due FSRS reviews and coach-created due reviews are visually distinct.
- Empty state offers reinforcement practice, not fake due reviews.
- Tests cover due filtering.

### LEARN-05 End-Of-Session Recap

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Acceptance:

- After a session, user sees:
  - what improved
  - what needs review
  - one precise encouragement
  - next recommended action
- Recap can include coach actions.
- Tests cover recap generation inputs.

## P1.5 Product UI Visual Reset

> Source of truth: `docs/claude/UI_MODERNIZATION_BRIEF.md`.
> These tasks supersede the older "make pages consistent" UI work. The goal is no longer just consistency; the goal is to remove the black-grid / emerald-glow / glassmorphism AI-template look and establish a learning-first product language.

### UIR-01 Visual Direction And Tokens Reset

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Problem:

The current UI relies too heavily on black backgrounds, emerald highlights, grid overlays, glass surfaces, glow shadows, and very large radii. This makes VocabDaily feel like a generic AI SaaS template instead of an English learning system.

Acceptance:

- `src/index.css` and Tailwind tokens support a light-first "Modern Learning Workbench" direction.
- Public surfaces no longer depend on `noise-bg`, heavy grid overlays, glow shadows, or glass panels as the default identity.
- Radius, shadow, and surface rules are reduced and documented in code or comments where helpful.
- Semantic accent roles exist for memory/review, practice, coach, exam, error, and neutral states.
- Existing dashboard pages still compile and remain usable.

Verification:

- `npm run build`
- Browser smoke `/`, `/login`, `/register`, `/pricing`, `/word-of-the-day` at mobile and desktop widths.

### UIR-02 Homepage Learning-First Redesign

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Problem:

The current homepage first viewport reads as "AI SaaS landing page" before it reads as "English learning product".

Acceptance:

- `src/pages/Home.tsx` first viewport shows a concrete learning workflow: today's mission, word/review/practice examples, and clear next action.
- Remove or substantially reduce black grid, spotlight, glass nav, clipped chat demo, oversized pill CTAs, and abstract AI pitch copy.
- Homepage copy is concrete: what the learner does, why it matters, and what improves.
- Mobile 375px first viewport feels complete; key content is not clipped behind sticky navigation.
- CTA labels fit without oversized rounded pills.

Verification:

- `npm run build`
- Browser smoke `/` at mobile and desktop.
- Check menu open state on mobile.

### UIR-03 Auth Shell Calm Learning Redesign

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Problem:

Login and register currently share the same dark grid / glass-card treatment as the marketing page. This looks polished but cold and generic.

Acceptance:

- `src/features/marketing/AuthShell.tsx`, login, register, magic-link, auth callback, and onboarding use a calm light-first learning account surface.
- Remove ambient glow, decorative grid, and glass panel defaults from auth.
- Forms keep clear labels, visible focus, accessible password controls, loading states, and bilingual clarity.
- Demo login remains available but does not visually dominate the form.
- Mobile 375px has no horizontal overflow and primary action remains easy to reach.

Verification:

- `npm run build`
- Browser smoke `/login`, `/register`, `/magic-link`, `/onboarding` at mobile and desktop.

### UIR-04 Pricing And Word Of The Day Learning Surface

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Problem:

Pricing still reads like SaaS plan comparison, and Word of the Day still feels like a generic dark card page. Both should support the learning product language.

Acceptance:

- `src/pages/PricingPage.tsx` keeps fail-closed billing honesty but reads like a learning membership page.
- Pricing does not imply checkout is live when provider secrets are missing.
- `src/pages/WordOfTheDayPage.tsx` becomes a daily study artifact: word, pronunciation, definition, example, usage, save/start action, previous words.
- Both pages use the new surface, radius, color, and typography direction from `UI_MODERNIZATION_BRIEF.md`.
- Footer dates/copy are consistent with the current product year.

Verification:

- `npm run build`
- Browser smoke `/pricing` and `/word-of-the-day` at mobile and desktop.

### UIR-05 Loading And Route Perception

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Problem:

Public routes can pause on a dark loading splash long enough to shape the user's first impression. The loading state reinforces the heavy black/green aesthetic and makes the product feel slow.

Acceptance:

- Public route fallback/loading UI uses the new light-first design language.
- Loading states are brief, quiet, and do not look like a product page.
- If route loading takes longer than expected, the state communicates progress without dramatic animation.
- No business logic or lazy-loading retry semantics are weakened.

Verification:

- `npm run build`
- Browser smoke hard refresh on `/`, `/login`, `/pricing`, `/word-of-the-day`.

## P2. Product UI Modernization

### UI-01 Route Metadata Registry

Status: done

Note:

Implemented in a previous harness loop. Keep this item done unless a regression is proven.

Acceptance:

- Single registry drives route label, icon, nav group, mobile priority, page title, and search aliases.
- Dashboard sidebar and mobile bottom nav consume the registry.
- Tests cover route metadata completeness.

### UI-02 Learning Cockpit Shell

Status: done

Note:

Implemented in a previous harness loop. Future work should modernize its visual treatment only through UIR/dashboard-specific tasks.

Acceptance:

- Today, Review, Practice, Chat, and LearningPath share a consistent mission-first shell.
- Above-the-fold answers "what now" within 5 seconds.
- Avoid generic card grids.
- Browser screenshots verify desktop and mobile.

### UI-03 Coach Mission Cards

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Acceptance:

- Chat welcome recommendations become mission cards.
- Cards explain why they are recommended.
- Cards launch a specific coach/task prompt.
- Empty learner context falls back to beginner-friendly cards.

### UI-04 Auth And Conversion Polish

Status: done

Note:

The earlier consistency pass is complete. The new UIR tasks above intentionally revisit auth/conversion from a stronger visual direction.

Acceptance:

- Home, Login, Register, Onboarding, and Pricing share visual language.
- Pricing does not imply payment works when provider secrets are missing.
- Login remains fast and accessible.

## P2. Architecture And Quality

### QA-01 Split Chat Runtime

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Acceptance:

- Large chat runtime/page modules are split by responsibility.
- No behavioral regression.
- Tests remain green.

### QA-02 Coach Policy Drift Guard

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Acceptance:

- Client and Supabase shared coaching policy remain byte-identical or generated from one source.
- Test fails if drift occurs.

### QA-03 Observability Hooks

Status: done

Last verified: 2026-04-25 — see harness_progress.md

Acceptance:

- Coach action persistence, review queue writes, and AI fallback states log safe structured events.
- No secrets in logs.

## Completion Promise

When all non-blocked P0/P1/P2 items are done, verified, committed, and documented, output:

```text
VOCABDAILY_ENTERPRISE_READY
```
