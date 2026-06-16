# VLE-00 Baseline Evidence Index

## Current-State Command Evidence

- Route and capability inventory command:
  - `rg -n "path=|DashboardRouteId|VocabularyBankPage|ImportAnkiApkgDialog|ai-grade-writing|pronunciation-assess" src supabase scripts`
  - Result: passed; found public routes, dashboard routes, Vocabulary page/import dialog, AI writing function, pronunciation function, route registry, and auth dashboard tests.

- Harness validation:
  - `python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-learning-ecosystem-prd --strict --quality-score`
  - Result: passed; quality score 100 excellent.

## Screenshot Evidence Already Present In Current Worktree

Learning-flow regression evidence:

- Summary: `product-audit-2026-06-14/learning-flow-regression/summary.json`
- Result in summary: 114 checks, 0 failed.
- Routes covered include public pages and dashboard learning pages.
- Themes covered: light, dark, system.
- Viewports covered: desktop 1440x960, mobile 390x844.

Required VLE-00 route screenshots:

| Route | Desktop light | Mobile light |
| --- | --- | --- |
| `/dashboard/today` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-today.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-today.png` |
| `/dashboard/practice` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-practice.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-practice.png` |
| `/dashboard/vocabulary` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-vocabulary.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-vocabulary.png` |
| `/dashboard/chat` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-chat.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-chat.png` |
| `/dashboard/writing` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-writing.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-writing.png` |
| `/dashboard/listening` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-listening.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-listening.png` |

Prior UI audit evidence:

- Audit report: `product-ui-audit-2026-06-14/UI_AUDIT_REPORT.md`
- Upgrade todo: `product-ui-audit-2026-06-14/UI_UPGRADE_TODO.md`
- Latest full UI wave summary: `product-ui-audit-2026-06-14/regression-wave5/summary.json`

