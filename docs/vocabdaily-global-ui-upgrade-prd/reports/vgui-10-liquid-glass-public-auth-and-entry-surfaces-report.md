# VGUI-10 Liquid Glass Public Auth And Entry Surfaces Report

Date: 2026-06-20
Status: passed
Feature oracle item: VGUI-F010

## Summary

Executed the public/auth/legal/sample/pricing/daily-word route phase. All 11 entry routes now have verified Liquid Glass navigation or control evidence while forms, legal copy, word cards, pricing plan bodies, and onboarding controls remain on solid readable surfaces.

This report does not claim the dashboard core, specialist modules, or final full-route Liquid Glass release gate are complete. Those remain VGUI-11 through VGUI-13.

## Plan Followed

- Applied the shared floating glass bar/control treatment to remaining public entry routes.
- Kept dense route content, form bodies, legal copy, and pricing plan content solid.
- Removed public/auth route emerald and raw amber decorative accents in favor of primary or semantic warning tokens.
- Preserved pricing fail-closed behavior and auth route targets.
- Fixed the `/onboarding` auth-initialization race so a valid local session does not flash-redirect to login before auth loading completes.
- Added focused tests proving glass headers are present where expected and form bodies are not inside glass surfaces.

## Files Changed

- `src/pages/WordOfTheDayPage.tsx`
- `src/pages/LegalPage.tsx`
- `src/pages/PricingPage.tsx`
- `src/pages/auth/OnboardingPage.tsx`
- `src/pages/WordOfTheDayPage.test.tsx`
- `src/pages/PricingPage.test.tsx`
- `src/pages/auth/AuthPages.i18n.test.tsx`
- `src/features/marketing/AuthShell.test.tsx`

## Validation Evidence

| Gate | Command / evidence | Result |
| --- | --- | --- |
| Focused public/auth tests | `npx vitest run src/pages/Home.i18n.test.tsx src/pages/Home.trust.test.ts src/pages/PricingPage.test.tsx src/pages/WordOfTheDayPage.test.tsx src/pages/auth/AuthPages.i18n.test.tsx src/features/marketing/AuthShell.test.tsx src/features/marketing/BrandMark.test.tsx` | passed: 7 files, 40 tests |
| Lint | `npm run lint` | passed |
| i18n parity | `npm run check:i18n` | passed |
| Production build | `npm run build` | passed; existing Browserslist `caniuse-lite` age warning only |
| VGUI-10 public/auth matrix | custom Playwright matrix against `http://127.0.0.1:5176` | passed: 44/44 checks |
| Project UI regression | `BASE_URL=http://127.0.0.1:5176 UI_REGRESSION_OUT_DIR=product-audit-2026-06-20/liquid-glass/vgui-10-ui-regression npm run test:ui-regression` | passed: 54/54 route checks and 10/10 scenarios |

## Browser Evidence

VGUI-10 public/auth matrix:

- Summary: `product-audit-2026-06-20/liquid-glass/vgui-10-public-auth/summary.json`
- Screenshots: `product-audit-2026-06-20/liquid-glass/vgui-10-public-auth/screenshots/`
- Routes: `/`, `/word-of-the-day`, `/demo`, `/pricing`, `/terms`, `/privacy`, `/login`, `/register`, `/magic-link`, `/auth/callback`, `/onboarding`
- Viewports: desktop 1440x960 and mobile 390x844
- Themes: light and dark
- Checks: visible content, no error boundary, no horizontal overflow, at least one shared glass shell/control, no visible form field inside a glass surface, no clipped visible controls, no main heading inside glass, and no fake social-proof strings.

Project UI regression:

- Summary: `product-audit-2026-06-20/liquid-glass/vgui-10-ui-regression/summary.json`
- Screenshots: `product-audit-2026-06-20/liquid-glass/vgui-10-ui-regression/screenshots/`
- Contact sheets: `product-audit-2026-06-20/liquid-glass/vgui-10-ui-regression/contact-sheet-desktop.html`, `product-audit-2026-06-20/liquid-glass/vgui-10-ui-regression/contact-sheet-mobile.html`

## Semantic Preservation Notes

- Pricing fail-closed state still does not mount checkout buttons or call checkout when billing is unavailable.
- Auth form labels remain visible and form fields are on solid panels.
- Legal text meaning and contact placeholder copy were not changed.
- `/auth/callback` without a valid provider session still redirects to `/login`, matching the existing failure path.
- `/onboarding` now waits while auth state initializes, then stays on onboarding when a valid local user is present.

## Source Packet Writeback

`source-packet.md` now records VGUI-10 public/auth route facts, including the Word/Legal glass header completion, semantic warning-token cleanup, and the onboarding auth-loading guard.

## Continuity Ledger Update

`continuity-ledger.md` now records VGUI-10 as passed and hands off to VGUI-11. Downstream phases inherit:

- public/auth glass placement is verified
- forms/legal/pricing/daily-word bodies stay solid
- onboarding should continue to respect `isLoading` before redirect decisions
- VGUI-11 owns dashboard core route bodies and learning correctness evidence

## Deviations And Blockers

No active blocker.

The custom Playwright matrix needed the current theme version (`2026-06-workbook-contrast-v6`) and an origin guard around `localStorage` seeding so route evidence did not trip over browser `about:blank` storage restrictions. This affected the test harness only, not app runtime code.

## Acceptance Gate Status

- All 11 entry routes have light/dark desktop/mobile evidence: passed.
- Focused tests, lint, i18n, and build: passed.
- Forms, legal copy, pricing bodies, and word cards remain solid/readable: passed.
- Billing and auth semantics preserved: passed.
- VGUI-F010 can be marked passing.

## Next Phase

Execute VGUI-11 Liquid Glass Dashboard Core Learning.

Target feature-oracle item: VGUI-F011.
