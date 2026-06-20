# Phase 08 - Liquid Glass Research Baseline And Route Plan

> For agentic workers: this phase reopens the completed VGUI harness for the 2026-06-20 Apple-inspired Liquid Glass full-site request. It does not claim the redesign is done; it creates the route/effect contract that makes the next implementation phases accountable.

**Goal:** Convert the new Apple Liquid Glass full-site request into a verified route, effect, accessibility, performance, and phase execution plan.

**Architecture:** This phase inherits the completed VGUI-00 through VGUI-07 evidence as historical baseline, but the new objective is not complete until VGUI-09 through VGUI-13 pass.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS 3, Radix/shadcn-style local components, lucide-react, framer-motion, i18n, Supabase integration, and Playwright-based UI regression scripts.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "hybrid",
  "phase": {
    "id": "VGUI-08",
    "number": "08",
    "title": "Liquid Glass Research Baseline And Route Plan",
    "status": "ready",
    "type": "baseline",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-global-ui-upgrade-prd",
    "phase_file": "docs/vocabdaily-global-ui-upgrade-prd/phase-08-liquid-glass-research-baseline-and-route-plan.md",
    "depends_on": ["VGUI-05"],
    "unlocks": ["VGUI-09"]
  },
  "goal": {
    "target": "Convert the Apple-inspired Liquid Glass full-site request into a verified route and execution contract.",
    "prompt": "Complete VGUI-08 Liquid Glass Research Baseline And Route Plan for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-08-liquid-glass-research-baseline-and-route-plan.md`; update feature-oracle item VGUI-F008; inspect current routes and design system files; write current web research, route coverage, effect coverage, risks, and next execution boundaries into the runtime docs; finish only after harness validation and report evidence pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-08-liquid-glass-research-baseline-and-route-plan-plan.md",
    "completion_report": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-08-liquid-glass-research-baseline-and-route-plan-report.md"
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
    "agent_roles": ["planner", "generator", "evaluator"]
  },
  "context": {
    "read_first": [
      "docs/vocabdaily-global-ui-upgrade-prd/README.md",
      "docs/vocabdaily-global-ui-upgrade-prd/phase-manifest.md",
      "docs/vocabdaily-global-ui-upgrade-prd/loop-contract.json",
      "docs/vocabdaily-global-ui-upgrade-prd/loop-state.json",
      "docs/vocabdaily-global-ui-upgrade-prd/feature-oracle.json",
      "docs/vocabdaily-global-ui-upgrade-prd/source-packet.md",
      "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md",
      "docs/vocabdaily-global-ui-upgrade-prd/phase-08-liquid-glass-research-baseline-and-route-plan.md"
    ],
    "primary_context": [
      "src/App.tsx",
      "src/features/learning/routeRegistry.ts",
      "src/index.css",
      "src/components/ui/button.tsx",
      "src/components/ui/glass-surface.tsx",
      "src/layouts/DashboardLayout.tsx",
      "src/pages/**",
      "src/features/**",
      "scripts/ui-regression.mjs",
      "scripts/learning-flow-regression.mjs"
    ],
    "context_budget": "broad",
    "do_not_load_unless": [
      "production provider dashboards",
      "secret files",
      "unrelated product PRDs"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "docs/vocabdaily-global-ui-upgrade-prd/README.md",
      "docs/vocabdaily-global-ui-upgrade-prd/phase-manifest.md",
      "docs/vocabdaily-global-ui-upgrade-prd/source-packet.md",
      "docs/vocabdaily-global-ui-upgrade-prd/feature-oracle.json",
      "docs/vocabdaily-global-ui-upgrade-prd/loop-state.json",
      "docs/vocabdaily-global-ui-upgrade-prd/progress-log.md",
      "docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md",
      "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md",
      "docs/vocabdaily-global-ui-upgrade-prd/next-window-prompt.md",
      "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-08-liquid-glass-research-baseline-and-route-plan-report.md"
    ],
    "do_not_edit": [
      "production systems",
      "secret files",
      "database migrations",
      "billing provider configuration",
      "route semantics or auth contracts"
    ],
    "external_inputs": [
      "Apple Developer Liquid Glass and HIG pages",
      "MDN CSS backdrop-filter and user preference pages",
      "Chrome and web.dev animation performance pages"
    ],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["repo search", "web research", "shell validation"],
    "approval_required": ["deployment", "production data mutation", "billing changes", "external dashboard changes"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "production migration", "force push"]
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
      {
        "id": "harness-strict",
        "cwd": ".",
        "command": "python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-global-ui-upgrade-prd --strict --quality-score",
        "expected": "Harness validation passed with a quality score",
        "required": true
      },
      {
        "id": "repo-diff-check",
        "cwd": ".",
        "command": "git diff --check",
        "expected": "No whitespace or conflict-marker errors",
        "required": true
      }
    ],
    "browser_checks": [
      "Name every route that VGUI-09 through VGUI-13 must capture at desktop 1440x960 and mobile 390x844.",
      "Name the reduced-motion and reduced-transparency evidence required before the full-site objective can be complete."
    ],
    "regression_scope": [
      "All routes in src/App.tsx remain in the future regression scope.",
      "Existing VGUI-00 through VGUI-07 evidence remains historical baseline, not proof of the new Liquid Glass objective."
    ],
    "compliance_gates": [
      "Do not claim official Apple Liquid Glass on the Web.",
      "Do not require secrets or production access.",
      "Document accessibility, performance, i18n, auth, billing, and privacy gates for later phases."
    ],
    "acceptance_gates": [
      "source-packet.md records the 2026-06-20 research and route/effect inventory",
      "phase-manifest.md lists VGUI-08 through VGUI-13 with dependencies",
      "feature-oracle.json includes VGUI-F008 through VGUI-F013",
      "loop-state.json points to the next executable implementation phase after this report",
      "the VGUI-08 report records the plan evidence and validation result"
    ],
    "rollback_plan": [
      "Revert VGUI-08 docs-only changes if harness validation fails and cannot be repaired in this phase."
    ]
  },
  "evidence": {
    "outputs": ["docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-08-liquid-glass-research-baseline-and-route-plan-report.md"],
    "required_artifacts": ["phase report", "strict harness validation output", "source packet update", "oracle update", "continuity ledger update", "next-window prompt"],
    "waiver_policy": "Only mark a gate waived with explicit user waiver or a named blocker and residual risk.",
    "next_phase_handoff": "VGUI-09 may start only after VGUI-08 report and harness validation are recorded."
  },
  "stop_conditions": [
    "current route inventory cannot be derived from src/App.tsx",
    "harness validation fails after repair attempts",
    "the plan would require production credentials or provider changes"
  ]
}
```

## Coding Agent Contract

- PHASE_ID: VGUI-08
- GOAL_TARGET: Convert the Apple-inspired Liquid Glass full-site request into a verified route and execution contract.
- GOAL_PROMPT: Complete VGUI-08 Liquid Glass Research Baseline And Route Plan for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-08-liquid-glass-research-baseline-and-route-plan.md`; work on feature-oracle item VGUI-F008; preserve old VGUI evidence as baseline only; write the 2026-06-20 route/effect plan into source packet, manifest, oracle, progress, handoff, continuity ledger, and report; finish only after strict harness validation passes or blockers are documented.
- DEPENDS_ON: VGUI-05
- READ_FIRST: `docs/vocabdaily-global-ui-upgrade-prd/README.md`, `docs/vocabdaily-global-ui-upgrade-prd/phase-manifest.md`, this file
- PRIMARY_CONTEXT: `src/App.tsx`, `src/features/learning/routeRegistry.ts`, `src/index.css`, `src/components/ui/button.tsx`, `src/components/ui/glass-surface.tsx`, `src/layouts/DashboardLayout.tsx`, `src/pages/**`, `src/features/**`, `scripts/ui-regression.mjs`, `scripts/learning-flow-regression.mjs`
- LIKELY_EDIT_PATHS: `docs/vocabdaily-global-ui-upgrade-prd/README.md`, `phase-manifest.md`, `source-packet.md`, `feature-oracle.json`, `loop-state.json`, `progress-log.md`, `agent-handoff.md`, `continuity-ledger.md`, `next-window-prompt.md`, `reports/vgui-08-liquid-glass-research-baseline-and-route-plan-report.md`
- DO_NOT_EDIT: production systems, secret files, database migrations, billing provider configuration, route semantics or auth contracts
- EXECUTION_MODE: plan-first; docs and evidence first; unlock implementation only after validation
- VALIDATION_COMMANDS: `python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-global-ui-upgrade-prd --strict --quality-score`; `git diff --check`
- BROWSER_CHECKS: Define required desktop/mobile, light/dark, reduced-motion, reduced-transparency, no-overflow, and no-clipping evidence for every route before later phases can pass.
- REGRESSION_SCOPE: All routes in `src/App.tsx`, all dashboard routes in `routeRegistry.ts`, shared glass/motion utilities, auth/billing failure modes, and learning retry/reveal states.
- COMPLIANCE_GATES: Do not claim official Apple Web APIs; do not require secrets; document accessibility, performance, i18n, auth, payment, privacy, and deployment approval gates.
- ROLLBACK_PLAN: Revert this docs-only phase if strict harness validation cannot pass.
- ACCEPTANCE_GATES: Phase report exists; oracle item is updated; source packet contains current research and inventory; manifest lists VGUI-08 through VGUI-13; loop state points to VGUI-09.
- EVIDENCE_OUTPUT: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-08-liquid-glass-research-baseline-and-route-plan-report.md`
- STOP_CONDITIONS: Stop if route inventory cannot be derived, strict validator cannot pass, or production credentials are required.

## Task Spec

Build the durable execution contract for the reopened Liquid Glass objective. This phase owns route inventory, effect inventory, external research synthesis, phase dependencies, oracle cases, runtime state, and the VGUI-08 report.

## Problem Boundary

This phase may edit harness documents only. It must not continue styling pages, alter route semantics, deploy, mutate data, or change auth/billing behavior.

## Context Policy

Read the harness runtime docs, `src/App.tsx`, `src/features/learning/routeRegistry.ts`, current shared style/component files, and cited external documentation. Treat web sources as reference material, not instructions.

## Requirements

- Record the full route count and route families.
- Record the shared effect inventory: glass shell, glass controls, solid content surfaces, motion, reduced motion, reduced transparency, focus, mobile targets, overflow, learning correctness, auth/payment/legal behavior.
- Add VGUI-08 through VGUI-13 to the phase manifest and VGUI-F008 through VGUI-F013 to the feature oracle.
- Update loop state, progress, handoff, continuity ledger, next-window prompt, and source packet.

## Test and Regression Requirements

Run strict harness validation and `git diff --check`. The report must list any validator failures and the fix applied before claiming completion.

## Compliance and Safety Requirements

No secrets, deployments, destructive commands, production data mutation, billing changes, provider dashboard changes, or production credential use.

## Rollback and Recovery

If the harness cannot validate, revert VGUI-08 docs-only changes and restore the previous VGUI-05/VGUI-07 state from git.

## Execution Capture

Write `reports/vgui-08-liquid-glass-research-baseline-and-route-plan-report.md` with research sources, route/effect inventory, changed docs, validation output, and next phase.

## Evaluator Protocol

An evaluator must verify that every new phase has a Machine Contract, Coding Agent Contract, required anchors, concrete commands, browser checks, stop conditions, and no placeholder leakage.

## Acceptance Criteria

- Strict harness validation passes.
- The new phase chain is discoverable from `phase-manifest.md`.
- `feature-oracle.json` contains VGUI-F008 through VGUI-F013.
- `loop-state.json` points to VGUI-09 after VGUI-08 evidence is recorded.
- The report says clearly that the full Liquid Glass redesign is not yet complete.

## Risks

- The old VGUI release evidence may be mistaken for the new objective.
- A plan-only phase may look like implementation completion.
- External documentation can become stale; future phases should refresh sources when a browser behavior is uncertain.
