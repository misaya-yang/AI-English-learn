# Phase 02 - Dark Mode Repair

> For agentic workers: this phase is locked until VD-01 passes or is explicitly blocked/waived.

**Goal:** Make dark mode readable, restrained, and free of glowy black-block transitions.

**Architecture:** Theme behavior is shared across public routes and dashboard routes through theme initialization, Tailwind/CSS tokens, layout shells, loading states, and route fallbacks.

**Tech Stack:** React, Tailwind CSS, next-themes-style runtime behavior, Vite, Playwright/browser screenshots.

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {"id": "VD-02", "number": "02", "title": "Dark Mode Repair", "status": "ready", "type": "implementation", "repo_path": "/Users/yang/projects/app", "docs_path": "docs/vocabdaily-upgrade-harness", "phase_file": "docs/vocabdaily-upgrade-harness/phase-02-dark-mode-repair.md", "depends_on": ["VD-01"], "unlocks": ["VD-03"]},
  "goal": {"target": "Make dark mode readable, restrained, and free of glowy black-block transitions.", "prompt": "Complete VD-02 Dark Mode Repair by following docs/vocabdaily-upgrade-harness/phase-02-dark-mode-repair.md; use VD-F003; repair theme tokens and loading states only after VD-01 passes.", "plan_required": true, "plan_output": "docs/vocabdaily-upgrade-harness/reports/vd-02-dark-mode-repair-plan.md", "completion_report": "docs/vocabdaily-upgrade-harness/reports/vd-02-dark-mode-repair-report.md"},
  "runtime": {"feature_oracle": "docs/vocabdaily-upgrade-harness/feature-oracle.json", "loop_contract": "docs/vocabdaily-upgrade-harness/loop-contract.json", "loop_state": "docs/vocabdaily-upgrade-harness/loop-state.json", "progress_log": "docs/vocabdaily-upgrade-harness/progress-log.md", "handoff": "docs/vocabdaily-upgrade-harness/agent-handoff.md", "continuity_ledger": "docs/vocabdaily-upgrade-harness/continuity-ledger.md", "next_window_prompt": "docs/vocabdaily-upgrade-harness/next-window-prompt.md", "session_boot": {"read_progress": true, "run_baseline_check": true, "update_progress_before_exit": true}, "agent_roles": ["planner", "generator", "evaluator"]},
  "context": {"read_first": ["docs/vocabdaily-upgrade-harness/README.md", "docs/vocabdaily-upgrade-harness/phase-manifest.md", "docs/vocabdaily-upgrade-harness/reports/vd-01-registration-and-login-recovery-report.md"], "primary_context": ["src/index.css", "src/App.tsx", "src/components/**", "src/pages/Home.tsx", "src/pages/dashboard/**", "src/components/layout/**", "scripts/ui-regression.mjs", "scripts/learning-flow-regression.mjs"], "context_budget": "focused", "do_not_load_unless": ["Supabase dashboard", "billing functions", "IELTS card content"]},
  "boundaries": {"likely_edit_paths": ["src/index.css", "src/components/**", "src/pages/Home.tsx", "src/pages/dashboard/**", "scripts/ui-regression.mjs", "scripts/learning-flow-regression.mjs", "docs/vocabdaily-upgrade-harness/**"], "do_not_edit": ["auth provider semantics unless regression forces small fix", "supabase/migrations/**", "billing/payment files", "new UI library"], "external_inputs": ["production UI", "browser screenshots"], "secrets_required": []},
  "tool_policy": {"allowed_tools": ["repo search", "shell validation", "in-app browser", "Playwright screenshots"], "approval_required": ["production deployment", "new dependency", "provider changes"], "dangerous_commands": ["git reset --hard", "rm -rf", "force push"]},
  "risk": {"tags": ["ui", "frontend", "browser", "accessibility"], "data_mutation": false, "migration_required": false, "browser_required": true, "ai_eval_required": false, "external_service_required": false, "release_blocking": true},
  "validation": {"commands": [{"id": "lint", "cwd": "/Users/yang/projects/app", "command": "npm run lint", "expected": "exit 0", "required": true}, {"id": "i18n", "cwd": "/Users/yang/projects/app", "command": "npm run check:i18n", "expected": "exit 0", "required": true}, {"id": "build", "cwd": "/Users/yang/projects/app", "command": "npm run build", "expected": "exit 0", "required": true}, {"id": "tests", "cwd": "/Users/yang/projects/app", "command": "npm test -- --run", "expected": "exit 0", "required": true}], "browser_checks": ["light/dark/system on / and dashboard routes", "desktop 1440x960 and mobile 390x844 screenshots", "route switching shows no full-screen black block", "button/form/text contrast is readable"], "regression_scope": ["auth UI remains usable", "public home remains readable", "practice feedback states remain readable"], "compliance_gates": ["WCAG-readable primary text", "no neon/outer-glow default", "no pure black page fields", "reduced motion respected for loaders"], "acceptance_gates": ["VD-F003 passing evidence recorded", "screenshots saved under product-audit output", "no horizontal overflow at target viewports"], "rollback_plan": ["revert theme token changes", "restore previous loading components if route rendering regresses"]},
  "evidence": {"outputs": ["docs/vocabdaily-upgrade-harness/reports/vd-02-dark-mode-repair-report.md"], "required_artifacts": ["screenshots", "contrast notes", "validation summary", "oracle update"], "waiver_policy": "Any missing viewport or theme mode requires a blocker or user waiver.", "next_phase_handoff": "Unlock VD-03 only when base theme and loading behavior are stable."},
  "stop_conditions": ["VD-01 is not passing", "theme fix requires broad IA redesign", "new dependency appears necessary", "browser checks cannot run"]
}
```

## Coding Agent Contract

- PHASE_ID: VD-02
- GOAL_TARGET: Make dark mode readable, restrained, and free of glowy black-block transitions.
- GOAL_PROMPT: Complete VD-02 Dark Mode Repair by following `docs/vocabdaily-upgrade-harness/phase-02-dark-mode-repair.md`; use VD-F003; repair theme tokens and loading states only after VD-01 passes.
- DEPENDS_ON: VD-01
- READ_FIRST: `docs/vocabdaily-upgrade-harness/README.md`, `docs/vocabdaily-upgrade-harness/phase-manifest.md`, this file, `reports/vd-01-registration-and-login-recovery-report.md`
- PRIMARY_CONTEXT: `src/index.css`, `src/App.tsx`, `src/components/**`, `src/pages/Home.tsx`, `src/pages/dashboard/**`, UI regression scripts
- LIKELY_EDIT_PATHS: theme CSS, shared layout/loading components, page shells, UI regression scripts, harness docs
- DO_NOT_EDIT: auth semantics, migrations, billing/payment files, new UI library
- EXECUTION_MODE: plan-first; implement stepwise; verify before completion; write evidence before handoff
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm run build`; `npm test -- --run`
- BROWSER_CHECKS: light/dark/system; desktop 1440x960; mobile 390x844; route switching; contrast
- REGRESSION_SCOPE: auth UI, public home, practice feedback states
- COMPLIANCE_GATES: readable contrast; no neon default; no pure black fields; reduced motion respected
- ROLLBACK_PLAN: revert token/loading changes
- ACCEPTANCE_GATES: screenshots and report prove no black-block transition and readable dark mode
- EVIDENCE_OUTPUT: `docs/vocabdaily-upgrade-harness/reports/vd-02-dark-mode-repair-report.md`
- STOP_CONDITIONS: VD-01 not passing; broad redesign required; new dependency required; browser checks unavailable

## Task Spec

Repair dark mode without doing the full product redesign. The phase should produce a restrained dark palette, readable text and controls, and route/theme transitions without full-screen black blocks.

## Problem Boundary

In scope: global theme tokens, dark mode surfaces, pre-paint theme initialization, route fallback/loading states, and contrast. Out of scope: changing product IA, rewriting all pages, adding IELTS content, or redesigning auth logic.

## Context Policy

Start from the user screenshots and current production pages. Inspect theme/layout source before editing. Do not use Chrome for authenticated checks unless explicitly requested.

## Requirements

### R1 Readable Dark Tokens

Dark mode must use restrained surfaces and readable foregrounds instead of glowing accents or large pure-black blocks.

### R2 No Theme Flash

Light, dark, and system modes must initialize without a visible full-page black flash.

### R3 Stable Route Loading

Dashboard route changes must not show long black skeletons or blank panels.

### R4 Viewport Coverage

Desktop `1440x960` and mobile `390x844` must have no horizontal overflow or clipped controls.

## Test and Regression Requirements

- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- `npm test -- --run`
- Browser screenshots for light/dark/system at required viewports.

## Compliance and Safety Requirements

- Primary text and controls must meet practical readable contrast.
- Respect reduced-motion expectations for loaders.
- Avoid neon/glow defaults and pure-black page fields.

## Rollback and Recovery

Revert theme/loading changes if auth pages, dashboard routing, or public pages become unreadable or blank.

## Execution Capture

Write `reports/vd-02-dark-mode-repair-report.md` with screenshots, changed token summary, route-switch findings, and validation output.

## Evaluator Protocol

Reject the phase if screenshots cover only one viewport, only one theme mode, or only the home page. Reject if black flashes persist during route changes.

## Acceptance Criteria

- Light/dark/system modes are readable.
- Desktop and mobile screenshots are captured.
- Route switching has no full-screen black block.
- Repo checks pass.

## Risks

- Token changes can accidentally regress light mode.
- Loading-state fixes can hide real auth or data-loading errors.
- Too much work here can drift into VD-03 full redesign.
