# Phase 11 - Liquid Glass Dashboard Core Learning

**Goal:** Upgrade Today, Review, Practice, Chat, Vocabulary, and Analytics to the Liquid Glass system while preserving learning correctness and dense-content readability.

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "VGUI-11",
    "number": "11",
    "title": "Liquid Glass Dashboard Core Learning",
    "status": "draft",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-global-ui-upgrade-prd",
    "phase_file": "docs/vocabdaily-global-ui-upgrade-prd/phase-11-liquid-glass-dashboard-core-learning.md",
    "depends_on": ["VGUI-10"],
    "unlocks": ["VGUI-12"]
  },
  "goal": {
    "target": "Upgrade core dashboard learning routes with Liquid Glass navigation and solid readable task surfaces.",
    "prompt": "Complete VGUI-11 Liquid Glass Dashboard Core Learning for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-11-liquid-glass-dashboard-core-learning.md`; update feature-oracle item VGUI-F011; preserve Today, Review, Practice, Chat, Vocabulary, and Analytics data and learning behavior; keep glass limited to navigation/control layers; finish only after focused tests, learning-flow checks, browser evidence, source-packet writeback, continuity update, and report evidence pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-11-liquid-glass-dashboard-core-learning-plan.md",
    "completion_report": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-11-liquid-glass-dashboard-core-learning-report.md"
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
    "read_first": ["docs/vocabdaily-global-ui-upgrade-prd/README.md", "docs/vocabdaily-global-ui-upgrade-prd/source-packet.md", "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md", "docs/vocabdaily-global-ui-upgrade-prd/phase-11-liquid-glass-dashboard-core-learning.md"],
    "primary_context": ["src/layouts/DashboardLayout.tsx", "src/components/BottomNavBar.tsx", "src/pages/dashboard/TodayPage.tsx", "src/pages/dashboard/ReviewPage.tsx", "src/pages/dashboard/PracticePage.tsx", "src/pages/dashboard/ChatPage.tsx", "src/pages/dashboard/VocabularyBankPage.tsx", "src/pages/dashboard/AnalyticsPage.tsx", "src/features/learning/components/**", "src/features/coach/**", "src/features/chat/components/**", "src/features/practice/**", "scripts/learning-flow-regression.mjs", "scripts/ui-regression.mjs"],
    "context_budget": "broad",
    "do_not_load_unless": ["public/auth pages except shell dependencies", "production providers"]
  },
  "boundaries": {
    "likely_edit_paths": ["src/layouts/DashboardLayout.tsx", "src/components/BottomNavBar.tsx", "src/pages/dashboard/TodayPage.tsx", "src/pages/dashboard/ReviewPage.tsx", "src/pages/dashboard/PracticePage.tsx", "src/pages/dashboard/ChatPage.tsx", "src/pages/dashboard/VocabularyBankPage.tsx", "src/pages/dashboard/AnalyticsPage.tsx", "src/features/learning/components/**", "src/features/coach/**", "src/features/chat/components/**", "src/features/practice/**", "scripts/learning-flow-regression.mjs", "scripts/ui-regression.mjs", "docs/vocabdaily-global-ui-upgrade-prd/**"],
    "do_not_edit": ["FSRS/review scheduling semantics unless a failing test proves visual state mapping is wrong", "Supabase schema", "AI provider credentials", "billing behavior"],
    "external_inputs": ["local screenshots and seeded regression states"],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["repo search", "shell validation", "browser screenshot regression"],
    "approval_required": ["deployment", "provider calls with real credentials", "new dependency"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "production migration"]
  },
  "risk": {
    "tags": ["ui", "frontend", "browser", "accessibility"],
    "data_mutation": false,
    "migration_required": false,
    "browser_required": true,
    "ai_eval_required": false,
    "external_service_required": false,
    "release_blocking": true
  },
  "validation": {
    "commands": [
      {"id": "core-dashboard-tests", "cwd": ".", "command": "npx vitest run src/pages/dashboard/PracticePage.test.tsx src/pages/dashboard/ReviewPage.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/pages/dashboard/VocabularyBankPage.test.tsx src/features/practice/attemptState.test.ts src/features/learning/sessionRecap.test.ts src/features/chat/components/ChatErrorBanner.test.tsx src/features/coach/reviewRailLogic.test.ts", "expected": "Core dashboard behavior tests pass", "required": true},
      {"id": "lint", "cwd": ".", "command": "npm run lint", "expected": "ESLint completes with zero errors", "required": true},
      {"id": "i18n", "cwd": ".", "command": "npm run check:i18n", "expected": "i18n parity passes", "required": true},
      {"id": "build", "cwd": ".", "command": "npm run build", "expected": "Production build passes", "required": true}
    ],
    "browser_checks": [
      "Capture `/dashboard/today`, `/dashboard/review`, `/dashboard/practice`, `/dashboard/chat`, `/dashboard/vocabulary`, and `/dashboard/analytics` at desktop 1440x960 and mobile 390x844.",
      "Verify first-wrong, retry-correct, second-wrong/reveal, empty, loading, and completion states where seeded scripts support them.",
      "Verify content surfaces remain solid while nav/control layers use glass."
    ],
    "regression_scope": ["Practice retry/reveal state machine", "Review due-only behavior", "Chat error and empty states", "Vocabulary large-list overflow", "Analytics dense chart readability"],
    "compliance_gates": ["No answer reveal after first wrong attempt", "No glass over long reading or chart content", "No horizontal overflow", "Keyboard focus remains visible"],
    "acceptance_gates": ["Core dashboard screenshots and learning-flow evidence pass", "Oracle VGUI-F011 updated", "Source and continuity writeback complete"],
    "rollback_plan": ["Revert core dashboard route and shared learning component changes if learning correctness tests fail and cannot be repaired locally."]
  },
  "evidence": {
    "outputs": ["docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-11-liquid-glass-dashboard-core-learning-report.md"],
    "required_artifacts": ["phase report", "focused test output", "learning-flow or UI regression summary", "screenshots", "source-packet writeback", "continuity-ledger update"],
    "waiver_policy": "Learning correctness gates cannot be waived without explicit user approval.",
    "next_phase_handoff": "Unlock VGUI-12 after core dashboard behavior and visuals are verified."
  },
  "stop_conditions": ["learning behavior must change to satisfy visual design", "seeded practice/review states cannot be verified", "dense content becomes unreadable"]
}
```

## Coding Agent Contract

- PHASE_ID: VGUI-11
- GOAL_TARGET: Upgrade core dashboard learning routes with Liquid Glass navigation and solid readable task surfaces.
- GOAL_PROMPT: Complete VGUI-11 by following this phase file; work on feature-oracle item VGUI-F011; preserve learning behavior; finish only after focused tests, learning-flow/browser evidence, writeback, and report evidence pass or blockers are documented.
- DEPENDS_ON: VGUI-10
- READ_FIRST: README, source packet, continuity ledger, this file
- PRIMARY_CONTEXT: DashboardLayout, BottomNavBar, Today, Review, Practice, Chat, Vocabulary, Analytics, shared learning/coach/chat/practice components, regression scripts
- LIKELY_EDIT_PATHS: same as PRIMARY_CONTEXT plus harness runtime docs and report
- DO_NOT_EDIT: FSRS/review semantics without failing-test proof, Supabase schema, AI credentials, billing behavior
- EXECUTION_MODE: plan-first; preserve behavior; verify seeded states
- VALIDATION_COMMANDS: focused core dashboard Vitest command; `npm run lint`; `npm run check:i18n`; `npm run build`
- BROWSER_CHECKS: six core dashboard routes, desktop/mobile, first-wrong/retry/reveal/empty/loading/completion where seeded
- REGRESSION_SCOPE: learning behavior, dense content readability, overflow, focus
- COMPLIANCE_GATES: no first-wrong answer leak, no glass over dense content, visible focus
- ROLLBACK_PLAN: Revert phase-scoped files if correctness fails.
- ACCEPTANCE_GATES: Behavior and visual evidence pass, oracle updated, writeback complete.
- EVIDENCE_OUTPUT: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-11-liquid-glass-dashboard-core-learning-report.md`
- STOP_CONDITIONS: Stop if visual design requires learning semantic changes.

## Task Spec

Upgrade the core dashboard learning routes: Today, Review, Practice, Chat, Vocabulary, and Analytics.

## Problem Boundary

This phase may change presentation, hierarchy, component styling, and seeded regression coverage for core dashboard routes. It must not change learning data contracts, review scheduling, answer-state semantics, billing, or provider credentials.

## Context Policy

Read VGUI-09 and VGUI-10 evidence before editing. Load only dashboard core pages, shared learning/coach/chat/practice components, and regression scripts named in the primary context.

## Requirements

- Keep navigation/control glass in the shell and small controls.
- Keep workbook cards, answer panels, chat content, vocabulary lists, and analytics charts solid.
- Preserve Practice first-wrong retry, retry-correct recovered, and second-wrong/reveal behavior.
- Verify empty, loading, completion, dense-list, and dense-chart states where the scripts support them.

## Test and Regression Requirements

Run focused dashboard tests, lint, i18n, build, and browser checks for the six core routes at desktop/mobile. Run learning-flow checks when route behavior changes.

## Compliance and Safety Requirements

No answer leak after first wrong attempt, visible focus order, no horizontal overflow, no low-contrast chart text, and no private data in screenshots.

## Rollback and Recovery

Revert core route changes if learning correctness fails and cannot be repaired within this phase.

## Execution Capture

Write the VGUI-11 report with command output, route screenshots, seeded state evidence, changed files, source-packet writeback, continuity update, and VGUI-F011 evidence.

## Evaluator Protocol

Evaluator verifies state-machine behavior before visual approval and rejects screenshots that show glass under dense learning content.

## Acceptance Criteria

Focused tests and route evidence pass, learning correctness is preserved, and VGUI-F011 is updated.

## Risks

Visual simplification can hide learning feedback, reveal answers too early, or make analytics less readable.
