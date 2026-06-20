# VGUI-13 Liquid Glass Regression Accessibility Performance Release Report

**Date:** 2026-06-21

**Status:** completed; production deployment, online UI regression, and subagent review passed.

## Scope

VGUI-13 proves the full Apple-inspired Liquid Glass frontend upgrade after VGUI-08 through VGUI-12. This phase covers static checks, unit tests, production build, all-route UI regression, seeded learning-flow regression, reduced-motion/reduced-transparency behavior, local performance checks, release evidence, rollback notes, and the user-approved deployment and online UI review path.

This is still a web approximation of Liquid Glass. It uses existing CSS tokens, `backdrop-filter`, semantic glass utilities, reduced-preference fallbacks, and existing React/Tailwind/Radix/framer-motion boundaries. It does not claim official Apple platform Liquid Glass on the web.

## User Feedback Fix

The first VGUI-13 dark-mode pass was visually too washed out. The release gate now locks dark mode to a direct neutral graphite/charcoal direction instead of the prior light blue-gray cast.

- Dark app background is now near `rgb(31, 32, 35)` and solid content cards are around `rgb(43, 45, 49)`.
- `src/themeContrast.test.ts` now rejects washed dark backgrounds by enforcing a darker neutral range while still preventing pure black.
- Default primary buttons in dark mode use a deeper muted blue instead of pale blue.
- Nested glass inside glass bars/panels no longer stacks backdrop blur, so performance checks report `stackedBlurredCount: 0`.
- Reduced-transparency dark selectors were tightened to `.dark .liquid-glass-*`, ensuring fallback surfaces do not become foggy.

Key local screenshots:

- `product-audit-2026-06-21/liquid-glass/vgui-13-dark-contrast-fix/screenshots/desktop-dark-reading-neutral-graphite.png`
- `product-audit-2026-06-21/liquid-glass/vgui-13-ui-regression-final/screenshots/desktop-dark-today.png`
- `product-audit-2026-06-21/liquid-glass/vgui-13-ui-regression-final/screenshots/desktop-dark-chat.png`
- `product-audit-2026-06-21/liquid-glass/vgui-13-ui-regression-final/screenshots/mobile-dark-settings.png`
- `product-audit-2026-06-21/liquid-glass/vgui-13-ui-regression-final/screenshots/mobile-dark-profile.png`

## Validation

| Check | Command | Result |
| --- | --- | --- |
| Lint | `npm run lint` | passed |
| i18n | `npm run check:i18n` | passed |
| Unit/component tests | `npm test` | passed: 111 files / 843 tests |
| Production build | `npm run build` | passed with existing Browserslist age warning |
| UI regression | `BASE_URL=http://127.0.0.1:5176 UI_REGRESSION_OUT_DIR=product-audit-2026-06-21/liquid-glass/vgui-13-ui-regression-final npm run test:ui-regression` | passed: 54 route checks and 10 scenarios, 0 failures |
| Final local UI regression after online findings | `BASE_URL=http://127.0.0.1:5176 UI_REGRESSION_OUT_DIR=product-audit-2026-06-21/liquid-glass/vgui-13-completion-cta-local-v2 npm run test:ui-regression` | passed: 54 route checks and 10 scenarios, 0 failures |
| Learning-flow regression | `BASE_URL=http://127.0.0.1:5176 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-21/liquid-glass/vgui-13-learning-flow-final npm run test:learning-flow-regression` | passed: 160 checks, 0 failures |
| Reduced preferences | custom reduced-motion/reduced-transparency matrix at `product-audit-2026-06-21/liquid-glass/vgui-13-reduced-preferences-final` | passed: 10 checks, 0 failures |
| Performance/glass stacking | custom Home/Today desktop/mobile light/dark matrix at `product-audit-2026-06-21/liquid-glass/vgui-13-performance-neutral-graphite` | passed: 8 checks, 0 failures, `stackedBlurredCount: 0` |
| Production HTTP | `curl -I -L https://www.uuedu.online` | passed: HTTP 200 |
| Production UI regression | `BASE_URL=https://www.uuedu.online UI_REGRESSION_OUT_DIR=product-audit-2026-06-21/liquid-glass/prod-ui-regression-final-after-cta-fix npm run test:ui-regression` | passed: 54 route checks and 10 scenarios, 0 failures |
| Production dark/touch proof | custom mobile dark Settings/Reading check at `product-audit-2026-06-21/liquid-glass/prod-dark-touch-final-after-cta-fix` | passed: dark body `rgb(31,32,35)`, Settings tabs 85x44 |
| Production route effects | custom `/auth/callback` and `/dashboard` route-effect check at `product-audit-2026-06-21/liquid-glass/prod-route-effects-final` | passed: auth callback safely redirects to login without a session; protected dashboard root safely redirects with `redirect=/dashboard` |

## Browser Evidence

Full UI regression:

- Summary: `product-audit-2026-06-21/liquid-glass/vgui-13-ui-regression-final/summary.json`
- Desktop contact sheet: `product-audit-2026-06-21/liquid-glass/vgui-13-ui-regression-final/contact-sheet-desktop.html`
- Mobile contact sheet: `product-audit-2026-06-21/liquid-glass/vgui-13-ui-regression-final/contact-sheet-mobile.html`
- Screenshots: `product-audit-2026-06-21/liquid-glass/vgui-13-ui-regression-final/screenshots/`
- Routes: public, auth, legal, entry, dashboard core, specialist modules, settings, and profile.
- Viewports: desktop 1440x960 and mobile 390x844.
- Themes: light and dark.

Learning-flow regression:

- Summary: `product-audit-2026-06-21/liquid-glass/vgui-13-learning-flow-final/summary.json`
- Screenshots: `product-audit-2026-06-21/liquid-glass/vgui-13-learning-flow-final/screenshots/`
- Coverage: light, dark, system; desktop/mobile; dashboard route switching; Practice retry/reveal; listening retry/reveal; IELTS reading load proof.

Reduced preferences:

- Summary: `product-audit-2026-06-21/liquid-glass/vgui-13-reduced-preferences-final/summary.json`
- Screenshots: `product-audit-2026-06-21/liquid-glass/vgui-13-reduced-preferences-final/screenshots/`
- Coverage: Home, Pricing, Today, Reading, and Settings at desktop/mobile with reduced motion and reduced transparency.
- Result: sampled glass controls compute disabled filters under reduced transparency and do not horizontally overflow.

Performance:

- Summary: `product-audit-2026-06-21/liquid-glass/vgui-13-performance-neutral-graphite/summary.json`
- Screenshots: `product-audit-2026-06-21/liquid-glass/vgui-13-performance-neutral-graphite/screenshots/`
- Coverage: Home and Today at desktop/mobile in light/dark.
- Result: no stacked blurred ancestors, no horizontal overflow, and route load events completed in the local browser matrix.

Production:

- Final deployment: `dpl_8aMLaKFPAA5a5JzQ4yaEFhcNXYJ6`
- Final production URL: `https://ai-english-learn-6cyx8svq0-zedpl28174-3992s-projects.vercel.app`
- Production alias: `https://www.uuedu.online`
- Production UI summary: `product-audit-2026-06-21/liquid-glass/prod-ui-regression-final-after-cta-fix/summary.json`
- Production UI screenshots: `product-audit-2026-06-21/liquid-glass/prod-ui-regression-final-after-cta-fix/screenshots/`
- Production contact sheets: `product-audit-2026-06-21/liquid-glass/prod-ui-regression-final-after-cta-fix/contact-sheet-desktop.html`, `product-audit-2026-06-21/liquid-glass/prod-ui-regression-final-after-cta-fix/contact-sheet-mobile.html`
- Production dark/touch summary: `product-audit-2026-06-21/liquid-glass/prod-dark-touch-final-after-cta-fix/summary.json`
- Production dark/touch screenshots: `product-audit-2026-06-21/liquid-glass/prod-dark-touch-final-after-cta-fix/screenshots/`
- Production route-effect summary: `product-audit-2026-06-21/liquid-glass/prod-route-effects-final/summary.json`
- Production route-effect screenshots: `product-audit-2026-06-21/liquid-glass/prod-route-effects-final/screenshots/`
- `/auth/callback` is an ephemeral route; with no callback session it safely redirects to `/login` without horizontal overflow or an error boundary.
- `/dashboard` is a protected redirect route; without a production Supabase session it safely redirects to `/login?redirect=%2Fdashboard` without horizontal overflow or an error boundary.

Online subagent review:

- Public/auth/legal lane: PASS after legal placeholder copy was removed and production legal pages showed `support@uuedu.online`.
- Core dashboard lane: PASS on final deployment; mobile bottom-nav reserve is in place and dashboard routes have no P1/P2 usability issue.
- Specialist/completion lane: PASS on final deployment; Listening, Grammar, and Pronunciation completion CTAs are fully visible above the bottom nav and grammar metrics wrap instead of truncating.
- Account/cross-cutting lane: PASS on final deployment; Settings touch targets are 85x44, dark mode is graphite/charcoal, and no P1/P2 accessibility issue remains.

## Local Corrections Applied

- Recalibrated dark tokens in `src/index.css` from washed blue-gray to neutral graphite/charcoal.
- Updated `src/themeContrast.test.ts` so dark-mode background tests enforce the new darker range.
- Updated `scripts/learning-flow-regression.mjs` so the Vocabulary route waits for loaded IELTS content and the dark-background check uses the new neutral threshold.
- Tightened reduced-transparency CSS selectors in dark mode.
- Disabled nested control blur inside glass bars/panels so glass does not stack over itself.
- Replaced legal placeholder/review copy with production-safe contact copy.
- Fixed Settings language persistence to use the global language key.
- Enforced mobile touch targets for tabs and switches.
- Reserved mobile dashboard main content space above the fixed bottom nav.
- Moved mobile completion CTAs above metric cards and made completion metrics compact without truncating text.
- Kept all billing, auth, Supabase, learning data, and route contracts unchanged.

## Residual Risks

- `npm run build` still prints the pre-existing Browserslist `caniuse-lite` age warning. The build succeeds.
- Full `npm run smoke:prod` was not run in the final pass because the shell did not expose Supabase production environment variables; production HTTP 200, production UI regression, and production browser evidence passed.
- Provider dashboards, DNS, database migrations, billing provider behavior, production data, and secrets were not touched.

## Rollback Plan

If production UI review finds a blocker, revert the release commit(s) or redeploy the previous known Vercel production deployment. The high-risk visual rollback files are:

- `src/index.css`
- `src/components/ui/glass-surface.tsx`
- `src/components/ui/button.tsx`
- `src/layouts/DashboardLayout.tsx`
- public/auth/dashboard route files changed by VGUI-09 through VGUI-13

Because this release does not include schema, billing, provider, or production-data changes, rollback is a frontend redeploy only.

## Completion Boundary

VGUI-F013 can be marked passing because:

- the branch was committed and pushed through `e93bf46`,
- production deployment completed at `dpl_8aMLaKFPAA5a5JzQ4yaEFhcNXYJ6`,
- production HTTP and production UI regression passed,
- production route-effect checks passed for `/auth/callback` and `/dashboard`,
- dark/touch browser evidence passed on the final deployment,
- online subagents reviewed every route family,
- all online findings were fixed and re-reviewed as PASS.
