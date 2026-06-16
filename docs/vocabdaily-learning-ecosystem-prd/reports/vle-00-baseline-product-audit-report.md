# VLE-00 Baseline Product Audit Report

## Phase Summary

- PHASE_ID: VLE-00
- Phase file: `docs/vocabdaily-learning-ecosystem-prd/phase-00-baseline-product-audit.md`
- Executor: Codex
- Date: 2026-06-16
- Status: passed

## Scope Executed

- Planned work: inventory current routes, lexicon/import capabilities, AI feedback surfaces, UI evidence, validation scripts, and known release blockers.
- Actual work: wrote VLE-00 plan, baseline report, and evidence index; cited existing screenshot regression artifacts; ran required route/capability inventory and strict harness validation.
- Scope expansions: none.
- Scope not executed: no product code changes, no new browser capture, no production smoke run in this phase.

## Current Worktree Note

The worktree is already dirty from prior implementation work. VLE-00 did not edit product source files. Its edits are limited to the phase report paths and baseline evidence index named in the phase contract.

## Route Inventory

| Surface | Routes | Owner files | Notes |
| --- | --- | --- | --- |
| Public | `/`, `/word-of-the-day`, `/demo`, `/pricing`, `/terms`, `/privacy` | `src/App.tsx`, `src/pages/Home.tsx`, `src/pages/WordOfTheDayPage.tsx`, `src/pages/SampleLessonPage.tsx`, `src/pages/PricingPage.tsx`, `src/pages/LegalPage.tsx` | Public acquisition and sample learning surfaces. |
| Auth | `/login`, `/register`, `/magic-link`, `/auth/callback`, `/onboarding` | `src/App.tsx`, `src/pages/auth/**`, `src/components/auth/RequireAuth.tsx` | Auth routes use shared route fallback and protected dashboard guard. |
| Dashboard core | `/dashboard/today`, `/dashboard/review`, `/dashboard/practice`, `/dashboard/chat`, `/dashboard/vocabulary`, `/dashboard/analytics` | `src/App.tsx`, `src/layouts/DashboardLayout.tsx`, `src/features/learning/routeRegistry.ts`, dashboard pages | Core learning loop, coach, lexicon, and metrics. |
| Specialty learning | `/dashboard/reading`, `/dashboard/listening`, `/dashboard/grammar`, `/dashboard/pronunciation`, `/dashboard/writing`, `/dashboard/exam`, `/dashboard/learning-path` | `src/App.tsx`, `src/pages/dashboard/*Page.tsx`, `src/features/exam/**`, `src/features/pronunciation/**` | Skills currently exist as routes; later phases should route them through Today, Practice, lexicon, and coach context. |
| Utility | `/dashboard/memory`, `/dashboard/leaderboard`, `/dashboard/settings`, `/dashboard/profile` | `src/App.tsx`, `src/pages/dashboard/*Page.tsx` | Memory/privacy, social/progress, preferences, account surfaces. |

Command evidence:

```bash
rg -n "path=|DashboardRouteId|VocabularyBankPage|ImportAnkiApkgDialog|ai-grade-writing|pronunciation-assess" src supabase scripts
```

Result: passed. The command found route declarations in `src/App.tsx`, `DashboardRouteId` and route metadata in `src/features/learning/routeRegistry.ts`, Vocabulary and APKG import entry points, and the writing/pronunciation edge functions.

## Lexicon And Import Capability Map

| Capability | Current implementation | Evidence |
| --- | --- | --- |
| Built-in wordbooks | Built-in book templates for A1, A2, B1, business, technology, IELTS academic core. | `src/data/wordBooks.ts` |
| Active wordbook | `getWordBooks`, `getActiveBook`, `setActiveBook`, active-book summary, and `UserDataContext` wiring. | `src/data/localStorage.ts`, `src/contexts/UserDataContext.tsx` |
| Custom words | Add/delete custom words and include them in available vocabulary. | `src/data/localStorage.ts`, `src/components/AddWordDialog.tsx` |
| CSV/TSV import | Parses word, definition, definitionZh, level, topic, partOfSpeech, phonetic, examples, synonyms, antonyms, collocations, memoryTip, etymology. | `src/services/bookImport.ts` |
| APKG import | Uses `fflate` and `sql.js`; inspects decks, maps fields by priority, maps coarse progress, imports selected deck. | `src/services/ankiApkgImport.ts`, `src/components/ImportAnkiApkgDialog.tsx` |
| Export | Exports CSV, CSV with progress, and Anki-compatible TSV/TXT. | `src/services/wordBookExport.ts`, `src/pages/dashboard/VocabularyBankPage.tsx` |
| Error reporting | Import errors can be downloaded as JSON from Vocabulary page handlers. | `src/pages/dashboard/VocabularyBankPage.tsx` |
| Current gap | Import exists, but VLE-02 still needs preview, explicit mapping confidence, user-controlled field mapping, and clearer post-import next actions. | Phase contract VLE-02 |

Compliance baseline:

- APKG and CSV content must be treated as untrusted user content.
- Current parsers convert HTML to plain text in important paths, but VLE-02 must keep safety tests explicit.
- Source/license metadata exists and should remain visible.

## AI Feedback And Evidence Map

| Capability | Current implementation | Evidence |
| --- | --- | --- |
| AI chat | `useSupabaseChat`, chat runtime request payloads, `ai-chat` edge function, local persistence, quiz attempts, session sync. | `src/hooks/useSupabaseChat.ts`, `src/features/chat/**`, `supabase/functions/ai-chat/index.ts` |
| Learner context | Builds goal context and learner profile from level, target, active book, due count, mission tasks, learner model, and mistakes. | `src/features/chat/utils/learnerContext.ts` |
| Writing feedback | `aiExamCoach` invokes `ai-grade-writing`; fallback feedback exists; exam runtime saves feedback records. | `src/services/aiExamCoach.ts`, `supabase/functions/ai-grade-writing/index.ts`, `src/features/exam/hooks/useExamPrepRuntime.ts` |
| Pronunciation | Local speech-recognition scoring and optional AI phoneme feedback through `pronunciation-assess`. | `src/services/pronunciationScorer.ts`, `supabase/functions/pronunciation-assess/index.ts` |
| Mistakes | Mistake collector stores source/category/word records; practice integration tests exist. | `src/services/mistakeCollector.ts`, `src/services/practiceMistakes.ts` |
| Evidence events | Evidence event types include `practice.correct`, `practice.recovered`, `practice.incorrect`, review ratings, vocab learned, lesson completed. | `src/services/evidenceEvents.ts`, `src/services/evidenceEvents.test.ts` |
| Strict local events | Local DB event kinds include `practice_recovered` and `practice_wrong`. | `src/lib/localDb.ts`, `src/services/learningEvents.strict.test.ts` |
| Current gap | VLE-04 still needs a formal AI read/write evidence contract, golden scenarios, privacy gates, and explicit fallback UI evidence. | Phase contract VLE-04 |

Privacy baseline:

- AI prompt payloads should be bounded to learning context.
- No prompt or report should expose secrets, auth tokens, billing data, or direct personal contact data.
- Memory writes should be explicit or policy-backed.

## Practice And Daily Loop Baseline

Current worktree contains an uncommitted practice-loop implementation:

- `src/features/practice/attemptState.ts`
- `src/features/practice/attemptState.test.ts`
- `src/pages/dashboard/PracticePage.test.tsx`
- updates to `src/pages/dashboard/PracticePage.tsx`
- recovered evidence additions in `src/services/evidenceEvents.ts`, `src/lib/localDb.ts`, `src/services/learningEvents.ts`
- session recap changes in `src/features/learning/sessionRecap.ts`

This likely satisfies a large part of VLE-03, but VLE-03 is not considered complete until its phase report is written and required checks are run against current state.

## UI Evidence Index

Baseline evidence index: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/baseline/evidence-index.md`.

Existing learning-flow regression evidence:

- Summary: `product-audit-2026-06-14/learning-flow-regression/summary.json`
- Summary result: 114 checks, 0 failed.
- Covered themes: light, dark, system.
- Covered viewports: desktop 1440x960 and mobile 390x844.
- Covered routes include public pages, Today, Review, Practice, Chat, Analytics, Reading, Listening, Grammar, Pronunciation, Writing, Vocabulary, Profile, Settings, and fast route switching.

Required VLE-00 screenshot references:

| Route | Desktop light | Mobile light |
| --- | --- | --- |
| `/dashboard/today` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-today.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-today.png` |
| `/dashboard/practice` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-practice.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-practice.png` |
| `/dashboard/vocabulary` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-vocabulary.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-vocabulary.png` |
| `/dashboard/chat` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-chat.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-chat.png` |
| `/dashboard/writing` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-writing.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-writing.png` |
| `/dashboard/listening` | `product-audit-2026-06-14/learning-flow-regression/screenshots/desktop-light-listening.png` | `product-audit-2026-06-14/learning-flow-regression/screenshots/mobile-light-listening.png` |

Existing UI audit baseline:

- `product-ui-audit-2026-06-14/UI_AUDIT_REPORT.md`
- `product-ui-audit-2026-06-14/UI_UPGRADE_TODO.md`
- Latest prior UI regression wave summary: `product-ui-audit-2026-06-14/regression-wave5/summary.json`

## Validation Results

| Gate | Command or check | Result | Notes |
| --- | --- | --- | --- |
| Route inventory | `rg -n "path=|DashboardRouteId|VocabularyBankPage|ImportAnkiApkgDialog|ai-grade-writing|pronunciation-assess" src supabase scripts` | passed | Found required route, import, and AI surfaces. |
| Harness strict validation | `python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-learning-ecosystem-prd --strict --quality-score` | passed | `Harness validation passed`; `Quality score: 100 (excellent)`. |
| Browser evidence | Existing `learning-flow-regression` summary and screenshots | passed as cited baseline | No new browser capture was required by VLE-00 because existing route/viewport artifacts are present. |
| Product code mutation | Git status review for VLE-00 edits | passed | VLE-00 changed only docs/evidence files in allowed paths. |

## Compliance Gate Results

| Compliance gate | Result | Evidence |
| --- | --- | --- |
| Import safety | passed baseline | APKG/CSV identified as untrusted content; VLE-02 owns explicit parser safety tests. |
| Privacy | passed baseline | AI evidence boundaries documented; VLE-04 owns prompt payload and privacy tests. |
| Auth | passed baseline | Dashboard routes remain under `RequireAuth` in `src/App.tsx`. |
| Accessibility | partial baseline | Existing audits and phase contracts require aria labels and non-color status; detailed checks are VLE-01/VLE-05 work. |
| Licensing | passed baseline | Wordbook source/license fields exist and are called out as required. |
| Data retention | partial baseline | Custom book/word deletion exists; VLE-01/VLE-02 must verify imported content deletion and cleanup paths. |

## Acceptance Gate Results

| Acceptance gate | Result | Evidence |
| --- | --- | --- |
| Route inventory exists | passed | Route inventory table and `src/App.tsx` search evidence. |
| Lexicon/import map exists | passed | Lexicon and import capability map above. |
| AI feedback map exists | passed | AI feedback and evidence map above. |
| UI evidence index exists | passed | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/baseline/evidence-index.md`. |
| VLE-01 unlock decision exists | passed | VLE-01 is unlocked. |

## VLE-01 Unlock Decision

VLE-01 is unlocked.

Rationale:

- The current lexicon data model and import surfaces are identified.
- The safe edit boundaries are known.
- The main gaps are product/UI gaps rather than unknown architecture blockers.
- No VLE-00 stop condition is active.

## Known Risks For Next Phases

- The worktree already contains uncommitted product changes from prior Practice/UI work; later phases must work with those changes and not revert them.
- VLE-01 may need small local persistence or type additions if wordbook metadata is insufficient for the desired lexicon UI.
- VLE-02 must prove APKG/CSV safety with tests rather than relying on current parser intent.
- VLE-04 remote AI smoke can be blocked by Supabase/provider reachability, so reports must classify provider failures separately from code defects.

## Rollback And Recovery

VLE-00 writes only docs and evidence index files. Rollback is deleting or correcting:

- `docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-plan.md`
- `docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-report.md`
- `product-audit-2026-06-14/vocabdaily-learning-ecosystem/baseline/evidence-index.md`

## Next Phase Handoff

- Dependency unlocked: VLE-01.
- Next phase should read this report, then improve `src/pages/dashboard/VocabularyBankPage.tsx`, lexicon helpers, wordbook metadata, and focused tests.
- Do not treat VLE-03 or VLE-05 as passed yet even though parts are already implemented; they still need phase-specific validation and reports.
