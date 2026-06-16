# VLE-05 UI System Evidence Index

Date: 2026-06-16

## Summary

- UI regression: 54 route checks, 10 learning scenarios, 0 failed.
- Learning-flow regression: 114 checks, 0 failed.
- Viewports: desktop 1440x960 and mobile 390x844.
- Themes covered by learning-flow regression: light, dark, and system.

## Key Artifacts

- UI regression summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression/summary.json`
- Desktop contact sheet: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression/contact-sheet-desktop.html`
- Mobile contact sheet: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression/contact-sheet-mobile.html`
- UI screenshots: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression/screenshots/`
- Learning-flow summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/learning-flow/summary.json`
- Theme and route-switch screenshots: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/learning-flow/screenshots/`

## Commands

```bash
npm run lint
npm run check:i18n
npm test -- --run src/components/DashboardSkeleton.test.tsx src/features/learning/components src/pages/dashboard
npm run build
BASE_URL=http://127.0.0.1:4173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression npm run test:ui-regression
BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/learning-flow npm run test:learning-flow-regression
```

## Notes

- The UI regression script was updated to follow the current labels and controls instead of old visual class names.
- Reading, listening, grammar, writing, and pronunciation scenarios all reach their recap states on desktop and mobile.
- VLE-06 should use this evidence as a local preview baseline, then add production smoke before deployment.
