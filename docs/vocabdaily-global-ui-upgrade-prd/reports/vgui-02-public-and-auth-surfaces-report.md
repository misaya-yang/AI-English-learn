# VGUI-02 Phase Report

**Phase:** VGUI-02 Public And Auth Surfaces

**Status:** passed

**Date:** 2026-06-17

---

## Summary

Public and auth entry surfaces now use the VGUI-01 light-first learning system more consistently. The work tightened visible copy, removed decorative auth-list dots, replaced generic dashboard wording with "Today" / "今日任务", and unified public page brand marks without touching auth, billing, or legal semantics.

This phase does not claim dashboard learning flows are complete. Practice retry/reveal behavior and module screens remain VGUI-03 and VGUI-04.

## Plan Followed

Plan file: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-02-public-and-auth-surfaces-plan.md`

1. Reviewed public/auth phase contract and inherited VGUI-01 token rules.
2. Polished `AuthShell` reassurance list visuals without changing form behavior.
3. Updated Pricing CTA wording from generic dashboard language to Today-task language.
4. Unified `WordOfTheDayPage` and `SampleLessonPage` headers with `BrandMark`.
5. Ran focused route tests, lint, i18n, build, and screenshot regression.
6. Wrote harness state and next-phase notes back for VGUI-03.

## Files Changed

- `src/features/marketing/AuthShell.tsx`
- `src/pages/PricingPage.tsx`
- `src/pages/WordOfTheDayPage.tsx`
- `src/pages/SampleLessonPage.tsx`
- `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-02-public-and-auth-surfaces-plan.md`
- `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-02-public-and-auth-surfaces-report.md`
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
| Focused tests | `npm test -- --run src/pages/Home.i18n.test.tsx src/pages/Home.trust.test.ts src/pages/PricingPage.test.tsx src/pages/WordOfTheDayPage.test.tsx src/pages/auth/AuthPages.i18n.test.tsx src/features/marketing/AuthShell.test.tsx` | passed | 6 test files, 36 tests passed. |
| Lint | `npm run lint` | passed | ESLint completed with zero errors. |
| i18n | `npm run check:i18n` | passed | i18n key parity check passed. |
| Build | `npm run build` | passed | Production build completed. Existing Browserslist age warning only. |
| Public/auth screenshots | one-off Playwright matrix against `http://127.0.0.1:4174` | passed | 40 checks, 0 failures across 10 routes, 2 themes, and 2 viewports. |
| Compliance | Local seeded browser state | passed | No production data mutation, provider change, checkout activation, or deployment. |
| Acceptance | VGUI-F003 | passed | Public/auth route evidence recorded. |

## Browser Evidence

- Summary: `product-audit-2026-06-17/global-ui/vgui-02-public-auth/summary.json`
- Contact sheet: `product-audit-2026-06-17/global-ui/vgui-02-public-auth/contact-sheet.html`
- Screenshots: `product-audit-2026-06-17/global-ui/vgui-02-public-auth/screenshots/`

Summary counts:

- Checks: 40
- Failures: 0
- Routes: `/`, `/pricing`, `/word-of-the-day`, `/demo`, `/login`, `/register`, `/magic-link`, `/onboarding`, `/terms`, `/privacy`
- Themes: light, dark
- Viewports: desktop 1440x960, mobile 390x844

## Code Facts Written Back

- `AuthShell` side-rail reassurance bullets now use real icons and text, not decorative dot prefixes.
- Pricing authenticated CTA now points to "Today" / "今日任务" instead of generic dashboard wording.
- `WordOfTheDayPage` and `SampleLessonPage` use shared `BrandMark`, keeping public headers visually aligned with Home, Pricing, Legal, and Auth surfaces.
- Pricing still keeps checkout fail-closed. The Pro waitlist branch stores only local product intent while checkout is unavailable.
- Legal copy still includes AI caveats where legally necessary; this phase did not remove compliance wording.

## Blockers And Deviations

- No blockers.
- The public/auth screenshot check is currently a one-off evidence script. VGUI-05 should decide whether to promote it into a durable npm script.
- Supabase production reachability was not tested in this phase.

## Handoff Notes

VGUI-03 may proceed. The next phase must focus on Today, Review, Practice, Chat, Vocabulary, and Analytics, with special attention to wrong-answer retry behavior, answer reveal timing, recovered stats, and inline feedback.
