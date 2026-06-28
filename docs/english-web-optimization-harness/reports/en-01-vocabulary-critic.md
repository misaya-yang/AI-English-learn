# EN-01 Vocabulary Critic

Critic Verdict: approved

- Phase: EN-01
- Feature: EN-F001
- Actor: critic
- Critic: independent subagent Raman, separate read-only context
- Independent reviewer: subagent Raman reviewed the EN-01 diff and evidence from a separate read-only context.
- Date: 2026-06-28
- Actor Report Reviewed: `docs/english-web-optimization-harness/reports/en-01-vocabulary-report.md`

## Reviewed Evidence

| Evidence | Result |
|---|---|
| Current EN-01 diff | Scope remains inside Vocabulary, Add/CSV import/Anki dialogs, and focused Vocabulary tests. No Supabase, billing, deployment, package-lock, schema, provider, or dependency changes found. |
| `npm test -- --run src/pages/dashboard/VocabularyBankPage.test.tsx` | passed: 1 file, 9 tests |
| `npm test -- --run src/features/lexicon/lexicalEntry.test.ts src/data/wordBooks.test.ts src/services/wordBookExport.test.ts src/pages/dashboard/VocabularyBankPage.test.tsx` | passed: 4 files, 21 tests |
| `npm run lint` | passed |
| `npm run check:i18n` | passed |
| `npm run build` | passed with existing Browserslist age warning only |
| `npm test -- --run` | passed: 114 files, 857 tests |
| `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-01-vocabulary npm run test:ui-regression` | passed: 54/54 checks |
| Manual English browser evidence | passed: `manual-english/result.json`, `dark-and-dialogs-result.json`, `post-critic-result.json` |
| `git diff --check` | passed |

## Initial Findings And Resolution

| Finding | Resolution | Evidence |
|---|---|---|
| P1: Keyboard Enter/Space on nested pronunciation button could bubble to the row and open the detail dialog. | fixed | `src/pages/dashboard/VocabularyBankPage.tsx` now returns when `event.target !== event.currentTarget`; `src/pages/dashboard/VocabularyBankPage.test.tsx` covers nested pronunciation keyboard/click behavior; `post-critic-result.json` covers it in browser. |
| P2: Controlled AddWordDialog Cancel called internal `setOpen(false)` and could fail to close when opened from Vocabulary. | fixed | `src/components/AddWordDialog.tsx` now calls `setDialogOpen(false)`; `src/pages/dashboard/VocabularyBankPage.test.tsx` covers controlled Cancel close; `post-critic-result.json` covers it in browser. |

## Verdict

- Approved.
- No remaining EN-01 blocker found in the reviewed diff.
- EN-02 may proceed, with Vocabulary route/link/import/export contracts preserved.
