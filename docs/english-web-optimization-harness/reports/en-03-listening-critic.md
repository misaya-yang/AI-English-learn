# EN-03 Listening Critic

Critic Verdict: approved

- Phase: EN-03
- Feature: EN-F003
- Actor: critic
- Critic: independent subagent Lumen, separate read-only context
- Date: 2026-06-28
- Actor Report Reviewed: `docs/english-web-optimization-harness/reports/en-03-listening-report.md`

## Reviewed Evidence

| Evidence | Result |
|---|---|
| Current EN-03 diff | Scope is bounded to `src/pages/dashboard/ListeningPage.tsx`, `src/pages/dashboard/ListeningPage.test.tsx`, and EN-03 harness evidence/state files. |
| `docs/english-web-optimization-harness/reports/en-03-listening-report.md` | Actor report records scope, code changes, validation, browser evidence, compliance gates, residual boundaries, and EN-04 handoff. |
| `product-audit-2026-06-28/en-03-listening/manual-unsupported-tts/result.json` | Unsupported browser run passed with TTS APIs simulated as undefined, fallback copy visible, audio controls absent, transcript access, disabled incomplete submit, final 5/5 review, 0 overflow, and no page errors. |
| `product-audit-2026-06-28/en-03-listening/manual-english/result.json` | Supported browser run passed for transcript fallback, answer gate, normalized scoring, desktop/mobile overflow, and no page errors. |
| `product-audit-2026-06-28/en-03-listening/summary.json` | UI regression passed 54/54 route checks and 10/10 scenarios. |

## Findings

| Area | Verdict | Evidence |
|---|---|---|
| Prior unsupported-TTS gate | approved | Support detection now requires `window.speechSynthesis` plus `window.SpeechSynthesisUtterance`, and browser evidence verifies unsupported fallback when both are undefined. |
| No-voice TTS startup | approved | Empty voice-list startup waits up to 800ms for `voiceschanged`, then calls browser default `speechSynthesis.speak()`; focused test covers the timeout path. |
| Transcript discipline | approved | Pre-submit transcript action is deliberately labeled as fallback and records `listening.transcript_revealed` once with source and before-submit metadata. |
| Scoring and review | approved | Normalized scoring handles punctuation/case/spacing and numeric variants; browser and focused tests verify `Listening score 5/5` for accepted variants. |
| Learning evidence | approved | Completion records non-zero estimated minutes and no longer increments vocabulary review count from listening question totals. |
| Scope discipline | approved | No external audio, Supabase, provider, deployment, dependency, Reading, or Practice changes were introduced. |

## Residual Risks

- Listening still uses prototype SpeechSynthesis with estimated progress rather than true utterance progress.
- Settings TTS controls remain a documented boundary for EN-05 or a future TTS unification phase.
- Rendered Listening content remains inline in `ListeningPage.tsx`; `src/data/listeningContent.ts` remains a candidate/test path.
- Critic did not independently rerun full validation commands; it reviewed the diff, actor report, focused paths, and evidence artifacts read-only.

## Verdict

- Approved.
- EN-F003 may remain `passing`.
- EN-04 Reading is unlocked with the carry-forward rule that Reading must preserve honest time accounting, scoring evidence, and avoid vocabulary review-count inflation.
