# Phase 13 - Liquid Glass Regression Accessibility Performance Release

**Goal:** Prove the full Apple-inspired Liquid Glass frontend optimization across all routes, effects, accessibility preferences, performance constraints, and release gates.

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "evaluation",
  "phase": {
    "id": "VGUI-13",
    "number": "13",
    "title": "Liquid Glass Regression Accessibility Performance Release",
    "status": "draft",
    "type": "release",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-global-ui-upgrade-prd",
    "phase_file": "docs/vocabdaily-global-ui-upgrade-prd/phase-13-liquid-glass-regression-accessibility-performance-release.md",
    "depends_on": ["VGUI-12"],
    "unlocks": []
  },
  "goal": {
    "target": "Verify the full Liquid Glass redesign across routes, effects, accessibility preferences, performance, and release readiness.",
    "prompt": "Complete VGUI-13 Liquid Glass Regression Accessibility Performance Release for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-13-liquid-glass-regression-accessibility-performance-release.md`; update feature-oracle item VGUI-F013; run full static, unit, build, UI regression, learning-flow, reduced-motion, reduced-transparency, and performance checks; write a release report with residual risk and rollback plan; do not deploy without explicit user approval.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-13-liquid-glass-regression-accessibility-performance-release-plan.md",
    "completion_report": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-13-liquid-glass-regression-accessibility-performance-release-report.md"
  },
  "runtime": {
    "feature_oracle": "docs/vocabdaily-global-ui-upgrade-prd/feature-oracle.json",
    "loop_contract": "docs/vocabdaily-global-ui-upgrade-prd/loop-contract.json",
    "loop_state": "docs/vocabdaily-global-ui-upgrade-prd/loop-state.json",
    "progress_log": "docs/vocabdaily-global-ui-upgrade-prd/progress-log.md",
    "handoff": "docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md",
    "continuity_ledger": "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md",
    "next_window_prompt": "docs/vocabdaily-global-ui-upgrade-prd/next-window-prompt.md",
    "session_boot": {"read_progress": true, "run_baseline_check": true, "update_progress_before_exit": true},
    "agent_roles": ["planner", "generator", "evaluator"]
  },
  "context": {
    "read_first": ["docs/vocabdaily-global-ui-upgrade-prd/README.md", "docs/vocabdaily-global-ui-upgrade-prd/source-packet.md", "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md", "docs/vocabdaily-global-ui-upgrade-prd/phase-13-liquid-glass-regression-accessibility-performance-release.md"],
    "primary_context": ["src/App.tsx", "src/index.css", "src/components/**", "src/pages/**", "src/features/**", "scripts/ui-regression.mjs", "scripts/learning-flow-regression.mjs", "scripts/e2e-smoke.mjs"],
    "context_budget": "broad",
    "do_not_load_unless": ["production provider dashboards", "secret files"]
  },
  "boundaries": {
    "likely_edit_paths": ["scripts/ui-regression.mjs", "scripts/learning-flow-regression.mjs", "docs/vocabdaily-global-ui-upgrade-prd/**", "small regression-only fixes in src/index.css or route files if failures are directly caused by VGUI-09 through VGUI-12"],
    "do_not_edit": ["deployment configuration without approval", "production data", "secret files", "database migrations", "billing provider behavior"],
    "external_inputs": ["local screenshots", "local Lighthouse or Playwright traces", "production smoke only after approval"],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["repo search", "shell validation", "browser screenshot regression", "local performance audit"],
    "approval_required": ["deployment", "production smoke requiring credentials", "provider dashboard changes", "new dependency"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "force push", "production migration"]
  },
  "risk": {
    "tags": ["ui", "frontend", "browser", "accessibility", "performance", "release"],
    "data_mutation": false,
    "migration_required": false,
    "browser_required": true,
    "ai_eval_required": false,
    "external_service_required": false,
    "release_blocking": true
  },
  "validation": {
    "commands": [
      {"id": "lint", "cwd": ".", "command": "npm run lint", "expected": "ESLint completes with zero errors", "required": true},
      {"id": "i18n", "cwd": ".", "command": "npm run check:i18n", "expected": "i18n parity passes", "required": true},
      {"id": "unit", "cwd": ".", "command": "npm test", "expected": "Vitest suite passes", "required": true},
      {"id": "build", "cwd": ".", "command": "npm run build", "expected": "TypeScript and Vite build pass", "required": true},
      {"id": "ui-regression", "cwd": ".", "command": "npm run test:ui-regression", "expected": "All route and scenario checks pass", "required": true},
      {"id": "learning-flow", "cwd": ".", "command": "npm run test:learning-flow-regression", "expected": "Learning-flow checks pass", "required": true},
      {"id": "harness-strict", "cwd": ".", "command": "python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-global-ui-upgrade-prd --strict --quality-score", "expected": "Harness validation passes", "required": true}
    ],
    "browser_checks": [
      "Every route in src/App.tsx is captured at desktop 1440x960 and mobile 390x844.",
      "Public/auth/dashboard routes are checked in light and dark.",
      "Reduced-motion and reduced-transparency runs prove controls remain usable.",
      "No route has horizontal overflow, clipped CTA text, blank fallback, or unreadable glass content.",
      "Lighthouse or equivalent local performance evidence is collected for `/` and `/dashboard/today`."
    ],
    "regression_scope": ["All public/auth/dashboard routes", "All scenario checks", "All learning retry/reveal flows", "All shared glass utilities", "Theme and language switching"],
    "compliance_gates": ["WCAG AA contrast spot checks", "keyboard focus order", "44px mobile primary targets", "privacy-safe screenshots", "no deployment without approval"],
    "acceptance_gates": ["All oracle items VGUI-F008 through VGUI-F013 are passing or explicitly blocked/waived", "Full command evidence recorded", "Contact sheets or screenshot summaries linked", "Rollback plan recorded", "Residual risks listed"],
    "rollback_plan": ["Revert VGUI-09 through VGUI-12 commits or files if full regression fails after local repair attempts.", "Do not deploy until local release gate passes and user approves deployment."]
  },
  "evidence": {
    "outputs": ["docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-13-liquid-glass-regression-accessibility-performance-release-report.md"],
    "required_artifacts": ["release report", "full command output summary", "UI regression summary", "learning-flow summary", "reduced-preference evidence", "performance evidence", "source-packet writeback", "continuity-ledger update"],
    "waiver_policy": "Release, accessibility, and full-route evidence require explicit user waiver.",
    "next_phase_handoff": "No further phase unlocks. If release is approved, create a separate deployment handoff with rollback and production smoke gates."
  },
  "stop_conditions": ["full regression is missing", "reduced-preference evidence is missing", "deployment is requested without explicit approval", "a production credential is required"]
}
```

## Coding Agent Contract

- PHASE_ID: VGUI-13
- GOAL_TARGET: Verify the full Liquid Glass redesign across routes, effects, accessibility preferences, performance, and release readiness.
- GOAL_PROMPT: Complete VGUI-13 by following this phase file; work on feature-oracle item VGUI-F013; run full static/unit/build/UI/learning-flow/reduced-preference/performance checks; write release report; do not deploy without explicit user approval.
- DEPENDS_ON: VGUI-12
- READ_FIRST: README, source packet, continuity ledger, this file
- PRIMARY_CONTEXT: all route/component files and regression scripts
- LIKELY_EDIT_PATHS: regression scripts, harness docs, small regression-only fixes caused by VGUI-09 through VGUI-12
- DO_NOT_EDIT: deployment config without approval, production data, secrets, migrations, billing provider behavior
- EXECUTION_MODE: plan-first; evaluate independently; repair only verified regressions
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm test`; `npm run build`; `npm run test:ui-regression`; `npm run test:learning-flow-regression`; harness strict validator
- BROWSER_CHECKS: every route desktop/mobile; light/dark; reduced-motion; reduced-transparency; no overflow/clipping/blank fallback; performance evidence for `/` and `/dashboard/today`
- REGRESSION_SCOPE: full app route and scenario matrix
- COMPLIANCE_GATES: accessibility, focus, target size, privacy-safe evidence, no deployment without approval
- ROLLBACK_PLAN: Revert VGUI-09 through VGUI-12 changes if full regression cannot pass.
- ACCEPTANCE_GATES: All VGUI-F008 through VGUI-F013 passing or explicitly blocked/waived, full evidence recorded, residual risks listed.
- EVIDENCE_OUTPUT: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-13-liquid-glass-regression-accessibility-performance-release-report.md`
- STOP_CONDITIONS: Stop if full regression, reduced-preference evidence, or required approvals are missing.

## Task Spec

Evaluate and prove the complete Liquid Glass redesign across all routes, effects, accessibility preferences, performance constraints, and release readiness.

## Problem Boundary

This phase is primarily evaluation. It may apply small regression-only fixes caused by VGUI-09 through VGUI-12, but it must not start a new design direction, deploy without approval, or mutate production systems.

## Context Policy

Read reports for VGUI-08 through VGUI-12, then full route/component files and regression scripts. Use current runtime behavior as authoritative evidence.

## Requirements

- Run full command suite and strict harness validation.
- Capture every route at desktop and mobile.
- Verify light/dark, reduced motion, reduced transparency, no overflow, no clipping, no blank fallback, and no unreadable glass content.
- Collect performance evidence for `/` and `/dashboard/today`.
- Record rollback plan and residual risks.

## Test and Regression Requirements

Run lint, i18n, full tests, build, full UI regression, full learning-flow regression, strict harness validation, and local performance audit evidence.

## Compliance and Safety Requirements

Accessibility, focus, mobile target size, privacy-safe screenshots, and deployment approval gates are release-blocking.

## Rollback and Recovery

If the release gate fails, revert or repair VGUI-09 through VGUI-12 changes according to the failing route/effect evidence. Do not deploy.

## Execution Capture

Write the VGUI-13 report with complete command output, regression summaries, screenshot/contact-sheet links, reduced-preference proof, performance proof, rollback plan, residual risk, source-packet writeback, continuity update, and VGUI-F013 evidence.

## Evaluator Protocol

Evaluator must inspect the full route matrix and reject completion when evidence is sampled, stale, missing reduced-preference proof, or missing learning-flow proof.

## Acceptance Criteria

All VGUI-F008 through VGUI-F013 are passing or explicitly blocked/waived with evidence; full route/effect evidence exists; release report is complete; deployment remains unperformed unless approved.

## Risks

Full-site claims are easy to overstate; sampled screenshots, partial tests, or stale reports do not prove completion.
