# VGUI-10 Liquid Glass Public Auth And Entry Surfaces Plan

Date: 2026-06-20
Status: planned
Feature oracle item: VGUI-F010

## Scope

Upgrade the 11 public/auth/entry routes to the shared Liquid Glass language without changing auth, legal, i18n, demo, or pricing fail-closed semantics:

- `/`
- `/word-of-the-day`
- `/demo`
- `/pricing`
- `/terms`
- `/privacy`
- `/login`
- `/register`
- `/magic-link`
- `/auth/callback`
- `/onboarding`

## Plan

| Requirement | Likely files | Validation / evidence |
| --- | --- | --- |
| Shared floating glass nav/control layer across public entry surfaces | `src/pages/Home.tsx`, `src/pages/PricingPage.tsx`, `src/pages/WordOfTheDayPage.tsx`, `src/pages/SampleLessonPage.tsx`, `src/pages/LegalPage.tsx`, `src/features/marketing/AuthShell.tsx`, marketing components | Browser screenshots for all 11 routes; check `[data-glass-surface]` in nav/control areas. |
| Forms, legal text, and pricing plan bodies remain solid and readable | `src/pages/auth/*.tsx`, `src/pages/LegalPage.tsx`, `src/pages/PricingPage.tsx`, `src/features/marketing/AuthShell.tsx` | Focused public/auth tests; screenshot inspection for no glass wrapping form fields, plan bodies, or legal copy. |
| Preserve auth, demo, i18n, legal, and billing fail-closed behavior | Auth pages, pricing page, public route links | `npx vitest run src/pages/Home.i18n.test.tsx src/pages/Home.trust.test.ts src/pages/PricingPage.test.tsx src/pages/WordOfTheDayPage.test.tsx src/pages/auth/AuthPages.i18n.test.tsx src/features/marketing/AuthShell.test.tsx src/features/marketing/BrandMark.test.tsx`; `npm run check:i18n`. |
| Prevent clipping/overflow across light and dark desktop/mobile routes | Route pages and small controls | Custom VGUI-10 browser matrix at 1440x960 and 390x844 for light/dark routes. |
| Maintain Liquid Glass web approximation fallbacks inherited from VGUI-09 | shared classes and route usage only | `npm run lint`; `npm run build`; no new dependencies. |

## Guardrails

- Do not edit Supabase auth contracts, billing provider logic, legal meaning, or dashboard route behavior.
- Keep glass limited to navigation, side rails, hero control rails, and small controls.
- Do not put glass behind form fields, legal copy, pricing plan details, long passages, or dense content.
- Preserve route targets and CTA labels covered by tests.
- Record command output, screenshot paths, source-packet writeback, continuity update, and oracle evidence before marking VGUI-F010 passing.
