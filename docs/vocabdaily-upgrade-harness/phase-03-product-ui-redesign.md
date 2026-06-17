# Phase 03 - Product UI Redesign

> For agentic workers: this phase is locked until VD-02 passes or is explicitly blocked/waived.

**Goal:** Redesign core screens into a practical English learning workspace with clear layout, plain copy, stronger typography, and no AI-template feel.

**Architecture:** This phase touches user-facing public and dashboard surfaces after auth and theme foundations are stable.

**Tech Stack:** React, Tailwind CSS, Radix primitives, Lucide icons, Product Design guidance, Playwright/browser screenshots.

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {"id": "VD-03", "number": "03", "title": "Product UI Redesign", "status": "ready", "type": "implementation", "repo_path": "/Users/yang/projects/app", "docs_path": "docs/vocabdaily-upgrade-harness", "phase_file": "docs/vocabdaily-upgrade-harness/phase-03-product-ui-redesign.md", "depends_on": ["VD-02"], "unlocks": ["VD-04"]},
  "goal": {"target": "Redesign core screens into a practical English learning workspace with clear layout, plain copy, stronger typography, and no AI-template feel.", "prompt": "Complete VD-03 Product UI Redesign by following docs/vocabdaily-upgrade-harness/phase-03-product-ui-redesign.md; use VD-F004; audit every core route before editing and ship only after desktop/mobile visual evidence passes.", "plan_required": true, "plan_output": "docs/vocabdaily-upgrade-harness/reports/vd-03-product-ui-redesign-plan.md", "completion_report": "docs/vocabdaily-upgrade-harness/reports/vd-03-product-ui-redesign-report.md"},
  "runtime": {"feature_oracle": "docs/vocabdaily-upgrade-harness/feature-oracle.json", "loop_contract": "docs/vocabdaily-upgrade-harness/loop-contract.json", "loop_state": "docs/vocabdaily-upgrade-harness/loop-state.json", "progress_log": "docs/vocabdaily-upgrade-harness/progress-log.md", "handoff": "docs/vocabdaily-upgrade-harness/agent-handoff.md", "continuity_ledger": "docs/vocabdaily-upgrade-harness/continuity-ledger.md", "next_window_prompt": "docs/vocabdaily-upgrade-harness/next-window-prompt.md", "session_boot": {"read_progress": true, "run_baseline_check": true, "update_progress_before_exit": true}, "agent_roles": ["planner", "generator", "evaluator"]},
  "context": {"read_first": ["docs/vocabdaily-upgrade-harness/README.md", "docs/vocabdaily-upgrade-harness/phase-manifest.md", "docs/vocabdaily-upgrade-harness/reports/vd-02-dark-mode-repair-report.md"], "primary_context": ["src/pages/Home.tsx", "src/pages/WordOfTheDayPage.tsx", "src/pages/PricingPage.tsx", "src/pages/dashboard/**", "src/components/**", "src/features/practice/**", "src/i18n/**", "scripts/ui-regression.mjs", "scripts/learning-flow-regression.mjs"], "context_budget": "broad", "do_not_load_unless": ["Supabase dashboard", "payment provider settings", "new content provider"]},
  "boundaries": {"likely_edit_paths": ["src/pages/**", "src/components/**", "src/features/practice/**", "src/i18n/**", "scripts/ui-regression.mjs", "scripts/learning-flow-regression.mjs", "docs/vocabdaily-upgrade-harness/**"], "do_not_edit": ["auth provider behavior except display copy", "supabase/migrations/**", "billing fail-closed semantics", "new UI library"], "external_inputs": ["production app screenshots", "provided user screenshots"], "secrets_required": []},
  "tool_policy": {"allowed_tools": ["repo search", "shell validation", "in-app browser", "Product Design playback brief", "Playwright screenshots"], "approval_required": ["new dependency", "payment copy semantics", "production deployment"], "dangerous_commands": ["git reset --hard", "rm -rf", "force push"]},
  "risk": {"tags": ["ui", "frontend", "browser", "accessibility", "product"], "data_mutation": false, "migration_required": false, "browser_required": true, "ai_eval_required": false, "external_service_required": false, "release_blocking": true},
  "validation": {"commands": [{"id": "lint", "cwd": "/Users/yang/projects/app", "command": "npm run lint", "expected": "exit 0", "required": true}, {"id": "i18n", "cwd": "/Users/yang/projects/app", "command": "npm run check:i18n", "expected": "exit 0", "required": true}, {"id": "build", "cwd": "/Users/yang/projects/app", "command": "npm run build", "expected": "exit 0", "required": true}, {"id": "tests", "cwd": "/Users/yang/projects/app", "command": "npm test -- --run", "expected": "exit 0", "required": true}], "browser_checks": ["/", "/login", "/register", "/pricing", "/word-of-the-day", "/dashboard/today", "/dashboard/review", "/dashboard/practice", "/dashboard/chat", "/dashboard/analytics", "/dashboard/profile", "/dashboard/settings", "reading/listening/grammar/pronunciation/writing/vocabulary module routes if present", "desktop 1440x960 and mobile 390x844"], "regression_scope": ["auth remains working", "practice retry rules remain intact", "billing stays fail-closed", "no route becomes blank"], "compliance_gates": ["copy audit removes awkward AI-sounding phrases", "no cards inside cards", "no button text clipping", "no hidden focus states", "no inaccessible low-contrast revealed answers"], "acceptance_gates": ["VD-F004 passing evidence recorded", "route inventory complete", "screenshots and console summaries captured", "copy audit included in report"], "rollback_plan": ["revert UI commits by phase", "preserve auth/theme fixes", "document route-specific blockers if a module cannot be verified"]},
  "evidence": {"outputs": ["docs/vocabdaily-upgrade-harness/reports/vd-03-product-ui-redesign-report.md"], "required_artifacts": ["route inventory", "desktop/mobile screenshots", "copy audit", "validation summary", "oracle update"], "waiver_policy": "Missing route coverage requires blocker or user waiver.", "next_phase_handoff": "Unlock VD-04 only after core UI has stable routes and entry points for learning content."},
  "stop_conditions": ["VD-02 is not passing", "new UI library appears necessary", "route inventory cannot be completed", "visual regression cannot run"]
}
```

## Coding Agent Contract

- PHASE_ID: VD-03
- GOAL_TARGET: Redesign core screens into a practical English learning workspace with clear layout, plain copy, stronger typography, and no AI-template feel.
- GOAL_PROMPT: Complete VD-03 Product UI Redesign by following `docs/vocabdaily-upgrade-harness/phase-03-product-ui-redesign.md`; use VD-F004; audit every core route before editing and ship only after desktop/mobile visual evidence passes.
- DEPENDS_ON: VD-02
- READ_FIRST: `docs/vocabdaily-upgrade-harness/README.md`, `docs/vocabdaily-upgrade-harness/phase-manifest.md`, this file, `reports/vd-02-dark-mode-repair-report.md`
- PRIMARY_CONTEXT: public pages, dashboard pages, shared components, practice feature, i18n files, UI regression scripts
- LIKELY_EDIT_PATHS: `src/pages/**`, `src/components/**`, `src/features/practice/**`, `src/i18n/**`, UI regression scripts, harness docs
- DO_NOT_EDIT: auth provider behavior, migrations, billing fail-closed semantics, new UI library
- EXECUTION_MODE: plan-first; audit before editing; implement route groups; verify before completion
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm run build`; `npm test -- --run`
- BROWSER_CHECKS: all public/core dashboard/module routes at desktop 1440x960 and mobile 390x844
- REGRESSION_SCOPE: auth, practice retry, billing fail-closed, no blank routes
- COMPLIANCE_GATES: no awkward AI copy; no nested cards; no clipped buttons; accessible focus and contrast
- ROLLBACK_PLAN: revert phase UI commits; preserve earlier auth/theme fixes
- ACCEPTANCE_GATES: full route inventory, screenshots, copy audit, report, oracle update
- EVIDENCE_OUTPUT: `docs/vocabdaily-upgrade-harness/reports/vd-03-product-ui-redesign-report.md`
- STOP_CONDITIONS: VD-02 not passing; new UI library required; route inventory blocked; screenshots cannot run

## Task Spec

Redesign the core product UI after dark mode is stable. The outcome should feel like an English learning product with clear tasks and useful hierarchy, not a generic AI SaaS dashboard.

## Problem Boundary

In scope: public pages, auth-adjacent copy, dashboard pages, practice/review/chat/analytics/profile/settings layouts, learning module entry points, typography, spacing, copy, and visual hierarchy. Out of scope: provider auth semantics, payment semantics, database migrations, and IELTS deck content.

## Context Policy

Audit routes before editing. Use Product Design playback brief and taste-skill principles. Avoid adding features just to fill space. Do not use saved Product Design context because preflight reported none.

## Requirements

### R1 Route Inventory

Every public and core dashboard route listed in the phase contract must be inventoried before edits are declared complete.

### R2 Plain Learning Copy

Visible copy should be concrete and learner-facing. Remove awkward AI-sounding phrases and abstract cockpit/workbench labels where they do not help.

### R3 Layout Hierarchy

Screens must prioritize the current learning task, next action, progress, and feedback. Avoid card nesting and uniform card grids.

### R4 Responsive Polish

Desktop `1440x960` and mobile `390x844` must have no overlap, horizontal overflow, clipped buttons, or unreadable feedback states.

## Test and Regression Requirements

- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- `npm test -- --run`
- Route screenshots and console summaries for all required routes.

## Compliance and Safety Requirements

- Keep auth, payment, and data contracts stable.
- Preserve accessibility focus states and readable contrast.
- Do not invent fake metrics, fake precision, or fake testimonials.

## Rollback and Recovery

Use route-group commits where possible. If a route regresses, revert that group while preserving VD-00 through VD-02 fixes.

## Execution Capture

Write `reports/vd-03-product-ui-redesign-report.md` with route inventory, screenshots, copy audit, changed files, and validation output.

## Evaluator Protocol

Reject the phase if it only changes the home page, only validates mobile, or relies on broad claims without screenshots. Reject if copy still reads like a generic AI product.

## Acceptance Criteria

- Required route inventory is complete.
- Screenshots cover desktop and mobile.
- Copy audit is recorded.
- Repo checks pass.
- VD-F004 has evidence.

## Risks

- Broad UI edits can break working auth/practice flows.
- Over-polishing can delay useful learning content.
- Adding decorative UI can worsen the user's AI-feel complaint.
