# EN-01 Vocabulary Plan

Status: passed

## Scope

Execute EN-01 / EN-F001 only. Keep product changes centered on `/dashboard/vocabulary` and its direct vocabulary import/export dialogs.

## Planned Changes

1. Localize accidental English-mode Chinese in `VocabularyBankPage.tsx`: export dialog, export/import toasts, import summary, stat cards, filters, book badges, detail action buttons, and empty search state.
2. Add direct empty-state add/import actions while preserving the existing menu actions.
3. Add keyboard activation for word rows that use `div role="button"`.
4. Extend scope to `src/components/ImportWordBookDialog.tsx`, `src/components/ImportAnkiApkgDialog.tsx`, and narrow placeholders in `src/components/AddWordDialog.tsx` because these dialogs are opened from the Vocabulary route and are part of EN-01 import/add acceptance.
5. Add focused tests for English-mode copy and row keyboard activation in `VocabularyBankPage.test.tsx`.

## Validation Plan

- `npm run lint`
- `npm run check:i18n`
- `npm test -- --run src/features/lexicon/lexicalEntry.test.ts src/data/wordBooks.test.ts src/services/wordBookExport.test.ts src/pages/dashboard/VocabularyBankPage.test.tsx`
- `npm run build`
- `curl -sSf http://127.0.0.1:5173/ >/dev/null`
- `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-01-vocabulary npm run test:ui-regression`
- `git diff --check`

## Evidence To Write

- `reports/en-01-vocabulary-report.md`
- `reports/en-01-vocabulary-critic.md`
- EN-F001 update in `feature-oracle.json`
- Session update in `progress-log.md`
- Code facts in `source-packet.md` and `continuity-ledger.md`
- Handoff update in `agent-handoff.md`
