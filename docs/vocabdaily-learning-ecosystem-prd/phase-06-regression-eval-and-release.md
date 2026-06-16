# Phase 06 - Regression Eval And Release

> For agentic workers: enter plan-first mode before editing. Execute this phase only, write the required evidence, and do not advance to deployment until acceptance gates pass or blockers are documented.

**Goal:** Package the full learning ecosystem upgrade for release with tests, browser regression, AI evals, production smoke, monitoring notes, rollback, and known-blocker evidence.

**Architecture:** This phase is the release gate. It should not introduce product features unless a release-blocking defect is found and fixed inside the named boundaries with new evidence.

**Tech Stack:** npm validation commands, Vitest, Playwright scripts, production smoke script, Supabase smoke, Vercel deployment gate, phase reports, rollback notes.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v2",
  "harness_role": "execution",
  "phase": {
    "id": "VLE-06",
    "number": "06",
    "title": "Regression Eval And Release",
    "status": "ready",
    "type": "release",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-learning-ecosystem-prd",
    "phase_file": "docs/vocabdaily-learning-ecosystem-prd/phase-06-regression-eval-and-release.md",
    "depends_on": ["VLE-05"],
    "unlocks": []
  },
  "goal": {
    "target": "Complete release validation for the learning ecosystem upgrade and produce deployment, smoke, monitoring, and rollback evidence.",
    "prompt": "Complete VLE-06 Regression Eval And Release for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-06-regression-eval-and-release.md`; run full validation and release gates, separate provider blockers from code defects, request approval before deployment, stay inside named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-06-regression-eval-and-release-plan.md",
    "completion_report": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-06-regression-eval-and-release-report.md"
  },
  "runtime": {
    "feature_oracle": "docs/vocabdaily-learning-ecosystem-prd/feature-oracle.json",
    "loop_contract": "docs/vocabdaily-learning-ecosystem-prd/loop-contract.json",
    "loop_state": "docs/vocabdaily-learning-ecosystem-prd/loop-state.json",
    "progress_log": "docs/vocabdaily-learning-ecosystem-prd/progress-log.md",
    "handoff": "docs/vocabdaily-learning-ecosystem-prd/agent-handoff.md",
    "continuity_ledger": "docs/vocabdaily-learning-ecosystem-prd/continuity-ledger.md",
    "next_window_prompt": "docs/vocabdaily-learning-ecosystem-prd/next-window-prompt.md",
    "session_boot": {
      "read_progress": true,
      "run_baseline_check": true,
      "update_progress_before_exit": true
    },
    "agent_roles": ["planner", "generator", "evaluator"]
  },
  "context": {
    "read_first": [
      "docs/vocabdaily-learning-ecosystem-prd/README.md",
      "docs/vocabdaily-learning-ecosystem-prd/phase-manifest.md",
      "docs/vocabdaily-learning-ecosystem-prd/phase-06-regression-eval-and-release.md",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-05-learning-workbench-ui-system-report.md"
    ],
    "primary_context": [
      "package.json",
      "scripts/ui-regression.mjs",
      "scripts/learning-flow-regression.mjs",
      "scripts/prod-smoke.mjs",
      "scripts/e2e-smoke.mjs",
      "docs/ops/PRODUCT_REGRESSION_RUNBOOK.md",
      "docs/ops/SMOKE_COVERAGE.md",
      "docs/ops/SUPABASE_RELEASE_CHECKLIST.md",
      "vercel.json",
      "supabase/functions/README.md"
    ],
    "context_budget": "focused",
    "do_not_load_unless": [
      "Feature implementation files may be opened only to fix a release-blocking regression with a focused test"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-06-regression-eval-and-release-plan.md",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-06-regression-eval-and-release-report.md",
      "docs/ops/PRODUCT_REGRESSION_RUNBOOK.md",
      "docs/ops/SMOKE_COVERAGE.md",
      "scripts/ui-regression.mjs",
      "scripts/learning-flow-regression.mjs",
      "scripts/prod-smoke.mjs",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/"
    ],
    "do_not_edit": [
      "feature files unless a release-blocking defect is documented",
      "billing fail-closed rules",
      "production env values",
      "secrets files"
    ],
    "external_inputs": [
      "production URL",
      "Supabase project reachability",
      "Vercel project access",
      "explicit user approval for deployment"
    ],
    "secrets_required": [
      "VITE_SUPABASE_URL for production smoke",
      "VITE_SUPABASE_ANON_KEY for production smoke",
      "Vercel authentication handled by CLI or connector"
    ]
  },
  "tool_policy": {
    "allowed_tools": ["rg", "npm validation commands", "Playwright regression scripts", "production smoke script", "Vercel deploy command after approval"],
    "approval_required": ["production deployment", "Supabase function deployment", "production migration", "production env change", "billing behavior change"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "production migration without approval", "force push"]
  },
  "risk": {
    "tags": ["frontend", "ui", "browser", "ai", "eval", "auth", "security", "external-service", "release"],
    "data_mutation": "release metadata and optional smoke test accounts",
    "migration_required": "possible",
    "browser_required": true,
    "ai_eval_required": true,
    "external_service_required": true,
    "release_blocking": true
  },
  "validation": {
    "commands": [
      {
        "id": "lint",
        "cwd": ".",
        "command": "npm run lint",
        "expected": "ESLint completes with zero errors.",
        "required": true
      },
      {
        "id": "i18n",
        "cwd": ".",
        "command": "npm run check:i18n",
        "expected": "i18n check completes with zero missing-key errors.",
        "required": true
      },
      {
        "id": "build",
        "cwd": ".",
        "command": "npm run build",
        "expected": "Production build completes.",
        "required": true
      },
      {
        "id": "unit-suite",
        "cwd": ".",
        "command": "npm test -- --run",
        "expected": "Full Vitest suite passes.",
        "required": true
      },
      {
        "id": "ui-regression",
        "cwd": ".",
        "command": "BASE_URL=http://127.0.0.1:4173 npm run test:ui-regression",
        "expected": "UI regression passes for required routes and viewports.",
        "required": true
      },
      {
        "id": "learning-flow-regression",
        "cwd": ".",
        "command": "BASE_URL=http://127.0.0.1:4173 npm run test:learning-flow-regression",
        "expected": "Learning-flow regression passes for routes, themes, and quick navigation.",
        "required": true
      },
      {
        "id": "prod-smoke",
        "cwd": ".",
        "command": "npm run smoke:prod",
        "expected": "Production smoke passes or the report separates provider reachability failures from application failures.",
        "required": true
      }
    ],
    "browser_checks": [
      "Open production /, /login, /pricing, /word-of-the-day and confirm 200 response and visible page body.",
      "Open production /dashboard/today with invalid or expired auth state and confirm no Supabase refresh storm.",
      "Open preview or production /dashboard/practice and confirm two-attempt reveal behavior after deployment.",
      "Open preview or production /dashboard/vocabulary and confirm import/export entry points still render.",
      "Confirm no console error burst above the release threshold documented in the report."
    ],
    "regression_scope": [
      "All phases VLE-00 through VLE-05 have reports or explicit waivers.",
      "Known provider/network failures are listed separately from code regressions.",
      "Rollback path covers frontend deploy, Supabase functions, and migrations if present.",
      "Monitoring notes name the first metrics to watch after release."
    ],
    "compliance_gates": [
      "Production deployment requires explicit user approval.",
      "No secrets are printed or committed.",
      "Auth refresh failure must not create repeated token refresh attempts.",
      "Billing fail-closed behavior remains unchanged unless explicitly approved.",
      "AI provider failures must not block core vocabulary and review flows.",
      "Smoke test accounts or imported test books must be disposable."
    ],
    "acceptance_gates": [
      "All required commands pass or have documented provider blockers with direct evidence.",
      "Desktop and mobile regression artifacts exist for the upgraded learning ecosystem.",
      "AI golden evals and fallback states are included in the release report.",
      "Production smoke covers frontend, auth health, AI chat, billing checkout, pricing, and word-of-the-day.",
      "Release report names deploy target, commit SHA, rollback target, monitoring checklist, and unresolved risks."
    ],
    "rollback_plan": [
      "Frontend rollback: redeploy the previous Vercel deployment or revert the release commit and redeploy after approval.",
      "Supabase function rollback: redeploy the previous known-good function bundle after approval.",
      "Database rollback: execute the paired down migration only after approval and backup confirmation.",
      "Feature rollback: disable new route entry points or hide new actions behind existing feature flags when available."
    ]
  },
  "evidence": {
    "outputs": [
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-06-regression-eval-and-release-report.md",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/"
    ],
    "required_artifacts": ["phase report", "full command output summary", "UI regression summary", "learning-flow summary", "production smoke output", "rollback checklist"],
    "waiver_policy": "A release gate may be waived only by explicit user approval recorded in the report with remaining risk and dependent action.",
    "next_phase_handoff": "This is the final harness phase; hand off commit, deploy, smoke, monitoring, and rollback evidence."
  },
  "stop_conditions": [
    "Stop before deployment if user approval is absent.",
    "Stop if production smoke shows an application failure that is not understood.",
    "Stop if billing, auth, or AI failures cannot be separated from provider reachability.",
    "Stop if rollback target is unknown."
  ]
}
```

## Coding Agent Contract

- PHASE_ID: VLE-06
- GOAL_TARGET: Complete release validation for the learning ecosystem upgrade and produce deployment, smoke, monitoring, and rollback evidence.
- GOAL_PROMPT: Complete VLE-06 Regression Eval And Release for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-06-regression-eval-and-release.md`; run full validation and release gates, separate provider blockers from code defects, request approval before deployment, stay inside named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: VLE-05
- READ_FIRST: `docs/vocabdaily-learning-ecosystem-prd/README.md`, `docs/vocabdaily-learning-ecosystem-prd/phase-manifest.md`, this file, `docs/vocabdaily-learning-ecosystem-prd/reports/vle-05-learning-workbench-ui-system-report.md`
- PRIMARY_CONTEXT: `package.json`, `scripts/ui-regression.mjs`, `scripts/learning-flow-regression.mjs`, `scripts/prod-smoke.mjs`, `docs/ops/PRODUCT_REGRESSION_RUNBOOK.md`, `docs/ops/SMOKE_COVERAGE.md`, `docs/ops/SUPABASE_RELEASE_CHECKLIST.md`, `vercel.json`
- LIKELY_EDIT_PATHS: release reports, ops docs, regression scripts, smoke script, release evidence folder
- DO_NOT_EDIT: feature files unless a release-blocking defect is documented, billing fail-closed rules, production env values, secrets files
- EXECUTION_MODE: plan-first; validate; smoke; request deployment approval; record rollback and monitoring evidence
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm run build`; `npm test -- --run`; `BASE_URL=http://127.0.0.1:4173 npm run test:ui-regression`; `BASE_URL=http://127.0.0.1:4173 npm run test:learning-flow-regression`; `npm run smoke:prod`
- BROWSER_CHECKS: production public pages, bad-token dashboard behavior, deployed practice reveal rule, deployed vocabulary entry points, console error threshold
- REGRESSION_SCOPE: all phase reports, provider blocker classification, frontend/function/migration rollback, monitoring notes
- COMPLIANCE_GATES: deployment approval, no secrets, auth refresh safety, billing unchanged, AI fallback, disposable smoke data
- ROLLBACK_PLAN: previous Vercel deployment, previous Supabase functions, paired down migration after approval, feature entry point disablement
- ACCEPTANCE_GATES: required commands pass or provider blockers are documented; regression artifacts exist; AI evals included; production smoke covered; release report contains deploy and rollback metadata
- EVIDENCE_OUTPUT: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-06-regression-eval-and-release-report.md`
- STOP_CONDITIONS: deployment approval absent; unexplained production application failure; provider reachability unclear; rollback target unknown

## Task Spec

Run the final release gate for the learning ecosystem upgrade. This phase proves that product behavior, UI, AI, auth, and release safety are ready, or it records a precise blocker.

## Problem Boundary

In scope:

- Full validation commands.
- UI and learning-flow regression.
- AI eval evidence.
- Production smoke.
- Deployment approval gate.
- Rollback and monitoring notes.

Out of scope:

- New product features.
- Payment semantics changes.
- Production migrations without approval.
- Secret rotation.

## Context Policy

Start from reports and scripts. Open feature files only when a release-blocking regression is found and the report names the defect.

## Requirements

### R1 Full Validation

Run the standard commands and record result, duration when available, and failure classification.

### R2 Browser And Production Smoke

Validate public routes, dashboard bad-token behavior, practice reveal behavior, and vocabulary entry points in preview or production.

### R3 Release Decision

The report must say ship, do not ship, or ship with explicit user waiver. It must include evidence.

### R4 Rollback

The report must name the previous frontend deployment, function rollback path, migration rollback path, and feature disable path.

## Test and Regression Requirements

- Full unit suite.
- UI regression.
- Learning-flow regression.
- Production smoke with provider reachability classification.

## Compliance and Safety Requirements

- Do not deploy without approval.
- Do not print secrets.
- Do not change billing behavior.
- Do not mutate production data without approval.
- Do not hide provider failures as product success.

## Rollback and Recovery

Use the rollback plan in the machine contract. If the rollback target cannot be identified, deployment must not proceed.

## Execution Capture

Use `docs/vocabdaily-learning-ecosystem-prd/reports/phase-report-template.md` and save the phase report at `docs/vocabdaily-learning-ecosystem-prd/reports/vle-06-regression-eval-and-release-report.md`.

## Evaluator Protocol

Evaluate the release report as if a different engineer must rollback at midnight. The report must contain enough concrete data to decide and act.

## Acceptance Criteria

- Release evidence is complete.
- Deployment approval gate is respected.
- Known blockers are specific and reproducible.
- The final state can be shipped or safely stopped.

## Risks

- Network restrictions can make Supabase smoke fail from the local environment.
- Vercel or Supabase credentials may be missing.
- A late release-blocking defect can require a focused fix and another validation run.
