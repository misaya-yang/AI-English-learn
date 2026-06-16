# VLE-01 Lexicon Evidence Index

Generated: 2026-06-16

## Validation

- `npm run lint`: passed.
- `npm run check:i18n`: passed.
- `npm run build`: passed.
- `npm test -- --run src/features/lexicon src/pages/dashboard/VocabularyBankPage.test.tsx src/services/evidenceEvents.test.ts`: 3 files, 22 tests passed.
- `BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon npm run test:learning-flow-regression`: 114 checks passed.
- `BASE_URL=http://127.0.0.1:4173 node product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/lexicon-interaction-smoke.mjs`: 9 checks passed.

## Browser Artifacts

- Summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/summary.json`
- Interaction smoke: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/interaction-smoke.json`
- Desktop light: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/screenshots/desktop-light-vocabulary.png`
- Desktop dark: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/screenshots/desktop-dark-vocabulary.png`
- Desktop system: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/screenshots/desktop-system-vocabulary.png`
- Mobile light: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/screenshots/mobile-light-vocabulary.png`
- Mobile dark: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/screenshots/mobile-dark-vocabulary.png`
- Mobile system: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/screenshots/mobile-system-vocabulary.png`
- Interaction screenshot: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/screenshots/desktop-light-vocabulary-interaction-smoke.png`

## Coverage Notes

- Vocabulary page browser summary has no horizontal overflow, no blank body, no long skeleton, and no error boundary for desktop/mobile light/dark/system.
- Interaction smoke covers search, status filter, topic filter, pronunciation button, lexicon practice link, active-book switch, export dialog, and custom word delete control accessibility.
