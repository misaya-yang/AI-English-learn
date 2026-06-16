# VGUI-03 Phase Report

**Phase:** VGUI-03 Dashboard Core Learning Flow

**Status:** passed

**Date:** 2026-06-17

---

## Summary

Core dashboard flows now share the same light-first learning-workbench direction, and the Practice feedback loop has durable automated coverage. The visible dark mode has been lifted out of the black cockpit range, Practice feedback uses inline semantic panels, the command palette and coach review rail no longer hardcode white-on-dark styling, and the learning-flow regression now clicks through wrong/retry/reveal states instead of only checking route screenshots.

This phase does not claim every specialist module is fully polished. Reading, Listening, Grammar, Pronunciation, Writing, Exam, Learning Path, Leaderboard, Memory, Settings, and Profile remain VGUI-04.

## Plan Followed

Plan file: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-03-dashboard-core-learning-flow-plan.md`

1. Reviewed the VGUI-03 phase contract, Practice state helper, dashboard layout, shared learning components, and core route evidence.
2. Verified the existing attempt-state helper already models first wrong, recovered, needs-review, and reveal outcomes.
3. Tightened dark-mode tokens so stored dark/system preference no longer renders near-black dashboard surfaces.
4. Updated Practice answer feedback and option states to semantic token colors with readable inline feedback.
5. Updated `SearchPalette` and `CoachReviewRail` to use shared foreground/surface tokens instead of hardcoded white/dark classes.
6. Extended `scripts/learning-flow-regression.mjs` with seeded browser interactions for multiple-choice and listening retry/reveal behavior.
7. Ran focused tests, lint, i18n, build, and full learning-flow regression.
8. Wrote harness evidence and handoff notes for VGUI-04.

## Files Changed

- `src/index.css`
- `index.html`
- `src/pages/dashboard/PracticePage.tsx`
- `src/components/SearchPalette.tsx`
- `src/features/coach/CoachReviewRail.tsx`
- `scripts/learning-flow-regression.mjs`
- `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-03-dashboard-core-learning-flow-plan.md`
- `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-03-dashboard-core-learning-flow-report.md`
- `docs/vocabdaily-global-ui-upgrade-prd/source-packet.md`
- `docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md`
- `docs/vocabdaily-global-ui-upgrade-prd/progress-log.md`
- `docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md`
- `docs/vocabdaily-global-ui-upgrade-prd/loop-state.json`
- `docs/vocabdaily-global-ui-upgrade-prd/feature-oracle.json`
- `docs/vocabdaily-global-ui-upgrade-prd/next-window-prompt.md`

## Validation Evidence

| Gate | Command or Check | Result | Notes |
| --- | --- | --- | --- |
| Focused tests | `npm test -- --run src/pages/dashboard/PracticePage.test.tsx src/pages/dashboard/ReviewPage.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/pages/dashboard/VocabularyBankPage.test.tsx src/features/practice/attemptState.test.ts src/features/learning/sessionRecap.test.ts` | passed | 6 test files, 34 tests passed. |
| Additional focused tests | `npm test -- --run src/features/coach/reviewRailLogic.test.ts src/features/learning/components/LearningCockpitShell.test.tsx src/pages/dashboard/PracticePage.test.tsx` | passed | 3 test files, 33 tests passed. |
| Lint | `npm run lint` | passed | ESLint completed with zero errors. |
| i18n | `npm run check:i18n` | passed | i18n key parity check passed. |
| Build | `npm run build` | passed | Production build completed. Existing Browserslist age warning only. |
| Learning-flow browser regression | `BASE_URL=http://127.0.0.1:4174 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-17/global-ui/vgui-03-learning-flow-v3 npm run test:learning-flow-regression` | passed | 118 checks, 0 failures. Includes light/dark/system route matrix, fast route switching, seeded multiple-choice retry/reveal, and seeded listening retry/reveal. |
| Compliance | Local seeded browser state | passed | No production data mutation, provider change, billing change, or deployment. |
| Acceptance | VGUI-F004 | passed | Core dashboard evidence recorded. |

## Browser Evidence

- Summary: `product-audit-2026-06-17/global-ui/vgui-03-learning-flow-v3/summary.json`
- Screenshots: `product-audit-2026-06-17/global-ui/vgui-03-learning-flow-v3/screenshots/`

Summary counts:

- Checks: 118
- Failures: 0
- Routes: public/auth smoke routes plus `/dashboard/today`, `/dashboard/review`, `/dashboard/practice`, `/dashboard/chat`, `/dashboard/analytics`, `/dashboard/vocabulary`, and module routes included by the learning-flow script.
- Themes: light, dark, system.
- Viewports: desktop 1440x960 and mobile 390x844.
- Interaction screenshots:
  - `desktop-light-practice-first-wrong.png`
  - `desktop-light-practice-second-wrong.png`
  - `desktop-light-listening-first-wrong.png`
  - `desktop-light-listening-second-wrong.png`

## Code Facts Written Back

- `src/features/practice/attemptState.ts` remains the source of truth for `answering` / `retrying` / `revealed`, first-try correct, recovered, try-again, and needs-review outcomes.
- `src/pages/dashboard/PracticePage.tsx` records first-try correct as `good`, recovered as `hard`, and needs-review as `again`; first wrong attempts do not record mistakes or reveal answer copy.
- `scripts/learning-flow-regression.mjs` now seeds a deterministic local word book and verifies real browser behavior for multiple-choice and listening retry/reveal flows.
- `src/index.css` dark tokens are now a brighter low-light study surface rather than near-black cockpit surfaces.
- `src/components/SearchPalette.tsx` and `src/features/coach/CoachReviewRail.tsx` no longer use hardcoded white/dark styling that conflicts with the shared theme.

## Blockers And Deviations

- No VGUI-03 blockers.
- Dark mode is now readable and non-black, but VGUI-04 should continue removing old hardcoded `dark:bg-*` and green-heavy module styling from specialist pages.
- Supabase production reachability was not tested in this phase.

## Handoff Notes

VGUI-04 may proceed. The next phase should apply the same non-black, light-first workbench rules to Reading, Listening, Grammar, Pronunciation, Writing, Exam, Learning Path, Leaderboard, Memory, Settings, and Profile, and should keep the enhanced learning-flow regression in the release gate.
