# EN-02 Speaking Critic

Critic Verdict: approved

- Phase: EN-02
- Feature: EN-F002
- Actor: critic
- Critic: independent subagent Rawls, separate read-only context
- Date: 2026-06-28
- Actor Report Reviewed: `docs/english-web-optimization-harness/reports/en-02-speaking-report.md`

## Reviewed Evidence

| Evidence | Result |
|---|---|
| Current EN-02 diff | Scope is bounded to pronunciation, Chat roleplay shell, ChatComposer prompt localization, scorer/tests, and EN-02 harness docs. Caveat: the dirty worktree also contains completed EN-01 vocabulary/import changes, so the whole worktree must not be described as EN-02-only. |
| `npm test -- --run src/services/pronunciationScorer.test.ts src/data/roleplayScenarios.test.ts src/features/chat/components/chatVisualContract.test.ts src/features/chat/runtime/quizSequenceState.test.ts src/features/chat/utils/quickPrompts.test.ts` | passed: 5 files, 54 tests |
| `npm run lint` | passed |
| `npm run check:i18n` | passed |
| `npm run build` | passed with existing Browserslist age warning only |
| `npm test -- --run` | passed: 114 files, 862 tests |
| `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-02-speaking npm run test:ui-regression` | passed: 54/54 route checks and 10/10 scenarios |
| Manual English browser evidence | passed: `product-audit-2026-06-28/en-02-speaking/manual-english/result.json` |
| `git diff --check` | passed |

## Findings

| Finding | Verdict | Evidence |
|---|---|---|
| Speech no-result/timeout settlement | approved | `src/services/pronunciationScorer.ts` uses single-settle cleanup, `onend` rejection, timeout rejection, and `stop()` on timeout; `src/services/pronunciationScorer.test.ts` covers result, `onend`, error, and timeout. |
| Pronunciation fallback | approved | `src/pages/dashboard/PronunciationPage.tsx` links unsupported Web Speech and error/no-result states to text speaking practice in Chat. |
| Local-only scoring disclosure | approved | `src/pages/dashboard/PronunciationPage.tsx` clearly labels local analysis when `hasAiFeedback` is false. |
| Chat roleplay shell | approved | `src/pages/dashboard/ChatPage.tsx` and `src/features/chat/components/RoleplayMode.tsx` expose selector, objectives, progress toggles, completion score, and prompt handoff without changing chat request payload/runtime. |
| English quick prompts | approved | `src/features/chat/components/ChatComposer.tsx` renders `prompt.text` in English mode and `prompt.textZh` in Chinese mode. |

## Residuals

- Pronunciation records remain session-local and are not durable learning-event evidence.
- Chat voice-input unsupported behavior still hides the microphone button; Pronunciation now has the direct fallback required by EN-02.
- Edge-function fallback provenance cannot distinguish provider fallback from true AI feedback without a Supabase function response-shape change.

## Verdict

- Approved.
- No remaining EN-02 blocker found in the reviewed diff.
- EN-03 may proceed, with the dirty-worktree caveat that EN-01 and EN-02 changes are both present.
