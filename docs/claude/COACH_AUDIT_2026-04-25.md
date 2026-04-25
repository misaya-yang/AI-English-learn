# COACH-* Audit

Audited: 2026-04-25

Scope: COACH-01..04 from `docs/claude/VOCABDAILY_REQUIREMENTS_BACKLOG.md`.
Doc-only verdict — the Dev agent owns any code follow-ups.

## COACH-01 — Feed real learner context into chat

**Verdict: implemented.**

`src/pages/dashboard/ChatPage.tsx:409-416` builds a `learnerProfile` via
`buildChatLearnerProfile({ learningProfile, weakTags, learnerModel,
recentMistakes })` and passes it into every `sendMessage` call site
(lines 650, 689, 714, 746, 782, 987, 1118). The shared policy module
(`src/features/coach/coachingPolicy.ts:166-216`) normalises both the
canonical `weaknessTags` and legacy `weakTags` into a single deduped
list, with a unit test in `src/features/coach/coachingPolicy.test.ts`
covering that path. `buildCoachSystemPrompt` (lines 288-385) injects
level, target, exam type, daily minutes, due count, learner mode,
burnout risk, weakness tags, stubborn topics, and recent errors into
the system prompt with graceful skipping when fields are missing.

## COACH-02 — Surface coaching actions in chat UI

**Verdict: implemented.**

`src/features/chat/components/CoachActionPanel.tsx` renders a compact
"Coach: next step" panel with buttons that map each action type to an
icon, label, duration hint, and `sendPrompt` runner. It is mounted from
`src/features/chat/components/ChatMessageBubble.tsx:138`, which means
every assistant turn that emitted `coaching_actions` shows the panel
inline. Empty/no-action responses are handled by
`hasCoachActionPanel(...)` which short-circuits to `null` when the
parsed payload is empty (`src/features/chat/utils/coachActions.ts`).
Selection logic is unit-tested in
`src/features/chat/utils/coachActions.test.ts`.

## COACH-03 — Review queue integration

**Verdict: implemented.**

`src/services/coachingActionRouter.ts` turns `schedule_review` and
`retry_with_hint` actions into `ReviewQueueItem`s via
`toReviewQueueItems` and persists them through
`addCoachReviewItems(userId, ...)`. The store
(`src/services/coachReviewQueue.ts`) writes IndexedDB locally and
syncs to Supabase `coach_review_queue` with idempotency keys, exposing
`getCoachReviews`, `markCoachReviewCompleted`, and dedupe-aware insert.
`src/features/coach/CoachReviewRail.tsx` renders due/upcoming buckets
with completion buttons inside `ReviewPage.tsx` (lines 304, 419).
`src/features/learning/reviewQueue.ts:12-13` documents that coach items
are surfaced separately and never folded into FSRS due lists. Tests:
`src/features/coach/reviewRailLogic.test.ts`,
`src/services/coachReviewQueue.test.ts`,
`src/services/coachingActionRouter.test.ts`.

## COACH-04 — Socratic error recovery

**Verdict: implemented.**

`src/features/coach/socraticRecovery.ts:55-97` builds an api-side prompt
that explicitly forbids the model from revealing the correct answer,
asks for one Socratic question + one hint + a retry invitation, and
mandates a `retry_with_hint` action (with optional `schedule_review`).
The visible learner-facing message is short and bilingual.
`ChatPage.tsx:1105-1118` invokes it on a wrong quiz attempt and routes
through `sendMessage` so the resulting actions hit the existing
COACH-02/03 pipelines. Behaviour is unit-tested in
`src/features/coach/socraticRecovery.test.ts`. The base
`COACHING_POLICY` rule "Do not simply hand over answers" reinforces the
contract on every turn.

## Summary for the Dev agent

All four COACH items are believed implemented end-to-end. The only
remaining COACH-area task surfaced by this audit is QA-02 (the byte
identity drift guard between client and edge policy copies); a spec is
provided in `docs/claude/QA_02_DRIFT_GUARD_SPEC.md`.
