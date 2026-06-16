# VocabDaily Learning Ecosystem Upgrade PRD Phase Manifest

This is the compact index for coding agents. Prefer this file plus the target phase file over loading the whole folder.

## Grep Usage

Find a phase:

```bash
rg -n "PHASE_ID: VLE-XX" docs/vocabdaily-learning-ecosystem-prd
```

Find all goal prompts:

```bash
rg -n "GOAL_PROMPT:" docs/vocabdaily-learning-ecosystem-prd
```

Find validation commands:

```bash
rg -n "VALIDATION_COMMANDS:" docs/vocabdaily-learning-ecosystem-prd
```

Find acceptance gates:

```bash
rg -n "ACCEPTANCE_GATES:" docs/vocabdaily-learning-ecosystem-prd
```

## Phase Index

| PHASE_ID | File | Depends On | Goal Target | Main Validation | Evidence Output |
| --- | --- | --- | --- | --- | --- |
| VLE-00 | `phase-00-baseline-product-audit.md` | none | Record the product, UI, route, data, and regression baseline for the learning ecosystem upgrade. | strict harness validation, repo audit commands, baseline screenshots | `reports/vle-00-baseline-product-audit-report.md` |
| VLE-01 | `phase-01-lexicon-and-wordbook-ecosystem.md` | VLE-00 | Redesign vocabulary into a learner-owned lexicon and wordbook center. | unit tests, i18n, build, vocabulary browser checks | `reports/vle-01-lexicon-and-wordbook-ecosystem-report.md` |
| VLE-02 | `phase-02-anki-import-export-experience.md` | VLE-01 | Productize APKG/CSV import and Anki-compatible export with preview, mapping, safety, and portability. | import parser tests, functional APKG check, vocabulary browser checks | `reports/vle-02-anki-import-export-experience-report.md` |
| VLE-03 | `phase-03-daily-loop-and-practice-routing.md` | VLE-02 | Connect Today, Review, Practice, dictation, and mistakes through one evidence-backed learning loop. | attempt state tests, practice UI tests, learning-flow regression | `reports/vle-03-daily-loop-and-practice-routing-report.md` |
| VLE-04 | `phase-04-ai-english-coach-and-skill-feedback.md` | VLE-03 | Make AI coach and skill feedback read/write learner evidence safely across vocabulary, writing, speaking, and listening. | chat/runtime tests, AI eval cases, privacy gates, edge fallback checks | `reports/vle-04-ai-english-coach-and-skill-feedback-report.md` |
| VLE-05 | `phase-05-learning-workbench-ui-system.md` | VLE-04 | Apply the workbench UI contract across dashboard routes and remove old dashboard/admin patterns. | UI regression screenshots, contrast checks, i18n checks, build | `reports/vle-05-learning-workbench-ui-system-report.md` |
| VLE-06 | `phase-06-regression-eval-and-release.md` | VLE-05 | Package full regression, eval, smoke, release, monitoring, and rollback evidence. | all standard commands, production smoke, release checklist, rollback report | `reports/vle-06-regression-eval-and-release-report.md` |

## Phase Report Index

| PHASE_ID | Required Report |
| --- | --- |
| VLE-00 | `reports/vle-00-baseline-product-audit-report.md` |
| VLE-01 | `reports/vle-01-lexicon-and-wordbook-ecosystem-report.md` |
| VLE-02 | `reports/vle-02-anki-import-export-experience-report.md` |
| VLE-03 | `reports/vle-03-daily-loop-and-practice-routing-report.md` |
| VLE-04 | `reports/vle-04-ai-english-coach-and-skill-feedback-report.md` |
| VLE-05 | `reports/vle-05-learning-workbench-ui-system-report.md` |
| VLE-06 | `reports/vle-06-regression-eval-and-release-report.md` |

## Dependency Flow

```text
VLE-00 Baseline Product Audit
  -> VLE-01 Lexicon And Wordbook Ecosystem
  -> VLE-02 Anki Import Export Experience
  -> VLE-03 Daily Loop And Practice Routing
  -> VLE-04 AI English Coach And Skill Feedback
  -> VLE-05 Learning Workbench UI System
  -> VLE-06 Regression Eval And Release
```

## Validation Matrix

| PHASE_ID | Mutates Data | Needs Browser/UI | Needs Agent/LLM Eval | Needs Migration | Needs External Service | Release Blocking |
| --- | --- | --- | --- | --- | --- | --- |
| VLE-00 | no | yes | no | no | no | no |
| VLE-01 | local learner data only | yes | no | possible | no | no |
| VLE-02 | local/imported learner data only | yes | no | possible | no | no |
| VLE-03 | local learner progress and evidence | yes | no | possible | no | no |
| VLE-04 | learner evidence, memory, feedback | yes | yes | possible | yes | yes |
| VLE-05 | no persistent data by default | yes | no | no | no | no |
| VLE-06 | release metadata only unless approved | yes | yes | possible | yes | yes |

## Risk Matrix

| PHASE_ID | Primary Risk | Stop Condition |
| --- | --- | --- |
| VLE-00 | Baseline misses a current route, script, or data surface. | Stop if the app cannot build or route inventory cannot be produced; write a blocker report with failing command output. |
| VLE-01 | Lexicon data shape breaks existing Today/Review word selection. | Stop if active wordbook selection or existing progress cannot round-trip in tests. |
| VLE-02 | Imported APKG/CSV content corrupts wordbooks or displays unsafe HTML. | Stop if parser safety, duplicate handling, or progress mapping cannot be proven with tests. |
| VLE-03 | Practice retry semantics inflate correctness or leak answers too early. | Stop if first-wrong, recovered, and second-wrong behavior cannot be tested for choice and dictation modes. |
| VLE-04 | AI coach reads too much learner data or writes unverified recommendations. | Stop if prompts cannot list evidence boundaries or if eval traces cannot show safe fallback behavior. |
| VLE-05 | Visual upgrade regresses readability, mobile layout, or route coherence. | Stop if desktop or mobile screenshots show overflow, blocked controls, unreadable feedback, or mixed accidental copy. |
| VLE-06 | Release gates depend on unavailable credentials or network state. | Stop if production smoke cannot distinguish code failure from provider reachability; write known-blocker evidence. |

## Goal Setup Templates

Use the exact phase file `GOAL_PROMPT` when creating an agent goal. If a phase has dependencies, do not execute it until dependency acceptance gates are met or explicitly waived in the previous phase report.

Example:

```text
Complete VLE-03 Daily Loop And Practice Routing for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-03-daily-loop-and-practice-routing.md`; preserve the two-attempt answer reveal rule, keep learner evidence semantics honest, stay inside named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
```

## Runtime Artifacts

| Artifact | Required Boot Use |
| --- | --- |
| `source-packet.md` | Read when source context is missing or a new window starts. |
| `loop-contract.json` | Read before planning to follow the runtime cycle. |
| `loop-state.json` | Read before selecting work and update before exit. |
| `feature-oracle.json` | Select one phase feature and record evidence against it. |
| `progress-log.md` | Append major execution and validation events. |
| `agent-handoff.md` | Read and update current handoff notes. |
| `continuity-ledger.md` | Preserve decisions, blockers, and evidence links. |
| `next-window-prompt.md` | Use as the cold-start continuation prompt. |

## Agent Role Handoffs

Planner role: reads runtime artifacts, chooses one active feature, writes or updates the phase plan, and confirms edit boundaries.

Generator role: implements scoped code, test, documentation, and evidence changes for the selected feature.

Evaluator role: runs validation, browser checks, compliance gates, and phase report review before the next phase unlocks.

## Shared Agent Rules

- Use the exact phase `GOAL_PROMPT` when starting a goal.
- Open only `READ_FIRST` and `PRIMARY_CONTEXT` before planning.
- Expand edit scope only when a blocker is documented.
- Write the phase report before moving on.
- Do not skip i18n, mobile, dark-mode, or evidence gates for UI phases.

## External Inputs Checklist

- Supabase env variables for production smoke: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Vercel project access for deployment.
- User-provided APKG/CSV deck samples for non-synthetic import QA.
- Real microphone/device access for pronunciation release checks.
- Explicit approval for production deployment, production database migration, billing behavior changes, or external provider dashboard changes.
