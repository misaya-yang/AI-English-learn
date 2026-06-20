# Phase 12 - Liquid Glass Specialist Modules And Account

**Goal:** Upgrade specialist modules, learning path, memory, leaderboard, settings, and profile so every remaining authenticated page meets the same Liquid Glass quality bar.

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "VGUI-12",
    "number": "12",
    "title": "Liquid Glass Specialist Modules And Account",
    "status": "draft",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-global-ui-upgrade-prd",
    "phase_file": "docs/vocabdaily-global-ui-upgrade-prd/phase-12-liquid-glass-specialist-modules-and-account.md",
    "depends_on": ["VGUI-11"],
    "unlocks": ["VGUI-13"]
  },
  "goal": {
    "target": "Upgrade every remaining authenticated route with the shared Liquid Glass system and module-specific readability.",
    "prompt": "Complete VGUI-12 Liquid Glass Specialist Modules And Account for `.` by following `docs/vocabdaily-global-ui-upgrade-prd/phase-12-liquid-glass-specialist-modules-and-account.md`; update feature-oracle item VGUI-F012; cover Reading, Listening, Grammar, Pronunciation, Writing, Exam, Learning Path, Memory, Leaderboard, Settings, and Profile; preserve feature semantics and account forms; finish only after focused tests, browser evidence, source-packet writeback, continuity update, and report evidence pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-12-liquid-glass-specialist-modules-and-account-plan.md",
    "completion_report": "docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-12-liquid-glass-specialist-modules-and-account-report.md"
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
    "read_first": ["docs/vocabdaily-global-ui-upgrade-prd/README.md", "docs/vocabdaily-global-ui-upgrade-prd/source-packet.md", "docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md", "docs/vocabdaily-global-ui-upgrade-prd/phase-12-liquid-glass-specialist-modules-and-account.md"],
    "primary_context": ["src/pages/dashboard/ReadingPage.tsx", "src/pages/dashboard/ListeningPage.tsx", "src/pages/dashboard/GrammarPage.tsx", "src/pages/dashboard/PronunciationPage.tsx", "src/pages/dashboard/WritingPage.tsx", "src/pages/dashboard/ExamPrepPage.tsx", "src/pages/dashboard/LearningPathPage.tsx", "src/pages/dashboard/MemoryCenterPage.tsx", "src/pages/dashboard/LeaderboardPage.tsx", "src/pages/dashboard/SettingsPage.tsx", "src/pages/dashboard/ProfilePage.tsx", "src/features/exam/components/**", "src/features/pronunciation/components/**", "scripts/learning-flow-regression.mjs", "scripts/ui-regression.mjs"],
    "context_budget": "broad",
    "do_not_load_unless": ["public/auth pages except shared shell", "production providers"]
  },
  "boundaries": {
    "likely_edit_paths": ["src/pages/dashboard/ReadingPage.tsx", "src/pages/dashboard/ListeningPage.tsx", "src/pages/dashboard/GrammarPage.tsx", "src/pages/dashboard/PronunciationPage.tsx", "src/pages/dashboard/WritingPage.tsx", "src/pages/dashboard/ExamPrepPage.tsx", "src/pages/dashboard/LearningPathPage.tsx", "src/pages/dashboard/MemoryCenterPage.tsx", "src/pages/dashboard/LeaderboardPage.tsx", "src/pages/dashboard/SettingsPage.tsx", "src/pages/dashboard/ProfilePage.tsx", "src/features/exam/components/**", "src/features/pronunciation/components/**", "scripts/learning-flow-regression.mjs", "scripts/ui-regression.mjs", "docs/vocabdaily-global-ui-upgrade-prd/**"],
    "do_not_edit": ["account persistence contract", "exam quota semantics", "AI provider credentials", "database migrations", "billing behavior"],
    "external_inputs": ["local screenshots and seeded module states"],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["repo search", "shell validation", "browser screenshot regression"],
    "approval_required": ["deployment", "provider calls with real credentials", "new dependency"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "production migration"]
  },
  "risk": {
    "tags": ["ui", "frontend", "browser", "auth", "accessibility"],
    "data_mutation": false,
    "migration_required": false,
    "browser_required": true,
    "ai_eval_required": false,
    "external_service_required": false,
    "release_blocking": true
  },
  "validation": {
    "commands": [
      {"id": "module-tests", "cwd": ".", "command": "npx vitest run src/pages/dashboard/ProfilePage.test.tsx src/pages/dashboard/SettingsPage.test.tsx src/pages/dashboard/VocabularyBankPage.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/features/learning/learningPathRouting.test.ts src/features/lexicon/lexicalEntry.test.ts", "expected": "Available module/account tests pass", "required": true},
      {"id": "lint", "cwd": ".", "command": "npm run lint", "expected": "ESLint completes with zero errors", "required": true},
      {"id": "i18n", "cwd": ".", "command": "npm run check:i18n", "expected": "i18n parity passes", "required": true},
      {"id": "build", "cwd": ".", "command": "npm run build", "expected": "Production build passes", "required": true}
    ],
    "browser_checks": [
      "Capture `/dashboard/reading`, `/dashboard/listening`, `/dashboard/grammar`, `/dashboard/pronunciation`, `/dashboard/writing`, `/dashboard/exam`, `/dashboard/learning-path`, `/dashboard/memory`, `/dashboard/leaderboard`, `/dashboard/settings`, and `/dashboard/profile` at desktop 1440x960 and mobile 390x844.",
      "Check active, empty, completion, settings-save, and profile edit states where the route exposes them.",
      "Verify module-specific content is solid/readable while controls use shared glass."
    ],
    "regression_scope": ["Reading passage readability", "Listening transcript readability", "Grammar answer feedback", "Pronunciation scoring", "Writing feedback", "Exam quota and scoring shell", "Settings/Profile forms"],
    "compliance_gates": ["Account forms preserve labels and focus order", "No personal data in screenshots beyond seeded regression user", "No glass behind long passage/transcript/body text"],
    "acceptance_gates": ["All remaining authenticated routes are captured", "Oracle VGUI-F012 updated", "Source and continuity writeback complete"],
    "rollback_plan": ["Revert module route files if route tests or screenshot regression reveal unreadable content."]
  },
  "evidence": {
    "outputs": ["docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-12-liquid-glass-specialist-modules-and-account-report.md"],
    "required_artifacts": ["phase report", "test output", "module screenshot matrix", "source-packet writeback", "continuity-ledger update"],
    "waiver_policy": "Account and exam behavior gates require explicit user waiver.",
    "next_phase_handoff": "Unlock VGUI-13 after all remaining authenticated routes are verified."
  },
  "stop_conditions": ["account persistence would need to change", "exam quota behavior would need to change", "module content becomes unreadable"]
}
```

## Coding Agent Contract

- PHASE_ID: VGUI-12
- GOAL_TARGET: Upgrade every remaining authenticated route with the shared Liquid Glass system and module-specific readability.
- GOAL_PROMPT: Complete VGUI-12 by following this phase file; work on feature-oracle item VGUI-F012; cover all specialist/account routes; preserve feature semantics; finish only after focused tests, browser evidence, writeback, and report evidence pass or blockers are documented.
- DEPENDS_ON: VGUI-11
- READ_FIRST: README, source packet, continuity ledger, this file
- PRIMARY_CONTEXT: specialist pages, account pages, exam/pronunciation components, regression scripts
- LIKELY_EDIT_PATHS: same as PRIMARY_CONTEXT plus harness runtime docs and report
- DO_NOT_EDIT: account persistence contract, exam quota semantics, AI provider credentials, database migrations, billing behavior
- EXECUTION_MODE: plan-first; route group implementation; verify route group
- VALIDATION_COMMANDS: module/account Vitest command from Machine Contract; `npm run lint`; `npm run check:i18n`; `npm run build`
- BROWSER_CHECKS: all specialist/account routes, desktop/mobile, active/empty/completion/save/edit states where available
- REGRESSION_SCOPE: long-form readability, transcript readability, answer feedback, scoring, forms
- COMPLIANCE_GATES: labels, focus order, no sensitive screenshot data, no glass behind long content
- ROLLBACK_PLAN: Revert module route files if content becomes unreadable.
- ACCEPTANCE_GATES: All remaining authenticated routes verified, oracle updated, writeback complete.
- EVIDENCE_OUTPUT: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-12-liquid-glass-specialist-modules-and-account-report.md`
- STOP_CONDITIONS: Stop if account persistence, exam quota, or content readability is compromised.

## Task Spec

Upgrade all remaining authenticated routes: Reading, Listening, Grammar, Pronunciation, Writing, Exam, Learning Path, Memory, Leaderboard, Settings, and Profile.

## Problem Boundary

This phase owns specialist and account route presentation. It must preserve account persistence, exam quota semantics, module scoring behavior, provider boundaries, and form contracts.

## Context Policy

Read VGUI-11 evidence first. Load only specialist/account route files, named feature components, and regression scripts. Do not revisit public/auth work unless a shared shell regression is proven.

## Requirements

- Keep reading passages, transcripts, writing feedback, exam prompts, memory entries, settings forms, and profile data on solid surfaces.
- Use shared glass only for route shell controls and small mode controls.
- Verify active, empty, completion, settings-save, and profile-edit states where available.
- Keep module copy concrete and avoid old cockpit/generic AI language.

## Test and Regression Requirements

Run module/account tests, lint, i18n, build, and browser checks for the 11 specialist/account routes at desktop/mobile.

## Compliance and Safety Requirements

Settings and profile labels must remain visible, focus order must be logical, and screenshots must use seeded regression identity only.

## Rollback and Recovery

Revert specialist/account route changes if route content becomes unreadable or account/exam behavior changes.

## Execution Capture

Write the VGUI-12 report with route coverage table, command output, screenshots, changed files, source-packet writeback, continuity update, and VGUI-F012 evidence.

## Evaluator Protocol

Evaluator checks every remaining authenticated route, not a sample, and rejects any route with glass under long-form content.

## Acceptance Criteria

All 11 specialist/account routes have evidence, tests pass, content remains readable, and VGUI-F012 is updated.

## Risks

Module pages contain long-form learning content where glass effects can quickly damage readability.
