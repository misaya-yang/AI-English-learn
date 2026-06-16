# Phase 00 - Baseline UI Audit And Inventory

> For agentic workers: enter plan-first mode before editing. Execute this phase only, write the required evidence, and do not advance to the next phase until acceptance gates pass or blockers are documented.

**Goal:** Establish baseline code, validation, and boundary evidence for VocabDaily Global UI Upgrade PRD Harness.

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
    "id": "VGUI-00",
    "number": "00",
    "title": "Baseline UI Audit And Inventory",
    "status": "draft",
    "type": "baseline",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-global-ui-upgrade-prd",
    "phase_file": "docs/vocabdaily-global-ui-upgrade-prd/phase-00-baseline-ui-audit-and-inventory.md",
    "depends_on": [],
    "unlocks": [
      "VGUI-01"
    ]
  },
  "goal": {
    "target": "Establish baseline code, validation, and boundary evidence for VocabDaily Global UI Upgrade PRD Harness.",
    "prompt": "Complete VGUI-00 Baseline UI Audit And Inventory for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-00-baseline-ui-audit-and-inventory.md`; work on the matching feature-oracle item, preserve continuity with adjacent phases, write code facts back to the source packet and continuity ledger, stay inside the named edit boundaries, and finish only after validation, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-00-baseline-ui-audit-and-inventory-plan.md",
    "completion_report": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-00-baseline-ui-audit-and-inventory-report.md"
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
      "docs/vocabdaily-global-ui-upgrade-prd/phase-00-baseline-ui-audit-and-inventory.md"
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
      "baseline"
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
      "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-00-baseline-ui-audit-and-inventory-report.md"
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

- PHASE_ID: VGUI-00
- GOAL_TARGET: Establish baseline code, validation, and boundary evidence for VocabDaily Global UI Upgrade PRD Harness.
- GOAL_PROMPT: Complete VGUI-00 Baseline UI Audit And Inventory for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-00-baseline-ui-audit-and-inventory.md`; work on feature-oracle item VGUI-F001; preserve dependency continuity with none; write code facts and boundary decisions back before handoff; stay inside the named edit boundaries; finish only after validation, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: none
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
- EVIDENCE_OUTPUT: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-00-baseline-ui-audit-and-inventory-report.md`
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

Execute VGUI-00 by using the phase contract, updating VGUI-F001, and preserving the dependency chain `VGUI-00 Baseline UI Audit And Inventory
  -> VGUI-01 Design Tokens And App Shell
  -> VGUI-02 Public And Auth Surfaces
  -> VGUI-03 Dashboard Core Learning Flow
  -> VGUI-04 Skill Modules And Utility Screens
  -> VGUI-05 Regression Evidence And Release Gate`.

## Cross-Phase Continuity

- Depends on: none
- Unlocks: VGUI-01
- Feature-oracle item: VGUI-F001
- Continuity ledger: `docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md`
- Prior-phase evidence to inherit: no prior phase; establish baseline evidence for dependent phases
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

- Work needed to satisfy VGUI-F001 for Baseline UI Audit And Inventory.
- Code inspection and summary writeback required to keep later phases aligned.

Out of scope:

- Production deployment.
- Production data mutation.
- Unrelated feature work outside this phase chain.

## Context Policy

Before editing, inspect:

- Start with this phase file, `source-packet.md`, and `continuity-ledger.md`.
- Inspect the repository to establish baseline code facts before unlocking implementation phases.
- Expand repo context only to paths you record back into the source packet.

Do not load unrelated files unless a blocker requires expanding context.

## Requirements

### R1 Route Inventory

Record every route from `PRD.md` with route path, owning page file, shared shell, auth requirement, and whether the route has meaningful empty, loading, error, and completed states.

### R2 Visual Baseline

Capture desktop 1440x960 and mobile 390x844 screenshots for all scoped routes. Record blockers for routes that cannot be captured because of auth, provider, or runtime failure.

### R3 UI Debt Inventory

Group findings by severity: P0 learning trust, P0 visual trust, P1 product clarity, P1 UI consistency, and P2 coverage. Findings must point to route names, screenshots, or code paths.

### R4 Worktree Separation

Record current exploratory changes in `src/index.css` and `src/pages/Home.tsx` separately from accepted implementation.

## Test and Regression Requirements

Run or record blockers for:

```bash
npm run lint
npm run check:i18n
npm run build
npm test -- --run
```

Start a local preview when screenshots are required. Browser evidence must cover desktop and mobile.

## Compliance and Safety Requirements

Do not expose secrets, mutate production data, deploy, or change external services. Use local/demo auth state for dashboard screenshots.

## Rollback and Recovery

This phase should edit docs and audit output only. Rollback is reverting docs written under `docs/vocabdaily-global-ui-upgrade-prd/` and deleting incomplete screenshot output.

## Execution Capture

Write the phase report, append progress-log evidence, update oracle evidence, update source-packet route facts, update continuity-ledger boundaries, and refresh agent-handoff next action.

Use ``docs/vocabdaily-global-ui-upgrade-prd/reports/phase-report-template.md`` when writing the phase report.

## Evaluator Protocol

Reject completion if any scoped route lacks a screenshot or named blocker, if worktree exploratory changes are not recorded, or if source-packet route facts are missing.

## Acceptance Criteria

- VGUI-F001 has screenshot and command evidence, or a named blocker.
- `reports/vgui-00-baseline-ui-audit-and-inventory-report.md` exists.
- `source-packet.md` includes route owners, commands, shared UI entry points, and current risks.
- `continuity-ledger.md` names which phase owns each route group.
- `agent-handoff.md` states whether VGUI-01 is unlocked.

## Risks

- Missing screenshot coverage can make later phases optimize only the pages that are easiest to see.
- Provider reachability errors can be mistaken for UI failures unless recorded separately.
- Existing exploratory UI edits can be mistaken for completed work unless separated in the report.
