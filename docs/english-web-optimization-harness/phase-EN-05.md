# Phase 05 - Learning Center Optimization

> For agentic workers: enter plan-first mode before editing. Execute EN-05 only after EN-04 is passed or waived, update EN-F005 only, and run whole-demand regression across EN-F001 through EN-F005.

**Goal:** Connect Today, Review, Analytics, Settings, Profile, and Learning Path into a coherent progress, reflection, and control center that preserves all prior module contracts.

**Architecture:** This terminal phase verifies and optimizes the central learning loop after Vocabulary, Speaking, Listening, and Reading have evidence. It owns cross-route progress clarity, reflection, settings/profile controls, and whole-demand regression.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Radix UI, i18n, localStorage/IndexedDB, learning events, evidence events, FSRS services, notifications, Vitest, Playwright regression scripts.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "EN-05",
    "number": "05",
    "title": "Learning Center Optimization",
    "status": "passed",
    "type": "release",
    "repo_path": ".",
    "docs_path": "docs/english-web-optimization-harness",
    "phase_file": "docs/english-web-optimization-harness/phase-EN-05.md",
    "depends_on": ["EN-04"],
    "unlocks": []
  },
  "goal": {
    "target": "Connect Today, Review, Analytics, Settings, Profile, and Learning Path into a coherent progress, reflection, and control center that preserves all prior module contracts.",
    "prompt": "Complete EN-05 Learning Center Optimization for `.` by following `docs/english-web-optimization-harness/phase-EN-05.md`; work on EN-F005, preserve completed EN-01 through EN-04 contracts, run whole-demand regression, stay inside the named edit boundaries, and finish only after validation, browser, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/english-web-optimization-harness/reports/en-05-learning-center-plan.md",
    "completion_report": "docs/english-web-optimization-harness/reports/en-05-learning-center-report.md"
  },
  "runtime": {
    "context_profile": "docs/english-web-optimization-harness/context-profile.json",
    "feature_oracle": "docs/english-web-optimization-harness/feature-oracle.json",
    "loop_contract": "docs/english-web-optimization-harness/loop-contract.json",
    "loop_state": "docs/english-web-optimization-harness/loop-state.json",
    "progress_log": "docs/english-web-optimization-harness/progress-log.md",
    "handoff": "docs/english-web-optimization-harness/agent-handoff.md",
    "continuity_ledger": "docs/english-web-optimization-harness/continuity-ledger.md",
    "next_window_prompt": "docs/english-web-optimization-harness/next-window-prompt.md",
    "session_boot": {
      "read_progress": true,
      "run_baseline_check": true,
      "update_progress_before_exit": true
    },
    "agent_roles": ["planner", "generator", "critic"]
  },
  "context": {
    "read_first": [
      "docs/english-web-optimization-harness/context-profile.json",
      "docs/english-web-optimization-harness/loop-state.json",
      "docs/english-web-optimization-harness/phase-EN-05.md"
    ],
    "primary_context": [
      "src/pages/dashboard/TodayPage.tsx",
      "src/pages/dashboard/ReviewPage.tsx",
      "src/pages/dashboard/AnalyticsPage.tsx",
      "src/pages/dashboard/SettingsPage.tsx"
    ],
    "context_budget": "focused",
    "do_not_load_unless": [
      "docs/english-web-optimization-harness/source-packet.md only for repository evidence lookup or code-fact writeback",
      "docs/english-web-optimization-harness/continuity-ledger.md only for dependency boundary lookup or writeback",
      "docs/english-web-optimization-harness/feature-oracle.json only for EN-F005 status and evidence updates",
      "docs/english-web-optimization-harness/progress-log.md only for session status updates",
      "docs/english-web-optimization-harness/agent-handoff.md only for role handoff updates",
      "src/pages/dashboard/ProfilePage.tsx and src/pages/dashboard/LearningPathPage.tsx after the initial EN-05 plan, because they are required Learning Center validation surfaces but remain outside the four-item hot path"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "src/pages/dashboard/TodayPage.tsx",
      "src/pages/dashboard/ReviewPage.tsx",
      "src/pages/dashboard/AnalyticsPage.tsx",
      "src/pages/dashboard/SettingsPage.tsx",
      "src/pages/dashboard/ProfilePage.tsx",
      "src/pages/dashboard/LearningPathPage.tsx",
      "src/services/learnerModel.ts",
      "src/services/reviewWindows.ts",
      "src/services/retentionInsights.ts",
      "src/services/reminderService.ts",
      "src/hooks/useStudyReminder.ts",
      "src/pages/dashboard/*.test.tsx",
      "src/services/*.test.ts",
      "docs/english-web-optimization-harness/reports/en-05-learning-center-report.md",
      "docs/english-web-optimization-harness/reports/en-05-learning-center-critic.md"
    ],
    "do_not_edit": [
      "supabase/**",
      "api/supabase.js",
      "vercel.json",
      "src/services/billingGateway.ts",
      "src/pages/PricingPage.tsx",
      "package-lock.json",
      ".env*",
      "production provider dashboards"
    ],
    "external_inputs": [
      "browser notification permission",
      "local seeded learner data from regression scripts",
      "completed EN-01 through EN-04 actor and critic artifacts"
    ],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["rg", "apply_patch", "npm validation commands", "Playwright browser checks"],
    "approval_required": ["production deployment", "Supabase schema change", "notification provider change", "dependency addition", "provider dashboard action"],
    "dangerous_commands": ["git reset --hard", "force push", "rm -rf", "production migration", "secret printing"]
  },
  "risk": {
    "tags": ["ui", "frontend", "auth", "privacy", "release"],
    "data_mutation": true,
    "migration_required": false,
    "browser_required": true,
    "ai_eval_required": false,
    "external_service_required": false,
    "release_blocking": true
  },
  "validation": {
    "commands": [
      {
        "id": "lint",
        "cwd": ".",
        "command": "npm run lint",
        "expected": "ESLint exits 0 with no new errors.",
        "required": true
      },
      {
        "id": "i18n",
        "cwd": ".",
        "command": "npm run check:i18n",
        "expected": "i18n check exits 0 with no missing keys.",
        "required": true
      },
      {
        "id": "focused-learning-center-tests",
        "cwd": ".",
        "command": "npm test -- --run src/pages/dashboard/ReviewPage.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/pages/dashboard/SettingsPage.test.tsx src/pages/dashboard/ProfilePage.test.tsx src/services/reviewWindows.test.ts src/services/retentionInsights.test.ts src/services/reminderService.test.ts",
        "expected": "Focused learning-center page and service tests pass.",
        "required": true
      },
      {
        "id": "full-tests",
        "cwd": ".",
        "command": "npm test -- --run",
        "expected": "Full Vitest suite exits 0.",
        "required": true
      },
      {
        "id": "build",
        "cwd": ".",
        "command": "npm run build",
        "expected": "TypeScript build and Vite production build exit 0.",
        "required": true
      },
      {
        "id": "dev-server-precheck",
        "cwd": ".",
        "command": "curl -sSf http://127.0.0.1:5173/ >/dev/null",
        "expected": "Local dev server is already running. If this fails, start `npm run dev -- --host 127.0.0.1 --port 5173` in a separate terminal and rerun.",
        "required": true
      },
      {
        "id": "ui-regression",
        "cwd": ".",
        "command": "BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-05-learning-center npm run test:ui-regression",
        "expected": "Browser regression captures all dashboard routes without login redirect, blank page, error boundary, or horizontal overflow.",
        "required": true
      },
      {
        "id": "learning-flow-regression",
        "cwd": ".",
        "command": "BASE_URL=http://127.0.0.1:5173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-28/en-05-learning-flow npm run test:learning-flow-regression",
        "expected": "Seeded learning-flow regression passes across route, theme, language, and learning-state checks.",
        "required": true
      },
      {
        "id": "diff-hygiene",
        "cwd": ".",
        "command": "git diff --check",
        "expected": "No whitespace errors in the working tree diff.",
        "required": true
      }
    ],
    "browser_checks": [
      "After dev-server-precheck passes, open /dashboard/today, /dashboard/review, /dashboard/analytics, /dashboard/settings, /dashboard/profile, and /dashboard/learning-path at 1440x960 and 390x844.",
      "Verify Today has one primary mission, due-review priority, daily word progress, and next-step handoff.",
      "Verify Review empty, due-card, revealed-answer, rating, and completion states.",
      "Verify Analytics empty states and populated seeded states do not fabricate progress.",
      "Verify Settings language, theme, notification, quiet hours, lifecycle preview, data export, and clear-data confirmation.",
      "Verify Profile CEFR, learning style, exam target, avatar/upload fallback, level progress, badges, and demo/pro state copy.",
      "Verify English-mode Settings tabs and Profile material/entitlement labels no longer show accidental Chinese or are recorded with product-intent evidence.",
      "Verify Settings clear-data either clears IndexedDB stores or clearly documents the current localStorage-only boundary without executing destructive automated clearing.",
      "Verify Today hard-word behavior either enters review debt or the UI copy no longer implies due-queue mutation.",
      "Run whole-demand regression by checking EN-F001 through EN-F005 evidence and route screenshots."
    ],
    "regression_scope": [
      "Vocabulary EN-F001 remains passing or waived.",
      "Speaking EN-F002 remains passing or waived.",
      "Listening EN-F003 remains passing or waived.",
      "Reading EN-F004 remains passing or waived.",
      "Whole-demand regression across completed feature-oracle items is executed or blocked with evidence.",
      "Independent critic evidence confirms minimal-change scope."
    ],
    "compliance_gates": [
      "Analytics shows only real or seeded evidence and does not fabricate learner history.",
      "Notification permission denial is handled without crash or permission bypass.",
      "Settings clear-data path requires explicit confirmation and does not run during automated checks.",
      "Clear-data behavior covers IndexedDB or documents residual local artifacts with user-facing risk.",
      "Auth/demo copy does not imply production account guarantees.",
      "No production deployment, provider dashboard action, or secret value is used without approval."
    ],
    "acceptance_gates": [
      "Today, Review, Analytics, Settings, Profile, and Learning Path form a coherent progress and reflection loop.",
      "Hard-coded English-mode leaks in touched learning-center surfaces are removed or documented with product-term rationale.",
      "Today hard-word copy and behavior are aligned with actual review-debt mutation.",
      "Settings clear-data semantics are explicit for localStorage and IndexedDB.",
      "Learning metrics remain honest in empty and seeded states.",
      "Whole-demand regression covers EN-F001 through EN-F005 with report evidence.",
      "Phase report includes validation evidence, browser screenshots, minimal-change scope, source packet writeback, feature oracle update, progress log update, handoff update, and independent critic approval."
    ],
    "rollback_plan": [
      "Revert EN-05 learning-center page, service, hook, and focused test changes.",
      "Do not clear user data as rollback.",
      "If release deployment is requested, require a separate deployment approval and rollback note."
    ]
  },
  "evidence": {
    "outputs": [
      "docs/english-web-optimization-harness/reports/en-05-learning-center-report.md",
      "docs/english-web-optimization-harness/reports/en-05-learning-center-critic.md",
      "product-audit-2026-06-28/en-05-learning-center/",
      "product-audit-2026-06-28/en-05-learning-flow/"
    ],
    "required_artifacts": [
      "phase report with Status line",
      "progress log entry",
      "feature oracle EN-F005 evidence update",
      "continuity ledger code-summary writeback",
      "source packet code facts update",
      "handoff update",
      "focused test output",
      "full test output",
      "browser screenshots",
      "whole-demand regression evidence",
      "independent critic artifact",
      "minimal-change scope notes"
    ],
    "waiver_policy": "A waived terminal gate must name the command, route, feature, actor evidence, critic evidence, residual risk, and user waiver before the full harness may be called complete.",
    "next_phase_handoff": "EN-05 is terminal; handoff must state whether the full English Web harness is complete, blocked, or waived with whole-demand regression evidence."
  },
  "stop_conditions": [
    "Stop if EN-04 dependency lacks passing or waived evidence.",
    "Stop if whole-demand regression cannot access prior actor and critic artifacts.",
    "Stop if production deployment is required without approval.",
    "Stop if notification, auth, or data-clearing behavior requires provider or destructive actions."
  ]
}
```

## Coding Agent Contract

- PHASE_ID: EN-05
- GOAL_TARGET: Connect Today, Review, Analytics, Settings, Profile, and Learning Path into a coherent progress, reflection, and control center that preserves all prior module contracts.
- GOAL_PROMPT: Complete EN-05 Learning Center Optimization for `.` by following `docs/english-web-optimization-harness/phase-EN-05.md`; work on EN-F005, preserve completed EN-01 through EN-04 contracts, run whole-demand regression, stay inside the named edit boundaries, and finish only after validation, browser, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: EN-04
- READ_FIRST: `docs/english-web-optimization-harness/context-profile.json`, `docs/english-web-optimization-harness/loop-state.json`, this file
- PRIMARY_CONTEXT: `src/pages/dashboard/TodayPage.tsx`, `src/pages/dashboard/ReviewPage.tsx`, `src/pages/dashboard/AnalyticsPage.tsx`, `src/pages/dashboard/SettingsPage.tsx`; after the initial plan also open `src/pages/dashboard/ProfilePage.tsx` and `src/pages/dashboard/LearningPathPage.tsx` for required EN-05 browser/evidence checks
- LIKELY_EDIT_PATHS: Today, Review, Analytics, Settings, Profile, Learning Path, learner model/review windows/retention/reminder services, study reminder hook, focused tests, EN-05 report and critic files
- DO_NOT_EDIT: `supabase/**`, `api/supabase.js`, `vercel.json`, `src/services/billingGateway.ts`, `src/pages/PricingPage.tsx`, `package-lock.json`, `.env*`, production provider dashboards
- EXECUTION_MODE: plan-first; implement one learning-center slice; run terminal whole-demand regression; write evidence before handoff
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm test -- --run src/pages/dashboard/ReviewPage.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/pages/dashboard/SettingsPage.test.tsx src/pages/dashboard/ProfilePage.test.tsx src/services/reviewWindows.test.ts src/services/retentionInsights.test.ts src/services/reminderService.test.ts`; `npm test -- --run`; `npm run build`; `curl -sSf http://127.0.0.1:5173/ >/dev/null`; `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-05-learning-center npm run test:ui-regression`; `BASE_URL=http://127.0.0.1:5173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-28/en-05-learning-flow npm run test:learning-flow-regression`; `git diff --check`
- BROWSER_CHECKS: Today, Review, Analytics, Settings, Profile, Learning Path desktop 1440x960 and mobile 390x844; empty and seeded states; language/theme; notification permission; whole-demand regression
- REGRESSION_SCOPE: EN-F001 Vocabulary, EN-F002 Speaking, EN-F003 Listening, EN-F004 Reading, whole-demand regression, minimal-change critic review
- COMPLIANCE_GATES: honest analytics, notification denial, data clear confirmation, auth/demo copy, no production/provider/secret work without approval
- ROLLBACK_PLAN: revert EN-05 page/service/hook/test changes; do not clear user data; separate approval for deployment rollback
- ACCEPTANCE_GATES: coherent progress loop; English-mode leaks removed or justified; metrics honest; whole-demand regression recorded; actor report, oracle update, source packet, continuity ledger, progress log, handoff, and critic approval complete
- EVIDENCE_OUTPUT: `docs/english-web-optimization-harness/reports/en-05-learning-center-report.md`
- STOP_CONDITIONS: EN-04 not passed or waived; prior evidence missing; deployment required without approval; notification/auth/data-clearing provider action required

## Task Spec

### UI Walk-Through Issues

1. Today includes multiple rails and panels; the primary mission must remain singular and obvious.
2. Today still has hard-coded Chinese toasts and bookmark/share button labels.
3. Analytics has high information density and many empty states that need evidence-honesty checks.
4. Settings notification, reminder, quiet-hour, and lifecycle preview controls include hard-coded Chinese labels and toasts.
5. Profile combines avatar upload, learning profile, badges, level progress, and Pro/freeze state; demo/pro copy needs clarity.
6. Learning Path must inherit prior module state without looking detached from Today and Review.
7. English-mode browser baseline showed Chinese Settings tab labels and Profile material labels before EN-05 work.

### Functional Issues

1. Today writes evidence events for learned and hard vocabulary; Analytics and Review must reflect those events.
2. Review, Today, Practice, Chat, Reading, Listening, and Analytics share learning-event semantics that can drift.
3. Notification permission and lifecycle reminders depend on browser permissions.
4. Local/demo auth and Supabase sync paths can diverge.
5. Analytics must distinguish empty state from real progress and seeded test data.
6. Settings clear-data flow is destructive and must stay guarded.
7. Settings clear-data currently has evidence of localStorage clearing but can leave IndexedDB progress/events/sync artifacts.
8. Today hard-word copy can imply review-list mutation while current evidence shows daily flags/evidence without direct FSRS due-queue mutation.

### Priority Optimization List

- P0: Run whole-demand regression across EN-F001 through EN-F005 before claiming completion.
- P0: Remove or branch hard-coded Chinese in touched English-mode learning-center surfaces.
- P0: Preserve clear-data confirmation and never execute destructive clearing in automated checks.
- P1: Make Today primary mission priority visible across review-due, new-word, and practice states.
- P1: Keep Analytics honest in empty and seeded states with no fabricated charts.
- P2: Align Settings/Profile controls with module language, theme, and demo/pro expectations.

### Risks and Regression Points

- Changes to learning events can alter every progress surface.
- Reminder and notification behavior can vary by browser permission state.
- Analytics charts can hide empty-state truth if seeded data is not labeled.
- Settings clear-data controls are destructive.
- Clear-data semantics can leave IndexedDB learner artifacts if only localStorage is cleared.
- Today hard-word behavior can mislead learners about review debt if copy and FSRS mutation diverge.
- Terminal regression may be blocked by missing prior phase evidence.

### Sub-Agent Conclusions

- UI agent: The center should feel operational, not decorative; mission priority, settings clarity, and analytics honesty are the main UX gates.
- Functional agent: Event semantics and destructive controls are the highest-risk functional areas.
- Quality agent: EN-05 must run full tests, build, UI regression, learning-flow regression, and whole-demand regression before completion.

### Quantitative Acceptance Metrics

- 5 feature-oracle items EN-F001 through EN-F005 are passing or waived with actor and critic evidence before full completion.
- 0 accidental Chinese strings visible in touched English-mode Today, Settings, Profile, and Analytics surfaces. Assumption: product terms such as IELTS, CEFR, FSRS, XP can remain unchanged; verification through browser body text and screenshots.
- 0 horizontal overflow pixels at `390x844` across checked learning-center routes. Verification: `test:ui-regression` summary.
- 6 routes verified in EN-05 browser checks: Today, Review, Analytics, Settings, Profile, Learning Path.
- 1 terminal actor report and 1 separate terminal critic artifact include whole-demand regression evidence.

## Problem Boundary

In scope: Today, Review, Analytics, Settings, Profile, Learning Path, learner model/review windows/retention/reminder services, study reminder hook, focused tests, full regression, EN-05 report and critic artifact.

Out of scope: production deployment without approval, Supabase schema/RLS/functions, billing, pricing, provider dashboards, dependency changes.

## Context Policy

Open only the four primary context paths before planning. Open `src/pages/dashboard/ProfilePage.tsx` and `src/pages/dashboard/LearningPathPage.tsx` immediately after the initial plan because they are required EN-05 validation surfaces but not hot-path files. Open prior phase reports only when running whole-demand regression.

## Requirements

### R1 Coherent Daily Center

Today and Review must present a clear current priority and next action across due-review, new-word, and practice states.

### R2 Honest Reflection

Analytics must show real or seeded evidence without fabricated learner history.

### R3 Control Safety

Settings and Profile must make language, theme, notification, profile, demo/pro, and destructive data controls clear and safe.

### R4 Whole-Demand Regression

EN-05 must verify completed EN-F001 through EN-F005 oracle evidence before the full harness can be marked complete.

### R5 Evidence Writeback

Actor report, critic artifact, oracle, progress log, source packet, continuity ledger, and handoff must be updated.

## Test and Regression Requirements

Run the validation commands in the Machine Contract. Capture Today, Review, Analytics, Settings, Profile, and Learning Path in desktop and mobile. Record whole-demand regression across all feature-oracle items.

## Compliance and Safety Requirements

Do not execute destructive clear-data actions during automated checks. Do not use production deployment or provider dashboards without approval. Do not print secrets. Keep analytics evidence honest.

## Rollback and Recovery

Rollback is a normal git revert of EN-05 touched files plus documentation updates. Do not clear user data as rollback. If deployment is separately approved, write a separate deployment rollback note.

## Execution Capture

Write `reports/en-05-learning-center-report.md` with command outputs, screenshots, whole-demand regression evidence, changed files, minimal-change rationale, oracle update, and blocker notes.

## Critic Protocol

Write `reports/en-05-learning-center-critic.md`. It must include `Critic Verdict: approved` or a documented waiver, the EN-F005 feature id, whole-demand regression assessment, and `Actor Report Reviewed: docs/english-web-optimization-harness/reports/en-05-learning-center-report.md`.

## Acceptance Criteria

- EN-F005 has actor and critic evidence.
- Whole-demand regression across EN-F001 through EN-F005 is recorded.
- Validation commands pass or blockers are documented.
- Source packet and continuity ledger contain EN-05 code facts.

## Risks

- Terminal regression cannot pass until prior actor and critic artifacts exist.
- Full browser regression can be slow or blocked by local server availability.
- Notification and auth behavior may differ outside local/demo contexts.
