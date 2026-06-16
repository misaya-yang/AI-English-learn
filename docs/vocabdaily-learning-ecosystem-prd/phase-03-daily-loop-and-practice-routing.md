# Phase 03 - Daily Loop And Practice Routing

> For agentic workers: enter plan-first mode before editing. Execute this phase only, write the required evidence, and do not advance to the next phase until acceptance gates pass or blockers are documented.

**Goal:** Connect Today, Review, Practice, dictation/listening, mistakes, and imported wordbooks into one honest learning loop.

**Architecture:** This phase builds on the answer attempt state, FSRS review, learning events, mistake collector, daily mission routing, and lexicon links. It should protect the two-attempt reveal rule and make recovered answers distinct from first-try correctness.

**Tech Stack:** React, TypeScript, FSRS services, learning event services, practice runtime, Vitest, Playwright learning-flow regression.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v2",
  "harness_role": "execution",
  "phase": {
    "id": "VLE-03",
    "number": "03",
    "title": "Daily Loop And Practice Routing",
    "status": "ready",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-learning-ecosystem-prd",
    "phase_file": "docs/vocabdaily-learning-ecosystem-prd/phase-03-daily-loop-and-practice-routing.md",
    "depends_on": ["VLE-02"],
    "unlocks": ["VLE-04"]
  },
  "goal": {
    "target": "Route daily tasks, review, practice, listening dictation, mistakes, and wordbook context through a consistent evidence-backed learning loop.",
    "prompt": "Complete VLE-03 Daily Loop And Practice Routing for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-03-daily-loop-and-practice-routing.md`; preserve the two-attempt answer reveal rule, keep learner evidence semantics honest, stay inside named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-03-daily-loop-and-practice-routing-plan.md",
    "completion_report": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-03-daily-loop-and-practice-routing-report.md"
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
      "docs/vocabdaily-learning-ecosystem-prd/phase-03-daily-loop-and-practice-routing.md",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-02-anki-import-export-experience-report.md"
    ],
    "primary_context": [
      "src/features/practice/attemptState.ts",
      "src/pages/dashboard/PracticePage.tsx",
      "src/pages/dashboard/TodayPage.tsx",
      "src/pages/dashboard/ReviewPage.tsx",
      "src/pages/dashboard/ListeningPage.tsx",
      "src/services/mistakeCollector.ts",
      "src/services/practiceMistakes.ts",
      "src/services/evidenceEvents.ts",
      "src/services/learningEvents.ts",
      "src/features/learning/sessionRecap.ts",
      "src/features/learning/dailyCoachPlan.ts",
      "src/contexts/UserDataContext.tsx",
      "scripts/learning-flow-regression.mjs"
    ],
    "context_budget": "focused",
    "do_not_load_unless": [
      "Chat runtime may be opened only if coach handoff query parameters from daily practice are broken"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "src/features/practice/**",
      "src/pages/dashboard/PracticePage.tsx",
      "src/pages/dashboard/TodayPage.tsx",
      "src/pages/dashboard/ReviewPage.tsx",
      "src/pages/dashboard/ListeningPage.tsx",
      "src/services/mistakeCollector.ts",
      "src/services/practiceMistakes.ts",
      "src/services/evidenceEvents.ts",
      "src/services/learningEvents.ts",
      "src/features/learning/sessionRecap.ts",
      "src/features/learning/dailyCoachPlan.ts",
      "src/pages/dashboard/*.test.tsx",
      "src/features/practice/*.test.ts",
      "src/services/*.test.ts",
      "scripts/learning-flow-regression.mjs",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-03-daily-loop-and-practice-routing-report.md",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/"
    ],
    "do_not_edit": [
      "billing files",
      "production deployment config",
      "third-party imported deck data"
    ],
    "external_inputs": [
      "synthetic learner state seeded through tests or demo session"
    ],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["rg", "apply_patch", "npm validation commands", "Playwright route checks"],
    "approval_required": ["database migration", "production data mutation", "deployment"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "production migration", "force push"]
  },
  "risk": {
    "tags": ["frontend", "ui", "database"],
    "data_mutation": "local learner progress and evidence",
    "migration_required": "possible",
    "browser_required": true,
    "ai_eval_required": false,
    "external_service_required": false,
    "release_blocking": false
  },
  "validation": {
    "commands": [
      {
        "id": "attempt-tests",
        "cwd": ".",
        "command": "npm test -- --run src/features/practice/attemptState.test.ts src/pages/dashboard/PracticePage.test.tsx src/features/learning/sessionRecap.test.ts src/services/evidenceEvents.test.ts src/services/learningEvents.strict.test.ts",
        "expected": "Focused attempt, practice, recap, and evidence tests pass.",
        "required": true
      },
      {
        "id": "lint",
        "cwd": ".",
        "command": "npm run lint",
        "expected": "ESLint completes with zero errors.",
        "required": true
      },
      {
        "id": "i18n",
        "cwd": ".",
        "command": "npm run check:i18n",
        "expected": "i18n check completes with zero missing-key errors.",
        "required": true
      },
      {
        "id": "build",
        "cwd": ".",
        "command": "npm run build",
        "expected": "Production build completes.",
        "required": true
      },
      {
        "id": "learning-flow",
        "cwd": ".",
        "command": "BASE_URL=http://127.0.0.1:4173 npm run test:learning-flow-regression",
        "expected": "Learning-flow regression passes across target routes, themes, and viewports.",
        "required": true
      }
    ],
    "browser_checks": [
      "On /dashboard/today desktop and mobile, confirm the next task clearly routes to review, new word, practice, or coach with active wordbook context.",
      "On /dashboard/practice desktop and mobile, answer a choice question wrong once and confirm no correct answer is revealed.",
      "On /dashboard/practice desktop and mobile, answer wrong then correct and confirm recovered state is visible and not counted as first-try correct.",
      "On /dashboard/practice desktop and mobile, answer wrong twice and confirm correct answer plus explanation appears.",
      "On listening or dictation flow, enter a wrong answer once and confirm expected answer is hidden; enter a second wrong answer and confirm reveal.",
      "On /dashboard/review, rate a word and confirm FSRS due state changes without breaking navigation."
    ],
    "regression_scope": [
      "First-try correct maps to practice.correct and FSRS good.",
      "Recovered maps to practice.recovered and FSRS hard.",
      "Needs-review maps to practice.incorrect and FSRS again.",
      "Mistake collector only receives second wrong, revealed, or explicitly failed items.",
      "Session recap separates first-try correct, recovered, and needs-review."
    ],
    "compliance_gates": [
      "No learner correctness metric may count recovered answers as first-try correct.",
      "No first wrong answer may leak the correct answer in toast, inline panel, aria text, or disabled option styling.",
      "All feedback must remain readable in light and dark mode.",
      "Keyboard Enter behavior must match the visible button state for check, retry, reveal, and next."
    ],
    "acceptance_gates": [
      "Today answers the learner question: what should I do now and why?",
      "Practice and dictation share the two-attempt reveal rule.",
      "Review, mistakes, and daily plan consume the same attempt outcomes.",
      "Imported active wordbooks can feed Today and Practice without losing source context.",
      "Learning-flow regression covers route switching, themes, desktop, mobile, and answer states."
    ],
    "rollback_plan": [
      "Rollback is reverting practice, daily loop, evidence, and recap files.",
      "If persistent evidence fields are added after approval, provide migration rollback and local data cleanup instructions.",
      "Keep legacy progress fields readable until new recap metrics are fully covered."
    ]
  },
  "evidence": {
    "outputs": [
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-03-daily-loop-and-practice-routing-report.md",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop/"
    ],
    "required_artifacts": ["phase report", "focused test output", "learning-flow regression summary", "practice desktop screenshot", "practice mobile screenshot"],
    "waiver_policy": "A browser interaction waiver must list the exact route, viewport, and state that could not be exercised.",
    "next_phase_handoff": "Unlock VLE-04 only when AI coach can rely on honest attempt, mistake, review, and session recap semantics."
  },
  "stop_conditions": [
    "Stop if first-wrong answer reveal cannot be prevented in every practice mode touched.",
    "Stop if recovered outcomes cannot be separated from first-try correct outcomes.",
    "Stop if review scheduling changes cannot be proven with focused tests."
  ]
}
```

## Coding Agent Contract

- PHASE_ID: VLE-03
- GOAL_TARGET: Route daily tasks, review, practice, listening dictation, mistakes, and wordbook context through a consistent evidence-backed learning loop.
- GOAL_PROMPT: Complete VLE-03 Daily Loop And Practice Routing for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-03-daily-loop-and-practice-routing.md`; preserve the two-attempt answer reveal rule, keep learner evidence semantics honest, stay inside named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: VLE-02
- READ_FIRST: `docs/vocabdaily-learning-ecosystem-prd/README.md`, `docs/vocabdaily-learning-ecosystem-prd/phase-manifest.md`, this file, `docs/vocabdaily-learning-ecosystem-prd/reports/vle-02-anki-import-export-experience-report.md`
- PRIMARY_CONTEXT: `src/features/practice/attemptState.ts`, `src/pages/dashboard/PracticePage.tsx`, `src/pages/dashboard/TodayPage.tsx`, `src/pages/dashboard/ReviewPage.tsx`, `src/pages/dashboard/ListeningPage.tsx`, `src/services/mistakeCollector.ts`, `src/services/evidenceEvents.ts`, `src/services/learningEvents.ts`, `src/features/learning/sessionRecap.ts`
- LIKELY_EDIT_PATHS: practice features, Today, Review, Listening, mistake and evidence services, session recap, daily coach plan, focused tests, learning-flow script, phase report, screenshots
- DO_NOT_EDIT: billing files, production deployment config, third-party imported deck data
- EXECUTION_MODE: plan-first; protect reveal rule; implement outcome semantics before UI polish; verify before handoff
- VALIDATION_COMMANDS: `npm test -- --run src/features/practice/attemptState.test.ts src/pages/dashboard/PracticePage.test.tsx src/features/learning/sessionRecap.test.ts src/services/evidenceEvents.test.ts src/services/learningEvents.strict.test.ts`; `npm run lint`; `npm run check:i18n`; `npm run build`; `BASE_URL=http://127.0.0.1:4173 npm run test:learning-flow-regression`
- BROWSER_CHECKS: Today task routing, Practice first wrong, Practice recovered, Practice second wrong reveal, dictation first wrong hidden expected answer, Review rating
- REGRESSION_SCOPE: practice.correct, practice.recovered, practice.incorrect, FSRS good/hard/again, mistake collector, recap metrics
- COMPLIANCE_GATES: no inflated correctness, no answer leak, readable feedback, keyboard Enter parity
- ROLLBACK_PLAN: revert loop/evidence/recap files; if persistent evidence fields appear after approval, add migration rollback and local cleanup
- ACCEPTANCE_GATES: Today gives clear next action; Practice and dictation share two-attempt reveal; Review and mistakes consume outcomes; imported wordbooks feed loop; learning-flow regression covers states
- EVIDENCE_OUTPUT: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-03-daily-loop-and-practice-routing-report.md`
- STOP_CONDITIONS: first-wrong reveal persists; recovered cannot be separated; FSRS scheduling unproven

## Task Spec

Make the learning loop honest. Wrong once means hint and retry, not answer reveal. Correct after retry means recovered, not first-try correct. Wrong twice means answer reveal and review scheduling.

## Problem Boundary

In scope:

- Today routing.
- Practice answer semantics.
- Listening/dictation retry behavior.
- Review and FSRS handoff.
- Mistake collector and recap semantics.
- Learning-flow regression.

Out of scope:

- AI coach prompt redesign.
- Import parser changes.
- Full UI system migration.
- Production deployment.

## Context Policy

Start from the attempt state helper and PracticePage. Open Chat only if daily handoff links to coach fail during browser checks.

## Requirements

### R1 Answer State

Choice and dictation flows use answering, retrying, revealed, and next states with a maximum of two attempts before reveal unless the learner chooses show answer.

### R2 Evidence Semantics

First-try correct, recovered, and needs-review are separate in events, FSRS rating, mistake collector behavior, and recap.

### R3 Daily Routing

Today chooses the next action from due reviews, active wordbook progress, recent mistakes, imported-book context, and learner goals.

### R4 Dictation And Listening

Dictation first wrong gives a hint and replay. Second wrong reveals the expected answer and writes review evidence.

## Test and Regression Requirements

- Focused tests for attempt state, PracticePage, listening/dictation retry behavior, recap, and evidence events.
- Learning-flow regression across desktop, mobile, light, dark, system themes.
- Browser screenshots for first wrong, recovered, and revealed states.

## Compliance and Safety Requirements

- Do not inflate correctness metrics.
- Do not leak correct answers early.
- Keep feedback inline and readable.
- Keep keyboard behavior aligned with visible state.

## Rollback and Recovery

Rollback by reverting touched files. If new persisted fields are introduced, keep legacy readers and document local cleanup.

## Execution Capture

Use `docs/vocabdaily-learning-ecosystem-prd/reports/phase-report-template.md` and save the phase report at `docs/vocabdaily-learning-ecosystem-prd/reports/vle-03-daily-loop-and-practice-routing-report.md`.

## Evaluator Protocol

Use a single word through three paths: first-try correct, retry correct, and second-wrong reveal. Confirm each produces distinct UI, evidence, FSRS rating, and recap output.

## Acceptance Criteria

- The product no longer rewards or displays wrong-first answers as if they were mastered.
- The learner sees a calm next step instead of a punishing or answer-leaking toast.
- VLE-04 has trustworthy evidence to use in AI coaching.

## Risks

- Existing tests may assume old correct/incorrect counters.
- Some practice modes may duplicate answer logic.
- UI feedback can regress contrast in dark mode.
