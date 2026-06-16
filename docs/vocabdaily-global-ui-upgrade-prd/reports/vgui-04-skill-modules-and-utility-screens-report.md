# VGUI-04 Phase Report

**Phase:** VGUI-04 Skill Modules And Utility Screens

**Status:** passed

**Date:** 2026-06-17

---

## Summary

Specialist modules and utility screens now share the same light-first learning-workbench baseline as the core dashboard. The regression matrix includes Exam, Learning Path, Memory, and Leaderboard; visible module leftovers were moved away from emerald/white/dark hardcoding; and old stored dark theme preferences now migrate once back to light so users do not keep landing on the rejected black-style home page.

Manual dark mode remains available, but the browser evidence now shows a low-light grey-blue surface instead of near-black panels.

## Plan Followed

Plan file: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-04-skill-modules-and-utility-screens-plan.md`

1. Reviewed module route evidence and searched dashboard/module files for hardcoded `dark:bg`, `text-white`, emerald accents, and heavy shadows.
2. Added Exam, Learning Path, Memory, and Leaderboard to the learning-flow regression route list.
3. Added regression seeding for the current theme preference version so dark-mode checks are explicit tests, not migrated away.
4. Added theme preference migration in `index.html` and `ThemeContext` to reset old non-light preferences once.
5. Reworked Exam, Memory, Vocabulary, Pronunciation issue badges, Analytics, Review, UpgradePrompt, Chat warning, and shared coach/layout accents to semantic token colors.
6. Ran focused tests, lint, i18n, build, and two learning-flow passes; the final pass used the corrected dark-theme seeding.
7. Inspected representative desktop and mobile screenshots before unlocking VGUI-05.

## Files Changed

- `index.html`
- `scripts/learning-flow-regression.mjs`
- `src/contexts/ThemeContext.tsx`
- `src/components/UpgradePrompt.tsx`
- `src/features/coach/CoachReviewRail.tsx`
- `src/features/marketing/BrandMark.tsx`
- `src/features/pronunciation/components/PhonemeIssueList.tsx`
- `src/features/exam/components/ExamPrepShared.tsx`
- `src/features/exam/components/HeroSummary.tsx`
- `src/features/exam/components/ExamBriefPanel.tsx`
- `src/features/exam/components/ExamDraftPanel.tsx`
- `src/features/exam/components/InsightRail.tsx`
- `src/features/exam/components/ExamWorkspaceTabs.tsx`
- `src/features/exam/components/ErrorGraph.tsx`
- `src/features/exam/components/RouteConsole.tsx`
- `src/features/exam/components/ExamReviewPanel.tsx`
- `src/layouts/DashboardLayout.tsx`
- `src/pages/dashboard/AnalyticsPage.tsx`
- `src/pages/dashboard/ChatPage.tsx`
- `src/pages/dashboard/ExamPrepPage.tsx`
- `src/pages/dashboard/MemoryCenterPage.tsx`
- `src/pages/dashboard/ReviewPage.tsx`
- `src/pages/dashboard/VocabularyBankPage.tsx`

## Validation Evidence

| Gate | Command or Check | Result | Notes |
| --- | --- | --- | --- |
| Focused module tests | `npm test -- --run src/components/ThemeToggle.test.tsx src/components/DashboardSkeleton.test.tsx src/pages/dashboard/ProfilePage.test.tsx src/pages/dashboard/SettingsPage.test.tsx src/pages/dashboard/VocabularyBankPage.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/pages/dashboard/ReviewPage.test.tsx src/pages/dashboard/PracticePage.test.tsx src/features/practice/attemptState.test.ts src/features/learning/sessionRecap.test.ts` | passed | 10 test files, 43 tests passed. |
| Lint | `npm run lint` | passed | ESLint completed with zero errors. |
| i18n | `npm run check:i18n` | passed | i18n key parity check passed. |
| Build | `npm run build` | passed | Production build completed. Existing Browserslist age warning only. |
| Learning-flow browser regression | `BASE_URL=http://127.0.0.1:4174 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-17/global-ui/vgui-04-modules-v2 npm run test:learning-flow-regression` | passed | 142 checks, 0 failures. Includes extended route set, light/dark/system, desktop/mobile, fast route switch, Practice retry/reveal, and listening retry/reveal. |
| Theme migration probe | Playwright localStorage probe against `/` | passed | Old `vocabdaily-theme=dark` with stale version migrated to `light`; body background `rgb(246, 247, 249)` and H1 `今天练什么`. |

## Browser Evidence

- Summary: `product-audit-2026-06-17/global-ui/vgui-04-modules-v2/summary.json`
- Screenshots: `product-audit-2026-06-17/global-ui/vgui-04-modules-v2/screenshots/`
- Key inspected screenshots:
  - `desktop-light-home.png`
  - `desktop-dark-home.png`
  - `desktop-light-exam.png`
  - `desktop-dark-exam.png`
  - `desktop-light-memory.png`
  - `desktop-light-learning-path.png`
  - `mobile-light-home.png`

Summary counts:

- Checks: 142
- Failures: 0
- Themes: light, dark, system
- Viewports: desktop 1440x960 and mobile 390x844

## Code Facts Written Back

- `scripts/learning-flow-regression.mjs` now covers `/dashboard/exam`, `/dashboard/learning-path`, `/dashboard/memory`, and `/dashboard/leaderboard`.
- `scripts/learning-flow-regression.mjs` seeds `vocabdaily-theme-version` so explicit dark checks remain dark after theme migration.
- `index.html` and `ThemeContext` share the `2026-06-workbench-light` theme version and migrate stale stored non-light values back to light once.
- Exam components now use semantic `primary`, `accent-exam`, `success`, `warning`, and `danger` tokens instead of visible emerald product accents.
- Memory, Vocabulary, Analytics, Review, Pronunciation, Chat, UpgradePrompt, BrandMark, CoachReviewRail, and DashboardLayout received scoped token cleanup for the same visual system.

## Blockers And Deviations

- No VGUI-04 blockers.
- This phase did not run production Supabase smoke or deployment; those remain VGUI-05 release-gate requirements.
- The manual dark mode is intentionally readable and non-black, but default and migrated user experience is light.

## Handoff Notes

VGUI-05 may proceed. The release gate should run the full command set, regenerate final UI and learning-flow evidence, investigate the production Supabase refresh-token storm, then commit, push, deploy to Vercel, and smoke the production URL.

