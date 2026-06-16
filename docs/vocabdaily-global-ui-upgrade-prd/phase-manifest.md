# VocabDaily Global UI Upgrade Phase Manifest

This is the compact execution index for agents. Read `PRD.md`, this file, and the target phase file before editing.

## Grep Usage

Find a phase:

```bash
rg -n "PHASE_ID: VGUI-XX" docs/vocabdaily-global-ui-upgrade-prd
```

Find goal prompts:

```bash
rg -n "GOAL_PROMPT:" docs/vocabdaily-global-ui-upgrade-prd
```

Find validation commands:

```bash
rg -n "VALIDATION_COMMANDS:" docs/vocabdaily-global-ui-upgrade-prd
```

Find acceptance gates:

```bash
rg -n "ACCEPTANCE_GATES:" docs/vocabdaily-global-ui-upgrade-prd
```

## Phase Index

| PHASE_ID | File | Depends On | Goal Target | Main Validation | Evidence Output |
| --- | --- | --- | --- | --- | --- |
| VGUI-00 | `phase-00-baseline-ui-audit-and-inventory.md` | none | Capture the current UI baseline for every scoped route and shared UI system. | lint, i18n, build, full tests, route screenshot inventory | `reports/vgui-00-baseline-ui-audit-and-inventory-report.md` |
| VGUI-01 | `phase-01-design-tokens-and-app-shell.md` | VGUI-00 | Establish the global light-first token system, readable dark mode, skeletons, and shells. | lint, focused component tests, build, theme screenshots | `reports/vgui-01-design-tokens-and-app-shell-report.md` |
| VGUI-02 | `phase-02-public-and-auth-surfaces.md` | VGUI-01 | Upgrade public, auth, onboarding, legal, sample, pricing, and daily-word surfaces. | lint, i18n, build, public/auth route screenshots | `reports/vgui-02-public-and-auth-surfaces-report.md` |
| VGUI-03 | `phase-03-dashboard-core-learning-flow.md` | VGUI-02 | Upgrade Today, Review, Practice, Chat, Vocabulary, and Analytics with correct learning feedback states. | lint, focused dashboard tests, learning-flow checks, screenshots | `reports/vgui-03-dashboard-core-learning-flow-report.md` |
| VGUI-04 | `phase-04-skill-modules-and-utility-screens.md` | VGUI-03 | Upgrade all skill modules plus memory, leaderboard, settings, and profile. | lint, focused route tests, desktop/mobile screenshots | `reports/vgui-04-skill-modules-and-utility-screens-report.md` |
| VGUI-05 | `phase-05-regression-evidence-and-release-gate.md` | VGUI-04 | Prove global UI readiness with complete regression, contact sheets, and release evidence. | lint, i18n, build, full tests, UI regression, learning-flow regression | `reports/vgui-05-regression-evidence-and-release-gate-report.md` |

## Phase Report Index

| PHASE_ID | Required Report |
| --- | --- |
| VGUI-00 | `reports/vgui-00-baseline-ui-audit-and-inventory-report.md` |
| VGUI-01 | `reports/vgui-01-design-tokens-and-app-shell-report.md` |
| VGUI-02 | `reports/vgui-02-public-and-auth-surfaces-report.md` |
| VGUI-03 | `reports/vgui-03-dashboard-core-learning-flow-report.md` |
| VGUI-04 | `reports/vgui-04-skill-modules-and-utility-screens-report.md` |
| VGUI-05 | `reports/vgui-05-regression-evidence-and-release-gate-report.md` |

## Dependency Flow

```text
VGUI-00 Baseline UI Audit And Inventory
  -> VGUI-01 Design Tokens And App Shell
  -> VGUI-02 Public And Auth Surfaces
  -> VGUI-03 Dashboard Core Learning Flow
  -> VGUI-04 Skill Modules And Utility Screens
  -> VGUI-05 Regression Evidence And Release Gate
```

## Validation Matrix

| PHASE_ID | Mutates Data | Needs Browser/UI | Needs Agent/LLM Eval | Needs Migration | Needs External Service | Release Blocking |
| --- | --- | --- | --- | --- | --- | --- |
| VGUI-00 | no | yes | no | no | no | yes |
| VGUI-01 | no | yes | no | no | no | yes |
| VGUI-02 | no | yes | no | no | no | yes |
| VGUI-03 | local learning state only | yes | no | no | optional Supabase mock/fallback only | yes |
| VGUI-04 | local learning state only | yes | no | no | optional Supabase mock/fallback only | yes |
| VGUI-05 | no | yes | no | no | production smoke only if approved | yes |

## Risk Matrix

| PHASE_ID | Primary Risk | Stop Condition |
| --- | --- | --- |
| VGUI-00 | Missing route coverage leads to a false global plan. | Stop if any scoped route cannot be loaded or captured and no blocker is recorded. |
| VGUI-01 | Token changes create regressions across unrelated pages. | Stop if a theme or shell change makes public or dashboard routes unreadable. |
| VGUI-02 | Public/auth copy or CTA changes alter auth or billing semantics. | Stop if billing, auth, demo, or legal behavior would need semantic changes. |
| VGUI-03 | Practice feedback becomes visually nicer but less correct. | Stop if first-wrong retry, reveal, recovered, or FSRS evidence cannot be verified. |
| VGUI-04 | Module pages drift into separate visual systems. | Stop if a module needs a new pattern not covered by shared component rules. |
| VGUI-05 | Release proceeds with weak evidence. | Stop if contact sheets, learning-flow regression, or build/test results are missing. |

## Runtime Artifacts

| Artifact | Path | Agent Rule |
| --- | --- | --- |
| PRD | `docs/vocabdaily-global-ui-upgrade-prd/PRD.md` | Product and UI scope source. |
| Source Packet | `docs/vocabdaily-global-ui-upgrade-prd/source-packet.md` | Current code facts and boundaries. |
| Loop Contract | `docs/vocabdaily-global-ui-upgrade-prd/loop-contract.json` | Follow observe, select, execute, verify, record, decide. |
| Loop State | `docs/vocabdaily-global-ui-upgrade-prd/loop-state.json` | Keep active phase and next action current. |
| Feature Oracle | `docs/vocabdaily-global-ui-upgrade-prd/feature-oracle.json` | Update status/evidence/notes only for the active item. |
| Progress Log | `docs/vocabdaily-global-ui-upgrade-prd/progress-log.md` | Append validation and blocker notes. |
| Agent Handoff | `docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md` | Keep planner/generator/evaluator notes file-based. |
| Continuity Ledger | `docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md` | Preserve cross-phase route and token decisions. |
| Next Window Prompt | `docs/vocabdaily-global-ui-upgrade-prd/next-window-prompt.md` | Restart prompt for fresh context. |

## Agent Role Handoffs

- Planner: owns source packet, PRD, phase contracts, oracle scope, and dependency clarity.
- Generator: executes one phase, updates code and evidence, and writes the phase report.
- Evaluator: reviews changed files, screenshot evidence, validation output, and oracle status independently.

## Goal Setup Templates

Use the target phase `GOAL_PROMPT`. Example:

```text
Complete VGUI-00 Baseline UI Audit And Inventory for `/Users/yang/projects/app` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-00-baseline-ui-audit-and-inventory.md`; update VGUI-F001 only; stay inside named boundaries; finish only after validation, screenshots, source-packet writeback, continuity update, and report evidence pass or blockers are documented.
```

## Shared Agent Rules

- One phase and one feature-oracle item at a time.
- Public/auth routes are not a substitute for dashboard module coverage.
- Mobile screenshots are not a substitute for desktop 1440 screenshots.
- Passing tests are not a substitute for visual evidence.
- Visual evidence is not a substitute for learning-flow correctness.

## External Inputs Checklist

- Browser screenshot output folder: `product-audit-2026-06-17/global-ui/`.
- Vercel deployment: approval required.
- Production Supabase or billing provider changes: approval required.
- Figma output: optional, not required for this PRD.
