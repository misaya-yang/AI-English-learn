# EN-03 Listening Report

- Status: passed
- Phase: EN-03
- Feature: EN-F003
- Actor: generator
- Date: 2026-06-28

## Scope

- Files inspected: `docs/english-web-optimization-harness/context-profile.json`, `docs/english-web-optimization-harness/loop-state.json`, `docs/english-web-optimization-harness/phase-EN-03.md`, `src/pages/dashboard/ListeningPage.tsx`, `src/services/tts.ts`, `src/services/learningEvents.ts`, `src/services/gamification.ts`.
- Files changed: `src/pages/dashboard/ListeningPage.tsx`, `src/pages/dashboard/ListeningPage.test.tsx`, EN-03 harness report/state files.
- Minimal Change: kept inline listening seed passages and inline SpeechSynthesis hook, repaired transcript discipline copy/event evidence, normalized fill/short-answer scoring, recorded non-zero estimated study minutes, removed listening question count from vocabulary review gamification, added no-voice TTS timeout handling, and added focused component plus browser fallback coverage.

## Plan Followed

1. Confirmed EN-02 dependency evidence: `en-02-speaking-report.md` has `Status: passed` and `en-02-speaking-critic.md` has `Critic Verdict: approved`.
2. Opened only EN-03 primary context before planning.
3. Wrote `docs/english-web-optimization-harness/reports/en-03-listening-plan.md`.
4. Implemented the smallest page-local slice in Listening.
5. Ran focused tests, required shared-service tests, lint, i18n, build, dev-server precheck, UI regression, manual English browser checks, full Vitest, and diff hygiene.

## Code Changes

| Area | Result |
|---|---|
| Transcript policy | Pre-submit transcript action is now explicitly labeled as a fallback, with copy telling learners to listen first when audio works and use transcript for accessibility, silent browsers, or post-submit review. |
| Transcript evidence | First transcript reveal records `listening.transcript_revealed` with `passageId`, `level`, `source`, `beforeSubmit`, and `ttsSupported`. |
| Scoring | Listening now normalizes punctuation/case/spacing and accepts numeric variants such as `15 percent` for a correct answer of `15`. |
| Study session | Listening completion records estimated minutes from duration label/transcript instead of zero minutes. The first clip records `2` minutes from `~90 sec`. |
| Gamification | Listening completion no longer calls `incrementReviewCount`, avoiding inflation of word-review achievements with listening question count. |
| Accessibility | Icon-only reset and skip controls now have `aria-label` and `title`. |
| TTS fallback | Unsupported state has explicit fallback copy and keeps transcript/questions usable. If voices are initially empty, Play waits up to 800ms for `voiceschanged`, then falls back to browser default speech synthesis instead of waiting forever. |

## Validation Evidence

| Command or check | Result | Evidence |
|---|---|---|
| `npm test -- --run src/pages/dashboard/ListeningPage.test.tsx` | passed | 1 file, 6 tests passed |
| `npm test -- --run src/pages/dashboard/ListeningPage.test.tsx src/data/listeningContent.test.ts src/services/learningEvents.strict.test.ts src/services/gamification.test.ts` | passed | 4 existing files, 59 tests passed; `src/services/learningEvents.strict.test.ts` is the repository's learning-events contract file. |
| `npm run lint` | passed | ESLint exited 0 |
| `npm run check:i18n` | passed | i18n key parity check passed |
| `npm run build` | passed | TypeScript and Vite build exited 0; existing Browserslist caniuse-lite age warning only |
| `curl -sSf http://127.0.0.1:5173/ >/dev/null` | passed | Dev server precheck exited 0 |
| `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-03-listening npm run test:ui-regression` | passed | `product-audit-2026-06-28/en-03-listening/summary.json`: 54/54 route checks and 10/10 scenarios passed |
| EN-03 manual English Playwright check | passed | `product-audit-2026-06-28/en-03-listening/manual-english/result.json` |
| EN-03 unsupported-TTS browser Playwright check | passed | `product-audit-2026-06-28/en-03-listening/manual-unsupported-tts/result.json` |
| `npm test -- --run` | passed | 115 files, 868 tests passed |
| `git diff --check` | passed | No whitespace errors |

## Browser Evidence

| Route | Viewport | Theme | Language | Evidence |
|---|---:|---|---|---|
| `/dashboard/listening` | 1440x960 | light | zh seed | `product-audit-2026-06-28/en-03-listening/screenshots/desktop-listening.png`; no overflow, blank page, error boundary, or login redirect |
| `/dashboard/listening` | 390x844 | light | zh seed | `product-audit-2026-06-28/en-03-listening/screenshots/mobile-listening.png`; no overflow, blank page, error boundary, or login redirect |
| `/dashboard/listening` completion | 1440x960 | light | zh seed | `product-audit-2026-06-28/en-03-listening/screenshots/desktop-scenario-listening-completion.png`; review state and score recap captured |
| `/dashboard/listening` completion | 390x844 | light | zh seed | `product-audit-2026-06-28/en-03-listening/screenshots/mobile-scenario-listening-completion.png`; review state captured with 0 horizontal overflow |
| `/dashboard/listening` selected clip | 1440x960 | light | en | `product-audit-2026-06-28/en-03-listening/manual-english/desktop-listening-selected.png`; reset/skip controls and transcript fallback verified |
| `/dashboard/listening` transcript fallback | 1440x960 | light | en | `product-audit-2026-06-28/en-03-listening/manual-english/desktop-transcript-fallback.png`; transcript fallback opened before submit and TTS support recorded as true |
| `/dashboard/listening` review | 1440x960 | light | en | `product-audit-2026-06-28/en-03-listening/manual-english/desktop-review-perfect-score.png`; normalized answers produced `Listening score 5/5` |
| `/dashboard/listening` transcript fallback | 390x844 | light | en | `product-audit-2026-06-28/en-03-listening/manual-english/mobile-transcript-fallback.png`; transcript fallback visible with 0 horizontal overflow |
| `/dashboard/listening` unsupported TTS selected clip | 1440x960 | light | en | `product-audit-2026-06-28/en-03-listening/manual-unsupported-tts/desktop-unsupported-selected.png`; `speechSynthesis` and `SpeechSynthesisUtterance` were simulated as `undefined`, fallback copy visible, audio controls absent |
| `/dashboard/listening` unsupported TTS transcript | 1440x960 | light | en | `product-audit-2026-06-28/en-03-listening/manual-unsupported-tts/desktop-unsupported-transcript.png`; transcript fallback opened before submit with no page errors |
| `/dashboard/listening` unsupported TTS review | 1440x960 | light | en | `product-audit-2026-06-28/en-03-listening/manual-unsupported-tts/desktop-unsupported-review.png`; learner completed questions and reached `Listening score 5/5` without audio APIs |

## Feature Oracle Updates

| Feature | Status | Evidence |
|---|---|---|
| EN-F003 | passing | This report, `docs/english-web-optimization-harness/reports/en-03-listening-critic.md`, focused ListeningPage tests, full Vitest, lint, i18n, build, UI regression, manual English browser evidence, and diff hygiene |

## Regression Evidence

| Area | Result | Notes |
|---|---|---|
| Listening all-answer gate | passed | Focused test verifies submit stays disabled with zero and partial answers. |
| Listening score review | passed | Focused test verifies `15 percent` and `Green gentrification.` score as correct variants. |
| No-voice TTS startup | passed | Focused test verifies an empty `getVoices()` result falls back after 800ms and calls `speechSynthesis.speak()` once. |
| Learning event payload | passed | Focused test verifies completion payload includes `durationMinutes`, `answerCount`, `transcriptRevealedBeforeSubmit`, and `ttsSupported`. |
| Gamification review count | passed | Focused test verifies `incrementReviewCount` is not called by listening completion. |
| Pronunciation and speaking routes | passed | UI regression kept `/dashboard/pronunciation` and `/dashboard/chat` green after EN-03. |
| Reading route | passed | UI regression kept `/dashboard/reading` green after EN-03. |
| Analytics event parsing | passed | `learningEvents.strict.test.ts`, full Vitest, and UI regression passed; no event schema or storage table changes were made. |

## Compliance Evidence

| Gate | Result | Notes |
|---|---|---|
| Transcript reveal deliberate and labeled | passed | Pre-submit action is labeled `Use transcript fallback` and explanatory copy names accessibility/silent-browser/post-submit use. |
| Audio/TTS unsupported state | passed | Focused component test and browser evidence cover unsupported TTS fallback copy, transcript access, disabled incomplete submit, final review, no audio controls, and no page errors. |
| No secret payloads | passed | New event payload contains only passage id, level, source, before-submit flag, TTS support, score, duration, XP, and counts. |
| Settings TTS controls | documented boundary | Listening still uses an inline SpeechSynthesis hook and does not read Settings `ttsEnabled`/voice. This is recorded as a boundary for EN-05 or a future TTS unification phase; no broader hook/service rewrite was required for EN-03. |
| Accessible audio controls | passed | Reset and skip icon buttons have accessible names and titles. |
| Browser autoplay/permission | passed | No autoplay was added; learner still initiates audio with Play. |

## Blockers

- None for EN-03.
- Residual boundary: Listening still uses prototype SpeechSynthesis and estimated progress, not real audio-duration progress. No-voice startup now has an 800ms fallback, but true utterance progress remains unavailable.
- Residual boundary: Settings TTS toggle/voice is not wired into Listening's inline hook; current phase documents rather than expands this boundary.
- Residual boundary: rendered Listening content remains inline in `ListeningPage.tsx`; `src/data/listeningContent.ts` is still a candidate/test path.

## Handoff

- Next action: execute EN-04 Reading using `docs/english-web-optimization-harness/phase-EN-04.md`.
- Dependent phase unlock: EN-04 is unlocked after EN-F003 passes and critic approval is recorded.
- Carry-forward: EN-04 should mirror EN-03's honesty fixes for reading time, scoring, and review-count semantics instead of treating reading questions as vocabulary reviews.
