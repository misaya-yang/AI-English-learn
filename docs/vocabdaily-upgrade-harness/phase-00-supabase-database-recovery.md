# Phase 00 - Supabase Database Recovery

> For agentic workers: this phase is already passing. Do not re-execute provider actions unless production smoke regresses.

**Goal:** Restore production Supabase reachability and proxy correctness for VocabDaily.

**Architecture:** Vercel serves the React app and routes `/api/supabase/*` through `api/supabase.js` to Supabase project `zjkbktdmwencnouwfrij`.

**Tech Stack:** Vercel API Route, Supabase Auth, Supabase Edge Functions, React/Vite app, Vitest.

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "VD-00",
    "number": "00",
    "title": "Supabase Database Recovery",
    "status": "passed",
    "type": "release",
    "repo_path": "/Users/yang/projects/app",
    "docs_path": "docs/vocabdaily-upgrade-harness",
    "phase_file": "docs/vocabdaily-upgrade-harness/phase-00-supabase-database-recovery.md",
    "depends_on": [],
    "unlocks": ["VD-01"]
  },
  "goal": {
    "target": "Restore production Supabase reachability and proxy correctness for VocabDaily.",
    "prompt": "Complete VD-00 Supabase Database Recovery by following docs/vocabdaily-upgrade-harness/phase-00-supabase-database-recovery.md; verify Supabase reachability, proxy response readability, production smoke, and evidence report before unlocking VD-01.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-upgrade-harness/reports/vd-00-supabase-database-recovery-plan.md",
    "completion_report": "docs/vocabdaily-upgrade-harness/reports/vd-00-supabase-database-recovery-report.md"
  },
  "runtime": {
    "feature_oracle": "docs/vocabdaily-upgrade-harness/feature-oracle.json",
    "loop_contract": "docs/vocabdaily-upgrade-harness/loop-contract.json",
    "loop_state": "docs/vocabdaily-upgrade-harness/loop-state.json",
    "progress_log": "docs/vocabdaily-upgrade-harness/progress-log.md",
    "handoff": "docs/vocabdaily-upgrade-harness/agent-handoff.md",
    "continuity_ledger": "docs/vocabdaily-upgrade-harness/continuity-ledger.md",
    "next_window_prompt": "docs/vocabdaily-upgrade-harness/next-window-prompt.md",
    "session_boot": {"read_progress": true, "run_baseline_check": true, "update_progress_before_exit": true},
    "agent_roles": ["planner", "generator", "evaluator"]
  },
  "context": {
    "read_first": ["docs/vocabdaily-upgrade-harness/README.md", "docs/vocabdaily-upgrade-harness/phase-manifest.md", "docs/vocabdaily-upgrade-harness/source-packet.md", "docs/vocabdaily-upgrade-harness/reports/vd-00-supabase-database-recovery-report.md"],
    "primary_context": ["api/supabase.js", "src/lib/supabaseProxy.test.ts", "scripts/prod-smoke.mjs", "vercel.json", ".env.example"],
    "context_budget": "focused",
    "do_not_load_unless": ["Supabase dashboard", "Vercel dashboard", "secret env files"]
  },
  "boundaries": {
    "likely_edit_paths": ["api/supabase.js", "src/lib/supabaseProxy.test.ts", "docs/vocabdaily-upgrade-harness/**"],
    "do_not_edit": ["supabase/migrations/**", "billing/payment semantics", "unrelated UI pages"],
    "external_inputs": ["Supabase project dashboard", "Vercel production deployment"],
    "secrets_required": ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]
  },
  "tool_policy": {
    "allowed_tools": ["repo search", "shell validation", "in-app browser", "Vercel CLI"],
    "approval_required": ["new Supabase project", "production migration", "destructive command", "force push"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "supabase db reset", "production schema migration"]
  },
  "risk": {
    "tags": ["auth", "database", "external-service", "release"],
    "data_mutation": true,
    "migration_required": false,
    "browser_required": true,
    "ai_eval_required": false,
    "external_service_required": true,
    "release_blocking": true
  },
  "validation": {
    "commands": [
      {"id": "lint", "cwd": "/Users/yang/projects/app", "command": "npm run lint", "expected": "exit 0", "required": true},
      {"id": "i18n", "cwd": "/Users/yang/projects/app", "command": "npm run check:i18n", "expected": "exit 0", "required": true},
      {"id": "build", "cwd": "/Users/yang/projects/app", "command": "npm run build", "expected": "exit 0", "required": true},
      {"id": "tests", "cwd": "/Users/yang/projects/app", "command": "npm test -- --run", "expected": "exit 0", "required": true},
      {"id": "prod-smoke", "cwd": "/Users/yang/projects/app", "command": "npm run smoke:prod", "expected": "8 passed, 0 failed", "required": true}
    ],
    "browser_checks": ["Supabase in-app browser project page shows project URL for zjkbktdmwencnouwfrij"],
    "regression_scope": ["public routes still return 200", "Edge Functions fail closed without JWT", "proxy body remains readable"],
    "compliance_gates": ["do not print secrets", "do not create new project if existing project is recoverable", "production smoke after deploy"],
    "acceptance_gates": ["Supabase Auth health returns 200 directly and through proxy", "signup/login probes return readable JSON", "phase report exists"],
    "rollback_plan": ["revert commit a766cf1 if proxy behavior regresses", "resume same Supabase project if it pauses again"]
  },
  "evidence": {
    "outputs": ["docs/vocabdaily-upgrade-harness/reports/vd-00-supabase-database-recovery-report.md"],
    "required_artifacts": ["phase report", "production smoke output", "proxy regression test"],
    "waiver_policy": "No waiver recorded.",
    "next_phase_handoff": "VD-01 is unlocked for browser-level auth UI verification."
  },
  "stop_conditions": ["Supabase account access missing", "production smoke fails after deploy", "schema migration needed without approval"]
}
```

## Coding Agent Contract

- PHASE_ID: VD-00
- GOAL_TARGET: Restore production Supabase reachability and proxy correctness for VocabDaily.
- GOAL_PROMPT: Complete VD-00 Supabase Database Recovery by following `docs/vocabdaily-upgrade-harness/phase-00-supabase-database-recovery.md`; verify Supabase reachability, proxy response readability, production smoke, and evidence report before unlocking VD-01.
- DEPENDS_ON: none
- READ_FIRST: `docs/vocabdaily-upgrade-harness/README.md`, `docs/vocabdaily-upgrade-harness/phase-manifest.md`, this file
- PRIMARY_CONTEXT: `api/supabase.js`, `src/lib/supabaseProxy.test.ts`, `scripts/prod-smoke.mjs`, `vercel.json`, `.env.example`
- LIKELY_EDIT_PATHS: `api/supabase.js`, `src/lib/supabaseProxy.test.ts`, `docs/vocabdaily-upgrade-harness/**`
- DO_NOT_EDIT: `supabase/migrations/**`, billing/payment semantics, unrelated UI pages
- EXECUTION_MODE: plan-first; implement stepwise; verify before completion; write evidence before handoff
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm run build`; `npm test -- --run`; `npm run smoke:prod`
- BROWSER_CHECKS: Supabase project page shows recovered project URL
- REGRESSION_SCOPE: public routes, Supabase proxy, Edge Function fail-closed behavior
- COMPLIANCE_GATES: no secrets printed; no new project if old project is recoverable; smoke after deploy
- ROLLBACK_PLAN: revert `a766cf1` if needed; resume same Supabase project if it pauses again
- ACCEPTANCE_GATES: health 200 direct and proxy; readable signup/login JSON; report exists
- EVIDENCE_OUTPUT: `docs/vocabdaily-upgrade-harness/reports/vd-00-supabase-database-recovery-report.md`
- STOP_CONDITIONS: missing Supabase access; production smoke failure; unapproved migration requirement

## Task Spec

Recover the existing production Supabase project and verify the Vercel proxy path used by production users. This phase is complete and should only be reopened if production smoke regresses.

## Problem Boundary

In scope: Supabase project reachability, Vercel proxy correctness, production smoke, and provider recovery evidence. Out of scope: auth UI redesign, schema migrations, payments, dark mode, and learning content.

## Context Policy

Read only the files named in `PRIMARY_CONTEXT` unless a failing smoke check points to another concrete file. Do not read secret files for documentation purposes and do not print env values.

## Requirements

### R1 Existing Project Recovery

Production must keep the existing Supabase ref `zjkbktdmwencnouwfrij` when it is recoverable.

### R2 Proxy Response Readability

The Vercel proxy must return response bodies that clients can decode and parse as JSON.

### R3 Production Smoke

The production domain must pass public route, Supabase Auth health, Edge Function fail-closed, and billing fail-closed smoke checks.

## Test and Regression Requirements

- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- `npm test -- --run`
- `npm run smoke:prod`
- Focused proxy regression: `src/lib/supabaseProxy.test.ts`

## Compliance and Safety Requirements

- No secrets in output, docs, screenshots, commits, or logs.
- No new project when the existing project can be resumed.
- No production migration in this phase.

## Rollback and Recovery

Revert commit `a766cf1` if proxy behavior regresses. If the Supabase project pauses again, resume the same project and rerun production smoke.

## Execution Capture

See `reports/vd-00-supabase-database-recovery-report.md` for commands, deployment id, and production smoke evidence.

## Evaluator Protocol

Verify the report includes provider recovery, proxy code change, regression test, production deployment, and production smoke. Reject the phase if direct or proxied Auth health is not 200.

## Acceptance Criteria

- Supabase direct Auth health returns 200.
- Supabase proxy Auth health returns 200.
- Production smoke passes with 0 failures.
- Signup/login API probes return readable JSON.

## Risks

- Supabase may pause again on the free plan.
- Provider dashboard state can lag behind public API readiness.
- Printing keys or tokens during smoke would create secret exposure risk.
