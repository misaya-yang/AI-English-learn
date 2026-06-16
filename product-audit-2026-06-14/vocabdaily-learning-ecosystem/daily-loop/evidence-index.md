# VLE-03 Daily Loop Evidence Index

Generated: 2026-06-16

## Validation

- `npm test -- --run src/features/practice/attemptState.test.ts src/pages/dashboard/PracticePage.test.tsx src/features/learning/sessionRecap.test.ts src/services/evidenceEvents.test.ts src/services/learningEvents.strict.test.ts`: 5 files, 46 tests passed.
- `npm run lint`: passed.
- `npm run check:i18n`: passed.
- `npm run build`: passed.
- `BASE_URL=http://127.0.0.1:4173 node product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/practice-attempt-smoke.mjs`: 6 checks passed.
- `BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop npm run test:learning-flow-regression`: 114 checks passed.

## Browser Artifacts

- Summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/summary.json`
- Practice attempt smoke: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/practice-attempt-smoke.json`
- Desktop choice first wrong: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/desktop-light-practice-first-wrong.png`
- Desktop choice recovered: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/desktop-light-practice-recovered.png`
- Desktop choice revealed: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/desktop-light-practice-revealed.png`
- Desktop listening first wrong: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/desktop-light-listening-first-wrong.png`
- Desktop listening revealed: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/desktop-light-listening-revealed.png`
- Mobile choice first wrong: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/mobile-light-practice-first-wrong.png`
- Mobile choice recovered: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/mobile-light-practice-recovered.png`
- Mobile choice revealed: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/mobile-light-practice-revealed.png`
- Mobile listening first wrong: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/mobile-light-listening-first-wrong.png`
- Mobile listening revealed: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/screenshots/mobile-light-listening-revealed.png`

## Coverage Notes

- Browser smoke seeds a local-auth learner and confirms local practice events do not trigger remote `path_progress_events` console errors.
- Choice smoke covers first wrong hidden-answer state, recovered-after-retry state, and second-wrong reveal state.
- Listening smoke uses keyboard Enter for both attempts to verify button/keyboard parity.
- Learning-flow regression covers public pages, dashboard core pages, reading, listening, grammar, pronunciation, writing, vocabulary, profile, and settings across desktop/mobile and light/dark/system themes.
