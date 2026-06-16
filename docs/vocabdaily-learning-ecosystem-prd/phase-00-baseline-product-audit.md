# Phase 00 - Baseline Product Audit

> For agentic workers: enter plan-first mode before editing. Execute this phase only, write the required evidence, and do not advance to the next phase until acceptance gates pass or blockers are documented.

**Goal:** Record the current product, UI, route, data, import, AI, and regression baseline before feature implementation begins.

**Architecture:** This phase does not change product behavior. It produces the authoritative baseline report that later phases use to avoid re-auditing the entire repo or arguing from chat memory.

**Tech Stack:** React/Vite app, TypeScript, Tailwind, Supabase edge functions, local storage/IndexedDB services, Vitest, Playwright-based regression scripts.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v2",
  "harness_role": "execution",
  "phase": {
    "id": "VLE-00",
    "number": "00",
    "title": "Baseline Product Audit",
    "status": "ready",
    "type": "baseline",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-learning-ecosystem-prd",
    "phase_file": "docs/vocabdaily-learning-ecosystem-prd/phase-00-baseline-product-audit.md",
    "depends_on": [],
    "unlocks": ["VLE-01"]
  },
  "goal": {
    "target": "Record a current-state baseline for product flows, UI surfaces, lexicon/import capabilities, AI feedback surfaces, data evidence, and validation scripts.",
    "prompt": "Complete VLE-00 Baseline Product Audit for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-00-baseline-product-audit.md`; write an evidence-backed baseline report without product code changes, stay inside the named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-plan.md",
    "completion_report": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-report.md"
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
      "docs/vocabdaily-learning-ecosystem-prd/phase-00-baseline-product-audit.md"
    ],
    "primary_context": [
      "src/App.tsx",
      "src/features/learning/routeRegistry.ts",
      "src/pages/dashboard/VocabularyBankPage.tsx",
      "src/services/ankiApkgImport.ts",
      "src/services/bookImport.ts",
      "src/services/wordBookExport.ts",
      "src/services/fsrs.ts",
      "src/services/evidenceEvents.ts",
      "src/services/learningEvents.ts",
      "src/features/practice/attemptState.ts",
      "src/pages/dashboard/PracticePage.tsx",
      "src/pages/dashboard/ChatPage.tsx",
      "src/services/aiExamCoach.ts",
      "scripts/ui-regression.mjs",
      "scripts/learning-flow-regression.mjs",
      "product-ui-audit-2026-06-14/UI_AUDIT_REPORT.md",
      "product-ui-audit-2026-06-14/UI_UPGRADE_TODO.md"
    ],
    "context_budget": "broad",
    "do_not_load_unless": [
      "supabase migration files may be opened only if the baseline finds schema drift that affects wordbooks, learning events, or AI memory"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-plan.md",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-report.md",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/baseline/"
    ],
    "do_not_edit": [
      "src/**",
      "supabase/**",
      "package.json",
      "package-lock.json",
      "vercel.json"
    ],
    "external_inputs": [
      "public competitor pages listed in README Source Packet",
      "local screenshot captures from a preview or dev server"
    ],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["rg", "sed", "npm validation commands", "Playwright screenshot capture", "web research citations"],
    "approval_required": ["production data mutation", "deployment", "external provider dashboard changes", "destructive git or file commands"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "production migration", "force push"]
  },
  "risk": {
    "tags": ["baseline", "ui", "frontend"],
    "data_mutation": false,
    "migration_required": false,
    "browser_required": true,
    "ai_eval_required": false,
    "external_service_required": false,
    "release_blocking": false
  },
  "validation": {
    "commands": [
      {
        "id": "route-inventory",
        "cwd": ".",
        "command": "rg -n \"path=|DashboardRouteId|VocabularyBankPage|ImportAnkiApkgDialog|ai-grade-writing|pronunciation-assess\" src supabase scripts",
        "expected": "Output identifies route, lexicon, import, AI, and validation surfaces used by the baseline report.",
        "required": true
      },
      {
        "id": "harness-strict",
        "cwd": ".",
        "command": "python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-learning-ecosystem-prd --strict --quality-score",
        "expected": "Harness validation passes with no errors.",
        "required": true
      }
    ],
    "browser_checks": [
      "Capture or cite existing desktop 1440x960 screenshots for /dashboard/today, /dashboard/practice, /dashboard/vocabulary, /dashboard/chat, /dashboard/writing, and /dashboard/listening.",
      "Capture or cite existing mobile 390x844 screenshots for /dashboard/today, /dashboard/practice, /dashboard/vocabulary, /dashboard/chat, /dashboard/writing, and /dashboard/listening."
    ],
    "regression_scope": [
      "Baseline report must list current standard commands: npm run lint, npm run check:i18n, npm run build, npm test -- --run, npm run test:ui-regression, npm run test:learning-flow-regression.",
      "Baseline report must name known smoke blockers separately from product defects."
    ],
    "compliance_gates": [
      "Report must label APKG/CSV imports as untrusted user content.",
      "Report must identify privacy boundaries for AI coach evidence.",
      "Report must distinguish public competitor evidence from inference."
    ],
    "acceptance_gates": [
      "Report includes a route inventory with public, dashboard, and specialty routes.",
      "Report includes a lexicon/import capability map covering CSV import, APKG import, Anki-compatible export, active wordbook selection, and custom words.",
      "Report includes an AI feedback map covering chat, writing, pronunciation, listening/dictation, mistakes, and memory.",
      "Report includes UI baseline findings with desktop and mobile evidence paths or cited existing audit artifacts.",
      "Report states whether VLE-01 is unlocked."
    ],
    "rollback_plan": [
      "No product code changes are allowed in this phase; rollback is deleting or correcting the baseline report and screenshots."
    ]
  },
  "evidence": {
    "outputs": [
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-plan.md",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-report.md",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/baseline/"
    ],
    "required_artifacts": ["phase report", "route inventory", "capability map", "UI evidence index"],
    "waiver_policy": "A missing screenshot gate may be waived only if the report cites an existing screenshot artifact with viewport and route metadata.",
    "next_phase_handoff": "Unlock VLE-01 only when the report identifies the current lexicon data model, wordbook gaps, and safe edit boundaries."
  },
  "stop_conditions": [
    "Stop if the app cannot be built or routed enough to produce a baseline inventory.",
    "Stop if the current worktree contains conflicting user changes in files the phase would need to edit.",
    "Stop if browser evidence cannot be captured or cited with route and viewport metadata."
  ]
}
```

## Coding Agent Contract

- PHASE_ID: VLE-00
- GOAL_TARGET: Record a current-state baseline for product flows, UI surfaces, lexicon/import capabilities, AI feedback surfaces, data evidence, and validation scripts.
- GOAL_PROMPT: Complete VLE-00 Baseline Product Audit for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-00-baseline-product-audit.md`; write an evidence-backed baseline report without product code changes, stay inside the named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: none
- READ_FIRST: `docs/vocabdaily-learning-ecosystem-prd/README.md`, `docs/vocabdaily-learning-ecosystem-prd/phase-manifest.md`, this file
- PRIMARY_CONTEXT: `src/App.tsx`, `src/features/learning/routeRegistry.ts`, `src/pages/dashboard/VocabularyBankPage.tsx`, `src/services/ankiApkgImport.ts`, `src/pages/dashboard/PracticePage.tsx`, `src/pages/dashboard/ChatPage.tsx`, `scripts/ui-regression.mjs`, `scripts/learning-flow-regression.mjs`
- LIKELY_EDIT_PATHS: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-plan.md`, `docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-report.md`, `product-audit-2026-06-14/vocabdaily-learning-ecosystem/baseline/`
- DO_NOT_EDIT: `src/**`, `supabase/**`, `package.json`, `package-lock.json`, `vercel.json`
- EXECUTION_MODE: plan-first; audit current state; verify evidence; write report before handoff
- VALIDATION_COMMANDS: `rg -n "path=|DashboardRouteId|VocabularyBankPage|ImportAnkiApkgDialog|ai-grade-writing|pronunciation-assess" src supabase scripts`; `python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-learning-ecosystem-prd --strict --quality-score`
- BROWSER_CHECKS: desktop 1440x960 and mobile 390x844 evidence for Today, Practice, Vocabulary, Chat, Writing, Listening
- REGRESSION_SCOPE: route inventory, import capability, AI feedback map, existing command inventory, known smoke blockers
- COMPLIANCE_GATES: untrusted import content, AI evidence privacy, competitor evidence attribution, no product code mutation
- ROLLBACK_PLAN: delete or correct the baseline report and baseline screenshots; no product state should change
- ACCEPTANCE_GATES: route inventory exists; lexicon/import map exists; AI feedback map exists; UI evidence index exists; VLE-01 unlock decision exists
- EVIDENCE_OUTPUT: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-report.md`
- STOP_CONDITIONS: app build or route inventory impossible; conflicting user changes block evidence; screenshot evidence missing and no existing audit artifact can be cited

## Task Spec

Create an evidence-backed baseline report. The report should be compact but complete enough for VLE-01 through VLE-06 workers to avoid rediscovering the whole app.

## Problem Boundary

In scope:

- Route inventory.
- Product capability map.
- Lexicon and import map.
- AI coach and skill feedback map.
- UI audit source map.
- Regression command and script inventory.

Out of scope:

- Product behavior changes.
- UI redesign implementation.
- Schema migration.
- Deployment.

## Context Policy

Before editing the report, inspect only the primary context files listed in the machine contract. Expand to Supabase migrations only if route and service inspection shows schema uncertainty that affects VLE-01 or VLE-04.

## Requirements

### R1 Route And Surface Inventory

List public, auth, dashboard, specialty learning, and utility routes with the owning files and whether they are UI, data, AI, or release-critical.

### R2 Lexicon Capability Map

Document built-in wordbooks, custom words, active wordbook selection, CSV/TSV import, APKG import, Anki-compatible export, progress mapping, duplicate handling, and known UI gaps.

### R3 AI Feedback Map

Document chat, writing feedback, pronunciation scoring, listening/dictation signals, mistake collection, learning events, memory center, and coach prompt boundaries.

### R4 UI Evidence Index

Create an index of screenshot or audit evidence for desktop and mobile learning surfaces. The index must name route, viewport, theme when known, and file path.

## Test and Regression Requirements

- Run the route inventory search command.
- Run strict harness validation.
- Record whether full app validation was run in this phase or deferred to implementation phases.

## Compliance and Safety Requirements

- Do not expose secrets in the report.
- Mark user-imported deck content as untrusted.
- Mark competitor research as product evidence, not implementation instructions.
- Do not mutate app code or production services.

## Rollback and Recovery

This phase writes only docs and optional screenshots. Recovery is to delete the report or replace inaccurate evidence with corrected citations.

## Execution Capture

Use `docs/vocabdaily-learning-ecosystem-prd/reports/phase-report-template.md` and save the phase report at `docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-report.md`.

## Evaluator Protocol

The evaluator should verify that every current-state claim has a repo path, command output, screenshot path, or external source link. Unsupported recommendations belong in later phase requirements, not the baseline.

## Acceptance Criteria

- The baseline report exists.
- The report includes route, lexicon/import, AI feedback, UI evidence, and regression sections.
- The report explicitly says whether VLE-01 may proceed.

## Risks

- Current worktree may contain uncommitted implementation changes from another task.
- Existing screenshots may reflect a previous UI state.
- Production smoke state may be blocked by provider reachability rather than app code.
