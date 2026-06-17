# VD-03 Product UI Redesign Report

**Date:** 2026-06-17

**Phase:** VD-03 Product UI Redesign

**Feature:** VD-F004

**Status:** Passing

## Outcome

VD-03 is complete for the current phase scope. The app now uses a lighter, task-first English learning UI foundation across the public entry, dashboard shell, Today, Practice, and standard module pages. The work removes the previous black AI-cockpit feel, reduces duplicated cards and glowy surfaces, keeps visible copy learner-facing, and preserves the Practice retry/reveal learning loop.

This phase does not claim the product is finished. It establishes the shared UI baseline required before VD-04 can add useful IELTS Anki-style content.

## Route Inventory

All routes below were covered by the updated learning-flow regression at desktop `1440x960`, mobile `390x844`, and `light` / `dark` / `system` themes unless noted by a specialized flow check.

| Group | Routes |
| --- | --- |
| Public | `/`, `/login`, `/register`, `/pricing`, `/word-of-the-day` |
| Auth-adjacent | `/magic-link`, `/auth/callback`, `/onboarding` |
| Core dashboard | `/dashboard/today`, `/dashboard/review`, `/dashboard/practice`, `/dashboard/chat`, `/dashboard/analytics` |
| Learning modules | `/dashboard/exam`, `/dashboard/reading`, `/dashboard/listening`, `/dashboard/grammar`, `/dashboard/pronunciation`, `/dashboard/writing`, `/dashboard/vocabulary`, `/dashboard/learning-path` |
| Account/tools | `/dashboard/memory`, `/dashboard/leaderboard`, `/dashboard/profile`, `/dashboard/settings` |
| Flow checks | fast route switching, Practice first-wrong hidden answer, Practice second-wrong reveal, Listening first-wrong hidden expected, Listening second-wrong reveal |

## Product/UI Changes

- Shared learning shell: visible/test-facing "cockpit" language was moved to "session" language while preserving component exports to avoid broad import churn.
- Learning surfaces: `LearningWorkspace` panels are flatter, lighter, and less card-stacked; metric strips use compact divisions instead of repeated floating cards.
- Dashboard shell: sidebar copy and descriptions were shortened; heavy `premium-*` card wrappers were reduced in standard and learning layouts.
- Theme behavior: theme version bumped to `2026-06-workbench-dark-v4`, so stale non-light preferences migrate to light again on next load while manual dark mode remains available.
- Dark palette: dark mode is now restrained graphite/gray rather than near-black, with borders and foreground contrast raised.
- Today page: hero metrics were simplified to the learner's current task, estimated time, new words, and due reviews; the word surface uses fewer outer card layers.
- Practice page: the primary question is now "今天练什么"; the no-mode state has one clear start button, not duplicate CTAs. The page emphasizes the selected exercise, why it is recommended, session result counts, and inline retry feedback.
- Regression script: `scripts/learning-flow-regression.mjs` now covers auth-adjacent routes and recognizes the updated Practice CTA copy.

## Copy Audit

- Removed visible "cockpit" framing from learner-facing shells and tests.
- Replaced generic "Choose this mode" with "Start with this" / "用这个开始" in Practice selection.
- Replaced abstract Practice page setup copy with "今天练什么" and a concrete explanation: mistakes get a hint before answer reveal.
- Shortened dashboard nav grouping labels from product/admin-feeling names to learner-facing groups such as "Skills" / "技能" and "More" / "更多".
- Kept Today and Home copy concrete: "今天练什么", "学完 4 个新词", "复习、新词和短练习。"

## Evidence

- Visual regression summary: `product-audit-2026-06-17/vd-03-learning-flow/summary.json`
- Screenshot directory: `product-audit-2026-06-17/vd-03-learning-flow/screenshots/`
- Representative screenshots:
  - `desktop-light-today.png`
  - `desktop-light-practice.png`
  - `desktop-light-practice-first-wrong.png`
  - `desktop-light-practice-second-wrong.png`
  - `desktop-dark-today.png`
  - `mobile-light-today.png`
  - `mobile-light-practice.png`
  - `desktop-light-chat.png`
  - `desktop-light-analytics.png`
  - `desktop-light-vocabulary.png`

## Validation

All validation commands below passed locally.

| Command | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run check:i18n` | pass |
| `npm run build` | pass |
| `npm test -- --run` | pass, 104 test files and 818 tests |
| `LEARNING_FLOW_OUT_DIR=product-audit-2026-06-17/vd-03-learning-flow npm run test:learning-flow-regression` | pass, 160/160 checks |
| Focused retry/theme tests | pass, `ThemeToggle`, `LearningCockpitShell`, `PracticePage` |

`npm run build` still prints the existing Browserslist data age warning; it is non-fatal and did not fail the build.

## Changed Files

- `index.html`
- `scripts/learning-flow-regression.mjs`
- `src/contexts/ThemeContext.tsx`
- `src/features/learning/components/LearningCockpitShell.tsx`
- `src/features/learning/components/LearningCockpitShell.test.tsx`
- `src/features/learning/components/LearningWorkspace.tsx`
- `src/features/learning/missionSourceSignal.ts`
- `src/features/learning/missionSourceSignal.test.ts`
- `src/index.css`
- `src/layouts/DashboardLayout.tsx`
- `src/pages/dashboard/PracticePage.tsx`
- `src/pages/dashboard/PracticePage.test.tsx`
- `src/pages/dashboard/TodayPage.tsx`
- `docs/vocabdaily-upgrade-harness/reports/vd-03-product-ui-redesign-plan.md`
- `docs/vocabdaily-upgrade-harness/reports/vd-03-product-ui-redesign-report.md`

## Remaining Product Notes

- Chat, Analytics, Vocabulary, and deeper skill pages are now visually safer and covered by screenshots, but they can still be made more product-specific in later dedicated route work.
- VD-04 should not spend time on more shell polish first. The next highest-value product gap is useful IELTS Anki-style vocabulary content and how that content enters review/practice.
- Do not re-open Supabase or auth work unless `AUTH_FLOW_ACCOUNTS=3 npm run smoke:prod:auth-flow` regresses.

## Decision

VD-F004 can be marked passing. Unlock VD-04 for the IELTS Anki-style card foundation.
