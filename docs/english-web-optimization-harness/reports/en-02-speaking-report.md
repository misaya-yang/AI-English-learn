# EN-02 Speaking Report

- Status: passed
- Phase: EN-02
- Feature: EN-F002
- Actor: generator
- Date: 2026-06-28

## Scope

- Files inspected: `docs/english-web-optimization-harness/context-profile.json`, `docs/english-web-optimization-harness/loop-state.json`, `docs/english-web-optimization-harness/phase-EN-02.md`, `src/pages/dashboard/PronunciationPage.tsx`, `src/hooks/usePronunciationSession.ts`, `src/services/pronunciationScorer.ts`, `src/pages/dashboard/ChatPage.tsx`, `src/features/chat/components/RoleplayMode.tsx`, `src/features/chat/components/ChatComposer.tsx`, `src/data/roleplayScenarios.ts`.
- Files changed: `src/services/pronunciationScorer.ts`, `src/services/pronunciationScorer.test.ts`, `src/pages/dashboard/PronunciationPage.tsx`, `src/pages/dashboard/ChatPage.tsx`, `src/features/chat/components/RoleplayMode.tsx`, `src/features/chat/components/ChatComposer.tsx`, `src/features/chat/components/chatVisualContract.test.ts`, EN-02 harness report/state files.
- Minimal Change: fixed speech-recognition no-result/timeout settlement, added direct text-speaking fallback from Pronunciation to Chat, made local-only scoring visibly explicit, exposed existing roleplay scenarios/objectives/progress inside Chat without changing chat request payloads, and fixed ChatComposer quick prompt language selection.

## Validation Evidence

| Command or check | Result | Evidence |
|---|---|---|
| `npm test -- --run src/services/pronunciationScorer.test.ts` | passed | 1 file, 20 tests passed |
| `npm test -- --run src/services/pronunciationScorer.test.ts src/data/roleplayScenarios.test.ts src/features/chat/components/chatVisualContract.test.ts src/features/chat/runtime/quizSequenceState.test.ts src/features/chat/utils/quickPrompts.test.ts` | passed | 5 files, 54 tests passed |
| `npm run lint` | passed | ESLint exited 0 |
| `npm run check:i18n` | passed | i18n key parity check passed |
| `npm run build` | passed | TypeScript and Vite build exited 0; existing Browserslist caniuse-lite age warning only |
| `curl -sSf http://127.0.0.1:5173/ >/dev/null` | passed | Dev server precheck exited 0 |
| `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-02-speaking npm run test:ui-regression` | passed | `product-audit-2026-06-28/en-02-speaking/summary.json`: 54/54 route checks and 10/10 scenarios passed |
| EN-02 manual English Playwright check | passed | `product-audit-2026-06-28/en-02-speaking/manual-english/result.json` |
| `npm test -- --run` | passed | 114 files, 862 tests passed |
| `git diff --check` | passed | No whitespace errors |

## Browser Evidence

| Route | Viewport | Theme | Language | Evidence |
|---|---:|---|---|---|
| `/dashboard/pronunciation` | 1440x960 | light | zh seed | `product-audit-2026-06-28/en-02-speaking/screenshots/desktop-pronunciation.png`; no overflow, blank page, error boundary, or login redirect |
| `/dashboard/pronunciation` | 390x844 | light | zh seed | `product-audit-2026-06-28/en-02-speaking/screenshots/mobile-pronunciation.png`; no overflow, blank page, error boundary, or login redirect |
| `/dashboard/chat` | 1440x960 | light | zh seed | `product-audit-2026-06-28/en-02-speaking/screenshots/desktop-chat.png`; no overflow, blank page, error boundary, or login redirect |
| `/dashboard/chat` | 390x844 | light | zh seed | `product-audit-2026-06-28/en-02-speaking/screenshots/mobile-chat.png`; no overflow, blank page, error boundary, or login redirect |
| `/dashboard/pronunciation -> /dashboard/chat` | 1440x960 | light | en | `product-audit-2026-06-28/en-02-speaking/manual-english/pronunciation-unsupported-fallback-chat.png`; unsupported SpeechRecognition shows direct text-speaking fallback and loads a Chat prompt |
| `/dashboard/pronunciation` | 1440x960 | light | en | `product-audit-2026-06-28/en-02-speaking/manual-english/pronunciation-no-result-fallback.png`; mocked no-result `onend` shows `No speech detected` and fallback CTA |
| `/dashboard/chat` | 1440x960 | light | en | `product-audit-2026-06-28/en-02-speaking/manual-english/chat-roleplay-progress.png`; roleplay scenario selector, objectives, key phrases, progress, completion score, and composer prompt verified |

## Feature Oracle Updates

| Feature | Status | Evidence |
|---|---|---|
| EN-F002 | passing | This report, `docs/english-web-optimization-harness/reports/en-02-speaking-critic.md`, focused tests, full Vitest, lint, i18n, build, UI regression, and manual English browser evidence |

## Regression Evidence

| Area | Result | Notes |
|---|---|---|
| Speech no-result lifecycle | passed | `listenOnce` now rejects on `onend` without result and on timeout; focused unit tests cover result, error, onend, and timeout |
| Pronunciation local scoring | passed | Existing scorer tests plus UI regression pronunciation completion passed; local-only state is explicit when AI feedback is unavailable |
| Chat normal flow shell | passed | Chat route regression and quiz runtime tests passed; Chat request payload/runtime not changed |
| Chat quiz answer-hiding | passed | `quizSequenceState.test.ts` remained green |
| Roleplay visibility | passed | Chat now exposes a bounded roleplay shell using existing scenario data, objectives, key phrases, self-tracked progress, and completion score |
| English quick prompts | passed | ChatComposer now chooses `prompt.text` in English mode; visual contract test covers the branch |

## Compliance Evidence

| Gate | Result | Notes |
|---|---|---|
| Microphone denial/no-result | passed | No-result `onend` is settled and shows retry/text-practice fallback; unsupported browser state links to text speaking practice |
| Transcript privacy | passed | No new transcript persistence was added; pronunciation records remain session-local |
| AI fallback disclosure | passed | Local analysis state explains that score uses transcript, pace, and confidence only when AI phoneme feedback is unavailable |
| Roleplay prompt safety | passed | Uses existing repository scenario prompts and does not request secrets, provider actions, or policy bypass |
| Accessible controls | passed | Record button aria labels preserved; roleplay objective toggles are buttons with `aria-pressed` |

## Blockers

- None for EN-02.
- Residual boundary: pronunciation attempt metadata remains session-local and is not persisted into learning events. This was intentionally not expanded because it would touch broader learner-event contracts; EN-05 remains responsible for cross-module progress evidence.
- Residual boundary: Chat voice-input unsupported state still hides the microphone button; Pronunciation now has a direct fallback, but Chat voice-input fallback can be revisited if EN-05 treats Chat as a learning-center control.
- Residual boundary: successful Edge Function fallback provenance is not distinguishable from true AI feedback without a provider/function response-shape change, which is outside EN-02 protected boundaries.

## Handoff

- Next action: execute EN-03 Listening using `docs/english-web-optimization-harness/phase-EN-03.md`.
- Dependent phase unlock: EN-03 is unlocked after EN-F002 passes and critic approval is recorded.
- Carry-forward: Listening should not assume speaking progress is persisted; it can rely on speaking route fallback and Chat roleplay visibility only.
