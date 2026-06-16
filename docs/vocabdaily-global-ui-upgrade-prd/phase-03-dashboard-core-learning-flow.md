# Phase 03 - Dashboard Core Learning Flow

> For agentic workers: enter plan-first mode before editing. Execute this phase only, write the required evidence, and do not advance to the next phase until acceptance gates pass or blockers are documented.

**Goal:** Complete the Dashboard Core Learning Flow slice while preserving prior phase contracts and downstream handoff boundaries.

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
    "id": "VGUI-03",
    "number": "03",
    "title": "Dashboard Core Learning Flow",
    "status": "draft",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-global-ui-upgrade-prd",
    "phase_file": "docs/vocabdaily-global-ui-upgrade-prd/phase-03-dashboard-core-learning-flow.md",
    "depends_on": [
      "VGUI-02"
    ],
    "unlocks": [
      "VGUI-04"
    ]
  },
  "goal": {
    "target": "Complete the Dashboard Core Learning Flow slice while preserving prior phase contracts and downstream handoff boundaries.",
    "prompt": "Complete VGUI-03 Dashboard Core Learning Flow for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-03-dashboard-core-learning-flow.md`; work on the matching feature-oracle item, preserve continuity with adjacent phases, write code facts back to the source packet and continuity ledger, stay inside the named edit boundaries, and finish only after validation, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-03-dashboard-core-learning-flow-plan.md",
    "completion_report": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-03-dashboard-core-learning-flow-report.md"
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
      "docs/vocabdaily-global-ui-upgrade-prd/phase-03-dashboard-core-learning-flow.md"
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
      "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-03-dashboard-core-learning-flow-report.md"
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

- PHASE_ID: VGUI-03
- GOAL_TARGET: Complete the Dashboard Core Learning Flow slice while preserving prior phase contracts and downstream handoff boundaries.
- GOAL_PROMPT: Complete VGUI-03 Dashboard Core Learning Flow for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-03-dashboard-core-learning-flow.md`; work on feature-oracle item VGUI-F004; preserve dependency continuity with VGUI-02; write code facts and boundary decisions back before handoff; stay inside the named edit boundaries; finish only after validation, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: VGUI-02
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
- EVIDENCE_OUTPUT: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-03-dashboard-core-learning-flow-report.md`
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

Execute VGUI-03 by using the phase contract, updating VGUI-F004, and preserving the dependency chain `VGUI-00 Baseline UI Audit And Inventory
  -> VGUI-01 Design Tokens And App Shell
  -> VGUI-02 Public And Auth Surfaces
  -> VGUI-03 Dashboard Core Learning Flow
  -> VGUI-04 Skill Modules And Utility Screens
  -> VGUI-05 Regression Evidence And Release Gate`.

## Cross-Phase Continuity

- Depends on: VGUI-02
- Unlocks: VGUI-04
- Feature-oracle item: VGUI-F004
- Continuity ledger: `docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md`
- Prior-phase evidence to inherit: the VGUI-02 phase report, progress-log entry, oracle evidence, and continuity-ledger boundary notes
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

- Work needed to satisfy VGUI-F004 for Dashboard Core Learning Flow.
- Code inspection and summary writeback required to keep later phases aligned.

Out of scope:

- Production deployment.
- Production data mutation.
- Unrelated feature work outside this phase chain.

## Context Policy

Before editing, inspect:

- Start with this phase file, `source-packet.md`, `continuity-ledger.md`, and the VGUI-02 phase report.
- Confirm inherited code facts and boundaries before editing.
- Expand repo context only to paths you record back into the source packet.

Do not load unrelated files unless a blocker requires expanding context.

## Requirements

### R1 Today And Review

`/dashboard/today` and `/dashboard/review` must show the next useful learning task, why it matters, due/review state, and completion state without decorative panels competing with the task.

### R2 Practice Feedback Loop

`/dashboard/practice` must preserve the retry state machine: answering, retrying, revealed, and next. First wrong attempt gives hint and retry without answer reveal. Second wrong or explicit reveal shows answer. Retry-correct is recovered, not first-try correct.

### R3 Coach And Vocabulary

`/dashboard/chat` and `/dashboard/vocabulary` must handle local auth, remote unavailable states, empty states, import/search/detail, and task recommendations without generic AI copy.

### R4 Analytics

`/dashboard/analytics` must summarize learning progress clearly, with useful empty and partial-data states and readable charts in light and dark modes.

## Test and Regression Requirements

Run:

```bash
npm run lint
npm run check:i18n
npm run build
npm test -- --run src/pages/dashboard/PracticePage.test.tsx src/pages/dashboard/ReviewPage.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/pages/dashboard/VocabularyBankPage.test.tsx src/features/practice/attemptState.test.ts src/features/learning/sessionRecap.test.ts
```

Capture desktop and mobile screenshots for Today, Review, Practice, Chat, Vocabulary, and Analytics. Run focused learning-flow checks for wrong/retry/reveal/recovered behavior.

## Compliance and Safety Requirements

Do not change FSRS, auth, Supabase persistence, billing, or AI provider semantics except for UI state display. Learning feedback must not rely on color alone.

## Rollback and Recovery

Rollback is reverting dashboard route UI, shared learning component, and regression-script changes from this phase while preserving VGUI-01 and VGUI-02 outputs.

## Execution Capture

Write the phase report, append progress-log evidence, update oracle evidence, update continuity-ledger boundaries, and refresh agent-handoff next action.

Use ``docs/vocabdaily-global-ui-upgrade-prd/reports/phase-report-template.md`` when writing the phase report.

## Evaluator Protocol

Reject completion if Practice reveals answers on first wrong attempt, if recovered is counted as first-try correct, if dashboard routes still look like unrelated tools, or if desktop 1440 is only a stretched mobile layout.

## Acceptance Criteria

- VGUI-F004 has command, screenshot, and learning-flow evidence.
- Today, Review, Practice, Chat, Vocabulary, and Analytics share one visual hierarchy.
- Practice retry and reveal states pass tests and browser evidence.
- Empty, loading, error, completion, and remote-unavailable states are visible where relevant.
- VGUI-04 receives shared module layout rules.

## Risks

- A visually pleasing Practice page can still be pedagogically wrong.
- Chat and Vocabulary can drift into separate product languages.
- Analytics can become dense without helping the learner decide what to do next.
