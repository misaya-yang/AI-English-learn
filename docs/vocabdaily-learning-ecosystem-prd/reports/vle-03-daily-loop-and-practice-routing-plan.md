# VLE-03 Daily Loop And Practice Routing Plan

## Objective

Make Today, Review, Practice, listening dictation, mistakes, FSRS, and session recap share one honest learning loop. Wrong once must give a hint and retry, not reveal the answer. Correct after retry must be recovered, not first-try correct. Wrong twice or explicit reveal must become needs-review evidence.

## Execution Steps

1. Audit the phase contract, `attemptState`, PracticePage, ReviewPage, TodayPage, Listening behavior, mistake collector, evidence events, learning events, and session recap.
2. Verify the answer state machine:
   - answering
   - retrying
   - revealed
   - maximum two attempts before automatic reveal
3. Verify outcome semantics:
   - firstTryCorrect -> FSRS `good`, `practice.correct`, first-try recap
   - recovered -> FSRS `hard`, `practice.recovered`, recovered recap
   - needsReview -> FSRS `again`, `practice.incorrect`, mistake collector
4. Verify listening/dictation:
   - first wrong hides expected answer
   - Enter key follows the same check/retry/reveal flow as the button
   - second wrong reveals expected answer
5. Fix any local/demo sync path that creates console error noise during practice evidence writes.
6. Add browser smoke evidence across desktop and mobile:
   - choice first wrong
   - choice recovered after retry
   - choice second wrong reveal
   - listening first wrong
   - listening second wrong reveal
7. Run required validation:
   - focused attempt/practice/recap/evidence tests
   - lint
   - i18n
   - build
   - practice attempt smoke
   - learning-flow regression

## Edit Boundaries

In scope:

- `src/features/practice/attemptState.ts`
- `src/pages/dashboard/PracticePage.tsx`
- `src/services/evidenceEvents.ts`
- `src/services/learningEvents.ts`
- `src/features/learning/sessionRecap.ts`
- `src/services/mistakeCollector.ts`
- focused tests under `src/features`, `src/pages/dashboard`, and `src/services`
- `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/**`

Out of scope:

- AI coach prompt redesign
- Import parser changes
- Billing
- Production deployment config
- Production data migration

## Acceptance Criteria

- First wrong multiple-choice attempt does not show the correct answer or write mistake evidence.
- Retry-correct multiple-choice attempt is shown as recovered, uses FSRS `hard`, and does not enter the mistake collector.
- Second wrong multiple-choice attempt reveals the answer, uses FSRS `again`, and enters the mistake collector.
- First wrong listening attempt hides the expected answer and gives a replay/hint.
- Second wrong listening attempt reveals the expected answer.
- Session recap separates first-try correct, recovered, and needs-review counts.
- Local-auth practice events do not trigger remote `path_progress_events` console errors.
- Browser checks pass on desktop 1440x960 and mobile 390x844.

## Rollback Plan

Revert touched practice/evidence/session recap files and VLE-03 audit artifacts. No production migration or remote data mutation is part of this phase.
