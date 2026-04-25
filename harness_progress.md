# VocabDaily Harness Progress

A running ledger of each Ralph loop iteration. Newest entries at the bottom.
Each entry uses the format defined in `CLAUDE_CODE_RALPH_PROMPT.md` step 8.

---

## 2026-04-24 20:55 - P0-OPS-1..4 (Billing fail-closed + prod env guard)

- Changed:
  - `supabase/functions/billing-webhook-stripe/index.ts`: replaced fail-open
    Stripe signature verification with a `StripeSignatureResult` discriminated
    union. Missing `STRIPE_WEBHOOK_SECRET` now returns 503
    (`webhook_not_configured`); bad signatures still return 400.
  - `supabase/functions/billing-create-checkout/index.ts`: introduced
    `BillingNotConfiguredError`. Stripe checkout throws when
    `STRIPE_SECRET_KEY` or `STRIPE_PRICE_PRO_*` is missing instead of
    synthesising a `?mock=1` success URL. Alipay path also throws (not yet
    implemented). Handler maps these to HTTP 503
    (`billing_provider_not_configured`).
  - New migration `supabase/migrations/20260424120000_billing_fail_closed_rls.sql`:
    drops client INSERT/UPDATE policies on `billing_customers`,
    `subscriptions`, and `user_entitlements` (the worst was a `FOR ALL`
    on `user_entitlements` that let a logged-in user flip their own plan to
    `pro` from the client). Adds explicit `service_role` ALL policies so
    Edge Functions keep working.
  - `src/lib/supabase.ts`: extracted `resolveSupabaseEnv()`. In production
    (`import.meta.env.PROD === true` or `MODE === 'production'`), missing
    `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` throws an explicit error
    rather than silently falling through to the dev project credentials.
    Whitespace-only values are treated as missing.
  - New `src/lib/supabase.test.ts`: 6 cases covering dev fallback, prod
    success, prod missing-each-var, and whitespace handling.
  - New `src/lib/billingFailClosed.test.ts`: 9 source-text guard tests that
    fail if anyone reverts the webhook fail-open, the mock-success
    fallback, or the RLS migration's drops.

- Verified:
  - `npx vitest run src/lib/supabase.test.ts src/lib/billingFailClosed.test.ts`
    → 15/15 passed.
  - `npm test` → 25 files, 315 tests, all green.
  - `npm run build` → tsc + vite build clean (only the pre-existing 500 kB
    chunk-size warning remains).

- Deploy:
  - Vercel auto-deploy will pick up the frontend changes (`src/lib/supabase.ts`)
    on push to `main`.
  - Supabase pieces are NOT deployed by Vercel and need separate commands:
    * `supabase functions deploy billing-webhook-stripe`
    * `supabase functions deploy billing-create-checkout`
    * `supabase db push` (applies the new RLS migration)
  - Required Supabase secrets to set BEFORE redeploying functions or the
    webhook will start returning 503:
    * `STRIPE_WEBHOOK_SECRET`
    * `STRIPE_SECRET_KEY`
    * `STRIPE_PRICE_PRO_MONTHLY`
    * `STRIPE_PRICE_PRO_YEARLY`
  - Required Vercel env on the production project:
    * `VITE_SUPABASE_URL`
    * `VITE_SUPABASE_ANON_KEY`
    (If either is missing the SPA bundle will throw at module load — by
    design.)

- Risks:
  - Until the four Stripe secrets are wired up in Supabase, the production
    webhook will return 503 and checkout will return 503
    (`billing_provider_not_configured`). This is the intended fail-closed
    state but should be coordinated with whoever owns Stripe config.
  - The `user_entitlements` `FOR ALL` policy was the only path a non-
    service caller had to mutate plan state. Need to confirm the Edge
    Functions / `_shared/supabase-admin.ts` use the service role — quick
    grep shows they do (`adminUpsert` in webhook + checkout).
  - Alipay is now hard-disabled (returns 503). UI should hide the option
    until backend is implemented; tracked as a follow-up.

- Next:
  - P0 AI Coach #5: introduce shared `COACHING_POLICY` used by both
    `src/features/chat/runtime/requestPayload.ts` and
    `supabase/functions/ai-chat/index.ts`.
  - Then P0 AI Coach #6: reconcile `weakTags` ↔ `weaknessTags` so
    `learningContext` always sends the canonical name.

---

## 2026-04-25 02:15 - P1-COACH-1 (Shared COACHING_POLICY + learning loop actions)

- Changed:
  - New module `src/features/coach/coachingPolicy.ts` (and a byte-identical
    copy at `supabase/functions/_shared/coaching-policy.ts` so the Deno Edge
    Function consumes the same rules). The module has zero imports so it
    compiles in both Node/jsdom and Deno without translation. It exports:
    * `COACHING_POLICY_VERSION` (`'1.0.0'`)
    * `LearnerContext`, `CoachingAction`, `ReviewQueueItem`, error/action
      enum types
    * `normalizeLearningContext()` — merges legacy `weakTags` with canonical
      `weaknessTags`, validates learner-mode/burnout-risk enums, clamps
      arrays, drops malformed `recentErrors`.
    * `buildCoachSystemPrompt(ctx, opts)` — one source of truth for the
      coach's system prompt: hard rules (no answer dumping, error-typed
      correction, specific praise, always end with a next step, recovery
      mode under burnout), Socratic teaching rhythm (notice → diagnose →
      socratic nudge → micro practice → reflection), and the JSON schema
      for `coaching_actions` the model must emit.
    * `parseCoachingActions(envelope)` — tolerant parser that pulls actions
      from a root-level array OR an `artifacts[type=coaching_actions]`
      entry, validates each entry against the action/error enums, requires
      a non-empty prompt, and clamps to 6.
    * `toReviewQueueItems(actions, opts)` — converts `schedule_review`
      and `retry_with_hint` actions into FSRS-ready review items with a
      stable FNV-1a id, propagates skill/targetWord/dueAt.
  - `src/features/chat/runtime/requestPayload.ts`: builds the system prompt
    via `buildCoachSystemPrompt` from the shared module instead of a
    hard-coded string. The legacy `SYSTEM_PROMPT` export is kept but now
    delegates to the policy. The outgoing `learningContext` carries the
    canonical `weaknessTags` plus the full learner-model fields (level,
    target, examType, dueCount, learnerMode, burnoutRisk, stubbornTopics,
    recommendedDailyReview, predictedRetention30d, recentErrors). The
    payload also carries `coachingPolicyVersion` so the Edge Function
    can detect drift.
  - `src/types/chatAgent.ts`: re-exports `CoachingAction` and
    `LearnerContext`, adds optional `learnerProfile` to `SendMessageOptions`,
    adds `coachingActions?: CoachingAction[]` to `ChatEdgeResponse`, and
    `coachingPolicyVersion` to `AgentMeta`.
  - `src/hooks/useSupabaseChat.ts`: forwards `options.learnerProfile` into
    the chat assistant request context so callers can supply a richer
    learner snapshot end to end.
  - `supabase/functions/ai-chat/index.ts`: imports the shared policy from
    `../_shared/coaching-policy.ts`. `DEFAULT_SYSTEM_PROMPT` is now
    `buildCoachSystemPrompt({}, …)`. `buildPedagogicalSystemContext` is
    rewritten to delegate to the shared `buildCoachSystemPrompt` — same
    code path used by the client. Server now also normalises
    `mergedLearningContext` so `weaknessTags` is always present (fixing the
    silent drop the memory engine had been hitting). Both the streaming
    and non-streaming paths now extract `coachingActions` from the model's
    response and surface them on the response envelope alongside
    `agentMeta.coachingPolicyVersion`.
  - `supabase/functions/_shared/memory-engine.ts`: `collectStableMemoryItems`
    now accepts both `learningContext.weaknessTags` (canonical) and
    `learningContext.weakTags` (legacy fallback) so weakness memories are
    no longer silently dropped during the rollout.
  - New `src/features/coach/coachingPolicy.test.ts`: 31 cases exercising
    the contract — normalisation, prompt content (Socratic, error types,
    coaching_actions schema, learner citations, recovery framing, exam
    framing, empty-context fallback, no-generic-praise rule), action
    parsing (root, artifacts, validation, clamp), review-queue conversion
    (stable ids, default windows, skill propagation), an integration case,
    and a guard test that asserts the two policy file copies stay
    byte-identical.

- Verified:
  - `npx vitest run src/features/coach/coachingPolicy.test.ts` → 31/31
    passed.
  - `npx vitest run` (full) → 26 files, 346 tests, all green (315 prior
    + 15 from Round 1 + 31 from this round + 0 unrelated drift).
  - `npm run build` → tsc + vite build clean.
  - Browser smoke: Vite dev server on `127.0.0.1:4173` returned 200 for
    `/`; force-imported `requestPayload.ts` (23.7 KB transformed) and
    `coachingPolicy.ts` (48.3 KB transformed) — no compiler errors in dev
    log.

- Deploy:
  - Frontend changes flow through Vercel automatically once `main` is
    pushed.
  - Edge Function changes need a manual redeploy:
    * `supabase functions deploy ai-chat`
    (memory-engine and coaching-policy are bundled with that function via
    relative imports.)
  - No new migrations required.
  - **Not pushed.** This vertical slice is safe to push independently of
    the still-pending Stripe-secret rollout from Round 1, since it only
    affects the AI coach prompt path. Confirm before pushing.

- Risks:
  - Older client builds in users' tabs will keep sending the static
    SYSTEM_PROMPT and only `weakTags`. The Edge Function now handles both,
    so this is graceful — but the streaming path's coaching-actions
    extraction requires the model to actually emit the JSON block. Until
    the model warms up to the new contract, expect mostly
    `coachingActions === undefined` in responses, which is the documented
    fallback behaviour.
  - `parseCoachingActions` runs against `extractFirstJsonObject` on
    streamed text. If the model emits a JSON envelope at the very start
    (legacy structured output) without a coaching_actions field, we
    correctly return `[]`. If it emits a partial coaching_actions array,
    only the valid entries land — the rest are silently dropped.
  - The COACHING_POLICY adds ~3 KB to the system prompt vs the previous
    static one. Within DeepSeek's context budget, but worth monitoring
    `contextMeta.budgetUsed.system` in production telemetry.

- Next:
  - P1 Learning Loop #11: surface `coachingActions` to the chat UI and
    persist `schedule_review` items into the FSRS review queue / mistake
    collector. The shared `toReviewQueueItems` helper is ready; needs a
    consumer in `useSupabaseChat` + a small queue writer service.
  - P1 Learning Loop #12: feed the learner-model snapshot
    (level/target/dueCount/burnoutRisk/recentErrors) into
    `SendMessageOptions.learnerProfile` from the dashboard hooks (today's
    page, exam page) so the coach actually receives it.

---

## 2026-04-25 11:15 - P1-LEARN-1 (Persist coachingActions into a real review queue)

- Changed:
  - New `src/services/coachReviewQueue.ts`: localStorage-backed queue keyed
    by the FNV-1a id from the policy module. Items are deduped on id, so
    a replayed action refreshes `dueAt`/`prompt` instead of doubling up.
    Queue is capped at 500 entries (drops completed first, then oldest
    open) so a runaway model emission can't blow out localStorage. Public
    surface: `addCoachReviewItems`, `getCoachReviews({ includeCompleted })`,
    `getDueCoachReviews({ now })`, `markCoachReviewCompleted`,
    `clearCoachReviewQueue`. Storage failures (private mode, SSR,
    QuotaExceeded) degrade silently — never throw.
  - New `src/services/coachingActionRouter.ts`: thin dispatch layer.
    `applyCoachingActions(actions, { userInputRef, now })` calls the
    policy's `toReviewQueueItems` to filter `schedule_review` and
    `retry_with_hint` actions into review items, then writes them via
    `addCoachReviewItems`. Returns `{ reviewItems, persisted }` for
    telemetry / UI affordance hooks.
  - `src/features/chat/runtime/assistantReply.ts`: after the assistant
    message is appended, call `applyCoachingActions(result.coachingActions,
    { userInputRef: assistantMessage.id })`. Wrapped in try/catch — a
    storage hiccup must not fail the chat turn. On success, fires a
    `chat_coaching_actions_persisted` experiment event with surface, mode,
    persistedCount, and the skill list.
  - 19 new tests across the two services:
    * Queue: persistence, dedupe-on-id, dueAt refresh, due-only filter,
      completed-skipping, malformed-storage recovery, empty input no-op,
      cap, insertion order, defensive guard when localStorage throws,
      `Date.now()` default for the due check.
    * Router: persists schedule_review and retry_with_hint, ignores
      celebrate_effort / ask_socratic_question / micro_task /
      reflection_prompt, returns the typed reviewItems, idempotent on
      replay, no-op for undefined / empty actions, drops actions that
      lack the skill needed to schedule.

- Verified:
  - `npx vitest run src/services/coachReviewQueue.test.ts
    src/services/coachingActionRouter.test.ts` → 19/19 passed.
  - Full vitest suite: 28 files, 365/365 tests (346 prior + 19 new), all
    green.
  - `npm run build` → tsc + vite build clean.
  - Browser smoke: vite dev server on `127.0.0.1:4173` returned 200 for
    `/`, force-imported the two new services + the updated assistantReply
    pipeline (router 3 KB, queue 13.7 KB, assistantReply 38.3 KB
    transformed). No errors in dev log.

- Deploy:
  - Pure frontend change. Vercel auto-deploy is sufficient.
  - No Edge Function or Supabase changes required this round.
  - Storage layer is localStorage; no migrations.

- Risks:
  - Review queue lives in localStorage, so it does not roam across
    devices. Until we promote to Supabase, a learner who clears their
    browser storage loses scheduled reviews. Acceptable as a v1 — the
    Edge Function still persists weakness memories independently, and the
    AI coach will re-derive scheduling on subsequent turns.
  - The router fires AFTER the assistant message is durably appended, so
    a network hiccup between "reply rendered" and "review persisted" is
    possible. Idempotency on FNV-1a id makes a manual retry safe; the
    AI's next turn will typically re-issue the same action anyway.
  - Cap of 500 is deliberately generous. If a user accumulates that many
    open reviews, they have a much bigger problem than a clamp — the
    coach should already be in recovery mode (covered by the policy in
    Round 2).

- Next:
  - P1 Learning Loop #12: surface the persisted review queue in the UI
    so the user sees "you scheduled X reviews" affordance after a chat
    turn, and the daily plan can pull due items from
    `getDueCoachReviews()`. Quickest impact: show count under the chat
    composer or in the Today hero.
  - P1 Learning Loop #13: feed `learnerProfile` from the today/exam
    dashboards into `SendMessageOptions` so the policy's learner-model
    section is no longer empty in production. Right now the Edge
    Function still falls back to the empty-context branch of the policy
    because no caller supplies the snapshot.

---

## 2026-04-25 11:30 - COACH-01 (Feed Real Learner Context Into Chat)

- Changed:
  - `src/features/chat/utils/learnerContext.ts`: new
    `buildChatLearnerProfile({ learningProfile, weakTags, learnerModel,
    recentMistakes })` returns `Partial<LearnerContext>`. Helpers:
    `mapBurnoutBucket` (0–1 → 'low' | 'medium' | 'high', NaN/Infinity
    safe, clamped) and `mapMistakeCategoryToErrorType` (case-insensitive
    keyword bucketing of free-form `MistakeEntry.category` strings into
    the canonical `CoachingErrorType` set, returns undefined for
    miscellaneous so the entry still surfaces the word without a wrong
    skill tag). Promotes `weakTags` onto the canonical `weaknessTags`
    field; the request payload still carries `weakTags` separately so
    older Edge Function revisions stay compatible.
  - `src/features/chat/utils/learnerContext.test.ts` (new): 14 cases —
    bucketing, dedupe, drop empty target / non-positive dailyMinutes,
    learnerModel field mapping (mode, burnoutRisk, dueCount,
    recommendedDailyReview), predictedRetention rescaling 0–100 → 0–1,
    recent-error sort-by-recency + cap at 6 + filter out eliminated +
    note formatting from userAnswer/correctAnswer, unknown category
    passthrough with skill=undefined, and a round-trip through
    `normalizeLearningContext` proving the legacy `weakTags` merge rule
    still wins for callers that supply both.
  - `src/pages/dashboard/ChatPage.tsx`: pull `progress`, `streak`, and
    `activeBookSummary` from `useUserData`. New memoised
    `chatLearnerModelSnapshot` (= `computeLearnerModel(userId, progress,
    streak.current, activeBookSummary.dailyGoal)` when there is
    progress). New `getChatLearnerProfile` callback that reads
    `getMistakes({ eliminated: false })` fresh on each invocation so
    practice errors land in the next chat turn even if the React tree
    has not re-rendered. Threads `learnerProfile: getChatLearnerProfile()`
    into all five `sendMessage(...)` call sites (manual send, quick
    prompt, manual quiz button, force web search, quiz batch
    requester) and updates each `useCallback` dep array.

- Verified:
  - `npx vitest run src/features/chat/utils/learnerContext.test.ts` →
    14/14 passed.
  - `npx vitest run` (full) → 29 files, 379/379 (366 prior + 14 new).
    Zero regressions in the existing coachingPolicy /
    coachReviewQueue / coachingActionRouter suites.
  - `npm run build` → tsc + vite clean. ChatPage chunk grew slightly
    (122.7 KB) — within budget.
  - Browser smoke: vite dev server on `127.0.0.1:4173` returned 200 for
    `/`, transformed `learnerContext.ts` (26 KB) and `ChatPage.tsx`
    (227 KB) without errors.

- Deploy:
  - Pure frontend change. Vercel auto-deploy is sufficient.
  - No Edge Function or migration changes.
  - The coach Edge Function already handles the canonical
    `weaknessTags` and the learner-model fields (Round 2 work).

- Risks:
  - `chatLearnerModelSnapshot` recomputes on every progress mutation —
    cheap (O(n) over wordProgress) but worth keeping an eye on for
    learners with large libraries.
  - `getMistakes()` is a synchronous localStorage read on every send.
    Acceptable for v1 (the queue caps at a few hundred entries) but
    should move to a hook with a memoised snapshot once the mistake
    collector grows or moves to IndexedDB.
  - `learnerProfile` payload now adds ~200–400 bytes to the chat
    request when populated. Within DeepSeek context budget; the
    server-side context-engine still clips `learning_context` before
    it hits the model.

- Next:
  - COACH-02: surface `coachingActions` in the chat UI as a compact
    "Next step" affordance the learner can act on (retry,
    schedule_review, micro_task). The actions are already extracted on
    the response (Round 2) and persisted into the review queue (Round
    3); only the UI surface is missing.
  - COACH-03: integrate the persisted coach review queue into the
    Review/Practice loop so `getDueCoachReviews()` items appear
    visually distinct from FSRS-due cards.

