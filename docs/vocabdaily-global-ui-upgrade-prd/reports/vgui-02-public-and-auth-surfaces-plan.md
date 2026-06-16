# VGUI-02 Plan - Public And Auth Surfaces

Status: in progress
Date: 2026-06-17
Feature oracle: VGUI-F003

## Design Read

Reading this as: public and auth entry surfaces for an English learning app, with a calm, concrete learning language and the VGUI-01 light-first token system.

## Plan

| Requirement | Files | Validation |
| --- | --- | --- |
| R1 homepage learning entry | `src/pages/Home.tsx` | focused Home tests, public screenshots |
| R2 public study surfaces | `src/pages/WordOfTheDayPage.tsx`, `src/pages/SampleLessonPage.tsx` | word-of-day tests, `/word-of-the-day` and `/demo` screenshots |
| R3 auth surfaces | `src/features/marketing/AuthShell.tsx`, `src/pages/auth/**` | auth i18n tests, auth route screenshots |
| R4 pricing and legal | `src/pages/PricingPage.tsx`, `src/pages/LegalPage.tsx` | pricing tests, pricing/legal screenshots |

## Implementation Notes

- Preserve auth, billing, and legal semantics.
- Use `BrandMark` consistently on public/auth surfaces.
- Remove decorative dot copy from auth reassurance lists.
- Replace generic dashboard wording with concrete "Today" or "今日任务" wording.
- Keep AI references only where they are legally/product-functionally necessary, not as design decoration.

## Browser Matrix

Routes:

- `/`
- `/pricing`
- `/word-of-the-day`
- `/demo`
- `/login`
- `/register`
- `/magic-link`
- `/onboarding`
- `/terms`
- `/privacy`

Viewports:

- desktop 1440x960
- mobile 390x844

Themes:

- light
- dark

## Acceptance Notes

- No black hero or AI SaaS cockpit feel.
- No clipped CTA labels.
- No accidental Chinese/English mixed copy in primary surfaces.
- No checkout path appears while billing is fail-closed.
- Guest and authenticated public entry behavior remains intact.
