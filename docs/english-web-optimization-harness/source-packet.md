# Source Packet

## Request Summary

Create an executable five-module PRD Phase Harness for the existing VocabDaily English-learning web app using only this repository as the input source.

## 发现摘要 / Discovery Summary

| Area | Discovered fact | Evidence paths |
|---|---|---|
| Tech stack | React 19, TypeScript, Vite, Tailwind CSS, Radix-style local components, lucide-react, Framer Motion, i18n, Supabase, IndexedDB, localStorage, Vitest, and Playwright-driven scripts | `package.json:6`, `package.json:21`, `README.md:13`, `CLAUDE.md:22` |
| Routing | Public/auth/dashboard routes are declared in the SPA router; dashboard routes are protected by `RequireAuth`; there is no `/dashboard/speaking` and no `/dashboard/learning-center` route | `src/App.tsx:66`, `src/App.tsx:81`, `src/App.tsx:84`, `src/components/auth/RequireAuth.tsx:34` |
| Route metadata | Dashboard sidebar/mobile nav use `routeRegistry`, but `SearchPalette` still has hard-coded quick links, so route metadata is not the only navigation contract | `src/features/learning/routeRegistry.ts:30`, `src/features/learning/routeRegistry.ts:71`, `src/layouts/DashboardLayout.tsx:189`, `src/components/BottomNavBar.tsx:6`, `src/components/SearchPalette.tsx:17` |
| Pages | Dashboard includes Today, Review, Practice, Exam, Vocabulary, Analytics, Chat, Memory, Reading, Listening, Grammar, Leaderboard, Pronunciation, Writing, Learning Path, Settings, Profile | `src/App.tsx:84`, `src/pages/dashboard/*Page.tsx`, `src/features/learning/routeRegistry.ts:71` |
| Module mapping | EN-02 Speaking maps to `/dashboard/pronunciation` plus candidate chat voice/roleplay surfaces; roleplay components/data exist but are not wired as the current Chat page's visible route contract | `src/pages/dashboard/PronunciationPage.tsx:11`, `src/pages/dashboard/ChatPage.tsx:178`, `src/features/chat/components/RoleplayMode.tsx:30`, `src/data/roleplayScenarios.ts:52` |
| Content wiring | Listening and Reading currently inline their seed passages in page files; `src/data/listeningContent.ts` and `src/data/readingContent.ts` are repository evidence/test candidates, not the current render path | `src/pages/dashboard/ListeningPage.tsx:65`, `src/pages/dashboard/ListeningPage.tsx:283`, `src/pages/dashboard/ReadingPage.tsx:57`, `src/pages/dashboard/ReadingPage.tsx:287` |
| Tests and checks | Package scripts expose lint, i18n, Vitest, build, UI regression, learning-flow regression, E2E smoke, production smoke, and auth-flow smoke; CI currently runs only install/build/Vitest | `package.json:6`, `.github/workflows/ci.yml:23`, `.github/workflows/ci.yml:26`, `.github/workflows/ci.yml:29` |
| Vitest scope | `npm test -- --run` uses Vitest and covers `src/**/*.test.{ts,tsx}`; top-level `tests/*.test.ts` use `node:test` and are not covered by the default Vitest pass | `vitest.config.ts:10`, `vitest.config.ts:13`, `tests/fsrs-core.test.ts:1`, `tests/supabase-sync.test.ts:1` |
| Local/demo auth | Regression scripts seed local auth and learner profile state; Supabase remains optional for local module verification; demo session stores local browser auth only | `scripts/ui-regression.mjs:125`, `scripts/learning-flow-regression.mjs:5`, `src/lib/supabase-auth.ts:21`, `src/lib/supabase-auth.ts:378`, `src/contexts/AuthContext.tsx:138` |
| Browser recheck evidence | In-app browser loaded 10 dashboard routes at desktop and mobile in default zh and English modes; no horizontal overflow and no console errors were observed in the route sweep; English mode still exposes Chinese text in Vocabulary content, Today word fields, Settings tab labels, and Profile entitlement/material labels | `product-audit-2026-06-28/english-web-harness-recheck/browser-route-sweep.json`, `product-audit-2026-06-28/english-web-harness-recheck-en/browser-route-sweep-en.json`, `product-audit-2026-06-28/english-web-harness-recheck-en/*.png` |
| Current browser recheck evidence | Playwright in-app browser navigated real URLs for Vocabulary, Pronunciation, Listening, Reading, Today, Settings, Profile, and Learning Path in English mode; all sampled routes reported `horizontalOverflow: 0`; Vocabulary retained learner-content Chinese and Today retained 4 Chinese characters requiring content-vs-chrome classification | `product-audit-2026-06-28/english-web-harness-recheck-current/playwright-*.json`, `product-audit-2026-06-28/english-web-harness-recheck-current/playwright-learning-path.png` |
| Do-not-edit zones | UI module optimization must not mutate production provider config, Supabase schema/functions/shared auth helpers, billing, Vercel proxy/rewrite config, secrets, or package lockfiles unless a phase report gains approval | `README.md:61`, `README.md:72`, `CLAUDE.md:40`, `CLAUDE.md:48`, `CLAUDE.md:67`, `docs/ops/SUPABASE_RELEASE_CHECKLIST.md:29`, `api/supabase.js:28`, `vercel.json:2`, `package-lock.json` |

## Subagent and Browser Evidence

| Source | Scope | Result |
|---|---|---|
| Main browser pass | Default zh mode, 10 dashboard routes, desktop `1440x900`, mobile `390x844` | Routes loaded with no console errors and no horizontal overflow; screenshots and `browser-route-sweep.json` stored under `product-audit-2026-06-28/english-web-harness-recheck/`. |
| Main browser pass | English mode after switching through Settings UI, same 10 routes and two viewports | Routes loaded with no console errors and no horizontal overflow; `Vocabulary` showed 9019 Chinese chars from bilingual content, `Today` 49 from word fields, `Settings` 8 from hard-coded tab labels, `Profile` 20 from entitlement/material labels. |
| Subagent Fermat | Route/page/nav read-only discovery | Confirmed route graph, missing `/dashboard/speaking` and `/dashboard/learning-center`, `SearchPalette` registry drift, inline Listening/Reading data, and roleplay not wired as visible Chat contract. |
| Subagent Darwin | Test/protection-boundary read-only discovery | Confirmed scripts, CI coverage gap, no `playwright.config.*`, Vitest include scope, production smoke env requirements, and expanded protected areas. |
| Subagent Pauli | Learning data/state discovery | Confirmed localStorage is the main learner-state source, IndexedDB stores FSRS/event/sync artifacts, Supabase sync is queued through `sync_queue`, AI gateway requires auth, Web Speech and SpeechSynthesis are browser boundaries, Settings clear-data leaves IndexedDB, Today hard flag does not enter due queue, and Vocabulary/Today/Pronunciation TTS calls do not honor Settings TTS controls. |
| Subagent Heisenberg | UI/route/harness read-only recheck | Confirmed real route mapping; flagged custom `phase-EN-xx` filenames versus the upstream validator's `phase-XX-slug` assumption, EN-05 Profile/Learning Path read-path visibility, and UI issue coverage gaps that require matrix or waiver evidence. |
| Subagent Chandrasekhar | Function/data/test-command read-only recheck | Confirmed package scripts, CI scope, inline Listening/Reading render data, no external PRD dependency, and repaired EN-03/EN-04 commands from the old missing learning-events test path to real `learningEvents.strict.test.ts` plus page tests. |
| Subagent Hooke | Harness compliance read-only recheck | Confirmed required root files, five requested phase filenames, required anchors, Machine Contract JSON, and Coding Agent Contract presence; flagged phase `status` drift and the upstream validator filename incompatibility. |
| Current Playwright browser | English-mode route recheck after subagent critique | Captured JSON for Vocabulary, Pronunciation, Listening, Reading, Today, Settings, Profile, and Learning Path plus a Learning Path screenshot; all sampled routes had `horizontalOverflow: 0`. Vocabulary retained learner-content Chinese; Today retained 4 Chinese characters to classify before claiming zero accidental chrome leakage. |

## Source Inventory

- App shell and route graph: `src/App.tsx`, `src/layouts/DashboardLayout.tsx`, `src/components/BottomNavBar.tsx`, `src/components/SearchPalette.tsx`, `src/features/learning/routeRegistry.ts`.
- Shared UI and learning surfaces: `src/features/learning/components/LearningWorkspace.tsx`, `src/features/learning/components/StudyWorkbook.tsx`, `src/components/ui/*`.
- Vocabulary: `src/pages/dashboard/VocabularyBankPage.tsx`, `src/features/lexicon/lexicalEntry.ts`, `src/data/wordBooks.ts`, `src/data/words.ts`, `src/services/wordBookExport.ts`.
- Speaking: `src/pages/dashboard/PronunciationPage.tsx`, `src/hooks/usePronunciationSession.ts`, `src/services/pronunciationScorer.ts`, `src/hooks/useSpeechRecognition.ts`, `src/pages/dashboard/ChatPage.tsx`, `src/features/chat/components/RoleplayMode.tsx`, `src/data/roleplayScenarios.ts`.
- Listening: `src/pages/dashboard/ListeningPage.tsx`, inline `SEED_PASSAGES`, inline `useTTSPlayer`, `src/services/tts.ts`, `src/services/learningEvents.ts`, `src/services/gamification.ts`; `src/data/listeningContent.ts` is a test/data candidate, not the current route render path.
- Reading: `src/pages/dashboard/ReadingPage.tsx`, inline `SEED_PASSAGES`, simulated `handleGenerateNew`, `src/services/learningEvents.ts`, `src/services/gamification.ts`; `src/data/readingContent.ts` is a test/data candidate, not the current route render path.
- Learning center: `src/pages/dashboard/TodayPage.tsx`, `src/pages/dashboard/ReviewPage.tsx`, `src/pages/dashboard/AnalyticsPage.tsx`, `src/pages/dashboard/SettingsPage.tsx`, `src/pages/dashboard/ProfilePage.tsx`, `src/pages/dashboard/LearningPathPage.tsx`, `src/services/learnerModel.ts`, `src/services/reviewWindows.ts`, `src/services/retentionInsights.ts`, `src/hooks/useStudyReminder.ts`.
- Regression docs: `docs/ops/PRODUCT_REGRESSION_RUNBOOK.md`, `docs/ops/SMOKE_COVERAGE.md`.

## Current System Shape

- The app uses Vite SPA routing. Protected dashboard routes are nested under `/dashboard` and guarded by `RequireAuth`.
- Dashboard navigation metadata is centralized in `routeRegistry.ts`; labels, search aliases, mobile priority, and page titles live there.
- Local/demo browser verification is supported by Playwright scripts that seed `localStorage` for auth, profile, word books, and daily words; the current browser sweep also verified the product's Settings language selector can switch to English.
- The learning loop spans local storage, IndexedDB, Supabase sync helpers, FSRS services, gamification, evidence events, daily missions, and analytics.
- AI and provider features have fallback boundaries: pronunciation falls back to local scoring; chat surfaces AI-unavailable state; production smoke treats missing JWT as fail-closed.
- Settings defaults to `zh` when `localStorage.language` is absent, so English Web acceptance requires an explicit English-mode switch before screenshots or text scans count.

## State Boundary Matrix

| Boundary | Reads/writes | Evidence | Harness rule |
|---|---|---|---|
| `UserDataContext` | Aggregates daily words, word books, progress, settings, gamification, and learner actions | `src/contexts/UserDataContext.tsx:83`, `src/contexts/UserDataContext.tsx:317`, `src/contexts/UserDataContext.tsx:448` | Phase changes must preserve public context action names and downstream progress expectations. |
| localStorage | Stores users, settings, sessions, word books, daily flags, profile, and demo auth compatibility state | `src/data/localStorage.ts:114`, `src/lib/supabase-auth.ts:702` | Local/demo browser evidence is valid for UI and local state only, not production sync proof. |
| IndexedDB | Stores `word_progress`, `review_logs`, `sync_queue`, `events`, `learning_events`, and `mistakes` | `src/lib/localDb.ts:78`, `src/services/syncQueue.ts:1` | Phases touching progress, clear-data, or event evidence must verify IndexedDB side effects or record a blocker. |
| Supabase sync | Upserts queued progress/events when authenticated; local/demo paths can skip remote sync | `src/services/syncQueue.ts:168`, `src/lib/wordProgressSync.ts:67`, `src/services/learningEvents.ts:98` | Local pass cannot be claimed as production Supabase pass; schema/RLS/function edits require approval. |
| AI gateway | Calls Edge Function REST with Supabase session token and fail-closed auth behavior | `src/services/aiGateway.ts:56`, `src/services/aiGateway.ts:119`, `src/services/deepseek.ts:8` | Use existing fallback paths; no provider credentials or function edits without approval. |
| Web Speech API | Pronunciation recognition uses `SpeechRecognition`/`webkitSpeechRecognition`, not `getUserMedia`/`MediaRecorder` | `src/hooks/useSpeechRecognition.ts:24`, `src/services/pronunciationScorer.ts:79` | EN-02 browser evidence must cover unsupported/denied/no-result states without assuming microphone capture APIs. |
| SpeechSynthesis | TTS uses browser `speechSynthesis`; Listening has an inline hook and shared `tts.ts` exists | `src/services/tts.ts:20`, `src/services/tts.ts:109`, `src/pages/dashboard/ListeningPage.tsx:281` | EN-01/EN-03 must verify TTS controls and Settings TTS behavior where touched. |
| Notifications | Reminder UX depends on browser notification permission | `src/hooks/useStudyReminder.ts`, `src/services/reminderService.ts` | EN-05 may verify prompts/denial but must not bypass browser permission or run destructive flows. |

## Requirements

| ID | Requirement | Phase |
|---|---|---|
| R1 | Vocabulary must make word ownership, source book, learning status, next action, import/export safety, and English-mode copy coherent | EN-01 |
| R2 | Speaking must connect pronunciation, roleplay, voice input, feedback, and fallback states into one measurable speaking module | EN-02 |
| R3 | Listening must provide reliable audio/TTS state, transcript discipline, answer scoring, review feedback, and learning-event evidence | EN-03 |
| R4 | Reading must provide passage selection, evidence-location review, scoring, generated-passage fallback honesty, and learning-event evidence | EN-04 |
| R5 | Learning Center must connect progress, review, reflection, settings, profile, reminders, and regression evidence across the full product | EN-05 |

## Non-Goals

- Do not change backend schema, Supabase RLS, Supabase Edge Functions, billing, Vercel rewrites, production domains, or provider dashboards.
- Do not add new libraries until a phase report proves the existing stack cannot satisfy the module.
- Do not rename public routes or change route IDs without a migration plan and regression evidence.
- Do not use external PRD material.

## Assumptions and Verification

| Assumption | Verification |
|---|---|
| "English Web" means the current VocabDaily English-learning web app | `README.md` product description plus dashboard route inventory in `src/App.tsx` |
| Existing numeric conversion metrics are not fully available for every module | Phase reports must record baseline counts from screenshots, DOM checks, and event/log evidence before acceptance |
| Local/demo auth is acceptable for module UI verification | `scripts/ui-regression.mjs` and `scripts/learning-flow-regression.mjs` seed local users and profile state |
| Production auth, billing, provider, and deployment evidence are outside this harness unless explicitly approved | `docs/ops/PRODUCT_REGRESSION_RUNBOOK.md` and smoke scripts require env and approval-sensitive data |
| Chinese text in English mode is not always a defect when it is learner content such as Chinese definitions or bilingual study hints | Each phase must separate content-intent Chinese from accidental UI chrome copy by citing the route, DOM snippet, and source path |
| `docs/ops/SMOKE_COVERAGE.md` may be stale relative to current scripts | Prefer current `scripts/prod-smoke.mjs` and package scripts; record stale-doc deltas in phase reports rather than editing ops docs in this harness |
| Settings clear-data originally removed localStorage only and could leave IndexedDB progress/events/sync artifacts | EN-05 added `clearLocalDbData()` and confirmation wiring; mocked call-path tests pass. Real IndexedDB deletion is not run in browser evidence because confirming clear-data is destructive. |
| Today hard-word action is a daily hard flag and does not directly change the FSRS due queue | EN-05 aligned copy so scheduling is described as happening after rating in Review; positive-streak and hard-word English copy are covered by browser evidence. |

## Module Issue Inventory

### EN-01 Vocabulary

- UI evidence: `VocabularyBankPage.tsx` has untranslated English-mode export dialog and stat labels around export and stats sections.
- UI evidence: word list rows use `div role="button"` with dialog trigger behavior; keyboard Enter/Space activation needs explicit verification.
- UI evidence: dense lexicon cards, IELTS deck preview, management list, filters, stats, and word rows share one route without a clear task hierarchy.
- UI evidence: empty state exposes actions behind an icon menu instead of direct primary actions.
- UI evidence: some bilingual section labels mix "Sense", "Examples", and Chinese copy inside the same heading.
- Functional evidence: export uses current filtered vocabulary, but empty export and success messages are hard-coded in Chinese.
- Functional evidence: `Open review` link carries query params, while `ReviewPage` must prove it honors or safely ignores them.
- Functional evidence: custom word deletion happens from detail dialog and needs undo/confirm evidence.
- Functional evidence: imported-word fallback paths can lack examples, collocations, or common mistakes and need clear drill alternatives.
- Functional evidence: `needsReviewCount` combines status and incorrect/correct count locally; downstream consistency with Review requires regression.
- Functional evidence: Vocabulary pronunciation uses `speakEnglishText`; Settings TTS toggles/voice must be honored or documented as a known boundary when EN-01 touches pronunciation controls.
- Browser evidence: English-mode route sweep showed 9019 Chinese characters on Vocabulary; acceptance must classify learner-content Chinese separately from accidental UI chrome leakage before claiming zero leakage.

### EN-02 Speaking

- UI evidence: Pronunciation has word/sentence tabs, score cards, record button, result recap, and history; roleplay components/data exist, but the current Chat page visible contract does not wire `RoleplayMode` as a full route flow.
- UI evidence: unsupported SpeechRecognition returns a centered message but no direct fallback route into roleplay or text speaking practice.
- UI evidence: roleplay selector and active scenario card are compact and sidebar-like; mobile speaking flow needs dedicated viewport evidence.
- UI evidence: score dimensions are visible, but phoneme issues can be empty when AI feedback is unavailable.
- UI evidence: voice input in Chat and pronunciation recording are separate controls with separate fallback handling.
- Functional evidence: `listenOnce` can remain pending when `onend` fires without a result; timeout behavior needs verification.
- Functional evidence: local pronunciation scoring uses transcript overlap, duration, and confidence; no persisted speaking progress is visible in the page.
- Functional evidence: AI pronunciation assessment falls back silently to local scoring; the user only sees local-only copy after a result.
- Functional evidence: roleplay objective completion is not currently a verified visible Chat flow; EN-02 must either wire a bounded roleplay path or document it as a blocker without pretending it already exists.
- Functional evidence: microphone permission denial and unsupported browser states need route-level browser checks.
- Functional evidence: speaking history is component-session state; persistent speaking evidence is an explicit acceptance decision or waiver, not an assumed existing contract.

### EN-03 Listening

- UI evidence: Listening uses browser SpeechSynthesis as prototype audio and progress is time-estimated from transcript length.
- UI evidence: Listening route seed passages are inline in `ListeningPage.tsx`; data-file changes alone cannot affect the rendered page unless EN-03 also connects that data path.
- UI evidence: transcript can be revealed before answering; transcript discipline needs product-gated states.
- UI evidence: audio control buttons use icons for stop/skip that need labels and purpose clarity.
- UI evidence: answer review and transcript review are split across main and aside panels.
- UI evidence: only three built-in clips are listed; level and topic filters are not present.
- Functional evidence: scoring uses exact lower-case comparison for short answers and fill blanks.
- Functional evidence: `incrementReviewCount` is called with question count after a listening passage, which may inflate review achievements.
- Functional evidence: elapsed listening time is not recorded in `addStudySession`; currently `addStudySession(0, 0, xp, 0)` records zero time.
- Functional evidence: TTS unavailable state keeps route usable, but answer flow still needs verification without audio playback.
- Functional evidence: learning event payload exists for completed passage but transcript review behavior is not captured.
- Functional evidence: Settings TTS enable/voice controls are not proven to drive Listening's inline TTS hook; EN-03 must verify or document this boundary.
- Browser evidence: English-mode sweep observed `0` Chinese characters, `0` console errors, and `0` horizontal overflow for `/dashboard/listening` at desktop and mobile before any EN-03 implementation.

### EN-04 Reading

- UI evidence: Reading select screen is not using the same `learning-open-route` class as Listening/Pronunciation.
- UI evidence: reading mode uses two scrollable columns; mobile stack and sticky behavior need screenshot evidence.
- UI evidence: generated-passage CTA currently simulates latency and reuses seed passages with "(New)" title.
- UI evidence: Reading route seed passages are inline in `ReadingPage.tsx`; data-file changes alone cannot affect the rendered page unless EN-04 also connects that data path.
- UI evidence: passage body and questions can create long unchunked reading sessions without progress markers.
- UI evidence: evidence lines appear only in review for questions that include `location`.
- Functional evidence: generated passages do not call the named Supabase Edge Function despite the file header claim.
- Functional evidence: short-answer scoring accepts partial inclusion, which can award false positives for very short input.
- Functional evidence: `elapsed` is rounded minutes from `Date.now`; very short sessions can record zero minutes.
- Functional evidence: `incrementReviewCount` is called with question count after reading completion, which may mix reading questions with word-review achievements.
- Functional evidence: unanswered gate exists, but review retry and wrong-answer remediation do not write targeted evidence items.
- Browser evidence: English-mode sweep observed `0` Chinese characters, `0` console errors, and `0` horizontal overflow for `/dashboard/reading` at desktop and mobile before any EN-04 implementation.

### EN-05 Learning Center

- UI evidence: Today contains multiple side rails and workbench panels; primary mission priority must stay singular on mobile and desktop.
- UI evidence: Today includes hard-coded Chinese toasts and bookmark/share labels despite i18n language branching elsewhere.
- UI evidence: Analytics contains many chart panels and empty states; density and no-fabricated-data behavior need route checks.
- UI evidence: Settings notification and quiet-hour controls include hard-coded Chinese labels and toasts.
- UI evidence: Profile avatar upload, CEFR/profile state, badges, and freeze redemption need clearer demo/pro boundaries.
- UI evidence: English-mode sweep confirmed Settings tab labels remain Chinese (`通用`, `通知`, `学习`, `账号`) and Profile contains Chinese entitlement/material labels (`写作反馈`, `阅读材料`, `答疑对话`, `考试反馈`, `听力材料`).
- Functional evidence: Today writes evidence events for learned and hard words; downstream Analytics/Review must reflect them.
- Functional evidence: Review, Today, Practice, Chat, and Analytics share learning events and mission tasks; changes need whole-demand regression.
- Functional evidence: notification permission, lifecycle preview, and study reminder states depend on browser permissions.
- Functional evidence: local/demo auth and Supabase sync boundaries can diverge; completion cannot rely only on demo state for production claims.
- Functional evidence: progress metrics require true event history; empty states must remain honest rather than fabricated.
- Functional evidence: Settings clear-data only clears localStorage contracts in current evidence and can leave IndexedDB stores.
- Functional evidence: Today hard-word copy implies review-list behavior, but current evidence shows daily flags/evidence without direct `reviewWord` due-queue mutation.

## Test Command Inventory

| Command | Evidence source | Use |
|---|---|---|
| `npm run lint` | `package.json` | Static lint gate |
| `npm run check:i18n` | `package.json`, `scripts/check-i18n.js` | Translation key gate |
| `npm test -- --run` | `package.json`, `vitest.config.ts` | Full unit/integration gate |
| `npm run build` | `package.json` | TypeScript build plus Vite production build |
| `BASE_URL=http://127.0.0.1:5173 npm run test:ui-regression` | `scripts/ui-regression.mjs` | Browser route screenshots, overflow, blank/error detection |
| `BASE_URL=http://127.0.0.1:5173 npm run test:learning-flow-regression` | `scripts/learning-flow-regression.mjs` | Seeded learning-flow browser regression |
| `BASE_URL=http://127.0.0.1:4174 npm run test:e2e:smoke` | `scripts/e2e-smoke.mjs`, `docs/ops/PRODUCT_REGRESSION_RUNBOOK.md` | Preview/public route and optional authenticated smoke |
| `git diff --check` | repo policy | Whitespace and patch hygiene |
| Custom `phase-EN` contract audit in `next-window-prompt.md` | Requested file contract and current repository evidence | Verifies required root files, exactly five `phase-EN-01.md` through `phase-EN-05.md` files, required anchors, Machine Contract JSON, passed statuses, browser checks, and placeholder absence |

Note: `npm test -- --run` means Vitest under this repo and does not cover top-level `tests/*.test.ts`. If a phase changes FSRS, Supabase sync, or other top-level `node:test` contracts, it must add an explicit `node --test tests/<file>.test.ts` command.

Validator compatibility note: `python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/english-web-optimization-harness --strict --quality-score` currently fails with `Missing numbered phase files matching phase-XX-<slug>.md` because the upstream script hard-codes numeric-slug filenames. This is a tooling mismatch with the requested `phase-EN-xx` filenames, not a signal to add extra phase files.

## Protected Areas

- `supabase/**`, `supabase/functions/_shared/**`, `src/lib/supabase-schema.sql`, and production provider dashboards: protected unless the phase explicitly gains approval.
- `api/supabase.js`, `vercel.json`, `src/lib/supabase.ts`, `src/lib/supabase-auth.ts`, production deployment settings, and smoke production env: protected unless release work is approved.
- `src/services/aiGateway.ts`, `src/services/memoryCenter.ts`, `src/services/billingGateway.ts`, and `supabase/functions/billing-*`: protected because provider, memory, and billing changes are outside module optimization.
- Secret files and env values: protected; phases may name secret variable names only.
- `package-lock.json` and dependency manifests: protected unless dependency approval is recorded.
- Existing completed harness reports under other docs folders: read-only evidence, not edit targets.

## Risk Tags

- EN-01: `ui`, `frontend`, `auth`, `database`.
- EN-02: `ui`, `frontend`, `ai`, `external-service`, `auth`, `privacy`.
- EN-03: `ui`, `frontend`, `browser`, `privacy`.
- EN-04: `ui`, `frontend`, `ai`, `eval`, `privacy`.
- EN-05: `ui`, `frontend`, `auth`, `privacy`, `release`.

## EN-01 Implementation Writeback

| Item | Evidence |
|---|---|
| Scope | EN-01 changed Vocabulary page chrome, direct Vocabulary add/import dialogs, and focused tests only. No protected areas, schema, provider, dependency, deployment, package lock, or route files were changed. |
| Code paths | `src/pages/dashboard/VocabularyBankPage.tsx`, `src/components/AddWordDialog.tsx`, `src/components/ImportWordBookDialog.tsx`, `src/components/ImportAnkiApkgDialog.tsx`, `src/pages/dashboard/VocabularyBankPage.test.tsx` |
| Fixed UI chrome | Export dialog, export/import toasts, last-import summary, stat labels, filter placeholders/items, book badges, empty state, empty search state, detail action buttons, add-word placeholders, CSV/TSV import dialog, and Anki import labels now respect English mode. |
| Fixed functionality/accessibility | Word list rows using `div role="button"` now activate on Enter/Space only when the row itself is focused; nested pronunciation controls no longer open details through bubbled key events. Empty state has direct Add word, Import word book, and Import Anki buttons while preserving the existing menu. Controlled AddWordDialog Cancel closes via the parent `onOpenChange` state. |
| Intentional learner content | Chinese definitions, example translations, and bilingual hints remain learner content in English mode and are not classified as accidental UI chrome. |
| Validation | `npm run lint`; `npm run check:i18n`; focused EN-01 tests 4 files/21 tests; `npm run build`; dev-server curl; UI regression 54/54; manual English desktop/mobile browser check; dark/dialog browser check; post-critic nested-audio and controlled-cancel browser check; full Vitest 114 files/857 tests; `git diff --check`. |
| Evidence artifacts | `docs/english-web-optimization-harness/reports/en-01-vocabulary-report.md`; `docs/english-web-optimization-harness/reports/en-01-vocabulary-critic.md`; `product-audit-2026-06-28/en-01-vocabulary/summary.json`; `product-audit-2026-06-28/en-01-vocabulary/manual-english/result.json`; `product-audit-2026-06-28/en-01-vocabulary/manual-english/dark-and-dialogs-result.json`; `product-audit-2026-06-28/en-01-vocabulary/manual-english/post-critic-result.json` |

## EN-02 Implementation Writeback

| Item | Evidence |
|---|---|
| Scope | EN-02 changed pronunciation scoring/session UX and bounded Chat roleplay UI only. No protected areas, Supabase functions, provider credentials, dependencies, deployment files, package lock, or broad chat request payloads were changed. |
| Code paths | `src/services/pronunciationScorer.ts`, `src/services/pronunciationScorer.test.ts`, `src/pages/dashboard/PronunciationPage.tsx`, `src/pages/dashboard/ChatPage.tsx`, `src/features/chat/components/RoleplayMode.tsx`, `src/features/chat/components/ChatComposer.tsx`, `src/features/chat/components/chatVisualContract.test.ts` |
| Fixed speech lifecycle | `listenOnce` no longer hangs when Web Speech ends without a result; it rejects on no speech, recognition error, timeout, and start failure, and stops recognition on timeout. |
| Fixed speaking fallback | Pronunciation unsupported/error states now offer text speaking practice through Chat. The fallback loads a composer prompt but still lets the user confirm before sending. |
| Fixed roleplay visibility | Chat now exposes existing roleplay scenarios as a visible speaking shell with objectives, key phrases, progress toggles, completion score, and prompt handoff. |
| Fixed English chrome | ChatComposer quick prompt chips now render English `prompt.text` outside Chinese mode. |
| Residual boundaries | Pronunciation records remain session-local; Chat voice-input unsupported behavior still hides the mic; true provider-vs-edge fallback provenance remains outside EN-02 because it would require Supabase function response changes. |
| Validation | `npm run lint`; `npm run check:i18n`; focused EN-02 tests 5 files/54 tests; `npm run build`; dev-server curl; UI regression 54/54 plus 10/10 scenarios; manual English unsupported/no-result/roleplay browser check; full Vitest 114 files/862 tests; `git diff --check`. |
| Evidence artifacts | `docs/english-web-optimization-harness/reports/en-02-speaking-report.md`; `docs/english-web-optimization-harness/reports/en-02-speaking-critic.md`; `product-audit-2026-06-28/en-02-speaking/summary.json`; `product-audit-2026-06-28/en-02-speaking/manual-english/result.json` |

## EN-03 Implementation Writeback

| Item | Evidence |
|---|---|
| Scope | EN-03 changed the Listening page and focused Listening page tests only. No external audio assets, Supabase schema/functions, provider credentials, dependencies, deployment files, package lock, Reading, or Practice route files were changed. |
| Code paths | `src/pages/dashboard/ListeningPage.tsx`, `src/pages/dashboard/ListeningPage.test.tsx` |
| Fixed transcript policy | Pre-submit transcript reveal is labeled as `Use transcript fallback` in English mode and includes copy telling learners to listen first when audio works, then use transcript for accessibility, silent browsers, or post-submit review. |
| Fixed transcript evidence | The first transcript reveal records `listening.transcript_revealed` with passage, level, source, before-submit status, and TTS support. Completion payload now records `durationMinutes`, `answerCount`, `transcriptRevealedBeforeSubmit`, and `ttsSupported`. |
| Fixed scoring | Fill-blank and short-answer scoring now normalizes case, punctuation, and spacing, and accepts numeric variants such as `15 percent` for `15`. |
| Fixed learning evidence | Listening completion records estimated non-zero study minutes from duration label/transcript. It no longer calls `incrementReviewCount`, so listening question totals do not inflate vocabulary review achievements. |
| Fixed TTS fallback/accessibility | Icon-only audio reset and skip controls have accessible names and titles. Unsupported TTS copy keeps transcript/question flow usable without audio playback. Empty voice-list startup now waits up to 800ms for `voiceschanged`, then falls back to browser default speech synthesis rather than waiting forever. |
| Residual boundaries | Listening still uses inline `SEED_PASSAGES` in `ListeningPage.tsx`; `src/data/listeningContent.ts` remains a candidate/test path. Listening still uses an inline SpeechSynthesis hook with estimated progress and does not read Settings TTS controls. |
| Validation | `npm test -- --run src/pages/dashboard/ListeningPage.test.tsx`; focused EN-03 suite 4 existing files/59 tests using `src/services/learningEvents.strict.test.ts`; `npm run lint`; `npm run check:i18n`; `npm run build`; dev-server curl; UI regression 54/54 plus 10/10 scenarios; supported and unsupported manual English browser checks; full Vitest 115 files/868 tests; `git diff --check`. |
| Evidence artifacts | `docs/english-web-optimization-harness/reports/en-03-listening-report.md`; `docs/english-web-optimization-harness/reports/en-03-listening-critic.md`; `product-audit-2026-06-28/en-03-listening/summary.json`; `product-audit-2026-06-28/en-03-listening/manual-english/result.json`; `product-audit-2026-06-28/en-03-listening/manual-unsupported-tts/result.json` |

## EN-04 Implementation Writeback

| Item | Evidence |
|---|---|
| Scope | EN-04 changed the Reading page and focused Reading page tests only. No Supabase schema/functions, provider credentials, dependencies, deployment files, package lock, Vocabulary, Speaking, Listening, Practice, or Analytics route files were changed. |
| Code paths | `src/pages/dashboard/ReadingPage.tsx`, `src/pages/dashboard/ReadingPage.test.tsx` |
| Fixed generation honesty | The simulated generated passage path is now an honest `Built-in practice variation` path. Copy states that practice variations come from current built-in passages and that no external AI or content provider is called. Local fallback events record `sourceType: local_fallback` and `generatedFallback: true`. |
| Fixed answer flow | Submit is disabled until all Reading questions are answered, and the question rail shows `Progress x/6`. Browser checks verified `Progress 0/6`, `Progress 1/6`, and `Progress 6/6` states. |
| Fixed scoring | Short-answer scoring normalizes punctuation, case, spacing, articles, singular/plural variants, and multi-part answers while rejecting partial false positives such as `hip` for `hippocampus`. |
| Fixed learning evidence | Reading completion records at least one study minute, includes `durationMinutes`, `answerCount`, `questionTypes`, `sourceType`, and `generatedFallback` in the learning event payload, and no longer increments vocabulary review count from reading question count. |
| Fixed evidence review and UI | Review renders `Evidence in passage` for located answers or `Evidence note` for passage-level inference questions. English mode uses `Passage` instead of accidental `文章`. The route shell now uses `learning-open-route`, and the mobile reading layout avoids forced nested column scrolling. |
| Residual boundaries | Reading still renders inline `SEED_PASSAGES` from `ReadingPage.tsx`; `src/data/readingContent.ts` remains a candidate/test path. Local/demo browser evidence does not prove production Supabase sync or provider-backed generation. |
| Validation | `npm test -- --run src/pages/dashboard/ReadingPage.test.tsx`; focused EN-04 suite 4 existing files/64 tests using `src/services/learningEvents.strict.test.ts`; `npm run lint`; `npm run check:i18n`; `npm run build`; dev-server curl; UI regression 54/54 plus 10/10 scenarios; manual English browser check 22 assertions/8 screenshots; MCP browser state/snapshot/screenshot check; full Vitest 116 files/878 tests; `git diff --check`. |
| Evidence artifacts | `docs/english-web-optimization-harness/reports/en-04-reading-report.md`; `docs/english-web-optimization-harness/reports/en-04-reading-critic.md`; `product-audit-2026-06-28/en-04-reading/summary.json`; `product-audit-2026-06-28/en-04-reading/manual-english/result.json`; `product-audit-2026-06-28/en-04-reading/mcp-browser-state.json`; `product-audit-2026-06-28/en-04-reading/mcp-browser-snapshot.md`; `product-audit-2026-06-28/en-04-reading/mcp-browser-reading.png` |

## EN-05 Implementation Writeback

| Item | Evidence |
|---|---|
| Scope | EN-05 changed learning-center local UI/state paths only. No Supabase schema/functions, provider credentials, dependencies, deployment files, billing, package lock, or route ids were changed. |
| Code paths | `src/pages/dashboard/TodayPage.tsx`, `src/pages/dashboard/ReviewPage.tsx`, `src/pages/dashboard/AnalyticsPage.tsx`, `src/pages/dashboard/SettingsPage.tsx`, `src/pages/dashboard/ProfilePage.tsx`, `src/data/localStorage.ts`, `src/lib/localDb.ts`, `src/pages/dashboard/SettingsPage.test.tsx`, `src/data/localStorage.settings.test.ts` |
| Fixed English chrome | Today workbench/status/action copy, Review card/detail copy, Analytics risk and 30-day labels, Settings tabs/notification/learning/audio/account/danger sections, and Profile quota/freeze labels now branch on English/ZH mode. Positive-streak Today state now renders `3-day streak` instead of `连续 3 天`. |
| Fixed clear-data boundary | `clearAllData` now removes `vocabdaily_`, `vocabdaily-`, Supabase/auth, and language keys. `clearLocalDbData` closes the open IDB handle and calls `deleteDB` for the app database after destructive confirmation. Browser evidence verifies the confirmation dialog and cancels; tests verify the mocked call path. |
| Fixed honesty boundaries | Today hard-word copy no longer implies direct FSRS review scheduling. Settings lifecycle preview no longer claims a reminder would send unless browser notifications are supported and granted. |
| Residual boundaries | Local/demo browser evidence does not prove production Supabase sync. Real IndexedDB deletion is not integration-tested because confirming clear-data would be destructive; the helper implementation and confirmation call path are verified. |
| Validation | Focused EN-05 suite 7 files/44 tests passed; storage/mission/path suite 5 files/105 tests passed; full Vitest 116 files/880 tests passed; lint/i18n/build passed; UI regression 54/54 plus 10/10 scenarios passed; contract-path learning-flow regression 160/160 passed; manual English route sweep 12/12 passed; positive-streak browser check passed; `git diff --check` passed. |
| Evidence artifacts | `docs/english-web-optimization-harness/reports/en-05-learning-center-report.md`; `docs/english-web-optimization-harness/reports/en-05-learning-center-critic.md`; `product-audit-2026-06-28/en-05-learning-center/ui-regression/summary.json`; `product-audit-2026-06-28/en-05-learning-flow/summary.json`; `product-audit-2026-06-28/en-05-learning-center/manual-english/result.json`; `product-audit-2026-06-28/en-05-learning-center/manual-english-positive-streak/result.json`; `product-audit-2026-06-28/en-05-learning-center/mcp-browser-today-state.json` |
