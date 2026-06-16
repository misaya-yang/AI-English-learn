# Phase 05 - Regression Evidence And Release Gate

> For agentic workers: enter plan-first mode before editing. Execute this phase only, write the required evidence, and do not advance to the next phase until acceptance gates pass or blockers are documented.

**Goal:** Complete the Regression Evidence And Release Gate slice while preserving prior phase contracts and downstream handoff boundaries.

**Architecture:** This phase inherits code facts from `source-packet.md`, boundary decisions from `continuity-ledger.md`, and prior evidence from the dependency phase report.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS 3, Radix/shadcn-style local components, lucide-react, i18n, Supabase integration, and Playwright-based UI regression scripts.

---

## Machine Contract

The JSON block below is the authoritative machine-readable contract for goal-mode agents and validators. Keep it synchronized with the human-readable sections.

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "VGUI-05",
    "number": "05",
    "title": "Regression Evidence And Release Gate",
    "status": "draft",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-global-ui-upgrade-prd",
    "phase_file": "docs/vocabdaily-global-ui-upgrade-prd/phase-05-regression-evidence-and-release-gate.md",
    "depends_on": [
      "VGUI-04"
    ],
    "unlocks": []
  },
  "goal": {
    "target": "Complete the Regression Evidence And Release Gate slice while preserving prior phase contracts and downstream handoff boundaries.",
    "prompt": "Complete VGUI-05 Regression Evidence And Release Gate for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-05-regression-evidence-and-release-gate.md`; work on the matching feature-oracle item, preserve continuity with adjacent phases, write code facts back to the source packet and continuity ledger, stay inside the named edit boundaries, and finish only after validation, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-05-regression-evidence-and-release-gate-plan.md",
    "completion_report": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-05-regression-evidence-and-release-gate-report.md"
  },
  "runtime": {
    "feature_oracle": "docs/vocabdaily-global-ui-upgrade-prd/feature-oracle.json",
    "loop_contract": "docs/vocabdaily-global-ui-upgrade-prd/loop-contract.json",
    "loop_state": "docs/vocabdaily-global-ui-upgrade-prd/loop-state.json",
    "progress_log": "docs/vocabdaily-global-ui-upgrade-prd/progress-log.md",
    "handoff": "docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md",
    "continuity_ledger": "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md",
    "next_window_prompt": "docs/vocabdaily-global-ui-upgrade-prd/next-window-prompt.md",
    "session_boot": {
      "read_progress": true,
      "run_baseline_check": true,
      "update_progress_before_exit": true
    },
    "agent_roles": [
      "planner",
      "generator",
      "evaluator"
    ]
  },
  "context": {
    "read_first": [
      "docs/vocabdaily-global-ui-upgrade-prd/README.md",
      "docs/vocabdaily-global-ui-upgrade-prd/phase-manifest.md",
      "docs/vocabdaily-global-ui-upgrade-prd/loop-contract.json",
      "docs/vocabdaily-global-ui-upgrade-prd/loop-state.json",
      "docs/vocabdaily-global-ui-upgrade-prd/feature-oracle.json",
      "docs/vocabdaily-global-ui-upgrade-prd/progress-log.md",
      "docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md",
      "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md",
      "docs/vocabdaily-global-ui-upgrade-prd/next-window-prompt.md",
      "docs/vocabdaily-global-ui-upgrade-prd/phase-05-regression-evidence-and-release-gate.md"
    ],
    "primary_context": [
      "docs/vocabdaily-global-ui-upgrade-prd/README.md",
      "docs/vocabdaily-global-ui-upgrade-prd/source-packet.md",
      "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md",
      "PRD.md, source-packet.md, phase-manifest.md, src/App.tsx, src/index.css, src/layouts/DashboardLayout.tsx, src/pages/**, src/features/**"
    ],
    "context_budget": "focused",
    "do_not_load_unless": [
      "external dashboards",
      "production environments",
      "unrelated modules not named by the phase contract"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "docs/vocabdaily-global-ui-upgrade-prd/source-packet.md",
      "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md",
      "docs/vocabdaily-global-ui-upgrade-prd/progress-log.md",
      "docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md",
      "phase-named source paths and report files"
    ],
    "do_not_edit": [
      "production systems",
      "secret files",
      "deployment configuration",
      "unrelated roadmap or product scopes"
    ],
    "external_inputs": [
      "local screenshots and repo files; external providers require explicit approval before use"
    ],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": [
      "repo search",
      "shell validation"
    ],
    "approval_required": [
      "production data mutation",
      "destructive commands",
      "external service changes",
      "deployment"
    ],
    "dangerous_commands": [
      "git reset --hard",
      "rm -rf",
      "production migration"
    ]
  },
  "risk": {
    "tags": [
      "implementation"
    ],
    "data_mutation": false,
    "migration_required": false,
    "browser_required": true,
    "ai_eval_required": false,
    "external_service_required": false,
    "release_blocking": true
  },
  "validation": {
    "commands": [
      {
        "id": "repo-test-discovery",
        "cwd": ".",
        "command": "npm run lint",
        "expected": "ESLint completes with zero errors",
        "required": true
      }
    ],
    "browser_checks": [
      "Capture phase-specific routes at desktop 1440x960 and mobile 390x844; record blockers for unavailable routes"
    ],
    "regression_scope": [
      "prior phase report evidence and feature-oracle status remain valid"
    ],
    "compliance_gates": [
      "do not read or write secrets",
      "do not mutate production data",
      "document approval before external service or deployment changes"
    ],
    "acceptance_gates": [
      "phase report exists with validation or blocker evidence",
      "feature-oracle item is updated with evidence or blocker notes",
      "source-packet and continuity-ledger code summaries are updated",
      "progress-log and agent-handoff name the next concrete action"
    ],
    "rollback_plan": [
      "revert phase-scoped changes and restore runtime docs from git if validation fails"
    ]
  },
  "evidence": {
    "outputs": [
      "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-05-regression-evidence-and-release-gate-report.md"
    ],
    "required_artifacts": [
      "phase report",
      "progress-log entry",
      "feature-oracle evidence",
      "continuity-ledger update",
      "source-packet code summary"
    ],
    "waiver_policy": "Only mark a gate waived when the user explicitly waives it or the report documents a blocker and remaining evidence.",
    "next_phase_handoff": "State whether dependent phases are unlocked and what the next agent must know."
  },
  "stop_conditions": [
    "required route screenshots or validation evidence are missing",
    "credentials or approvals are required but not documented",
    "destructive commands, production data access, or out-of-scope edits are required"
  ]
}
```

## Coding Agent Contract

- PHASE_ID: VGUI-05
- GOAL_TARGET: Complete the Regression Evidence And Release Gate slice while preserving prior phase contracts and downstream handoff boundaries.
- GOAL_PROMPT: Complete VGUI-05 Regression Evidence And Release Gate for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-05-regression-evidence-and-release-gate.md`; work on feature-oracle item VGUI-F006; preserve dependency continuity with VGUI-04; write code facts and boundary decisions back before handoff; stay inside the named edit boundaries; finish only after validation, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: VGUI-04
- READ_FIRST: `docs/vocabdaily-global-ui-upgrade-prd/README.md`, `docs/vocabdaily-global-ui-upgrade-prd/phase-manifest.md`, this file
- PRIMARY_CONTEXT: docs/vocabdaily-global-ui-upgrade-prd/README.md, docs/vocabdaily-global-ui-upgrade-prd/source-packet.md, docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md, PRD.md, source-packet.md, phase-manifest.md, src/App.tsx, src/index.css, src/layouts/DashboardLayout.tsx, src/pages/**, src/features/**
- LIKELY_EDIT_PATHS: docs/vocabdaily-global-ui-upgrade-prd/source-packet.md, docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md, docs/vocabdaily-global-ui-upgrade-prd/progress-log.md, docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md, phase-named source paths and report files
- DO_NOT_EDIT: production systems, secret files, deployment configuration, unrelated roadmap or product scopes
- EXECUTION_MODE: plan-first; implement stepwise; verify before completion; write evidence before handoff
- VALIDATION_COMMANDS: npm run lint; npm run check:i18n; npm run build; npm test -- --run
- BROWSER_CHECKS: Capture phase-specific routes at desktop 1440x960 and mobile 390x844; record blockers for unavailable routes.
- REGRESSION_SCOPE: Prior phase report evidence, feature-oracle status, and continuity-ledger boundaries remain valid.
- COMPLIANCE_GATES: Do not read/write secrets, mutate production data, deploy, or change external services without documented approval.
- ROLLBACK_PLAN: Revert phase-scoped changes and restore runtime docs from git if validation fails.
- ACCEPTANCE_GATES: Phase report exists; validation or blocker evidence is recorded; oracle item, progress log, handoff, source packet, and continuity ledger are updated.
- EVIDENCE_OUTPUT: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-05-regression-evidence-and-release-gate-report.md`
- STOP_CONDITIONS: Stop if exact code paths, credentials, approvals, destructive commands, production data access, or out-of-scope edits are required but undocumented.

## Harness Runtime

- FEATURE_ORACLE: `docs/vocabdaily-global-ui-upgrade-prd/feature-oracle.json`
- LOOP_CONTRACT: `docs/vocabdaily-global-ui-upgrade-prd/loop-contract.json`
- LOOP_STATE: `docs/vocabdaily-global-ui-upgrade-prd/loop-state.json`
- PROGRESS_LOG: `docs/vocabdaily-global-ui-upgrade-prd/progress-log.md`
- AGENT_HANDOFF: `docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md`
- NEXT_WINDOW_PROMPT: `docs/vocabdaily-global-ui-upgrade-prd/next-window-prompt.md`
- CONTINUITY_LEDGER: `docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md`

Session boot:

1. Read the runtime artifacts above.
2. Follow the loop contract: observe, select, execute, verify, record, decide.
3. Run the target phase's baseline or smoke validation before implementation when available.
4. Select one matching feature-oracle item and keep work scoped to that item and this phase.
5. Summarize inspected code facts and interface decisions back into the source packet and continuity ledger.
6. Update loop state, progress, continuity, and handoff files before exiting.

## Feature Oracle Policy

The feature oracle is the durable test list for long-running agents. Do not delete oracle cases to make completion easier. Update only `status`, `evidence`, and `notes` unless the user explicitly changes scope.

Status rules:

- `failing`: not implemented or not verified.
- `passing`: end-to-end evidence exists.
- `blocked`: a named dependency, credential, environment, or scope issue prevents completion.
- `waived`: the user explicitly waived the case and remaining risk is documented.

## Task Spec

Execute VGUI-05 by using the phase contract, updating VGUI-F006, and preserving the dependency chain `VGUI-00 Baseline UI Audit And Inventory
  -> VGUI-01 Design Tokens And App Shell
  -> VGUI-02 Public And Auth Surfaces
  -> VGUI-03 Dashboard Core Learning Flow
  -> VGUI-04 Skill Modules And Utility Screens
  -> VGUI-05 Regression Evidence And Release Gate`.

## Cross-Phase Continuity

- Depends on: VGUI-04
- Unlocks: none
- Feature-oracle item: VGUI-F006
- Continuity ledger: `docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md`
- Prior-phase evidence to inherit: the VGUI-04 phase report, progress-log entry, oracle evidence, and continuity-ledger boundary notes
- Boundary this phase must preserve for later phases: code/interface facts written by prior phases and any downstream contract named in the continuity ledger
- Handoff this phase must produce: phase report, progress-log entry, oracle evidence, source-packet code summary, continuity-ledger update, and agent-handoff next action

## Code Summary Writeback

Before claiming completion, inspect the code paths allowed by this phase and write back:

- `source-packet.md`: summarize discovered files, services, routes, schemas, tests, commands, and runtime constraints.
- `continuity-ledger.md`: record interface boundaries, dependency assumptions, changed contracts, and any downstream phase impact.
- `agent-handoff.md`: state the next concrete action, active feature-oracle item, validation evidence, and blocker status.
- Phase report: link validation output and the exact code-summary update.

## Problem Boundary

In scope:

- Work needed to satisfy VGUI-F006 for Regression Evidence And Release Gate.
- Code inspection and summary writeback required to keep later phases aligned.

Out of scope:

- Production deployment.
- Production data mutation.
- Unrelated feature work outside this phase chain.

## Context Policy

Before editing, inspect:

- Start with this phase file, `source-packet.md`, `continuity-ledger.md`, and the VGUI-04 phase report.
- Confirm inherited code facts and boundaries before editing.
- Expand repo context only to paths you record back into the source packet.

Do not load unrelated files unless a blocker requires expanding context.

## Requirements

### R1 Full Command Gate

Run and record:

```bash
npm run lint
npm run check:i18n
npm run build
npm test -- --run
```

Failures must include exact command, error summary, owner area, and whether release is blocked.

### R2 Full Route UI Regression

Run UI regression across every route in `PRD.md`, desktop 1440x960 and mobile 390x844. Output must include screenshots, summary JSON, and contact sheets.

### R3 Learning-Flow Regression

Run learning-flow regression for Practice wrong/retry/reveal/recovered, listening retry, recap stats, theme switching, and route switching. The run must fail if first wrong answer reveals the expected answer.

### R4 Release Report

Write a release report with validation matrix, screenshot paths, known risks, rollback plan, production-smoke recommendation, and whether deployment is recommended.

## Test and Regression Requirements

Run:

```bash
npm run lint
npm run check:i18n
npm run build
npm test -- --run
BASE_URL=http://127.0.0.1:4173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-17/global-ui npm run test:ui-regression
BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-17/global-ui-learning npm run test:learning-flow-regression
```

Production smoke and deployment require explicit user approval.

## Compliance and Safety Requirements

Do not deploy, mutate production data, or change providers without explicit approval. Redact personal data from screenshot evidence.

## Rollback and Recovery

Rollback is reverting the UI upgrade commit range. The release report must name files touched, known rollback risks, and whether any data/provider state was touched.

## Execution Capture

Write the phase report, append progress-log evidence, update oracle evidence, update continuity-ledger boundaries, and refresh agent-handoff next action.

Use ``docs/vocabdaily-global-ui-upgrade-prd/reports/phase-report-template.md`` when writing the phase report.

## Evaluator Protocol

Reject completion if any scoped route is missing from regression, if screenshot evidence only covers mobile or only covers desktop, if learning-flow regression is skipped, or if deployment is recommended with unresolved P0 issues.

## Acceptance Criteria

- VGUI-F006 has command, UI regression, learning-flow regression, and contact-sheet evidence.
- All scoped routes are present in the regression summary or have a named blocker.
- Light, dark, and system behavior is covered where theme state is touched.
- Release report says deploy, do not deploy, or deploy after named blocker resolution.
- `feature-oracle.json` statuses are updated with evidence paths.

## Risks

- A release can look visually improved while a learning-flow invariant is broken.
- Production provider failures can be misclassified as UI defects.
- Screenshot volume can hide one broken route unless summary JSON and contact sheets are reviewed.
