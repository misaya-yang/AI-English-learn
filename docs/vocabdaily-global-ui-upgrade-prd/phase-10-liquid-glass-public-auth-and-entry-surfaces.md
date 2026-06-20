# Phase 10 - Liquid Glass Public Auth And Entry Surfaces

**Goal:** Apply the Liquid Glass system to every public, auth, legal, sample, pricing, and word-of-day route while preserving auth, i18n, legal, and fail-closed billing behavior.

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "VGUI-10",
    "number": "10",
    "title": "Liquid Glass Public Auth And Entry Surfaces",
    "status": "draft",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-global-ui-upgrade-prd",
    "phase_file": "docs/vocabdaily-global-ui-upgrade-prd/phase-10-liquid-glass-public-auth-and-entry-surfaces.md",
    "depends_on": ["VGUI-09"],
    "unlocks": ["VGUI-11"]
  },
  "goal": {
    "target": "Upgrade all public and auth entry routes to the shared Liquid Glass visual language without semantic drift.",
    "prompt": "Complete VGUI-10 Liquid Glass Public Auth And Entry Surfaces for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-10-liquid-glass-public-auth-and-entry-surfaces.md`; update feature-oracle item VGUI-F010; keep forms and plan cards solid, use glass only for navigation and small controls, preserve auth/legal/billing behavior, and finish only after focused tests, browser evidence, source-packet writeback, continuity update, and report evidence pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-10-liquid-glass-public-auth-and-entry-surfaces-plan.md",
    "completion_report": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-10-liquid-glass-public-auth-and-entry-surfaces-report.md"
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
    "read_first": ["docs/vocabdaily-global-ui-upgrade-prd/README.md", "docs/vocabdaily-global-ui-upgrade-prd/source-packet.md", "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md", "docs/vocabdaily-global-ui-upgrade-prd/phase-10-liquid-glass-public-auth-and-entry-surfaces.md"],
    "primary_context": ["src/pages/Home.tsx", "src/pages/PricingPage.tsx", "src/pages/WordOfTheDayPage.tsx", "src/pages/SampleLessonPage.tsx", "src/pages/LegalPage.tsx", "src/features/marketing/AuthShell.tsx", "src/pages/auth/LoginPage.tsx", "src/pages/auth/RegisterPage.tsx", "src/pages/auth/MagicLinkPage.tsx", "src/pages/auth/AuthCallbackPage.tsx", "src/pages/auth/OnboardingPage.tsx", "src/features/marketing/**", "scripts/ui-regression.mjs"],
    "context_budget": "focused",
    "do_not_load_unless": ["dashboard learning logic", "production provider dashboards"]
  },
  "boundaries": {
    "likely_edit_paths": ["src/pages/Home.tsx", "src/pages/PricingPage.tsx", "src/pages/WordOfTheDayPage.tsx", "src/pages/SampleLessonPage.tsx", "src/pages/LegalPage.tsx", "src/features/marketing/AuthShell.tsx", "src/pages/auth/*.tsx", "src/features/marketing/**", "scripts/ui-regression.mjs", "docs/vocabdaily-global-ui-upgrade-prd/**"],
    "do_not_edit": ["billing fail-closed logic except visual labels around existing states", "Supabase auth contract", "legal meaning", "dashboard route behavior"],
    "external_inputs": ["local screenshots and route reports"],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["repo search", "shell validation", "browser screenshot regression"],
    "approval_required": ["deployment", "billing provider change", "production auth change", "new dependency"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "production migration"]
  },
  "risk": {
    "tags": ["ui", "frontend", "browser", "auth", "payment", "accessibility"],
    "data_mutation": false,
    "migration_required": false,
    "browser_required": true,
    "ai_eval_required": false,
    "external_service_required": false,
    "release_blocking": true
  },
  "validation": {
    "commands": [
      {"id": "public-auth-tests", "cwd": ".", "command": "npx vitest run src/pages/Home.i18n.test.tsx src/pages/Home.trust.test.ts src/pages/PricingPage.test.tsx src/pages/WordOfTheDayPage.test.tsx src/pages/auth/AuthPages.i18n.test.tsx src/features/marketing/AuthShell.test.tsx src/features/marketing/BrandMark.test.tsx", "expected": "Public/auth tests pass", "required": true},
      {"id": "lint", "cwd": ".", "command": "npm run lint", "expected": "ESLint completes with zero errors", "required": true},
      {"id": "i18n", "cwd": ".", "command": "npm run check:i18n", "expected": "i18n parity passes", "required": true},
      {"id": "build", "cwd": ".", "command": "npm run build", "expected": "Production build passes", "required": true}
    ],
    "browser_checks": [
      "Capture `/`, `/word-of-the-day`, `/demo`, `/pricing`, `/terms`, `/privacy`, `/login`, `/register`, `/magic-link`, `/auth/callback`, and `/onboarding` at desktop 1440x960 and mobile 390x844.",
      "Check light and dark theme for all public/auth routes.",
      "Check no CTA wraps, no fake social proof, no fake metrics, no glass over form fields, and no low-contrast legal text."
    ],
    "regression_scope": ["Auth navigation", "demo login path", "pricing fail-closed state", "legal route links", "language switching", "theme switching"],
    "compliance_gates": ["Labels remain visible above inputs", "Pricing never starts real checkout when billing is unavailable", "No personal data appears in screenshots"],
    "acceptance_gates": ["All entry routes use the shared glass nav/control layer", "Forms and legal text remain solid and readable", "Oracle VGUI-F010 is updated with screenshot and command evidence"],
    "rollback_plan": ["Revert public/auth route files if auth, legal, or pricing tests fail and cannot be fixed locally."]
  },
  "evidence": {
    "outputs": ["docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-10-liquid-glass-public-auth-and-entry-surfaces-report.md"],
    "required_artifacts": ["phase report", "test output", "public/auth screenshot matrix", "source-packet writeback", "continuity-ledger update"],
    "waiver_policy": "Auth, payment, and legal gates require explicit user waiver.",
    "next_phase_handoff": "Unlock VGUI-11 after entry surfaces are verified."
  },
  "stop_conditions": ["auth behavior would need to change", "billing behavior would need to change", "legal text meaning would need to change"]
}
```

## Coding Agent Contract

- PHASE_ID: VGUI-10
- GOAL_TARGET: Upgrade all public and auth entry routes to the shared Liquid Glass visual language without semantic drift.
- GOAL_PROMPT: Complete VGUI-10 Liquid Glass Public Auth And Entry Surfaces for `.` by following this phase file; work on feature-oracle item VGUI-F010; preserve auth, legal, i18n, and billing behavior; finish only after focused tests, browser evidence, writeback, and report evidence pass or blockers are documented.
- DEPENDS_ON: VGUI-09
- READ_FIRST: README, source packet, continuity ledger, this file
- PRIMARY_CONTEXT: public pages, auth pages, marketing components, UI regression script
- LIKELY_EDIT_PATHS: public pages, auth pages, marketing components, UI regression script, harness runtime docs and report
- DO_NOT_EDIT: billing fail-closed semantics, Supabase auth contract, legal meaning, dashboard behavior
- EXECUTION_MODE: plan-first; implement route group; verify route group
- VALIDATION_COMMANDS: focused public/auth Vitest command; `npm run lint`; `npm run check:i18n`; `npm run build`
- BROWSER_CHECKS: all public/auth routes, desktop/mobile, light/dark, CTA clipping, form readability
- REGRESSION_SCOPE: auth, pricing, legal, demo, theme, language
- COMPLIANCE_GATES: visible labels, no real charge, no personal data in evidence
- ROLLBACK_PLAN: Revert phase-scoped files if route semantics fail.
- ACCEPTANCE_GATES: Entry surfaces verified, evidence recorded, oracle updated, source/continuity writeback complete.
- EVIDENCE_OUTPUT: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-10-liquid-glass-public-auth-and-entry-surfaces-report.md`
- STOP_CONDITIONS: Stop if auth, billing, or legal semantics require changes.

## Task Spec

Apply the shared Liquid Glass system to all public, auth, legal, sample, pricing, and word-of-day entry routes.

## Problem Boundary

This phase owns public/auth route presentation and marketing shell components. It must preserve auth flows, legal meaning, pricing fail-closed behavior, and i18n contracts.

## Context Policy

Read VGUI-09 evidence first, then public/auth pages and marketing components named in the primary context. Do not load dashboard learning pages unless a shared component dependency requires it.

## Requirements

- Use one shared floating glass nav/control treatment across public entry surfaces.
- Keep forms, legal text, and plan cards solid and high contrast.
- Remove fake metrics or fake social proof.
- Preserve CTA labels and route targets tested by existing tests.
- Verify guest and authenticated states where route behavior differs.

## Test and Regression Requirements

Run the public/auth Vitest command, lint, i18n, build, and browser captures for all 11 public/auth/entry routes at desktop and mobile in light and dark.

## Compliance and Safety Requirements

Auth labels must remain visible, pricing must not initiate checkout when billing is fail-closed, screenshots must not expose private data, and legal text must remain readable.

## Rollback and Recovery

Revert phase-scoped public/auth files if tests show auth, pricing, legal, or i18n semantic drift.

## Execution Capture

Write the VGUI-10 report with route list, command output, screenshots, semantic-preservation notes, source-packet writeback, continuity update, and VGUI-F010 evidence.

## Evaluator Protocol

Evaluator compares route behavior and copy against tests, checks glass is limited to navigation/control/side-rail layers, and verifies no CTA clipping or form readability regression.

## Acceptance Criteria

All 11 entry routes have evidence, tests pass, forms/legal/pricing remain readable and semantically unchanged, and VGUI-F010 is updated.

## Risks

Public polish can accidentally alter auth route targets, legal meaning, or pricing fail-closed behavior.
