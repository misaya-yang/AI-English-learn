# VD-02 Dark Mode Repair Plan

## Status

planned

## Scope

Repair the shared dark-mode foundation without doing the broader VD-03 product redesign. This phase covers theme tokens, pre-paint initialization, route fallback/loading surfaces, and browser evidence for light/dark/system themes.

## Current Findings

- VD-01 is passing: production registration/login was verified with 3 synthetic accounts.
- Current dark tokens are visually unstable: background/card/sidebar values sit in a muddy gray range while some deployed surfaces still read as black blocks.
- `index.html`, `ThemeContext`, and `scripts/learning-flow-regression.mjs` use inconsistent theme-version strings, so tests can accidentally exercise migration behavior instead of explicit dark mode.
- Legacy `glow-*` and `premium-*` compatibility utilities still allow heavy dark shadows.
- `DashboardSkeleton` is already compact, but it still needs validation against route switching and theme modes.

## Implementation Steps

1. Align theme version constants across `index.html`, `ThemeContext`, and regression scripts.
2. Replace dark tokens in `src/index.css` with a restrained charcoal study palette: readable foregrounds, non-black backgrounds, clear borders, subdued accents.
3. Flatten dark shadows/glow utilities so dark mode does not produce neon or cockpit-like panels.
4. Tune dark public home background and metadata theme color to match the new palette before paint.
5. Extend learning-flow regression checks so dark-mode failures catch near-black full-page backgrounds and stale skeletons.
6. Run repo checks and browser regression at desktop `1440x960` and mobile `390x844`.

## Acceptance Evidence

- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- `npm test -- --run`
- `BASE_URL=<local preview> LEARNING_FLOW_OUT_DIR=product-audit-2026-06-17/vd-02-dark-mode npm run test:learning-flow-regression`
- Screenshots saved under `product-audit-2026-06-17/vd-02-dark-mode/screenshots`

## Boundaries

- Do not touch auth semantics, billing, Supabase migrations, or IELTS card content.
- Do not introduce a UI library or broad page redesign.
- Do not use the user's Chrome.
