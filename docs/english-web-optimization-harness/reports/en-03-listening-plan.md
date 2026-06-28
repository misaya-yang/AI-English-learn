# EN-03 Listening Plan

- Phase: EN-03
- Feature: EN-F003
- Status: planned
- Date: 2026-06-28

## Evidence Read

- Dependency evidence: `docs/english-web-optimization-harness/reports/en-02-speaking-report.md` has `Status: passed`; `docs/english-web-optimization-harness/reports/en-02-speaking-critic.md` has `Critic Verdict: approved`.
- Phase contract: `docs/english-web-optimization-harness/phase-EN-03.md` requires transcript discipline, scoring integrity, TTS fallback, learning-event integrity, browser evidence, and critic approval.
- Primary context opened: `src/pages/dashboard/ListeningPage.tsx`, `src/services/tts.ts`, `src/services/learningEvents.ts`, `src/services/gamification.ts`.

## Selected Slice

Implement EN-F003 inside `/dashboard/listening` without external audio, schema, Reading, Practice, or dependency changes.

## Planned Changes

- `src/pages/dashboard/ListeningPage.tsx`: add pure scoring/session helpers; accept answer variants with normalized comparison; record non-zero estimated study minutes; remove listening question count from vocabulary review gamification; add transcript reveal event payload; make transcript labels explicit before and after answering; add accessible names to icon-only controls; keep TTS unsupported flow usable.
- `src/pages/dashboard/ListeningPage.test.tsx`: add focused component tests for transcript discipline, incomplete-submit gate, variant scoring/session payload, transcript reveal event, and avoiding review-count inflation.
- Harness docs: write EN-03 report/critic and update oracle/state/log/handoff/source-packet/continuity after validation.

## Validation Commands

- `npm test -- --run src/pages/dashboard/ListeningPage.test.tsx`
- `npm test -- --run src/pages/dashboard/ListeningPage.test.tsx src/data/listeningContent.test.ts src/services/learningEvents.strict.test.ts src/services/gamification.test.ts`
- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- `curl -sSf http://127.0.0.1:5173/ >/dev/null`
- `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-03-listening npm run test:ui-regression`
- `git diff --check`

## Browser Checks

- English light mode `/dashboard/listening` at 1440x960 and 390x844.
- Select clip, play/pause/reset/skip controls, transcript reveal label before questions, incomplete submit disabled, completed review with score/explanations/transcript.
- TTS unsupported or fallback status captured if available in the browser environment.

## Boundaries

- No external audio assets or providers.
- No Supabase/schema/provider edits.
- No Reading/Practice route edits.
- If Settings TTS integration needs broader hook/service redesign, record it as an inline-TTS boundary in the report instead of expanding scope.
