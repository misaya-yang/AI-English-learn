# VLE-03 Daily Loop And Practice Routing Report

## Phase Summary

- PHASE_ID: VLE-03
- Phase file: `docs/vocabdaily-learning-ecosystem-prd/phase-03-daily-loop-and-practice-routing.md`
- Executor: Codex
- Date: 2026-06-16
- Status: passed

## Scope Executed

- Planned work: Verify and harden the shared daily/practice retry loop across Practice, listening, evidence events, mistake collector behavior, FSRS ratings, and session recap.
- Actual work: Verified existing two-attempt state machine, added browser smoke coverage for desktop/mobile answer states, and fixed local-auth strict event writes so demo/local practice no longer triggers remote `path_progress_events` console errors.
- Scope expansions: Added `practice-attempt-smoke.mjs` for repeatable browser evidence and a strict learning event test for local-auth remote-sync short-circuiting.
- Scope not executed: No AI coach prompt redesign, no billing change, no production migration, no deployment config change.

## Evidence Inventory

| Evidence | Path or command | Result |
| --- | --- | --- |
| Plan | `docs/vocabdaily-learning-ecosystem-prd/reports/vle-03-daily-loop-and-practice-routing-plan.md` | Created |
| Focused tests | `npm test -- --run src/features/practice/attemptState.test.ts src/pages/dashboard/PracticePage.test.tsx src/features/learning/sessionRecap.test.ts src/services/evidenceEvents.test.ts src/services/learningEvents.strict.test.ts` | 5 files, 46 tests passed |
| Lint | `npm run lint` | Passed |
| i18n | `npm run check:i18n` | Passed |
| Build | `npm run build` | Passed |
| Practice smoke | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/practice-attempt-smoke.json` | 6 checks passed, 0 failed |
| Browser screenshots | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/summary.json` | 114 checks passed, 0 failed |
| Desktop first wrong | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/desktop-light-practice-first-wrong.png` | Captured |
| Desktop recovered | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/desktop-light-practice-recovered.png` | Captured |
| Desktop reveal | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/desktop-light-practice-revealed.png` | Captured |
| Mobile listening reveal | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/mobile-light-listening-revealed.png` | Captured |

## Validation Results

| Gate | Command or check | Result | Notes |
| --- | --- | --- | --- |
| Attempt/practice/recap/evidence tests | `npm test -- --run src/features/practice/attemptState.test.ts src/pages/dashboard/PracticePage.test.tsx src/features/learning/sessionRecap.test.ts src/services/evidenceEvents.test.ts src/services/learningEvents.strict.test.ts` | Passed | 46 focused tests |
| Lint | `npm run lint` | Passed | No ESLint errors |
| i18n | `npm run check:i18n` | Passed | Key parity check passed |
| Build | `npm run build` | Passed | Production bundle completed |
| Browser attempt smoke | `BASE_URL=http://127.0.0.1:4173 node product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/practice-attempt-smoke.mjs` | Passed | Desktop/mobile choice and listening attempt states |
| Browser route/theme regression | `BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop npm run test:learning-flow-regression` | Passed | 114 checks, 0 failed |

## Acceptance Gate Results

| Acceptance gate | Result | Evidence |
| --- | --- | --- |
| First wrong choice attempt gives hint and does not reveal correct answer | Passed | `PracticePage.test.tsx`; `practice-attempt-smoke.json`; first-wrong screenshots |
| Retry-correct choice attempt records recovered, not first-try correct | Passed | `attemptState.test.ts`; `PracticePage.test.tsx`; recovered screenshots |
| Second wrong choice attempt reveals answer and records needs-review | Passed | `PracticePage.test.tsx`; reveal screenshots |
| First wrong listening attempt hides expected answer | Passed | `PracticePage.test.tsx`; listening first-wrong screenshots |
| Second wrong listening attempt reveals expected answer | Passed | `PracticePage.test.tsx`; listening reveal screenshots |
| Evidence and recap separate first-try correct, recovered, and needs-review | Passed | `evidenceEvents.test.ts`; `learningEvents.strict.test.ts`; `sessionRecap.test.ts` |
| Local-auth practice evidence avoids remote sync console errors | Passed | `learningEvents.strict.test.ts`; `practice-attempt-smoke.json` |
| Desktop and mobile route/theme regression passes | Passed | `summary.json` |

## Compliance Gate Results

| Compliance gate | Result | Evidence |
| --- | --- | --- |
| No recovered answer counted as first-try correct | Passed | `PracticePage.test.tsx`; `sessionRecap.test.ts` |
| No first wrong answer leaks correct answer through feedback | Passed | `PracticePage.test.tsx`; `practice-attempt-smoke.json` |
| Inline feedback readable in light/dark route regression | Passed | `summary.json`; screenshots |
| Keyboard Enter parity for listening check/retry/reveal | Passed | `practice-attempt-smoke.mjs` uses Enter for both listening attempts |
| Mistake collector only receives revealed/failed items | Passed | `PracticePage.test.tsx` |

## Rollback and Recovery

- Rollback path: Revert `src/services/learningEvents.ts`, `src/services/learningEvents.strict.test.ts`, and VLE-03 audit files. Existing attempt-state and PracticePage behavior was verified rather than substantially rewritten in this phase.
- Feature flags or toggles: None.
- Data cleanup: None. Local-auth strict events remain local; no production writes were added.
- Remaining release risk: Low for Practice/listening retry semantics. Today/Review route-level behavior is covered by learning-flow regression; deeper Today decision quality remains part of future product tuning.

## User Waivers

- Waived gate: None.
- Waived by: N/A.
- Reason: N/A.
- Remaining risk: N/A.
- Dependent phases may proceed: yes

## Next Phase Handoff

- Dependency unlocked: VLE-04 AI English Coach And Skill Feedback.
- Important files changed: `src/services/learningEvents.ts`, `src/services/learningEvents.strict.test.ts`, `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/practice-attempt-smoke.mjs`.
- Known blockers: None.
- Recommended next phase: Verify AI coach and skill feedback consume bounded, honest evidence from practice/review/session recap without overclaiming correctness.
