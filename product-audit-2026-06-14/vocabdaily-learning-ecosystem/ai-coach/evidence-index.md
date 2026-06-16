# VLE-04 AI Coach Evidence Index

Generated: 2026-06-16

## Validation

- `npm test -- --run src/features/chat src/features/coach src/services/pronunciationScorer.test.ts src/services/evidenceEvents.test.ts src/services/writingAnalytics.test.ts`: 24 files, 224 tests passed.
- `npm test -- --run src/features/chat/runtime/localSyncPolicy.test.ts src/features/chat/runtime/requestPayload.test.ts src/features/coach/coachingPolicy.test.ts src/features/coach/socraticRecovery.test.ts`: 4 files, 52 tests passed.
- `npm run lint`: passed.
- `npm run check:i18n`: passed.
- `npm run build`: passed.
- `BASE_URL=http://127.0.0.1:4173 node product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/ai-coach-surface-smoke.mjs`: 8 checks passed.
- `BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach npm run test:learning-flow-regression`: 114 checks passed.

## Browser Artifacts

- Summary: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/summary.json`
- AI coach smoke: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/ai-coach-surface-smoke.json`
- Desktop chat handoff: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/screenshots/desktop-light-chat-handoff.png`
- Mobile chat handoff: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/screenshots/mobile-light-chat-handoff.png`
- Desktop writing fallback: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/screenshots/desktop-light-writing-local-fallback.png`
- Mobile writing fallback: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/screenshots/mobile-light-writing-local-fallback.png`
- Desktop pronunciation local fallback: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/screenshots/desktop-light-pronunciation-local-fallback.png`
- Mobile pronunciation local fallback: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/screenshots/mobile-light-pronunciation-local-fallback.png`
- Desktop pronunciation AI feedback: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/screenshots/desktop-light-pronunciation-ai-feedback.png`
- Mobile pronunciation AI feedback: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/screenshots/mobile-light-pronunciation-ai-feedback.png`

## Coverage Notes

- Chat handoff smoke confirms a Today-plan prompt fills the composer and remains user-confirmed rather than auto-sent.
- Writing smoke uses local fallback and confirms visible score breakdown, suggestions, and local-only disclosure.
- Pronunciation smoke covers both local-only scoring and AI phoneme feedback with distinct UI states.
- Learning-flow regression covers public pages, dashboard core pages, reading, listening, grammar, pronunciation, writing, vocabulary, profile, and settings across desktop/mobile and light/dark/system themes.
