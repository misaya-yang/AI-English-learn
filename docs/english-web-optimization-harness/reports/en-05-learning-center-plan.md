# EN-05 Learning Center Plan

- Phase: EN-05
- Feature: EN-F005
- Actor: generator
- Date: 2026-06-28

## Dependency Check

- EN-04 actor report: `docs/english-web-optimization-harness/reports/en-04-reading-report.md`
- EN-04 critic artifact: `docs/english-web-optimization-harness/reports/en-04-reading-critic.md`
- EN-F004 status: passing in `feature-oracle.json`

## Primary Context Read

- `src/pages/dashboard/TodayPage.tsx`
- `src/pages/dashboard/ReviewPage.tsx`
- `src/pages/dashboard/AnalyticsPage.tsx`
- `src/pages/dashboard/SettingsPage.tsx`

## Planned Scope

1. Remove accidental English-mode Chinese from the learning-center hot path:
   - Today word workbench labels, buttons, status chips, bookmark/share copy, toasts, topic labels, and hard-word semantics.
   - Settings tabs, notification controls, learning/audio/account/danger labels, quiet-hour/lifecycle copy, and toasts.
   - Review and Analytics hard-coded labels found in primary-context inspection where they affect English-mode route evidence.
   - Profile labels after opening the likely edit path.
2. Align Today hard-word behavior with actual persistence:
   - Keep `markTodayWordHard` as a local daily hard flag and evidence event.
   - Remove copy that implies direct FSRS due-queue mutation unless the code actually calls `reviewWord` or writes due progress.
3. Make Settings clear-data semantics explicit and safe:
   - Preserve the confirmation dialog and do not automate destructive clearing in validation.
   - Either clear local IndexedDB learner artifacts after confirmation or explicitly label the current localStorage-only boundary; prefer a small repo-local helper if existing `localDb` APIs support it without schema changes.
4. Add or update focused tests only for changed behavior.
5. Run terminal validation:
   - Focused EN-05 tests.
   - Full Vitest, lint, i18n, build.
   - Dev-server precheck, UI regression, learning-flow regression.
   - Manual browser checks for Today, Review, Analytics, Settings, Profile, Learning Path in English desktop/mobile.
   - Whole-demand oracle check across EN-F001 through EN-F005.

## Parallel Review

- UI explorer: accidental English-mode Chinese and layout risks.
- Functional explorer: Today hard semantics, clear-data/IndexedDB boundary, analytics honesty.
- Quality explorer: focused tests and terminal regression matrix.

## Edit Boundaries

- Allowed: EN-05 likely edit paths and EN-05 harness report/state files.
- Forbidden: Supabase schema/functions, production providers, billing, Vercel config, package lock, secrets, deployment.
