# Phase 04 - AI English Coach And Skill Feedback

> For agentic workers: enter plan-first mode before editing. Execute this phase only, write the required evidence, and do not advance to the next phase until acceptance gates pass or blockers are documented.

**Goal:** Make the AI coach useful because it is evidence-based: it should read bounded learner context, explain why a task is recommended, run small drills, and write back safe learning evidence.

**Architecture:** This phase builds on chat runtime, daily coach plan, mistake collector, writing feedback, pronunciation scoring, evidence events, and memory center. It should define the AI read/write contract before broad UI polish.

**Tech Stack:** React chat UI, Supabase edge functions, local chat fallback, learning context builders, AI gateway, writing feedback service, pronunciation scorer, Vitest, golden eval traces.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v2",
  "harness_role": "execution",
  "phase": {
    "id": "VLE-04",
    "number": "04",
    "title": "AI English Coach And Skill Feedback",
    "status": "ready",
    "type": "eval",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-learning-ecosystem-prd",
    "phase_file": "docs/vocabdaily-learning-ecosystem-prd/phase-04-ai-english-coach-and-skill-feedback.md",
    "depends_on": ["VLE-03"],
    "unlocks": ["VLE-05"]
  },
  "goal": {
    "target": "Create an evidence-bounded AI coach contract across vocabulary, writing, pronunciation, listening, grammar, and daily recovery tasks.",
    "prompt": "Complete VLE-04 AI English Coach And Skill Feedback for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-04-ai-english-coach-and-skill-feedback.md`; define and implement bounded AI evidence contracts, evals, privacy gates, and fallback behavior, stay inside named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-04-ai-english-coach-and-skill-feedback-plan.md",
    "completion_report": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-04-ai-english-coach-and-skill-feedback-report.md"
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
      "docs/vocabdaily-learning-ecosystem-prd/phase-04-ai-english-coach-and-skill-feedback.md",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-03-daily-loop-and-practice-routing-report.md"
    ],
    "primary_context": [
      "src/pages/dashboard/ChatPage.tsx",
      "src/hooks/useSupabaseChat.ts",
      "src/features/chat/runtime/requestPayload.ts",
      "src/features/chat/runtime/assistantReply.ts",
      "src/features/chat/utils/learnerContext.ts",
      "src/features/learning/dailyCoachPlan.ts",
      "src/services/mistakeCollector.ts",
      "src/services/coachReviewQueue.ts",
      "src/services/aiExamCoach.ts",
      "src/services/pronunciationScorer.ts",
      "src/services/evidenceEvents.ts",
      "src/services/memoryCenter.ts",
      "supabase/functions/ai-chat/index.ts",
      "supabase/functions/ai-grade-writing/index.ts",
      "supabase/functions/pronunciation-assess/index.ts"
    ],
    "context_budget": "focused",
    "do_not_load_unless": [
      "Billing or entitlement files may be opened only if AI quota enforcement is directly changed"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "src/pages/dashboard/ChatPage.tsx",
      "src/features/chat/**",
      "src/features/coach/**",
      "src/features/learning/dailyCoachPlan.ts",
      "src/services/aiExamCoach.ts",
      "src/services/pronunciationScorer.ts",
      "src/services/evidenceEvents.ts",
      "src/services/memoryCenter.ts",
      "src/services/coachReviewQueue.ts",
      "supabase/functions/ai-chat/**",
      "supabase/functions/ai-grade-writing/**",
      "supabase/functions/pronunciation-assess/**",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-04-ai-english-coach-and-skill-feedback-report.md",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/"
    ],
    "do_not_edit": [
      "billing webhook behavior",
      "payment entitlement fail-closed rules",
      "production deployment config"
    ],
    "external_inputs": [
      "Supabase edge functions for AI chat, writing grading, and pronunciation assessment",
      "mock AI responses for local tests",
      "golden learner scenarios stored in test fixtures"
    ],
    "secrets_required": [
      "VITE_SUPABASE_URL for integration smoke only",
      "VITE_SUPABASE_ANON_KEY for integration smoke only",
      "AI provider keys in Supabase function environment for remote smoke only"
    ]
  },
  "tool_policy": {
    "allowed_tools": ["rg", "apply_patch", "npm validation commands", "Playwright route checks", "Supabase function smoke when credentials are available"],
    "approval_required": ["deploying Supabase functions", "changing production env vars", "database migration", "deployment"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "production migration", "force push"]
  },
  "risk": {
    "tags": ["frontend", "ui", "ai", "llm", "eval", "security", "auth", "external-service"],
    "data_mutation": "learner evidence, memory, feedback, and chat records",
    "migration_required": "possible",
    "browser_required": true,
    "ai_eval_required": true,
    "external_service_required": true,
    "release_blocking": true
  },
  "validation": {
    "commands": [
      {
        "id": "coach-tests",
        "cwd": ".",
        "command": "npm test -- --run src/features/chat src/features/coach src/services/aiExamCoach.test.ts src/services/pronunciationScorer.test.ts src/services/evidenceEvents.test.ts",
        "expected": "Focused coach, chat, writing, pronunciation, and evidence tests pass.",
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
        "id": "ai-golden-eval",
        "cwd": ".",
        "command": "npm test -- --run src/features/chat/runtime/requestPayload.test.ts src/features/coach/coachingPolicy.test.ts src/features/coach/socraticRecovery.test.ts",
        "expected": "Golden coach policy and request-payload tests pass.",
        "required": true
      }
    ],
    "browser_checks": [
      "On /dashboard/chat desktop 1440x960, start from Today handoff and confirm coach explains evidence used before asking the learner to answer.",
      "On /dashboard/chat mobile 390x844, confirm one recommended next prompt and composer are visible without crowding.",
      "On /dashboard/writing, submit a short answer and confirm score, issues, rewrites, and next review action are visible and readable.",
      "On /dashboard/pronunciation with mocked speech recognition, confirm local fallback scoring and AI-enhanced feedback states are distinct.",
      "On AI service failure, confirm the UI shows a recoverable fallback and does not lose user input."
    ],
    "regression_scope": [
      "Chat history remains recoverable after route switching.",
      "Quiz canvas attempts still persist locally and remotely when available.",
      "Writing fallback feedback remains available when edge function fails.",
      "Pronunciation local scoring remains available when AI assessment fails.",
      "Daily coach handoff retains active wordbook and due-review context."
    ],
    "compliance_gates": [
      "Prompt payloads list only bounded learner evidence needed for the coaching task.",
      "No prompt includes raw secrets, auth tokens, billing data, or direct personal contact data.",
      "Memory writes require an explicit user action or a documented coach action policy.",
      "The coach must not imitate named teachers, writers, examiners, or creators unless the user supplies consent and the product has a verified opt-in model.",
      "AI output must mark uncertainty and provide a retry or fallback path.",
      "Authenticated routes remain protected and demo mode does not create production users."
    ],
    "acceptance_gates": [
      "A coach evidence contract exists and is tested for vocabulary, review pressure, mistakes, writing issues, pronunciation issues, and daily mission state.",
      "Golden scenarios cover beginner vocabulary recovery, IELTS writing revision, listening dictation miss, pronunciation issue, and imported wordbook practice.",
      "Coach responses start with a concrete diagnosis or question, then a small drill, then a review action.",
      "Writing feedback creates issue tags that can feed review or coach recovery.",
      "Pronunciation feedback separates local score, AI score, phoneme issues, and fallback state."
    ],
    "rollback_plan": [
      "Rollback is reverting chat, coach, AI service, and test files.",
      "If edge functions change after approval, redeploy the previous function versions and keep local fallback enabled.",
      "If memory schema changes after approval, include migration rollback and memory cleanup notes."
    ]
  },
  "evidence": {
    "outputs": [
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-04-ai-english-coach-and-skill-feedback-report.md",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach/"
    ],
    "required_artifacts": ["phase report", "focused test output", "golden eval table", "chat screenshot", "writing screenshot", "pronunciation fallback screenshot"],
    "waiver_policy": "Remote AI smoke may be waived only when provider credentials or network reachability are unavailable and local mocked evals pass.",
    "next_phase_handoff": "Unlock VLE-05 only when AI evidence surfaces and fallback states are stable enough to design consistently."
  },
  "stop_conditions": [
    "Stop if prompt payloads require secrets or direct personal contact data.",
    "Stop if AI outputs cannot be bounded by tested evidence contracts.",
    "Stop if remote failure loses learner input or blocks local fallback."
  ]
}
```

## Coding Agent Contract

- PHASE_ID: VLE-04
- GOAL_TARGET: Create an evidence-bounded AI coach contract across vocabulary, writing, pronunciation, listening, grammar, and daily recovery tasks.
- GOAL_PROMPT: Complete VLE-04 AI English Coach And Skill Feedback for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-04-ai-english-coach-and-skill-feedback.md`; define and implement bounded AI evidence contracts, evals, privacy gates, and fallback behavior, stay inside named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: VLE-03
- READ_FIRST: `docs/vocabdaily-learning-ecosystem-prd/README.md`, `docs/vocabdaily-learning-ecosystem-prd/phase-manifest.md`, this file, `docs/vocabdaily-learning-ecosystem-prd/reports/vle-03-daily-loop-and-practice-routing-report.md`
- PRIMARY_CONTEXT: `src/pages/dashboard/ChatPage.tsx`, `src/hooks/useSupabaseChat.ts`, `src/features/chat/runtime/requestPayload.ts`, `src/features/chat/utils/learnerContext.ts`, `src/features/learning/dailyCoachPlan.ts`, `src/services/aiExamCoach.ts`, `src/services/pronunciationScorer.ts`, Supabase AI function files
- LIKELY_EDIT_PATHS: chat runtime, coach features, daily coach plan, AI services, evidence and memory services, Supabase AI functions, tests, phase report, screenshots and eval outputs
- DO_NOT_EDIT: billing webhook behavior, payment entitlement fail-closed rules, production deployment config
- EXECUTION_MODE: plan-first; define evidence contract first; implement evals; verify failure states before polish
- VALIDATION_COMMANDS: `npm test -- --run src/features/chat src/features/coach src/services/aiExamCoach.test.ts src/services/pronunciationScorer.test.ts src/services/evidenceEvents.test.ts`; `npm run lint`; `npm run check:i18n`; `npm run build`; `npm test -- --run src/features/chat/runtime/requestPayload.test.ts src/features/coach/coachingPolicy.test.ts src/features/coach/socraticRecovery.test.ts`
- BROWSER_CHECKS: Chat Today handoff, mobile coach focus, Writing feedback, Pronunciation local and AI states, AI failure fallback
- REGRESSION_SCOPE: chat history, quiz canvas attempts, writing fallback, pronunciation fallback, daily coach context
- COMPLIANCE_GATES: bounded prompt evidence, no secrets or direct personal contact data, explicit memory write policy, no unauthorized persona imitation, uncertainty and retry paths, auth protection
- ROLLBACK_PLAN: revert AI/chat files; redeploy previous edge functions if changed after approval; include memory rollback if schema changes
- ACCEPTANCE_GATES: evidence contract tested; golden scenarios covered; coach runs diagnosis-question-drill-review pattern; writing issues feed review; pronunciation states are distinct
- EVIDENCE_OUTPUT: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-04-ai-english-coach-and-skill-feedback-report.md`
- STOP_CONDITIONS: prompt requires secrets; evidence contract untestable; remote failure loses input or blocks fallback

## Task Spec

Make AI behave like a tutor with a notebook, not a free-form chatbot. The coach must explain the evidence it is using, ask or drill one small step, and write back useful learning evidence only through approved actions.

## Problem Boundary

In scope:

- Coach evidence contract.
- Chat request payload boundaries.
- Writing feedback issue handoff.
- Pronunciation feedback fallback and AI state.
- Golden coaching scenarios.
- Privacy and memory write policy.

Out of scope:

- New AI provider selection.
- Payment entitlement changes.
- Real-time voice conversation.
- Public teacher/persona marketplace.

## Context Policy

Start from learner context and request payload builders. Open Supabase functions only after the frontend evidence contract is clear.

## Requirements

### R1 Evidence Contract

Define the learner evidence fields the coach may read: level, goal, active book, due count, daily mission, recent mistakes, attempt outcomes, writing issue tags, pronunciation issues, and learner preferences.

### R2 Coach Session Shape

Coach output must follow a small learning sequence: diagnosis or clarifying question, one drill, feedback, review action.

### R3 Skill Feedback Handoff

Writing and pronunciation feedback must produce structured issue tags that can feed review, coach prompts, and analytics.

### R4 Failure And Fallback

AI failures must preserve input, show a useful fallback, and allow retry without duplicating evidence.

## Test and Regression Requirements

- Unit tests for evidence payload shaping and privacy exclusions.
- Golden scenario tests for five learner cases.
- Browser checks for Chat, Writing, Pronunciation, and failure fallback.

## Compliance and Safety Requirements

- Do not include secrets or direct personal contact data in prompts.
- Do not impersonate named people.
- Do not create memory without user action or policy-backed coach action.
- Make uncertainty visible in AI feedback.

## Rollback and Recovery

Rollback by reverting frontend and function changes. If functions are deployed after approval, redeploy the previous versions and keep local fallback active.

## Execution Capture

Use `docs/vocabdaily-learning-ecosystem-prd/reports/phase-report-template.md` and save the phase report at `docs/vocabdaily-learning-ecosystem-prd/reports/vle-04-ai-english-coach-and-skill-feedback-report.md`.

## Evaluator Protocol

Evaluate with the five golden scenarios and verify that each response uses named evidence, asks or drills one step, and writes only approved evidence.

## Acceptance Criteria

- AI coach has a bounded evidence contract.
- Skill feedback creates reusable learning evidence.
- Failure states are recoverable and honest.
- VLE-05 can design the AI surfaces without inventing missing states.

## Risks

- Existing chat runtime has many states and can regress easily.
- Remote provider failures can be confused with frontend bugs.
- AI prompt changes can accidentally include too much learner data.
