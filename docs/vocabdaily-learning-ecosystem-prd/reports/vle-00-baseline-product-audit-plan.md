# VLE-00 Baseline Product Audit Plan

## Phase

- PHASE_ID: VLE-00
- Phase file: `docs/vocabdaily-learning-ecosystem-prd/phase-00-baseline-product-audit.md`
- Objective: record the current product, UI, route, data, import, AI, and regression baseline before implementation phases continue.

## Execution Map

| Requirement or gate | Evidence source | Output |
| --- | --- | --- |
| Route and surface inventory | `src/App.tsx`, `src/features/learning/routeRegistry.ts`, route inventory `rg` command | Report route table |
| Lexicon and import capability map | `src/pages/dashboard/VocabularyBankPage.tsx`, `src/data/localStorage.ts`, `src/services/bookImport.ts`, `src/services/ankiApkgImport.ts`, `src/services/wordBookExport.ts`, `src/contexts/UserDataContext.tsx` | Report lexicon/import map |
| AI feedback map | `src/pages/dashboard/ChatPage.tsx`, `src/hooks/useSupabaseChat.ts`, `src/services/aiExamCoach.ts`, `src/services/pronunciationScorer.ts`, `src/services/evidenceEvents.ts`, Supabase AI functions | Report AI evidence map |
| UI evidence index | Existing `product-audit-2026-06-14/learning-flow-regression/summary.json` and `product-ui-audit-2026-06-14` waves | Evidence index and report screenshot references |
| Validation | route inventory search, strict harness validator | Report validation table |

## Boundaries

This phase writes only:

- `docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-plan.md`
- `docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-report.md`
- `product-audit-2026-06-14/vocabdaily-learning-ecosystem/baseline/evidence-index.md`

No product source, Supabase code, package files, or deployment config should change in VLE-00.

## Verification

- `rg -n "path=|DashboardRouteId|VocabularyBankPage|ImportAnkiApkgDialog|ai-grade-writing|pronunciation-assess" src supabase scripts`
- `python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-learning-ecosystem-prd --strict --quality-score`

