# Progress Log

## 2026-06-16

- Created VocabDaily Learning Ecosystem PRD harness with VLE-00 through VLE-06 phase files.
- Completed VLE-00 baseline report and evidence index.
- Completed VLE-01 lexicon implementation slice:
  - upgraded Vocabulary wordbook metadata, mastery lanes, detail status/source, empty-state actions, accessible icon controls, and AddWordDialog primary styling.
  - added `src/pages/dashboard/VocabularyBankPage.test.tsx`.
  - ran focused tests, lint, i18n, build, interaction smoke, and 114-check learning-flow regression.
- Added runtime artifacts required for long-running PRD harness validation.
- Completed VLE-02 import/export implementation slice:
  - added CSV preview, APKG deck preview, field names, sample rows, mapping confidence, explicit field mapping controls, coarse/no progress mapping, and post-import next actions.
  - fixed APKG optional-field fallback so uncertain fields do not pollute topic, synonyms, memory tips, or other optional lexical fields.
  - added focused CSV/APKG/export tests, including multi-deck APKG progress and explicit ambiguous-field mapping.
  - ran focused tests, lint, i18n, build, import/export interaction smoke, and 114-check learning-flow regression.
- Completed VLE-03 daily-loop and practice-routing slice:
  - verified first-wrong hidden-answer behavior, recovered retry semantics, second-wrong reveal behavior, FSRS rating mapping, mistake collector behavior, and session recap counts.
  - added desktop/mobile browser smoke for choice and listening attempt states.
  - fixed local-auth strict learning events so practice smoke no longer triggers remote `path_progress_events` console errors.
  - ran focused tests, lint, i18n, build, practice attempt smoke, and 114-check learning-flow regression.
- Completed VLE-04 AI coach and skill-feedback slice:
  - added local-auth chat storage short-circuiting so demo/local coach sessions do not write remote chat tables.
  - upgraded writing local fallback with actionable suggestions instead of score-only feedback.
  - added localhost-only pronunciation AI feedback injection for browser regression, while keeping production Edge Function behavior unchanged.
  - added desktop/mobile AI coach smoke for chat handoff, writing fallback, pronunciation local fallback, and pronunciation AI feedback.
  - ran focused coach/chat/writing/pronunciation tests, golden coach eval tests, lint, i18n, build, AI coach smoke, and 114-check learning-flow regression.
- Completed VLE-05 learning workbench UI system slice:
  - audited light-first theme initialization, dashboard skeleton behavior, semantic learning accents, route copy, and dashboard UI consistency.
  - hardened `scripts/ui-regression.mjs` for current route-flow labels and semantic reading/listening answer interactions instead of old visual class names.
  - added desktop and mobile contact sheet generation for UI screenshots.
  - ran lint, i18n, focused dashboard tests, build, 54-route plus 10-scenario UI regression, and 114-check learning-flow regression.
- Completed VLE-06 regression/eval/release slice:
  - ran lint, i18n, production build, full Vitest suite, `git diff --check`, release UI regression, and release learning-flow regression.
  - deployed to Vercel production as `dpl_14ifbn7oSx6jG5zFE4rFrrWN3wDU`, aliased to `https://www.uuedu.online`.
  - verified production public routes and bad-token stale auth behavior after deploy.
  - documented Supabase project TLS reachability failure as a production provider/network blocker separate from frontend route health.
