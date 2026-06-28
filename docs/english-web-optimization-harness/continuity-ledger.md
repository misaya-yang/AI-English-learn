# Continuity Ledger

## Phase Chain

| Phase | Feature | Depends on | Unlocks | Handoff boundary | Required writeback |
|---|---|---|---|---|---|
| EN-01 | EN-F001 | none | EN-02 | Vocabulary data, lexicon UI, import/export, word detail, practice/review links | Source packet code facts, lexicon test evidence, vocabulary screenshots, oracle evidence |
| EN-02 | EN-F002 | EN-01 | EN-03 | Pronunciation and roleplay use lexicon and daily-word evidence without changing lexicon contracts | Speaking fallback notes, microphone evidence, roleplay objective evidence, oracle evidence |
| EN-03 | EN-F003 | EN-02 | EN-04 | Listening uses learning event and progress contracts without redefining speaking or vocabulary flows | TTS state, transcript policy, scoring evidence, event payload notes |
| EN-04 | EN-F004 | EN-03 | EN-05 | Reading adds evidence-location and scoring behavior without replacing listening or vocabulary contracts | Reading scoring notes, generated-passage fallback notes, event payload evidence |
| EN-05 | EN-F005 | EN-04 | none | Learning center verifies Today, Review, Analytics, Settings, Profile, and Learning Path across all prior modules | Whole-demand regression, terminal report, final critic artifact |

## Interface Decisions

| Interface | Current fact | Evidence | Inherited by |
|---|---|---|---|
| Route registry | Dashboard metadata lives in `src/features/learning/routeRegistry.ts` and is consumed by shell navigation | `src/features/learning/routeRegistry.ts`, `src/layouts/DashboardLayout.tsx` | All phases |
| Route drift | `SearchPalette` still uses hard-coded quick links and is not fully derived from route registry | `src/components/SearchPalette.tsx` | All navigation-touching phases |
| Local auth seed | Browser regression scripts seed local auth and profile state through localStorage | `scripts/ui-regression.mjs`, `scripts/learning-flow-regression.mjs` | All browser phases |
| Vocabulary source | Vocabulary combines built-in words, custom words, word books, and progress | `src/pages/dashboard/VocabularyBankPage.tsx`, `src/data/wordBooks.ts`, `src/data/localStorage.ts` | EN-01, EN-02, EN-05 |
| Vocabulary TTS | Vocabulary pronunciation calls `speakEnglishText`; Settings TTS toggle/voice influence is unproven | `src/pages/dashboard/VocabularyBankPage.tsx`, `src/services/tts.ts`, `src/pages/dashboard/SettingsPage.tsx` | EN-01, EN-05 |
| Pronunciation scoring | AI scoring falls back to local scoring and records `hasAiFeedback`; speech recognition uses Web Speech API and can hang on no-result `onend` without repair | `src/services/pronunciationScorer.ts`, `src/hooks/usePronunciationSession.ts`, `src/hooks/useSpeechRecognition.ts` | EN-02, EN-05 |
| Roleplay visibility | Roleplay components and scenarios exist, but the visible Chat route contract does not prove a full roleplay flow | `src/pages/dashboard/ChatPage.tsx`, `src/features/chat/components/RoleplayMode.tsx`, `src/data/roleplayScenarios.ts` | EN-02, EN-05 |
| Listening audio | Listening uses inline seed passages and an inline SpeechSynthesis/TTS hook with transcript fallback; `src/data/listeningContent.ts` is a candidate/test path, not the current render source | `src/pages/dashboard/ListeningPage.tsx`, `src/services/tts.ts`, `src/data/listeningContent.ts` | EN-03, EN-05 |
| Reading generation | Reading uses inline seed passages and simulates generated passage fallback from seed passages; `src/data/readingContent.ts` is a candidate/test path, not the current render source | `src/pages/dashboard/ReadingPage.tsx`, `src/data/readingContent.ts` | EN-04, EN-05 |
| Learning evidence | Today, Review, Reading, Listening, Chat, and Analytics share learning events, evidence events, missions, and progress | `src/services/learningEvents.ts`, `src/services/evidenceEvents.ts`, `src/pages/dashboard/AnalyticsPage.tsx` | EN-05 |
| State persistence | localStorage drives primary learner state; IndexedDB stores FSRS progress, logs, events, and sync queue; local/demo auth cannot prove remote Supabase sync | `src/data/localStorage.ts`, `src/lib/localDb.ts`, `src/services/syncQueue.ts`, `src/services/learningEvents.ts` | All phases |
| Learning-center drift | EN-05 repaired Settings clear-data by adding localStorage namespace cleanup plus an IndexedDB delete helper after destructive confirmation; Today hard flags remain daily flags and copy now says Review scheduling updates only after rating in Review | `src/pages/dashboard/SettingsPage.tsx`, `src/data/localStorage.ts`, `src/lib/localDb.ts`, `src/pages/dashboard/TodayPage.tsx` | final harness |

## Browser Baseline Evidence

| Evidence set | Scope | Notes |
|---|---|---|
| `product-audit-2026-06-28/english-web-harness-recheck/` | Default zh mode, 10 dashboard routes, desktop/mobile | No console errors or horizontal overflow observed in the sweep. |
| `product-audit-2026-06-28/english-web-harness-recheck-en/` | English mode after Settings UI switch, same routes/viewports | No console errors or horizontal overflow; residual Chinese appears in Vocabulary learner content, Today word fields, Settings tabs, and Profile material labels. |

## Code Summary Writeback Rule

Every phase runner must append a short code-fact update to this ledger and to `source-packet.md` before handoff. The update must name inspected files, changed files, preserved contracts, validation evidence, and downstream assumptions.

## Dependency Unlock Rule

Dependent phases stay blocked until the prior phase has a passed or waived feature-oracle item, a passed actor report, and a separate approved or waived critic artifact. EN-05 must run whole-demand regression across EN-F001 through EN-F005 before the full harness can be called complete.

## EN-01 Code Fact Writeback

| Field | Fact |
|---|---|
| Date | 2026-06-28 |
| Phase | EN-01 Vocabulary |
| Changed files | `src/pages/dashboard/VocabularyBankPage.tsx`; `src/components/AddWordDialog.tsx`; `src/components/ImportWordBookDialog.tsx`; `src/components/ImportAnkiApkgDialog.tsx`; `src/pages/dashboard/VocabularyBankPage.test.tsx`; EN-01 harness report/state files |
| Preserved contracts | `/dashboard/vocabulary` route, Practice query links, Review query links, wordbook source/license display, built-in delete protection, import/export services, local/demo auth seed, no dependency or backend changes |
| Implemented facts | English-mode Vocabulary chrome now covers stats, filters, book badges, export/import toasts, import summary, export dialog, empty search, detail actions, add/import dialogs, and Anki field labels. Empty state now has direct add/import actions. Word rows now respond to Enter/Space only when the row itself has focus, so nested pronunciation controls do not open details. Controlled AddWordDialog Cancel now closes via `onOpenChange`. |
| Verification | Focused EN-01 suite 4 files/21 tests passed; full Vitest 114 files/857 tests passed; lint/i18n/build passed; UI regression 54/54 passed; English desktop/mobile browser checks passed; dark empty-search/add/import dialog checks passed; post-critic nested-audio and controlled-cancel browser check passed; `git diff --check` passed. |
| Downstream assumptions | EN-02 may rely on Vocabulary English chrome and lexicon links being stable. Vocabulary TTS still calls `speakEnglishText`; Settings-wide TTS control verification remains an EN-05 boundary unless a future phase changes TTS behavior. |

## EN-02 Code Fact Writeback

| Field | Fact |
|---|---|
| Date | 2026-06-28 |
| Phase | EN-02 Speaking |
| Changed files | `src/services/pronunciationScorer.ts`; `src/services/pronunciationScorer.test.ts`; `src/pages/dashboard/PronunciationPage.tsx`; `src/pages/dashboard/ChatPage.tsx`; `src/features/chat/components/RoleplayMode.tsx`; `src/features/chat/components/ChatComposer.tsx`; `src/features/chat/components/chatVisualContract.test.ts`; EN-02 harness report/state files |
| Preserved contracts | `/dashboard/pronunciation`, `/dashboard/chat`, chat send payload/runtime, quiz sequence state, local scoring fallback, roleplay scenario data shape, no Supabase/provider/dependency changes |
| Implemented facts | `listenOnce` now settles on result, error, `onend` without result, start failure, and timeout. Pronunciation unsupported/error states link to text-speaking Chat fallback. Local-only scoring is explicitly labeled. Chat exposes a bounded roleplay selector with objectives, key phrases, progress toggles, completion score, and composer prompt. ChatComposer quick prompts use English text in English mode. |
| Verification | Focused EN-02 suite 5 files/54 tests passed; full Vitest 114 files/862 tests passed; lint/i18n/build passed; UI regression 54/54 and 10/10 scenarios passed; manual English unsupported/no-result/roleplay browser checks passed; `git diff --check` passed. |
| Downstream assumptions | EN-03 may rely on route-level speaking fallback and Chat roleplay visibility only. Speaking records remain session-local and are not a durable learning-event source. |

## EN-03 Code Fact Writeback

| Field | Fact |
|---|---|
| Date | 2026-06-28 |
| Phase | EN-03 Listening |
| Changed files | `src/pages/dashboard/ListeningPage.tsx`; `src/pages/dashboard/ListeningPage.test.tsx`; EN-03 harness report/state files |
| Preserved contracts | `/dashboard/listening`, inline seed passages, local/demo auth browser seed, SpeechSynthesis user-initiated playback, learning-event freeform analytics layer, `addStudySession` signature, no schema/provider/dependency/deployment changes |
| Implemented facts | Transcript reveal before answering is deliberately labeled as a fallback and logged once as `listening.transcript_revealed`. Completion uses normalized scoring, records estimated non-zero listening minutes, includes transcript/TTS metadata in the completion event, and no longer increments vocabulary review count from listening question count. Reset/skip audio controls have accessible names. Empty voice-list startup now falls back after 800ms; unsupported browser TTS has route-level fallback evidence. |
| Verification | Focused ListeningPage tests 1 file/6 tests passed; focused EN-03 contract suite 4 existing files/59 tests passed using `learningEvents.strict.test.ts`; full Vitest 115 files/868 tests passed; lint/i18n/build passed; UI regression 54/54 and 10/10 scenarios passed; supported and unsupported manual English browser checks passed; `git diff --check` passed. |
| Downstream assumptions | EN-04 should audit Reading for the same honesty risks: generated fallback claims, scoring leniency/strictness, non-zero duration, and avoiding question-count review inflation. EN-05 should decide whether Settings TTS controls should govern Listening's inline SpeechSynthesis hook. |

## EN-04 Code Fact Writeback

| Field | Fact |
|---|---|
| Date | 2026-06-28 |
| Phase | EN-04 Reading |
| Changed files | `src/pages/dashboard/ReadingPage.tsx`; `src/pages/dashboard/ReadingPage.test.tsx`; EN-04 harness report/state files |
| Preserved contracts | `/dashboard/reading`, inline seed passages, local/demo auth browser seed, `addStudySession` signature, learning-event freeform analytics layer, no schema/provider/dependency/deployment changes |
| Implemented facts | The old simulated generation copy is now an honest built-in practice variation flow. Reading submit is gated until all questions are answered, and progress is visible as `Progress x/6`. Scoring rejects partial short-answer false positives and accepts article, singular/plural, and required multi-part variants. Review always shows either an evidence line or an evidence note. Completion records non-zero estimated minutes and no longer increments vocabulary review count from reading question totals. English mode now uses `Passage` instead of accidental `文章`, and mobile reading layout avoids forced nested scroll columns. |
| Verification | Focused ReadingPage tests 1 file/10 tests passed; focused EN-04 contract suite 4 existing files/64 tests passed using `learningEvents.strict.test.ts`; full Vitest 116 files/878 tests passed; lint/i18n/build passed; UI regression 54/54 and 10/10 scenarios passed; manual English browser check 22 assertions/8 screenshots passed; MCP browser snapshot/state/screenshot check passed; `git diff --check` passed. |
| Downstream assumptions | EN-05 may rely on Reading's local completion event payload and no review-count inflation. EN-05 must still treat this as local/demo evidence only and should not claim production Supabase sync or live AI generation without separate approval and proof. |

## EN-05 Code Fact Writeback

| Field | Fact |
|---|---|
| Date | 2026-06-28 |
| Phase | EN-05 Learning Center |
| Changed files | `src/pages/dashboard/TodayPage.tsx`; `src/pages/dashboard/ReviewPage.tsx`; `src/pages/dashboard/AnalyticsPage.tsx`; `src/pages/dashboard/SettingsPage.tsx`; `src/pages/dashboard/ProfilePage.tsx`; `src/data/localStorage.ts`; `src/lib/localDb.ts`; `src/pages/dashboard/SettingsPage.test.tsx`; `src/data/localStorage.settings.test.ts`; EN-05 harness report/state files |
| Preserved contracts | `/dashboard/today`, `/dashboard/review`, `/dashboard/analytics`, `/dashboard/settings`, `/dashboard/profile`, `/dashboard/learning-path`, local/demo auth, `UserDataContext` action names, learning event freeform analytics layer, Supabase/provider/deployment/dependency boundaries |
| Implemented facts | Today, Review, Analytics, Settings, and Profile no longer leak accidental Chinese chrome in English mode. Today hard-word copy now matches daily-flag behavior. Positive-streak Today state renders `3-day streak`. Settings reminder preview is permission-gated. Clear-data remains destructive-confirmed and now calls both localStorage namespace cleanup and IndexedDB database deletion helper. |
| Verification | Focused EN-05 suite 7 files/44 tests passed; storage/mission/path suite 5 files/105 tests passed; full Vitest 116 files/880 tests passed; lint/i18n/build passed; UI regression 54/54 and 10/10 scenarios passed; learning-flow 160/160 passed at the phase contract path; manual English 12-route browser sweep passed; positive-streak browser check passed; `git diff --check` passed. |
| Residual assumptions | Local/demo evidence does not prove production Supabase sync. Real IndexedDB `deleteDB` execution is not integration-tested because browser confirmation would be destructive; helper implementation and mocked Settings call path are verified. |
