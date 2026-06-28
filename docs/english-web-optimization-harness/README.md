# English Web Optimization Harness

## Harness Intent

Build a five-phase execution harness for optimizing the existing VocabDaily English-learning web app from repository evidence only. The five modules are Vocabulary, Speaking, Listening, Reading, and Learning Center.

## Coding Agent Loading Protocol

1. Open `docs/english-web-optimization-harness/context-profile.json`.
2. Open `docs/english-web-optimization-harness/loop-state.json`.
3. Open the assigned target phase file. If no target is assigned, start with `phase-EN-01.md`.
4. Open only the hot-path `PRIMARY_CONTEXT` listed in the assigned phase.
5. Keep this README, `source-packet.md`, `feature-oracle.json`, `progress-log.md`, `agent-handoff.md`, `continuity-ledger.md`, prior reports, and `next-window-prompt.md` deferred until the context profile trigger applies.
6. Write a plan before editing.
7. Stay inside `LIKELY_EDIT_PATHS`.
8. Run the named validation commands and browser checks, or write a blocker with the exact failed command.
9. Before exit, update the phase report, progress log, feature oracle evidence, source packet code facts, continuity ledger, and handoff.
10. Advance only after dependencies are passed or explicitly waived in evidence.

## Long-Running Runtime Protocol

- Control loop: `observe -> select -> execute -> verify -> record -> decide`.
- One run owns exactly one `PHASE_ID` and one feature-oracle item.
- Completion requires command evidence, browser or runtime evidence, minimal-change notes, and an independent critic artifact.
- Passing oracle items must cite a passed actor report and a separate approved critic artifact.

## Source Packet

Primary evidence lives in `docs/english-web-optimization-harness/source-packet.md`. It records repository-discovered stack, route inventory, validation commands, protected areas, assumptions, and module-specific issues.

## Runtime Artifacts

| File | Purpose |
|---|---|
| `context-profile.json` | Progressive disclosure and role loading budgets |
| `loop-contract.json` | Observe/select/execute/verify/record/decide loop |
| `loop-state.json` | Active phase and active feature |
| `feature-oracle.json` | Observable module acceptance cases |
| `progress-log.md` | Session status and discovery record |
| `agent-handoff.md` | Planner, generator, and critic messages |
| `continuity-ledger.md` | Cross-phase dependency and writeback boundary |
| `next-window-prompt.md` | Copy-ready continuation prompt |

## Current System Shape

- React 19, TypeScript, Vite 7, Tailwind CSS 3, Radix-style local UI components, lucide-react, Framer Motion, i18n, Vitest, Playwright, Supabase, IndexedDB.
- Route source of truth: `src/App.tsx` plus `src/features/learning/routeRegistry.ts`.
- Dashboard modules include `/dashboard/vocabulary`, `/dashboard/pronunciation`, `/dashboard/listening`, `/dashboard/reading`, `/dashboard/today`, `/dashboard/review`, `/dashboard/analytics`, `/dashboard/settings`, `/dashboard/profile`, and `/dashboard/learning-path`.
- There is no `/dashboard/speaking` route and no `/dashboard/learning-center` route; EN-02 maps to `/dashboard/pronunciation` plus candidate Chat voice/roleplay surfaces, and EN-05 maps to Today, Review, Analytics, Settings, Profile, and Learning Path.
- Browser evidence exists under `product-audit-2026-06-28/english-web-harness-recheck/` and `product-audit-2026-06-28/english-web-harness-recheck-en/`; English mode was switched through Settings UI before the English sweep.
- Local/demo auth is valid for UI and local state verification only. Supabase production sync, provider credentials, billing, migrations, deployment, and destructive clear-data behavior remain approval-gated.

## Assumptions and Decisions

- Assumption: "English Web" means this repository's VocabDaily English-learning web app. Verification: `README.md`, `src/App.tsx`, and `src/features/learning/routeRegistry.ts`.
- Assumption: no external PRD is available or allowed. Verification: every requirement in this harness cites repository paths.
- Decision: use `PHASE_ID` values `EN-01` through `EN-05`; phase filenames are exactly `phase-EN-01.md` through `phase-EN-05.md` to match the requested five-module harness contract.
- Decision: local/demo browser paths are valid for module execution; production Supabase, migrations, billing, deployment, and provider dashboards require explicit approval.
- Decision: every phase command list includes patch hygiene (`git diff --check`) and a dev-server precheck for browser commands. Start the local server with `npm run dev -- --host 127.0.0.1 --port 5173` before 5173 browser checks; start a preview server before 4174 smoke checks.

## Phase Order

| Order | PHASE_ID | Module | File |
|---:|---|---|---|
| 1 | EN-01 | Vocabulary | `phase-EN-01.md` |
| 2 | EN-02 | Speaking | `phase-EN-02.md` |
| 3 | EN-03 | Listening | `phase-EN-03.md` |
| 4 | EN-04 | Reading | `phase-EN-04.md` |
| 5 | EN-05 | Learning Center | `phase-EN-05.md` |

## New Window Prompt

Use `docs/english-web-optimization-harness/next-window-prompt.md`.

## Roadmap Cohesion

Vocabulary builds the lexical data and practice-entry foundation. Speaking uses lexicon and daily words for pronunciation and roleplay. Listening and Reading create skill-drill evidence loops. Learning Center closes the system by connecting Today, Review, Analytics, Settings, Profile, and Learning Path into progress, reflection, and control surfaces.

## Shared Harness Rules

- Use repository code and docs as the only source.
- Preserve public route paths, function signatures, local storage keys, Supabase table contracts, and existing test commands unless a phase report proves a narrow change is required.
- Preserve IndexedDB store semantics, local/demo auth boundaries, `sync_queue` behavior, AI gateway auth fail-closed behavior, Web Speech/SpeechSynthesis fallbacks, and Settings destructive-action guards.
- Every phase must write evidence under `docs/english-web-optimization-harness/reports/`.
- No phase may mark itself passed without independent critic evidence.

## Global Non-Goals

- No external PRD, market research, or competitor benchmarking.
- No dependency additions without a report section that names the reason and alternative.
- No production deployment, provider dashboard action, Supabase migration, billing change, or destructive data operation without explicit user approval.
- No broad visual redesign outside the assigned module.

## Global Compliance Gates

- Secrets: do not print, commit, or request secret values.
- Auth: local/demo evidence cannot be presented as production auth proof.
- Privacy: learner content, profile state, and local storage data stay scoped to the current user.
- Accessibility: icon-only controls require labels; keyboard focus must remain visible.
- i18n: English and Chinese mode must not leak untranslated user-facing text unless the product term is intentionally bilingual.
- Safety: `git reset --hard`, force push, broad deletes, production migrations, and provider changes require approval.

## Standard Verification Commands

```bash
npm run lint
npm run check:i18n
npm test -- --run
npm run build
curl -sSf http://127.0.0.1:5173/ >/dev/null
BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/english-web npm run test:ui-regression
BASE_URL=http://127.0.0.1:5173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-28/english-web-learning-flow npm run test:learning-flow-regression
git diff --check
```

`npm test -- --run` is Vitest for `src/**/*.test.{ts,tsx}`. If a phase changes top-level `tests/*.test.ts` contracts, add the matching `node --test tests/<file>.test.ts` command to that phase report.

The upstream `validate_harness_prd.py --strict` command currently assumes `phase-XX-slug.md` filenames and reports a false structural failure for this requested `phase-EN-01.md` through `phase-EN-05.md` harness. Use the custom contract audit in `next-window-prompt.md`, or update the upstream validator to accept `phase-EN-\d{2}.md`, before treating that validator result as authoritative.

## Required Browser or Runtime Checks

- Desktop `1440x960` and mobile `390x844`.
- Light and dark theme where the phase touches layout, controls, charts, or copy.
- English and Chinese language checks where the phase touches visible copy.
- Browser commands that target `127.0.0.1:5173` require an already running dev server; record the server URL and command in the phase report.
- Console/page-error summary for every checked route.
- Screenshot path recorded in the phase report.

## External Inputs and Approvals

| External input | Approval policy |
|---|---|
| Supabase production project, migrations, edge functions | Required before mutation or dashboard action |
| Vercel deployment or production smoke | Required before deploy or production verification |
| Billing providers | Required before checkout semantics or provider config changes |
| Microphone, notification, TTS, speech APIs | Browser permission checks allowed; no permission bypass |
| AI gateway | Use local fallback where available; real provider credentials are never printed |
