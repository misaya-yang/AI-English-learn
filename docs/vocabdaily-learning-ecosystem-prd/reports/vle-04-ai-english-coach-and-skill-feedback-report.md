# VLE-04 AI English Coach And Skill Feedback Report

## Phase Summary

- PHASE_ID: VLE-04
- Phase file: `docs/vocabdaily-learning-ecosystem-prd/phase-04-ai-english-coach-and-skill-feedback.md`
- Executor: Codex
- Date: 2026-06-16
- Status: passed

## Scope Executed

- Planned work: Verify and harden bounded AI coach evidence, skill feedback, fallback behavior, privacy gates, and browser evidence.
- Actual work: Added local-auth chat storage short-circuiting, upgraded writing local fallback suggestions, added a localhost-only pronunciation AI feedback test hook, and created desktop/mobile browser smoke for chat handoff, writing fallback, pronunciation local fallback, and pronunciation AI feedback.
- Scope expansions: Added `src/features/chat/runtime/localSyncPolicy.ts` so demo/local chat sessions do not touch remote chat tables, reducing Supabase network-error noise in local-auth flows.
- Scope not executed: No production edge function deploy, no Supabase migration, no billing or entitlement change, no production env var change.

## Evidence Inventory

| Evidence | Path or command | Result |
| --- | --- | --- |
| Plan | `docs/vocabdaily-learning-ecosystem-prd/reports/vle-04-ai-english-coach-and-skill-feedback-plan.md` | Created |
| Focused tests | `npm test -- --run src/features/chat src/features/coach src/services/pronunciationScorer.test.ts src/services/evidenceEvents.test.ts src/services/writingAnalytics.test.ts` | 24 files, 224 tests passed |
| AI golden eval | `npm test -- --run src/features/chat/runtime/localSyncPolicy.test.ts src/features/chat/runtime/requestPayload.test.ts src/features/coach/coachingPolicy.test.ts src/features/coach/socraticRecovery.test.ts` | 4 files, 52 tests passed |
| Lint | `npm run lint` | Passed |
| i18n | `npm run check:i18n` | Passed |
| Build | `npm run build` | Passed |
| AI coach smoke | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/ai-coach-surface-smoke.json` | 8 checks passed, 0 failed |
| Browser route/theme regression | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/summary.json` | 114 checks passed, 0 failed |
| Evidence index | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/evidence-index.md` | Created |

## Implementation Notes

- Chat storage now uses `shouldUseRemoteChatStorage(userId)`. Local-auth IDs stay in local storage for session loading, creation, message persistence, title updates, deletion, and quiz attempts. This prevents demo/local coach flows from creating remote Supabase chat-table noise.
- `gradeLocally` now returns actionable fallback suggestions, so offline IELTS writing feedback still shows dimensions and concrete next edits.
- `scoreWithAi` supports a localhost-only `window.__VOCABDAILY_PRONUNCIATION_ASSESS_MOCK__` hook for browser regression. Production and non-localhost builds still use the Edge Function path and fall back to local scoring on failure.

## Validation Results

| Gate | Command or check | Result | Notes |
| --- | --- | --- | --- |
| Coach/chat/writing/pronunciation tests | `npm test -- --run src/features/chat src/features/coach src/services/pronunciationScorer.test.ts src/services/evidenceEvents.test.ts src/services/writingAnalytics.test.ts` | Passed | 224 focused tests |
| Golden coach eval | `npm test -- --run src/features/chat/runtime/localSyncPolicy.test.ts src/features/chat/runtime/requestPayload.test.ts src/features/coach/coachingPolicy.test.ts src/features/coach/socraticRecovery.test.ts` | Passed | 52 tests |
| Lint | `npm run lint` | Passed | No ESLint errors |
| i18n | `npm run check:i18n` | Passed | Key parity check passed |
| Build | `npm run build` | Passed | Production bundle completed |
| Browser AI coach smoke | `BASE_URL=http://127.0.0.1:4173 node product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/ai-coach-surface-smoke.mjs` | Passed | 8 desktop/mobile checks |
| Browser route/theme regression | `BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach npm run test:learning-flow-regression` | Passed | 114 checks, 0 failed |

## Acceptance Gate Results

| Acceptance gate | Result | Evidence |
| --- | --- | --- |
| Evidence contract covers level, target, due pressure, weak tags, recent mistakes, writing, pronunciation, and daily mission state | Passed | `requestPayload.test.ts`; `learnerContext.test.ts`; `coachStudio.test.ts`; `coachingPolicy.test.ts` |
| Golden scenarios cover beginner vocabulary recovery, IELTS writing, listening/pronunciation issues, and active wordbook context | Passed | `missionCardSelector.test.ts`; `coachingPolicy.test.ts`; `learnerContext.test.ts`; `ai-coach-surface-smoke.json` |
| Coach policy follows diagnosis/question -> small drill -> review action | Passed | `coachingPolicy.test.ts`; `socraticRecovery.test.ts`; chat handoff screenshots |
| Writing fallback shows score, dimensions, suggestions, and local-only state | Passed | `writingAnalytics.test.ts`; writing fallback screenshots |
| Pronunciation feedback separates local score, AI score, phoneme issues, and fallback state | Passed | `pronunciationScorer.test.ts`; pronunciation local and AI screenshots |
| Local-auth chat does not trigger remote chat session/message writes | Passed | `localSyncPolicy.test.ts`; `useSupabaseChat.ts` short-circuit paths; AI coach smoke console checks |

## Compliance Gate Results

| Compliance gate | Result | Evidence |
| --- | --- | --- |
| Prompt payloads include only bounded learner evidence | Passed | `requestPayload.test.ts`; `learnerContext.test.ts` |
| No secrets, auth tokens, billing data, or direct contact data added to prompt payloads | Passed | `requestPayload.ts`; `aiGateway.ts` redaction behavior unchanged |
| Memory writes remain explicit actions | Passed | Chat memory controls unchanged; no automatic memory writes added |
| AI failure has recoverable fallback and does not lose input | Passed | writing fallback smoke; pronunciation local fallback smoke; chat handoff fills composer for user confirmation |
| Local pronunciation AI mock cannot run on production hostnames | Passed | `pronunciationScorer.ts` restricts browser mock to `localhost` and `127.0.0.1` |
| Authenticated/demo routes remain protected without production-user creation | Passed | local-auth storage policy and learning-flow regression |

## Rollback and Recovery

- Rollback path: Revert `src/hooks/useSupabaseChat.ts`, `src/features/chat/runtime/localSyncPolicy.ts`, `src/services/writingAnalytics.ts`, `src/services/pronunciationScorer.ts`, related tests, and VLE-04 audit artifacts.
- Feature flags or toggles: No product flag added. The pronunciation test hook is localhost-only and inert unless a test script sets the window function.
- Data cleanup: None. The phase reduces remote writes for local-auth chat; no migration was added.
- Remaining release risk: Remote AI quality still depends on provider credentials and Supabase function availability. Local fallback now remains usable when those services fail.

## User Waivers

- Waived gate: Remote live AI provider smoke.
- Waived by: Environment limitation.
- Reason: Provider credentials and deployed function state were not changed in this phase. Local mocked evals, fallback paths, and browser evidence passed.
- Remaining risk: Provider-specific prompt/output drift should be checked during VLE-06 production smoke before release.
- Dependent phases may proceed: yes

## Next Phase Handoff

- Dependency unlocked: VLE-05 Learning Workbench UI System.
- Important files changed: `src/hooks/useSupabaseChat.ts`, `src/features/chat/runtime/localSyncPolicy.ts`, `src/services/writingAnalytics.ts`, `src/services/pronunciationScorer.ts`, and `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/ai-coach-surface-smoke.mjs`.
- Known blockers: None for VLE-05.
- Recommended next phase: Audit all dashboard route surfaces against the Modern Learning Workbench visual contract, with special attention to dark-mode surfaces, route fallback/skeleton behavior, nested cards, and desktop-first screenshots.
