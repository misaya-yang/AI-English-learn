# Phase 09 - Liquid Glass Tokens Motion And Shell

> For agentic workers: execute this phase only after VGUI-08 passes. This phase owns shared tokens, glass primitives, motion rules, and navigation/control layers. It must not redesign dense learning content yet.

**Goal:** Establish the full-site Liquid Glass approximation system, motion rules, navigation/control shell, and reduced-preference fallbacks.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "VGUI-09",
    "number": "09",
    "title": "Liquid Glass Tokens Motion And Shell",
    "status": "draft",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-global-ui-upgrade-prd",
    "phase_file": "docs/vocabdaily-global-ui-upgrade-prd/phase-09-liquid-glass-tokens-motion-and-shell.md",
    "depends_on": ["VGUI-08"],
    "unlocks": ["VGUI-10"]
  },
  "goal": {
    "target": "Establish shared Liquid Glass tokens, primitives, shell navigation, motion rules, and accessibility fallbacks.",
    "prompt": "Complete VGUI-09 Liquid Glass Tokens Motion And Shell for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-09-liquid-glass-tokens-motion-and-shell.md`; update feature-oracle item VGUI-F009; stay within shared style, component, shell, and regression paths; preserve route/auth/billing/data contracts; finish only after validation, browser evidence, source-packet writeback, continuity update, and report evidence pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-09-liquid-glass-tokens-motion-and-shell-plan.md",
    "completion_report": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-09-liquid-glass-tokens-motion-and-shell-report.md"
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
    "read_first": [
      "docs/vocabdaily-global-ui-upgrade-prd/README.md",
      "docs/vocabdaily-global-ui-upgrade-prd/source-packet.md",
      "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md",
      "docs/vocabdaily-global-ui-upgrade-prd/phase-09-liquid-glass-tokens-motion-and-shell.md"
    ],
    "primary_context": [
      "src/index.css",
      "src/components/ui/glass-surface.tsx",
      "src/components/ui/button.tsx",
      "src/components/ThemeToggle.tsx",
      "src/components/LanguageSwitcher.tsx",
      "src/components/BottomNavBar.tsx",
      "src/features/marketing/BrandMark.tsx",
      "src/layouts/DashboardLayout.tsx",
      "src/lib/motion.ts",
      "scripts/ui-regression.mjs"
    ],
    "context_budget": "focused",
    "do_not_load_unless": ["production dashboards", "database code", "billing provider code"]
  },
  "boundaries": {
    "likely_edit_paths": [
      "src/index.css",
      "src/components/ui/glass-surface.tsx",
      "src/components/ui/button.tsx",
      "src/components/ThemeToggle.tsx",
      "src/components/LanguageSwitcher.tsx",
      "src/components/BottomNavBar.tsx",
      "src/features/marketing/BrandMark.tsx",
      "src/layouts/DashboardLayout.tsx",
      "src/lib/motion.ts",
      "scripts/ui-regression.mjs",
      "docs/vocabdaily-global-ui-upgrade-prd/**"
    ],
    "do_not_edit": ["Supabase schema", "billing semantics", "auth flow contracts", "page-specific learning logic outside shell integration"],
    "external_inputs": ["local screenshots", "MDN/Apple/Chrome/web.dev references recorded in source-packet.md"],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["repo search", "shell validation", "browser screenshot regression"],
    "approval_required": ["deployment", "production mutation", "new dependency"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "force push"]
  },
  "risk": {
    "tags": ["ui", "frontend", "browser", "accessibility", "performance"],
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
      {"id": "focused-tests", "cwd": ".", "command": "npx vitest run src/themeContrast.test.ts src/components/ui/glass-surface.test.tsx src/components/ui/button.test.tsx src/components/ThemeToggle.test.tsx src/components/LanguageSwitcher.test.tsx src/components/BottomNavBar.test.tsx src/components/DashboardSkeleton.test.tsx", "expected": "Focused token, component, and shell tests pass", "required": true},
      {"id": "build", "cwd": ".", "command": "npm run build", "expected": "TypeScript and Vite production build pass", "required": true}
    ],
    "browser_checks": [
      "Capture /, /pricing, /login, /dashboard/today, /dashboard/chat, and /dashboard/settings at desktop 1440x960 and mobile 390x844.",
      "Verify top navigation, sidebar, bottom nav, theme toggle, language switcher, search trigger, and account trigger use glass only as navigation/control layers.",
      "Verify prefers-reduced-motion and prefers-reduced-transparency remove nonessential motion/transparency without hiding controls."
    ],
    "regression_scope": ["No horizontal overflow", "No text clipping in shell controls", "No glass-on-glass over dense content", "No route/auth/billing semantic changes"],
    "compliance_gates": ["WCAG AA contrast for shell text", "44px mobile touch targets for primary controls", "No official Apple Web API claim"],
    "acceptance_gates": ["Shared tokens and components documented", "Browser evidence linked", "Oracle VGUI-F009 updated", "Continuity ledger names downstream constraints"],
    "rollback_plan": ["Revert shared token and shell changes if more than one route family becomes unreadable or untestable."]
  },
  "evidence": {
    "outputs": ["docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-09-liquid-glass-tokens-motion-and-shell-report.md"],
    "required_artifacts": ["phase report", "test output", "screenshot folder or summary", "source-packet writeback", "continuity-ledger update"],
    "waiver_policy": "Only waive browser evidence with a named browser/tooling blocker and residual risk.",
    "next_phase_handoff": "Unlock VGUI-10 when shared shell and preference fallbacks are verified."
  },
  "stop_conditions": ["shared glass CSS breaks fixed or sticky positioning", "contrast tests fail without a local fix", "implementation requires a new design dependency"]
}
```

## Coding Agent Contract

- PHASE_ID: VGUI-09
- GOAL_TARGET: Establish shared Liquid Glass tokens, primitives, shell navigation, motion rules, and accessibility fallbacks.
- GOAL_PROMPT: Complete VGUI-09 Liquid Glass Tokens Motion And Shell for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-09-liquid-glass-tokens-motion-and-shell.md`; work on feature-oracle item VGUI-F009; preserve route/auth/billing/data contracts; finish only after validation, browser evidence, writeback, and report evidence pass or blockers are documented.
- DEPENDS_ON: VGUI-08
- READ_FIRST: README, source packet, continuity ledger, this file
- PRIMARY_CONTEXT: `src/index.css`, `src/components/ui/glass-surface.tsx`, `src/components/ui/button.tsx`, `src/components/ThemeToggle.tsx`, `src/components/LanguageSwitcher.tsx`, `src/components/BottomNavBar.tsx`, `src/features/marketing/BrandMark.tsx`, `src/layouts/DashboardLayout.tsx`, `src/lib/motion.ts`, `scripts/ui-regression.mjs`
- LIKELY_EDIT_PATHS: same as PRIMARY_CONTEXT plus harness runtime docs and report
- DO_NOT_EDIT: Supabase schema, billing semantics, auth flow contracts, page-specific learning logic outside shell integration
- EXECUTION_MODE: plan-first; implement shared layer; verify route families before handoff
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; focused Vitest command from Machine Contract; `npm run build`
- BROWSER_CHECKS: desktop/mobile for `/`, `/pricing`, `/login`, `/dashboard/today`, `/dashboard/chat`, `/dashboard/settings`; reduced-motion; reduced-transparency
- REGRESSION_SCOPE: navigation/control layers, shell positioning, text clipping, overflow, route semantics
- COMPLIANCE_GATES: WCAG AA contrast, mobile target size, no official Apple Web claim, no new dependency without approval
- ROLLBACK_PLAN: Revert shared token and shell changes if route families become unreadable or untestable.
- ACCEPTANCE_GATES: Shared system verified, evidence recorded, oracle updated, source/continuity writeback complete.
- EVIDENCE_OUTPUT: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-09-liquid-glass-tokens-motion-and-shell-report.md`
- STOP_CONDITIONS: Stop if fixed/sticky positioning breaks, contrast tests fail, or a new dependency is required.

## Task Spec

Implement the shared Liquid Glass approximation layer: tokens, utilities, `GlassSurface`, Button variants, shell controls, motion rules, and reduced-preference fallbacks.

## Problem Boundary

This phase owns shared system and shell files only. It must not redesign page bodies beyond shell integration, change auth/billing/data contracts, or add dependencies.

## Context Policy

Read the VGUI-08 report, source packet, continuity ledger, and only the primary context files named in the Machine Contract before planning.

## Requirements

- Preserve fixed/sticky/absolute positioning on glass elements.
- Keep dense content surfaces solid.
- Add or repair tests for glass primitives and shell controls.
- Verify reduced motion and reduced transparency.
- Record downstream component rules for VGUI-10 through VGUI-12.

## Test and Regression Requirements

Run the focused VGUI-09 tests, lint, i18n, build, and browser checks for `/`, `/pricing`, `/login`, `/dashboard/today`, `/dashboard/chat`, and `/dashboard/settings`.

## Compliance and Safety Requirements

Meet contrast and focus expectations, keep 44px mobile primary targets where physically possible, and do not claim official Apple Web Liquid Glass.

## Rollback and Recovery

Revert shared CSS/component/shell changes if they break positioning, contrast, or route access across more than one route family.

## Execution Capture

Write the VGUI-09 report with changed files, command output, screenshot paths, reduced-preference evidence, source-packet writeback, continuity update, and VGUI-F009 evidence.

## Evaluator Protocol

Evaluator checks changed CSS for positioning overrides, stacked blur, unreadable text, missing fallback media queries, missing tests, and sampled evidence masquerading as full shell proof.

## Acceptance Criteria

Shared system tests and build pass, shell screenshots pass, reduced-preference behavior is proven, and VGUI-F009 contains evidence.

## Risks

Backdrop filters can be costly, reduced-transparency support is not universal, and overusing glass can damage readability.
