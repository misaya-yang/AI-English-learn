# VLE-05 Learning Workbench UI System Plan

## Objective

Prove the dashboard now behaves like one coherent English learning workbench across desktop, mobile, light, dark, and system themes, and remove stale regression assumptions that still targeted the old UI.

## Execution Steps

1. Audit the VLE-05 contract and current UI system surfaces:
   - theme pre-paint behavior
   - dashboard skeleton
   - `LearningWorkspace` accent tokens
   - dashboard route pages
   - UI regression scripts
2. Verify the current visible copy and controls against the product direction:
   - direct learning task labels
   - no visible cockpit-style product language
   - no full-screen black fallback
   - readable review and recap states
3. Harden the UI regression script:
   - align route-flow button selectors with current labels such as "开始这篇", "开始这段", and "开始这组"
   - answer reading/listening controls by option semantics instead of stale visual classes
   - generate desktop and mobile contact sheet HTML files from captured screenshots
4. Run VLE-05 validation:
   - lint
   - i18n
   - focused dashboard/UI tests
   - production build
   - UI regression on desktop 1440x960 and mobile 390x844
   - learning-flow regression across themes and route switching
5. Record evidence, update the feature oracle, and hand off to VLE-06 release readiness.

## Edit Boundaries

In scope:

- `scripts/ui-regression.mjs`
- VLE-05 report and audit evidence
- runtime harness files

Audited but not changed in this slice:

- `src/index.css`
- `index.html`
- `src/components/DashboardSkeleton.tsx`
- `src/features/learning/components/LearningWorkspace.tsx`
- dashboard route pages

Out of scope:

- billing files
- production deployment config
- production data mutation
- AI prompt behavior
- parser/import logic

## Acceptance Criteria

- UI regression passes with zero failed route checks and zero failed scenario checks.
- Desktop and mobile contact sheets exist and point to current screenshots.
- Learning-flow regression passes all checks, including retry/reveal, theme, and route-switch coverage.
- `npm run lint`, `npm run check:i18n`, focused tests, and `npm run build` all pass.
- VLE-06 is unlocked only with durable evidence paths.

## Rollback Plan

Revert `scripts/ui-regression.mjs` and VLE-05 audit artifacts. No runtime data cleanup or migration is needed because this slice does not mutate production data.
