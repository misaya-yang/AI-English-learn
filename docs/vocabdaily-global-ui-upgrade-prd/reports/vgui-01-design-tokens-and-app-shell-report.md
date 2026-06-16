# VGUI-01 Phase Report

**Phase:** VGUI-01 Design Tokens And App Shell

**Status:** passed

**Date:** 2026-06-17

---

## Summary

Stabilized the global VocabDaily visual foundation so the app no longer defaults to a black AI dashboard feel. The shipped baseline is now light-first, with a readable dusk-style dark mode, aligned pre-paint theme initialization, safer skeletons, and explicit root backgrounds to prevent route-switch flashes.

This phase does not claim that all public, dashboard, and module screens are fully redesigned. It makes the shared foundation safe for VGUI-02 through VGUI-05.

## Plan Followed

Plan file: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-01-design-tokens-and-app-shell-plan.md`

1. Reviewed the inherited VGUI-00 baseline and token/shell entry points.
2. Accepted and revised the exploratory `src/index.css` and `src/pages/Home.tsx` direction as the current light-first base.
3. Updated HTML theme metadata, pre-paint theme resolution, and skip-link accent.
4. Aligned `ThemeProvider` with the pre-paint storage key and normalized invalid theme values.
5. Revised global dark tokens away from near-black surfaces.
6. Updated public and dashboard skeletons to use quiet learning loading states.
7. Ran static, focused, build, and browser/theme regression checks.
8. Wrote code facts and next-phase handoff notes back into the harness runtime files.

## Files Changed

- `index.html`
- `src/index.css`
- `src/contexts/ThemeContext.tsx`
- `src/components/DashboardSkeleton.tsx`
- `src/pages/Home.tsx`
- `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-01-design-tokens-and-app-shell-plan.md`
- `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-01-design-tokens-and-app-shell-report.md`
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
| Lint | `npm run lint` | passed | ESLint completed with zero errors. |
| i18n | `npm run check:i18n` | passed | i18n key parity check passed. |
| Build | `npm run build` | passed | Production build completed. Existing Browserslist age warning only. |
| Focused tests | `npm test -- --run src/components/DashboardSkeleton.test.tsx src/components/ThemeToggle.test.tsx src/features/learning/components/LearningCockpitShell.test.tsx` | passed | 3 test files, 19 tests passed. |
| Theme matrix | one-off Playwright matrix against `http://127.0.0.1:4174` | passed | 32 checks, 0 failures across 5 routes, 3 themes, and 2 viewports. |
| Route switching | `/dashboard/today -> /dashboard/practice -> /dashboard/settings` in system theme | passed | No long-lived skeleton, no blank body, no horizontal overflow, no near-black root/background. |
| Compliance | Local seeded browser state | passed | No production data mutation, provider changes, or deployment. |
| Acceptance | VGUI-F002 | passed | Token, shell, theme, and skeleton evidence recorded. |

## Browser Evidence

- Summary: `product-audit-2026-06-17/global-ui/vgui-01-theme/summary.json`
- Contact sheet: `product-audit-2026-06-17/global-ui/vgui-01-theme/contact-sheet.html`
- Screenshots: `product-audit-2026-06-17/global-ui/vgui-01-theme/screenshots/`

Summary counts:

- Checks: 32
- Failures: 0
- Routes: `/`, `/login`, `/dashboard/today`, `/dashboard/practice`, `/dashboard/settings`
- Themes: light, dark, system
- Viewports: desktop 1440x960, mobile 390x844

Computed background checks from the final run:

- Desktop light home root/background: `rgb(246, 247, 249)`, brightness 247.
- Desktop dark home root/background: `rgb(81, 92, 108)`, brightness 91.
- Mobile dark today root/background: `rgb(81, 92, 108)`, brightness 86.
- System route switch remained populated after 1200ms on each target route.

## Code Facts Written Back

- `index.html` now declares light and dark `theme-color` values, `color-scheme`, non-black iOS status-bar behavior, and a pre-paint script that validates `vocabdaily-theme`.
- `ThemeContext` now defaults to `vocabdaily-theme`, normalizes invalid stored theme values, and sets `documentElement.style.colorScheme`.
- `src/index.css` now gives `html` and `#root` explicit `background: hsl(var(--background))`, preventing transparent root flashes.
- Dark tokens were moved from near-black slate to a lighter dusk slate with clearer borders and surfaces.
- `DashboardSkeleton` and `PageSkeleton` use quiet learning-copy loading states and avoid large, heavy full-screen blocks.

## Blockers And Deviations

- The focused phase did not redesign every page. Public/auth route polish is VGUI-02, core learning flow is VGUI-03, and module/account screens are VGUI-04.
- The theme matrix was a one-off Playwright check for this phase. VGUI-05 should promote durable regression coverage or fold the checks into the release evidence workflow.
- Supabase production reachability was not solved in this phase. It remains a release/smoke concern.

## Handoff Notes

VGUI-02 may proceed. The next phase should work on public, auth, pricing, sample, legal, daily-word, and onboarding surfaces using the now-stabilized light-first token system. Do not reintroduce black hero surfaces, emerald as a default accent, or AI-style vague copy.
