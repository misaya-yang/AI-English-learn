# VGUI-00 Plan

Date: 2026-06-17
Phase: VGUI-00 Baseline UI Audit And Inventory

## Plan

1. Verify baseline commands: lint, i18n, build, and full Vitest.
2. Start the production preview build locally.
3. Capture UI regression screenshots for every scoped route at desktop 1440x960 and mobile 390x844.
4. Inspect the regression summary for failures, overflow, redirects, error boundaries, and blank/low-content pages.
5. Record evidence in the phase report and update the harness runtime files.

## Expected Evidence

- Command outputs from `npm run lint`, `npm run check:i18n`, `npm run build`, and `npm test -- --run`.
- `product-audit-2026-06-17/global-ui/baseline/summary.json`.
- `product-audit-2026-06-17/global-ui/baseline/contact-sheet-desktop.html`.
- `product-audit-2026-06-17/global-ui/baseline/contact-sheet-mobile.html`.
- `product-audit-2026-06-17/global-ui/baseline/screenshots/`.
