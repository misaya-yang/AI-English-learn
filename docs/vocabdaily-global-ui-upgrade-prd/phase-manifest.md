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
| VGUI-08 | `phase-08-liquid-glass-research-baseline-and-route-plan.md` | VGUI-05 | Reopen the completed harness for the 2026-06-20 Apple-inspired Liquid Glass full-site objective and write the route/effect execution contract. | strict harness validator, diff check, route/effect inventory | `reports/vgui-08-liquid-glass-research-baseline-and-route-plan-report.md` |
| VGUI-09 | `phase-09-liquid-glass-tokens-motion-and-shell.md` | VGUI-08 | Establish shared Liquid Glass tokens, glass primitives, motion rules, navigation/control shell, and reduced-preference fallbacks. | lint, i18n, focused shell tests, build, shell screenshots | `reports/vgui-09-liquid-glass-tokens-motion-and-shell-report.md` |
| VGUI-10 | `phase-10-liquid-glass-public-auth-and-entry-surfaces.md` | VGUI-09 | Upgrade all public, auth, legal, sample, pricing, and word-of-day routes without auth, legal, i18n, or billing drift. | focused public/auth tests, lint, i18n, build, public/auth screenshots | `reports/vgui-10-liquid-glass-public-auth-and-entry-surfaces-report.md` |
| VGUI-11 | `phase-11-liquid-glass-dashboard-core-learning.md` | VGUI-10 | Upgrade Today, Review, Practice, Chat, Vocabulary, and Analytics while preserving learning correctness. | focused dashboard tests, lint, i18n, build, learning-flow evidence | `reports/vgui-11-liquid-glass-dashboard-core-learning-report.md` |
| VGUI-12 | `phase-12-liquid-glass-specialist-modules-and-account.md` | VGUI-11 | Upgrade Reading, Listening, Grammar, Pronunciation, Writing, Exam, Learning Path, Memory, Leaderboard, Settings, and Profile. | module/account tests, lint, i18n, build, module screenshots | `reports/vgui-12-liquid-glass-specialist-modules-and-account-report.md` |
| VGUI-13 | `phase-13-liquid-glass-regression-accessibility-performance-release.md` | VGUI-12 | Prove full Liquid Glass readiness across all routes, effects, accessibility preferences, performance, and release gates. | lint, i18n, full tests, build, UI regression, learning-flow regression, strict harness validator | `reports/vgui-13-liquid-glass-regression-accessibility-performance-release-report.md` |

## Phase Report Index

| PHASE_ID | Required Report |
| --- | --- |
| VGUI-00 | `reports/vgui-00-baseline-ui-audit-and-inventory-report.md` |
| VGUI-01 | `reports/vgui-01-design-tokens-and-app-shell-report.md` |
| VGUI-02 | `reports/vgui-02-public-and-auth-surfaces-report.md` |
| VGUI-03 | `reports/vgui-03-dashboard-core-learning-flow-report.md` |
| VGUI-04 | `reports/vgui-04-skill-modules-and-utility-screens-report.md` |
| VGUI-05 | `reports/vgui-05-regression-evidence-and-release-gate-report.md` |
| VGUI-08 | `reports/vgui-08-liquid-glass-research-baseline-and-route-plan-report.md` |
| VGUI-09 | `reports/vgui-09-liquid-glass-tokens-motion-and-shell-report.md` |
| VGUI-10 | `reports/vgui-10-liquid-glass-public-auth-and-entry-surfaces-report.md` |
| VGUI-11 | `reports/vgui-11-liquid-glass-dashboard-core-learning-report.md` |
| VGUI-12 | `reports/vgui-12-liquid-glass-specialist-modules-and-account-report.md` |
| VGUI-13 | `reports/vgui-13-liquid-glass-regression-accessibility-performance-release-report.md` |

## Dependency Flow

```text
VGUI-00 Baseline UI Audit And Inventory
  -> VGUI-01 Design Tokens And App Shell
  -> VGUI-02 Public And Auth Surfaces
  -> VGUI-03 Dashboard Core Learning Flow
  -> VGUI-04 Skill Modules And Utility Screens
  -> VGUI-05 Regression Evidence And Release Gate
  -> VGUI-08 Liquid Glass Research Baseline And Route Plan
  -> VGUI-09 Liquid Glass Tokens Motion And Shell
  -> VGUI-10 Liquid Glass Public Auth And Entry Surfaces
  -> VGUI-11 Liquid Glass Dashboard Core Learning
  -> VGUI-12 Liquid Glass Specialist Modules And Account
  -> VGUI-13 Liquid Glass Regression Accessibility Performance Release
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
| VGUI-08 | no | yes | no | no | no | yes |
| VGUI-09 | no | yes | no | no | no | yes |
| VGUI-10 | no | yes | no | no | billing/auth provider changes require approval | yes |
| VGUI-11 | local seeded learning state only | yes | no | no | no | yes |
| VGUI-12 | local seeded learning/account state only | yes | no | no | no | yes |
| VGUI-13 | no | yes | no | no | production smoke/deploy only if approved | yes |

## Risk Matrix

| PHASE_ID | Primary Risk | Stop Condition |
| --- | --- | --- |
| VGUI-00 | Missing route coverage leads to a false global plan. | Stop if any scoped route cannot be loaded or captured and no blocker is recorded. |
| VGUI-01 | Token changes create regressions across unrelated pages. | Stop if a theme or shell change makes public or dashboard routes unreadable. |
| VGUI-02 | Public/auth copy or CTA changes alter auth or billing semantics. | Stop if billing, auth, demo, or legal behavior would need semantic changes. |
| VGUI-03 | Practice feedback becomes visually nicer but less correct. | Stop if first-wrong retry, reveal, recovered, or FSRS evidence cannot be verified. |
| VGUI-04 | Module pages drift into separate visual systems. | Stop if a module needs a new pattern not covered by shared component rules. |
| VGUI-05 | Release proceeds with weak evidence. | Stop if contact sheets, learning-flow regression, or build/test results are missing. |
| VGUI-08 | The new Liquid Glass objective is mistaken for already-completed VGUI evidence. | Stop if VGUI-08 through VGUI-13 are not represented in the oracle and loop state. |
| VGUI-09 | Shared glass utilities break fixed/sticky shell positioning or reduce contrast. | Stop if shell controls clip, overflow, or fail reduced-preference fallbacks. |
| VGUI-10 | Public/auth visual polish changes auth, legal, i18n, or billing meaning. | Stop if pricing fail-closed, auth, demo, legal, or form-label behavior changes. |
| VGUI-11 | Core dashboard looks better but learning states become less correct. | Stop if first-wrong retry, second-wrong reveal, review due-only behavior, or dense analytics cannot be verified. |
| VGUI-12 | Specialist modules become visually consistent but less readable. | Stop if passages, transcripts, writing feedback, exam prompts, settings forms, or profile data become hard to read. |
| VGUI-13 | Final release gate uses sampled evidence for a full-route claim. | Stop if any route, viewport, reduced-preference, or learning-flow evidence is missing without a blocker. |

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

- Historical browser screenshot output folder: `product-audit-2026-06-17/global-ui/`.
- Liquid Glass browser screenshot output folder: `product-audit-2026-06-20/liquid-glass/`.
- Vercel deployment: approval required.
- Production Supabase or billing provider changes: approval required.
- Figma output: optional, not required for this PRD.
