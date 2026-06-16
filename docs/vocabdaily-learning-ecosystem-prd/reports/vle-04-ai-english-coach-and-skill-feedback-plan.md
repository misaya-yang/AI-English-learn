# VLE-04 AI English Coach And Skill Feedback Plan

## Objective

Make coach, writing, and pronunciation feedback useful under real product conditions: bounded learner evidence goes into the coach, fallback states stay usable when online AI is unavailable, and UI evidence proves the learner can see what happened.

## Execution Steps

1. Audit VLE-04 contract plus chat request payload, coach policy, learner context, writing analytics, pronunciation scoring, local auth behavior, and existing focused tests.
2. Keep AI context bounded:
   - learner level, target, due pressure, active wordbook, weak tags, recent mistakes
   - no auth tokens, billing data, direct contact data, or raw secrets
3. Harden local/demo behavior:
   - local-auth chat sessions must stay local and not write remote chat tables
   - writing fallback must still return actionable suggestions
   - pronunciation must visibly separate local-only scoring from AI phoneme feedback
4. Add browser evidence:
   - chat Today handoff populates the composer without auto-sending
   - writing fallback shows score, dimensions, suggestions, and local-only state
   - pronunciation local fallback shows local-only state
   - pronunciation AI feedback shows phoneme feedback and hides local-only state
5. Run required validation:
   - focused coach/chat/writing/pronunciation/evidence tests
   - AI golden eval tests
   - lint
   - i18n
   - build
   - AI coach browser smoke
   - learning-flow regression

## Edit Boundaries

In scope:

- `src/hooks/useSupabaseChat.ts`
- `src/features/chat/runtime/**`
- `src/features/coach/**`
- `src/features/chat/utils/learnerContext.ts`
- `src/services/writingAnalytics.ts`
- `src/services/pronunciationScorer.ts`
- focused tests under `src/features` and `src/services`
- `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/**`

Out of scope:

- billing behavior
- production env vars
- production Supabase function deployment
- database migrations
- payment entitlement rules

## Acceptance Criteria

- Chat request payload and coach policy tests prove bounded evidence and diagnosis -> drill -> review behavior.
- Local-auth chat sessions do not create remote Supabase session/message writes.
- Writing fallback returns visible local suggestions instead of a score-only dead end.
- Pronunciation local-only and AI-enhanced feedback states are distinct and browser-verified.
- Browser checks pass on desktop 1440x960 and mobile 390x844.
- Full learning-flow regression remains green.

## Rollback Plan

Revert VLE-04 source changes, tests, and audit artifacts. No production migration, edge function deploy, billing change, or remote data cleanup is required for this phase.
