# VLE-02 Import Export Evidence Index

Generated: 2026-06-16

## Validation

- `npm test -- --run src/services/ankiApkgImport.test.ts src/services/bookImport.test.ts src/services/wordBookExport.test.ts src/pages/dashboard/VocabularyBankPage.test.tsx`: 4 files, 12 tests passed.
- `npm run lint`: passed.
- `npm run check:i18n`: passed.
- `npm run build`: passed.
- `BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export npm run test:learning-flow-regression`: 114 checks passed.
- `BASE_URL=http://127.0.0.1:4173 node product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/import-export-interaction-smoke.mjs`: 5 checks passed.

## Browser Artifacts

- Summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/summary.json`
- Interaction smoke: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/interaction-smoke.json`
- CSV preview: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/screenshots/desktop-light-csv-preview.png`
- APKG preview: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/screenshots/desktop-light-apkg-preview.png`
- Desktop vocabulary light: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/screenshots/desktop-light-vocabulary.png`
- Desktop vocabulary dark: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/screenshots/desktop-dark-vocabulary.png`
- Mobile vocabulary light: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/screenshots/mobile-light-vocabulary.png`
- Mobile vocabulary dark: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/screenshots/mobile-dark-vocabulary.png`
- Fast route switch: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/screenshots/desktop-light-fast-route-switch.png`

## Download Artifacts

- Latest CSV with progress: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/downloads/CSV导入-1781619680658-2026-06-16.csv`
- Latest Anki TXT: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/downloads/CSV导入-1781619680658-2026-06-16.txt`
- Latest import error report: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/downloads/wordbook-import-errors-1781619680996.json`

## Coverage Notes

- CSV smoke covers preview, duplicate count, invalid-row error report download, import activation, and post-import next actions.
- APKG smoke covers deck preview, field names, sample rows, mapping confidence, field mapping controls, progress mode, import activation, and mapped progress.
- Learning-flow regression covers public pages, dashboard core pages, reading, listening, grammar, pronunciation, writing, vocabulary, profile, and settings across desktop/mobile and light/dark/system themes.
