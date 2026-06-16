# Continuity Ledger

## Decisions

- Default visual direction is Modern Learning Workbench: light-first, quiet surfaces, semantic accents, fewer nested cards, and no generic AI cockpit copy.
- Lexicon is the product anchor: imported words, custom words, progress, practice links, review links, and source/license metadata must stay visible.
- Practice correctness semantics must distinguish first-try correct, recovered after retry, and needs review.
- Local-auth coach/chat sessions stay local and must not create Supabase chat-table write noise.
- Writing and pronunciation must keep useful local fallback states when online AI is unavailable.
- Pronunciation AI feedback browser regression uses a localhost-only mock hook; production hostnames still use the Edge Function path.
- Production deployment, production database migration, billing behavior changes, and external deck downloads require explicit approval.

## Evidence Anchors

- VLE-00 baseline report: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-report.md`.
- VLE-01 lexicon report: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-01-lexicon-and-wordbook-ecosystem-report.md`.
- VLE-01 browser summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/summary.json`.
- VLE-01 interaction smoke: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/interaction-smoke.json`.
- VLE-02 import/export report: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-02-anki-import-export-experience-report.md`.
- VLE-02 browser summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/summary.json`.
- VLE-02 interaction smoke: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/interaction-smoke.json`.
- VLE-03 daily-loop report: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-03-daily-loop-and-practice-routing-report.md`.
- VLE-03 browser summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/summary.json`.
- VLE-03 practice smoke: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/practice-attempt-smoke.json`.
- VLE-04 AI coach report: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-04-ai-english-coach-and-skill-feedback-report.md`.
- VLE-04 browser summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/summary.json`.
- VLE-04 AI coach smoke: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/ai-coach-surface-smoke.json`.
- VLE-05 UI system report: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-05-learning-workbench-ui-system-report.md`.
- VLE-05 UI regression summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression/summary.json`.
- VLE-05 learning-flow summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/learning-flow/summary.json`.
- VLE-05 desktop contact sheet: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression/contact-sheet-desktop.html`.
- VLE-05 mobile contact sheet: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression/contact-sheet-mobile.html`.
- VLE-06 release report: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-06-regression-eval-and-release-report.md`.
- VLE-06 UI regression summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/ui-regression/summary.json`.
- VLE-06 learning-flow summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/learning-flow/summary.json`.
- VLE-06 production smoke: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/prod-smoke-post-deploy.txt`.
- VLE-06 public browser smoke: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/e2e-prod-smoke-post-deploy.json`.
- VLE-06 bad-token smoke: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/bad-token-smoke-post-deploy.json`.
- Vercel deployment: `dpl_14ifbn7oSx6jG5zFE4rFrrWN3wDU`, aliased to `https://www.uuedu.online`.

## Blockers

- Supabase project `zjkbktdmwencnouwfrij.supabase.co` closes TLS connections from this environment. Production frontend and bad-token smoke passed, but authenticated Supabase-backed features need provider/network investigation.
