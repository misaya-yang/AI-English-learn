# English Web Optimization Phase Manifest

## Grep Usage

```bash
rg -n "PHASE_ID|GOAL_TARGET|VALIDATION_COMMANDS|BROWSER_CHECKS|STOP_CONDITIONS" docs/english-web-optimization-harness
rg -n "EN-0[1-5]|EN-F00[1-5]" docs/english-web-optimization-harness
```

## Phase Index

| PHASE_ID | File | Depends On | Goal Target | Main Validation | Evidence Output |
|---|---|---|---|---|---|
| EN-01 | `phase-EN-01.md` | none | Make Vocabulary a coherent lexicon and wordbook center with English-mode polish and safe learning actions. | `npm run lint`, `npm run check:i18n`, focused lexicon tests, build, vocabulary browser checks | `reports/en-01-vocabulary-report.md` |
| EN-02 | `phase-EN-02.md` | EN-01 | Unify pronunciation and roleplay into a measurable speaking practice loop with microphone and AI fallback clarity. | `npm run lint`, `npm run check:i18n`, focused pronunciation/chat tests, build, speaking browser checks | `reports/en-02-speaking-report.md` |
| EN-03 | `phase-EN-03.md` | EN-02 | Make Listening reliable across TTS, transcript discipline, scoring, review feedback, and learning-event evidence. | `npm run lint`, `npm run check:i18n`, focused listening tests, build, listening browser checks | `reports/en-03-listening-report.md` |
| EN-04 | `phase-EN-04.md` | EN-03 | Make Reading reliable across passage selection, answer gating, evidence-line review, scoring, and generated-passage honesty. | `npm run lint`, `npm run check:i18n`, focused reading tests, build, reading browser checks | `reports/en-04-reading-report.md` |
| EN-05 | `phase-EN-05.md` | EN-04 | Connect progress, review, reflection, settings, profile, and full-module regression into one learning center. | full tests, build, UI regression, learning-flow regression, whole-demand regression | `reports/en-05-learning-center-report.md` |

## Phase Report Index

| PHASE_ID | Actor report | Critic artifact | Initial status |
|---|---|---|---|
| EN-01 | `reports/en-01-vocabulary-report.md` | `reports/en-01-vocabulary-critic.md` | passed |
| EN-02 | `reports/en-02-speaking-report.md` | `reports/en-02-speaking-critic.md` | passed |
| EN-03 | `reports/en-03-listening-report.md` | `reports/en-03-listening-critic.md` | passed |
| EN-04 | `reports/en-04-reading-report.md` | `reports/en-04-reading-critic.md` | passed after critic reconciliation |
| EN-05 | `reports/en-05-learning-center-report.md` | `reports/en-05-learning-center-critic.md` | passed after critic reconciliation |

## Dependency Flow

```text
EN-01 Vocabulary -> EN-02 Speaking -> EN-03 Listening -> EN-04 Reading -> EN-05 Learning Center
```

## Validation Matrix

| PHASE_ID | Mutates Data | Needs Browser/UI | Needs Agent/LLM Eval | Needs Migration | Needs External Service | Release Blocking |
|---|---|---|---|---|---|---|
| EN-01 | local learner vocabulary only | yes | no | no | no | no |
| EN-02 | local pronunciation session, optional speaking evidence | yes | yes, fallback-aware | no | optional AI gateway, Web Speech API | no |
| EN-03 | local study session and learning events only | yes | no | no | browser SpeechSynthesis | no |
| EN-04 | local study session and learning events only | yes | yes, generated-passage honesty | no | optional AI generation only with approval | no |
| EN-05 | local settings/profile/progress only; clear-data destructive path guarded | yes | no | no | optional notification permission | yes |

## Risk Matrix

| PHASE_ID | Main risks | Stop condition |
|---|---|---|
| EN-01 | mixed-language English mode, unsafe custom/imported word rendering, route-link drift into Practice or Review | Stop if vocabulary correctness needs schema or sync changes outside local contracts. |
| EN-02 | Web Speech permission/support failures, AI scoring fallback opacity, roleplay not wired as visible Chat contract, session-only progress | Stop if real microphone or AI credentials are required and no local fallback evidence is available. |
| EN-03 | TTS timing mismatch, transcript reveal bypass, inaccurate short-answer scoring, event/gamification inflation, Settings TTS drift | Stop if reliable listening evidence requires external audio assets or schema changes. |
| EN-04 | simulated generation misrepresented as AI output, partial-match false positives, long mobile layout overflow | Stop if generated-passage behavior requires new provider credentials. |
| EN-05 | fabricated analytics, hard-coded settings/profile copy, notification permission failures, clear-data IndexedDB residue, Today hard/due-queue drift, cross-module regression | Stop if terminal regression requires production deployment without approval. |

## Goal Setup Templates

```text
Complete EN-01 by following docs/english-web-optimization-harness/phase-EN-01.md; update EN-F001 only.
Complete EN-02 by following docs/english-web-optimization-harness/phase-EN-02.md; update EN-F002 only.
Complete EN-03 by following docs/english-web-optimization-harness/phase-EN-03.md; update EN-F003 only.
Complete EN-04 by following docs/english-web-optimization-harness/phase-EN-04.md; update EN-F004 only.
Complete EN-05 by following docs/english-web-optimization-harness/phase-EN-05.md; update EN-F005 and run whole-demand regression.
```

## Runtime Artifacts

| Artifact | Path |
|---|---|
| Context profile | `context-profile.json` |
| Source packet | `source-packet.md` |
| Loop contract | `loop-contract.json` |
| Loop state | `loop-state.json` |
| Feature oracle | `feature-oracle.json` |
| Progress log | `progress-log.md` |
| Handoff | `agent-handoff.md` |
| Continuity ledger | `continuity-ledger.md` |
| Next-window prompt | `next-window-prompt.md` |

## Agent Role Handoffs

| Role | Must read | Must write |
|---|---|---|
| Planner | source packet, manifest, continuity ledger | phase contract updates, assumption updates, handoff |
| Generator | context profile, loop state, target phase, primary context | actor report, oracle evidence, progress log, source packet code facts, continuity ledger |
| Critic | target phase, actor report, changed files, command evidence | critic artifact with verdict and reviewed actor report path |

## Shared Agent Rules

- Execute one phase and one feature item.
- Keep context loading bounded by `context-profile.json`.
- Preserve route IDs, local storage keys, Supabase contracts, test scripts, and deployment config unless a report gains approval.
- Preserve IndexedDB store contracts, `sync_queue`, local/demo auth behavior, AI gateway fail-closed auth, Web Speech/SpeechSynthesis fallbacks, and destructive-action guards.
- Start `npm run dev -- --host 127.0.0.1 --port 5173` before any 5173 browser command; record `curl -sSf http://127.0.0.1:5173/ >/dev/null` as the server precheck.
- `npm test -- --run` covers Vitest `src/**/*.test.{ts,tsx}` only; top-level `tests/*.test.ts` require explicit `node --test` commands when affected.
- Record blockers with exact command, route, viewport, residual risk, and alternate evidence.
- Completion requires actor and critic artifacts.

## Discovery Evidence Addendum

| Source | Evidence |
|---|---|
| Route/page subagent | No `/dashboard/speaking` or `/dashboard/learning-center`; EN-02 uses `/dashboard/pronunciation` plus Chat candidate surfaces; EN-05 spans Today, Review, Analytics, Settings, Profile, Learning Path. |
| Test/boundary subagent | CI runs install/build/Vitest only; phase contracts must carry lint, i18n, build, browser, learning-flow, and `git diff --check` gates locally. |
| Data/state subagent | localStorage is primary learner state, IndexedDB carries FSRS/events/sync queue, local/demo auth cannot prove remote sync, Settings clear-data can leave IndexedDB, Today hard may not enter due queue. |
| In-app browser | Default zh and English sweeps covered 10 dashboard routes at desktop/mobile; no console errors or horizontal overflow observed; English-mode residual Chinese appeared in Vocabulary learner content, Today word fields, Settings tabs, and Profile material labels. |
| Current subagent/browser repair | Heisenberg, Chandrasekhar, and Hooke rechecked UI/routes, function/test commands, and harness compliance. Playwright then navigated Vocabulary, Pronunciation, Listening, Reading, Today, Settings, Profile, and Learning Path in English mode under `product-audit-2026-06-28/english-web-harness-recheck-current/`. |
| Validator compatibility | The requested five phase files are exactly `phase-EN-01.md` through `phase-EN-05.md`. The upstream `validate_harness_prd.py --strict` currently hard-codes `phase-XX-slug.md`; use the custom contract audit in `next-window-prompt.md` or patch the validator before relying on strict quality score output. |

## External Inputs Checklist

| Input | Allowed without approval | Requires approval |
|---|---|---|
| Local dev server | yes | no |
| Seeded local/demo learner | yes | no |
| Browser microphone, TTS, notification permission prompt | yes, for verification | no permission bypass |
| Supabase production project | read-only smoke with env provided | schema, RLS, edge function, or dashboard mutation |
| Vercel production | no | deploy, alias change, env change |
| Billing providers | no | any checkout/provider config change |
| Secrets | variable names only | printing, storing, or committing values is forbidden |
