# VGUI-00 Phase Report

**Phase:** VGUI-00 Baseline UI Audit And Inventory

**Status:** passed

**Date:** 2026-06-17

---

## Summary

Established the executable UI baseline for the global VocabDaily redesign. The current app builds, passes lint/i18n/tests, and the existing UI regression script captures all scoped public, auth, dashboard, skill, and account routes on desktop and mobile without overflow, redirects to login, or error boundaries.

The report does not claim that the UI is visually complete. It proves the baseline is capturable and safe to use as the starting point for VGUI-01 through VGUI-05.

## Plan Followed

Plan file: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-00-baseline-ui-audit-and-inventory-plan.md`

1. Ran static, i18n, build, and full test gates.
2. Started Vite preview from the production build.
3. Ran UI regression against `http://127.0.0.1:4174`.
4. Inspected summary counts and generated evidence paths.
5. Updated harness runtime files for VGUI-01 handoff.

## Files Changed

Documentation and evidence updates only:

- `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-00-baseline-ui-audit-and-inventory-plan.md`
- `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-00-baseline-ui-audit-and-inventory-report.md`
- `docs/vocabdaily-global-ui-upgrade-prd/source-packet.md`
- `docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md`
- `docs/vocabdaily-global-ui-upgrade-prd/progress-log.md`
- `docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md`
- `docs/vocabdaily-global-ui-upgrade-prd/loop-state.json`
- `docs/vocabdaily-global-ui-upgrade-prd/feature-oracle.json`
- `docs/vocabdaily-global-ui-upgrade-prd/next-window-prompt.md`

Existing exploratory UI changes remain in `src/index.css` and `src/pages/Home.tsx`; they are not accepted as implementation until VGUI-01/VGUI-02.

## Validation Evidence

| Gate | Command or Check | Result | Notes |
| --- | --- | --- | --- |
| Lint | `npm run lint` | passed | ESLint completed with zero errors. |
| i18n | `npm run check:i18n` | passed | i18n key parity check passed. |
| Build | `npm run build` | passed | Production build completed. Vite emitted the existing Browserslist age warning only. |
| Tests | `npm test -- --run` | passed | 103 test files, 810 tests passed. |
| Preview | `npm run preview -- --host 127.0.0.1 --port 4173` | passed with port change | 4173 was occupied, Vite served at `http://127.0.0.1:4174/`. |
| UI regression | `BASE_URL=http://127.0.0.1:4174 UI_REGRESSION_OUT_DIR=product-audit-2026-06-17/global-ui/baseline npm run test:ui-regression` | passed | 54 route checks, 0 failures. 10 scenario checks, 0 failures. |
| Browser/Runtime | `summary.json` inspection | passed | 64 screenshots generated; no horizontal overflow, no error boundary, no auth redirects on protected seeded routes. |
| Compliance | Local screenshot run | passed | Used local seeded regression state; no production data mutation or deployment. |
| Acceptance | VGUI-F001 | passed | Every scoped route is represented in screenshot regression or scenario evidence. |

## Feature Oracle Updates

| Feature ID | Old Status | New Status | Evidence |
| --- | --- | --- | --- |
| VGUI-F001 | failing | passing | `product-audit-2026-06-17/global-ui/baseline/summary.json`; 54 route checks, 10 scenario checks, 0 failures. |

## Progress Log Update

Progress log now records VGUI-00 as passed and VGUI-01 as the next phase. The clean-state note records that exploratory code edits still exist in `src/index.css` and `src/pages/Home.tsx`.

## Screenshots, Logs, Or Eval Tables

- Summary: `product-audit-2026-06-17/global-ui/baseline/summary.json`
- Desktop contact sheet: `product-audit-2026-06-17/global-ui/baseline/contact-sheet-desktop.html`
- Mobile contact sheet: `product-audit-2026-06-17/global-ui/baseline/contact-sheet-mobile.html`
- Screenshot folder: `product-audit-2026-06-17/global-ui/baseline/screenshots/`

Summary counts:

- Route checks: 54
- Route failures: 0
- Scenario checks: 10
- Scenario failures: 0
- Screenshots: 64

## Blockers And Deviations

- Port 4173 was already in use, so Vite preview ran on 4174. This is not a product blocker.
- Supabase production reachability was not tested in VGUI-00. It remains a release/smoke concern for later phases.
- The baseline proves route capture and runtime health, not final visual quality.

## Handoff Notes

VGUI-01 may proceed. The next phase should work on global tokens, app shell, theme initialization, skeletons, and shared component rules. It must explicitly review the existing exploratory changes in `src/index.css` and `src/pages/Home.tsx` before accepting, revising, or replacing them.
