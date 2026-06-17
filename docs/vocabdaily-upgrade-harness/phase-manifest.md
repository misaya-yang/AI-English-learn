# VocabDaily Upgrade PRD Phase Manifest

This is the compact index for coding agents. Work one phase and one feature-oracle item at a time.

## Grep Usage

```bash
rg -n "PHASE_ID: VD-XX" docs/vocabdaily-upgrade-harness
rg -n "GOAL_PROMPT:" docs/vocabdaily-upgrade-harness
rg -n "VALIDATION_COMMANDS:" docs/vocabdaily-upgrade-harness
rg -n "ACCEPTANCE_GATES:" docs/vocabdaily-upgrade-harness
```

## Phase Index

| PHASE_ID | File | Depends On | Goal Target | Main Validation | Evidence Output |
| --- | --- | --- | --- | --- | --- |
| VD-00 | `phase-00-supabase-database-recovery.md` | none | Restore production Supabase reachability and proxy correctness. | `npm run smoke:prod` plus proxy regression test | `reports/vd-00-supabase-database-recovery-report.md` |
| VD-01 | `phase-01-registration-and-login-recovery.md` | VD-00 | Prove and repair real registration/login UI flow. | Browser auth smoke plus repo checks | `reports/vd-01-registration-and-login-recovery-report.md` |
| VD-02 | `phase-02-dark-mode-repair.md` | VD-01 | Make dark mode readable, restrained, and free of black flashes. | Desktop/mobile theme screenshots plus repo checks | `reports/vd-02-dark-mode-repair-report.md` |
| VD-03 | `phase-03-product-ui-redesign.md` | VD-02 | Redesign core UI into a practical English learning workspace. | Full route visual regression plus copy audit | `reports/vd-03-product-ui-redesign-report.md` |
| VD-04 | `phase-04-ielts-anki-card-foundation.md` | VD-03 | Ship a first useful IELTS Anki-style card foundation. | Card data tests plus learning-flow UI check | `reports/vd-04-ielts-anki-card-foundation-report.md` |

## Phase Report Index

| PHASE_ID | Required Report | Status |
| --- | --- | --- |
| VD-00 | `reports/vd-00-supabase-database-recovery-report.md` | passing |
| VD-01 | `reports/vd-01-registration-and-login-recovery-report.md` | passing |
| VD-02 | `reports/vd-02-dark-mode-repair-report.md` | next |
| VD-03 | `reports/vd-03-product-ui-redesign-report.md` | locked |
| VD-04 | `reports/vd-04-ielts-anki-card-foundation-report.md` | locked |

## Dependency Flow

```text
VD-00 Supabase Database Recovery
  -> VD-01 Registration and Login Recovery
  -> VD-02 Dark Mode Repair
  -> VD-03 Product UI Redesign
  -> VD-04 IELTS Anki Card Foundation
```

## Validation Matrix

| PHASE_ID | Mutates Data | Needs Browser/UI | Needs Agent/LLM Eval | Needs Migration | Needs External Service | Release Blocking |
| --- | --- | --- | --- | --- | --- | --- |
| VD-00 | yes, test account creation only | minimal | no | no | Supabase and Vercel | yes |
| VD-01 | yes, test account creation only | yes | no | no unless auth schema broken | Supabase and production site | yes |
| VD-02 | no | yes | no | no | no | yes |
| VD-03 | no | yes | no | no | no | yes |
| VD-04 | maybe seed content | yes | content review | maybe if persistence changes | no unless import/export provider added | yes |

## Risk Matrix

| PHASE_ID | Primary Risk | Stop Condition |
| --- | --- | --- |
| VD-00 | Production auth outage from paused Supabase or broken proxy body handling. | Stop if Supabase account/project access is missing or production smoke fails after deploy. |
| VD-01 | False-positive login from demo/local fallback while real Supabase sessions fail. | Stop if email confirmation, provider policy, or table/RLS errors need dashboard or schema changes not approved by the phase. |
| VD-02 | Token changes make light/dark contrast or route loading worse. | Stop if visual fixes require broad redesign outside theme/loading boundaries. |
| VD-03 | Broad UI churn breaks workflows or creates more AI-feeling copy. | Stop if screens cannot be audited at desktop and mobile viewports. |
| VD-04 | Content looks fake, generic, or detached from the existing FSRS/review model. | Stop if useful card schema requires migration or copyrighted content not approved. |

## Runtime Artifacts

| Artifact | Path | Agent Rule |
| --- | --- | --- |
| Loop Contract | `docs/vocabdaily-upgrade-harness/loop-contract.json` | Follow observe, select, execute, verify, record, decide before claiming progress. |
| Loop State | `docs/vocabdaily-upgrade-harness/loop-state.json` | Keep active phase, feature, iteration, status, and next action current. |
| Feature Oracle | `docs/vocabdaily-upgrade-harness/feature-oracle.json` | Update only status, evidence, and notes for the feature being worked. |
| Progress Log | `docs/vocabdaily-upgrade-harness/progress-log.md` | Append session start/end, validation, and blocker notes. |
| Agent Handoff | `docs/vocabdaily-upgrade-harness/agent-handoff.md` | Keep planner, generator, and evaluator notes file-based and brief. |
| Continuity Ledger | `docs/vocabdaily-upgrade-harness/continuity-ledger.md` | Preserve phase relatedness, code-summary writeback, and interface boundary decisions. |
| Next Window Prompt | `docs/vocabdaily-upgrade-harness/next-window-prompt.md` | Use this to restart work in a fresh context window. |

## Agent Role Handoffs

- Planner: keep the five-phase sequence strict and update phase docs before implementation.
- Generator: execute only the active phase and write concrete evidence.
- Evaluator: inspect changed files, production/runtime checks, screenshots, and oracle evidence before unlock.

## Goal Setup Templates

Use the exact phase prompt from the target phase file. Current next phase:

```text
Complete VD-02 Dark Mode Repair by following `docs/vocabdaily-upgrade-harness/phase-02-dark-mode-repair.md`; use VD-F003; repair theme tokens and loading states only after VD-01 passes.
```

For a fresh agent, first read `README.md`, `phase-manifest.md`, `loop-contract.json`, `loop-state.json`, `feature-oracle.json`, `progress-log.md`, `agent-handoff.md`, `continuity-ledger.md`, and the target phase file. Work on one phase and one feature-oracle item only.

## Shared Agent Rules

- Do not start a later phase until the previous phase report is passing or explicitly blocked/waived.
- Do not print secrets or tokens.
- Do not use Chrome unless explicitly requested; the user prefers the in-app browser for browser-authenticated work.
- For UI phases, validate desktop `1440x960` and mobile `390x844`.
- For Product Design work, brief is locked: English learning app, practical workbench, no AI-template copy, restrained tokens, full interactivity for shipped flows.

## External Inputs Checklist

- Supabase dashboard: available in the in-app browser, but dashboard mutation still needs phase relevance and safety.
- Vercel deploy: allowed when release evidence is required, with smoke after deploy.
- Billing/payment: not part of these phases except fail-closed regression checks.
