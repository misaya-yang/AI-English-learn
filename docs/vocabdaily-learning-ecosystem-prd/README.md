# VocabDaily Learning Ecosystem Upgrade PRD

**Date:** 2026-06-16

**Owner:** Product / Design / Engineering

**Purpose:** Convert VocabDaily from a broad English-learning toolbox into a lexicon-centered learning ecosystem with Anki-compatible wordbooks, daily review/practice routing, AI coaching, and evidence-backed UI regression.

---

## Harness Intent

VocabDaily already has many useful parts: FSRS review, daily words, practice modes, AI chat, writing feedback, pronunciation scoring, specialty pages, CSV and APKG import, export, and a vocabulary bank. The product problem is that these parts do not yet behave like one learning system. The upgrade target is a wordbook-first English learning product where every imported word, saved word, mistake, dictation answer, writing issue, and coach recommendation lands in a visible learner-owned lexicon and returns through a clear daily loop.

The product thesis:

- The learner should always know what to do today.
- The learner should own a portable vocabulary library, not just consume hidden app content.
- AI should coach from evidence: word history, mistakes, writing issues, pronunciation signals, listening/dictation misses, and learner goals.
- UI should feel like a calm study workbench, not a generic AI dashboard or admin database.
- Every phase must leave tests, screenshots, reports, or eval traces that a fresh agent can inspect.

## Coding Agent Loading Protocol

When assigned a phase goal:

1. Open this `README.md`.
2. Open `phase-manifest.md`.
3. Locate the target with:

```bash
rg -n "PHASE_ID: <ID>|GOAL_PROMPT|VALIDATION_COMMANDS|ACCEPTANCE_GATES" docs/vocabdaily-learning-ecosystem-prd
```

4. Open only the target phase file and files listed in that phase's `PRIMARY_CONTEXT`.
5. Create a plan before editing.
6. Treat `LIKELY_EDIT_PATHS` as the intended write boundary.
7. Complete validation, browser/runtime checks, regression scope, compliance gates, rollback notes, evidence output, and acceptance gates before claiming completion.
8. Move to the next phase only after dependency gates are met or explicitly waived in a report.

## Long-Running Runtime Protocol

This PRD is designed for long agent runs and fresh context windows. Every execution window must boot from the runtime artifacts before editing:

1. Read `loop-contract.json` to understand the observe/select/execute/verify/record/decide cycle.
2. Read `loop-state.json` to identify the active phase, active feature, current iteration, status, last decision, and next action.
3. Read `feature-oracle.json` to select exactly one phase feature and its acceptance evidence.
4. Read `progress-log.md`, `agent-handoff.md`, and `continuity-ledger.md` before changing files.
5. Update `progress-log.md`, `loop-state.json`, and the relevant phase report before exiting a long-running window.

Agents must keep one phase in focus. If a blocker requires crossing phase boundaries, record the blocker and either stop or create an explicit waiver in the phase report.

## Source Packet

Primary request:

- Product and UI review from a product-manager and designer perspective.
- Search comparable English/vocabulary learning products.
- Compare industry patterns with the current implementation.
- Produce an executable PRD for future implementation.
- Pay special attention to English learning, AI English coaching, vocabulary, dictation/listening, writing, and the missing Anki-like vocabulary ecosystem.

Repo evidence inspected:

- App shell and routes: `src/App.tsx`, `src/layouts/DashboardLayout.tsx`, `src/features/learning/routeRegistry.ts`.
- Learning pages: `src/pages/dashboard/TodayPage.tsx`, `src/pages/dashboard/PracticePage.tsx`, `src/pages/dashboard/ReviewPage.tsx`, `src/pages/dashboard/ChatPage.tsx`, `src/pages/dashboard/VocabularyBankPage.tsx`, specialty pages for reading, listening, grammar, pronunciation, writing, exam, analytics, settings, profile.
- Lexicon and wordbook base: `src/data/wordBooks.ts`, `src/services/bookImport.ts`, `src/services/ankiApkgImport.ts`, `src/services/wordBookExport.ts`, `src/features/lexicon/lexicalEntry.ts`, `src/components/ImportAnkiApkgDialog.tsx`, `src/components/ImportWordBookDialog.tsx`, `src/components/AddWordDialog.tsx`.
- Learning engine and evidence: `src/contexts/UserDataContext.tsx`, `src/services/fsrs.ts`, `src/services/learningEvents.ts`, `src/services/evidenceEvents.ts`, `src/services/mistakeCollector.ts`, `src/features/learning/dailyCoachPlan.ts`, `src/features/practice/attemptState.ts`.
- AI and skill feedback: `src/hooks/useSupabaseChat.ts`, `src/services/aiExamCoach.ts`, `src/services/pronunciationScorer.ts`, `supabase/functions/ai-chat`, `supabase/functions/ai-grade-writing`, `supabase/functions/pronunciation-assess`.
- Existing audit/regression material: `docs/claude/VOCABDAILY_UPGRADE_TODO_2026-06-13.md`, `product-ui-audit-2026-06-14/UI_AUDIT_REPORT.md`, `product-ui-audit-2026-06-14/UI_UPGRADE_TODO.md`, `scripts/ui-regression.mjs`, `scripts/learning-flow-regression.mjs`.

External product research:

- [Anki Manual - importing](https://docs.ankiweb.net/importing/intro.html): Anki supports importing text files, packaged decks, and other sources.
- [Anki Manual - packaged decks](https://docs.ankiweb.net/importing/packaged-decks.html): APKG packages carry decks, notes, note types, and cards.
- [Anki Manual - deck options and FSRS](https://docs.ankiweb.net/deck-options.html): scheduling options are deck-level presets; FSRS is part of the review model.
- [Anki Manual - card templates](https://docs.ankiweb.net/templates/intro.html): fields and templates let learners reshape card front/back behavior.
- [Anki Manual - add-ons](https://docs.ankiweb.net/addons.html): ecosystem value comes from extensibility and community add-ons.
- [AnkiWeb shared decks](https://ankiweb.net/shared/decks): shared decks are searchable by subject/language.
- [Quizlet Learn help](https://help.quizlet.com/hc/en-us/articles/360030986971-Studying-with-Learn): learners choose a study set, start Learn, and choose a session goal.
- [Duolingo learning path blog](https://blog.duolingo.com/new-duolingo-home-screen-design/): the path redesign made progression linear and guided.
- [ELSA Speak](https://elsaspeak.com/en): AI personalizes lessons by level, goals, progress, accent, and industry focus.
- [Memrise](https://www.memrise.com/) and [Memrise new experience](https://memrisebeta.zendesk.com/hc/en-us/articles/4437047561745-The-New-Memrise-Experience): vocabulary is tied to real native-speaker clips and then conversation practice.
- [Lingvist](https://lingvist.com/): spaced repetition and personalized word timing are core product promises.
- [Grammarly features](https://www.grammarly.com/features) and [Grammarly generative AI support](https://support.grammarly.com/hc/en-us/articles/14528857014285-Introducing-generative-AI-assistance): writing value appears inline through suggestions, rewrites, tone adjustments, and user-controlled prompts.

Research interpretation:

- Observed evidence: competitor product pages and official docs show clear patterns around decks, importability, review scheduling, guided paths, AI coaching, and context-rich practice.
- Product inference: VocabDaily should not imitate one competitor. It should combine Anki-style ownership, Quizlet-style low-friction sets, Duolingo-style daily routing, ELSA/Memrise-style context and speech, and Grammarly-style writing feedback into one coherent English-learning loop.

## Runtime Artifacts

| Artifact | Purpose |
| --- | --- |
| `source-packet.md` | Compact source brief for fresh windows. |
| `loop-contract.json` | Runtime loop contract and stop rules. |
| `loop-state.json` | Current active phase, feature, status, and next action. |
| `feature-oracle.json` | Feature-level acceptance oracle across VLE-00 to VLE-06. |
| `progress-log.md` | Append-only execution progress. |
| `agent-handoff.md` | Current handoff for the next agent window. |
| `continuity-ledger.md` | Durable decisions, evidence, and blocker ledger. |
| `next-window-prompt.md` | Cold-start prompt for continuing the harness. |

## Current System Shape

Tech stack:

- React 19, Vite 7, TypeScript, Tailwind, Radix UI, lucide-react, framer-motion, Vitest, Playwright scripts.
- Supabase auth/data/edge functions plus local-first IndexedDB/localStorage support.
- FSRS scheduling exists in `src/services/fsrs.ts` and is used through `reviewWord`.
- Wordbooks exist as built-in and imported sets in `src/data/wordBooks.ts`.
- APKG parsing exists through `sql.js` and `fflate` in `src/services/ankiApkgImport.ts`.
- CSV/TSV import and Anki-compatible export exist through `src/services/bookImport.ts` and `src/services/wordBookExport.ts`.
- The dashboard has many routes: Today, Review, Practice, Chat, Exam, Vocabulary, Analytics, Memory, Reading, Listening, Grammar, Pronunciation, Writing, Learning Path, Leaderboard, Settings, Profile.

Product strengths:

- The app already covers vocabulary, review, practice, AI chat, writing, pronunciation, exam prep, and analytics.
- The APKG import base is unusually valuable for a young vocabulary app.
- Existing UI work has moved toward a calmer learning workbench and away from a black AI cockpit.
- Test surface is broad: unit tests, i18n checks, builds, UI regression scripts, learning-flow regression scripts, prod smoke scripts.

Current gaps:

- The vocabulary bank is functional but still reads partly as management UI; it does not yet feel like the learner's portable lexicon.
- Imported decks do not become a complete journey: preview, field mapping, confidence, study plan, review schedule, practice routing, and coach context are not yet unified.
- AI chat can use learning context, but the product contract is not explicit enough: which evidence it reads, what it writes back, what it must not expose, and how it turns feedback into review.
- Writing, listening/dictation, pronunciation, reading, grammar, and practice are still too route-shaped. They need to become modes routed by Today, the lexicon, mistakes, and goals.
- Analytics and recap semantics need to distinguish first-try correctness, recovered answers, needs-review answers, dictation misses, writing issue tags, and pronunciation issue tags.
- UI quality depends on route-by-route work. The next upgrade needs a route contract, not another one-page redesign.

## Assumptions and Decisions

- Use the existing Modern Learning Workbench direction: light-first, quiet surfaces, semantic accents, 6px radius, readable text, low card nesting.
- Do not introduce a new UI library.
- Do not delete dark mode; keep it readable and less black than the previous cockpit style.
- Do not change payment semantics or production billing fail-closed behavior in this harness.
- Treat APKG and CSV imports as user-provided untrusted content; strip unsafe HTML and never execute imported content.
- Treat external competitor pages as research sources only; do not copy their brand, exact UI, or proprietary content.
- Treat AI feedback as coaching evidence, not final truth. The UI must expose confidence, source, retry, and privacy boundaries.
- Keep learner-owned data portable through CSV/TSV/APKG-compatible export paths before adding community features.

## Phase Order

| Phase | Name | Core Outcome | Report |
| --- | --- | --- | --- |
| Phase 00 | Baseline Product Audit | Produce a current-state product, UI, data, route, and regression baseline for the learning ecosystem upgrade. | `reports/vle-00-baseline-product-audit-report.md` |
| Phase 01 | Lexicon And Wordbook Ecosystem | Redesign the vocabulary bank into a learner-owned lexicon with wordbook detail, list metadata, mastery lanes, and evidence links. | `reports/vle-01-lexicon-and-wordbook-ecosystem-report.md` |
| Phase 02 | Anki Import Export Experience | Turn CSV/APKG import/export into a trustworthy deck workflow with preview, field mapping, progress mapping, errors, and portability checks. | `reports/vle-02-anki-import-export-experience-report.md` |
| Phase 03 | Daily Loop And Practice Routing | Route Today, Review, Practice, listening dictation, and mistakes through one answer/retry/review loop backed by attempt evidence. | `reports/vle-03-daily-loop-and-practice-routing-report.md` |
| Phase 04 | AI English Coach And Skill Feedback | Make AI coaching evidence-based across vocabulary, writing, speaking, listening, and weak-tag recovery with privacy and eval gates. | `reports/vle-04-ai-english-coach-and-skill-feedback-report.md` |
| Phase 05 | Learning Workbench UI System | Apply the workbench UI contract across dashboard routes and remove old AI-dashboard/admin patterns. | `reports/vle-05-learning-workbench-ui-system-report.md` |
| Phase 06 | Regression Eval And Release | Add complete regression, eval, smoke, rollout, and rollback gates for production release. | `reports/vle-06-regression-eval-and-release-report.md` |

## New Window Prompt

Use `next-window-prompt.md` when a fresh agent window continues the work. The prompt forces the agent to load `prd-phase-harness`, read runtime artifacts first, execute one phase and one feature at a time, follow the loop cycle, stay inside edit boundaries, run validation, write evidence, update `continuity-ledger.md`, and record stop conditions.

## Roadmap Cohesion

VLE-00 records the baseline so later phases do not argue from memory. VLE-01 establishes the learner-owned lexicon, because every later feature needs a durable vocabulary center. VLE-02 makes import/export trustworthy and portable before imported content drives scheduling. VLE-03 connects daily learning and practice to the lexicon and attempt evidence. VLE-04 gives AI a clear read/write contract over that evidence. VLE-05 applies the UI system after the core information model is stable. VLE-06 packages regression, eval, deployment, and rollback so production is not released from a narrow happy path.

## Shared Harness Rules

- Stay inside phase boundaries unless a blocker is documented in the phase report.
- Plan before editing.
- Prefer existing repo patterns, services, tests, and UI utilities.
- Write or update focused tests for every behavior change.
- Capture desktop `1440x960` and mobile `390x844` screenshots for every UI phase.
- Keep Chinese and English copy paths deliberate; English product terms are allowed only when intentionally branded.
- Do not claim completion without durable evidence in the phase report.
- Document blockers and user waivers explicitly.

## Global Non-Goals

- Building a public community marketplace for decks in the first execution wave.
- Real-money marketplace, creator payouts, or paid deck distribution.
- Replacing FSRS with another scheduler.
- Replacing Supabase auth, billing, or edge-function architecture.
- Adding a new UI component library.
- Importing copyrighted third-party decks into the repo.
- Using AI to impersonate named teachers, writers, creators, or examiners without explicit consent.

## Global Compliance Gates

- Import safety: APKG/CSV content must be parsed as data, sanitized for display, and never executed.
- Privacy: AI prompts and traces must avoid direct personal contact data and must expose what learner evidence is used.
- Auth: dashboard routes must remain protected; demo mode must not create production auth users.
- Accessibility: all icon-only controls need labels, visible focus, keyboard reachability, and non-color-only status text.
- Copyright/licensing: imported deck metadata must preserve source/license fields and warn when the user cannot confirm rights.
- Data retention: learner-owned wordbooks, progress, mistakes, and memory records need deletion paths.
- Release safety: production deployment, external provider changes, billing changes, and database migrations require explicit approval.

## Standard Verification Commands

```bash
npm run lint
npm run check:i18n
npm run build
npm test -- --run
python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-learning-ecosystem-prd --strict --quality-score
```

## Required Browser or Runtime Checks

- Public routes: `/`, `/login`, `/register`, `/pricing`, `/word-of-the-day`.
- Dashboard routes: `/dashboard/today`, `/dashboard/review`, `/dashboard/practice`, `/dashboard/chat`, `/dashboard/vocabulary`, `/dashboard/analytics`, `/dashboard/settings`, `/dashboard/profile`.
- Skill routes: `/dashboard/reading`, `/dashboard/listening`, `/dashboard/grammar`, `/dashboard/pronunciation`, `/dashboard/writing`, `/dashboard/exam`, `/dashboard/learning-path`.
- Viewports: desktop `1440x960`, mobile `390x844`.
- Themes: light, dark, system.
- Evidence folder for implementation phases: `product-audit-2026-06-14/vocabdaily-learning-ecosystem/`.

## External Inputs and Approvals

- Supabase production credentials: only required for production smoke and deployment phases; never print or commit values.
- Vercel deployment: requires explicit user approval before production deployment.
- Production database migration: requires explicit user approval, migration dry-run evidence, and rollback notes.
- Third-party deck content: user must provide or approve the file; no agent should download copyrighted decks into the repo.
- Real microphone testing: requires a browser/device environment when pronunciation capture is being released.
