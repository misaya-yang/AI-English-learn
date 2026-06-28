# EN-02 Speaking Plan

Status: planned

## Scope

Execute EN-02 / EN-F002 only. Keep product changes centered on `/dashboard/pronunciation`, the speech-recognition wrapper/session, and bounded Chat fallback links.

## Planned Changes

1. Fix `listenOnce` so Web Speech `onend` without a result rejects instead of leaving the session pending.
2. Add timeout/settlement safety to the pronunciation listening wrapper and unit tests for result, error, end-without-result, and timeout paths.
3. Improve unsupported speech-recognition UI with a direct fallback to `/dashboard/chat` using a speaking-practice prompt.
4. Make local-only pronunciation scoring visible as an explicit feedback state when AI phoneme feedback is unavailable.
5. Preserve existing Chat runtime, quiz sequence, voice input, scoring fallback, and route contracts; do not claim a complete roleplay route unless browser/source evidence proves it.

## Validation Plan

- `npm run lint`
- `npm run check:i18n`
- `npm test -- --run src/services/pronunciationScorer.test.ts src/data/roleplayScenarios.test.ts src/features/chat/components/chatVisualContract.test.ts src/features/chat/runtime/quizSequenceState.test.ts src/features/chat/utils/quickPrompts.test.ts`
- `npm run build`
- `curl -sSf http://127.0.0.1:5173/ >/dev/null`
- `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-02-speaking npm run test:ui-regression`
- `git diff --check`

## Evidence To Write

- `reports/en-02-speaking-report.md`
- `reports/en-02-speaking-critic.md`
- EN-F002 update in `feature-oracle.json`
- Session update in `progress-log.md`
- Code facts in `source-packet.md` and `continuity-ledger.md`
- Handoff update in `agent-handoff.md`
