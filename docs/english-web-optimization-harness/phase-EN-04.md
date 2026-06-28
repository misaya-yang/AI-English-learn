# Phase 04 - Reading Optimization

> For agentic workers: enter plan-first mode before editing. Execute EN-04 only after EN-03 is passed or waived, update EN-F004 only, and leave durable reading evidence.

**Goal:** Make Reading reliable across passage selection, answer gating, evidence-line review, honest generated-passage fallback, scoring, and learning-event evidence.

**Architecture:** This phase works inside `/dashboard/reading`, preserving seed passages, route contract, learning-event recording, and local fallback behavior. It must not introduce external generation or provider credentials without approval.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Framer Motion, i18n, local seed reading content, learning events, gamification service, Vitest, Playwright regression scripts.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "EN-04",
    "number": "04",
    "title": "Reading Optimization",
    "status": "passed",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/english-web-optimization-harness",
    "phase_file": "docs/english-web-optimization-harness/phase-EN-04.md",
    "depends_on": ["EN-03"],
    "unlocks": ["EN-05"]
  },
  "goal": {
    "target": "Make Reading reliable across passage selection, answer gating, evidence-line review, honest generated-passage fallback, scoring, and learning-event evidence.",
    "prompt": "Complete EN-04 Reading Optimization for `.` by following `docs/english-web-optimization-harness/phase-EN-04.md`; work on EN-F004, preserve reading route and learning-event contracts, stay inside the named edit boundaries, and finish only after validation, browser, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/english-web-optimization-harness/reports/en-04-reading-plan.md",
    "completion_report": "docs/english-web-optimization-harness/reports/en-04-reading-report.md"
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
      "docs/english-web-optimization-harness/phase-EN-04.md"
    ],
    "primary_context": [
      "src/pages/dashboard/ReadingPage.tsx",
      "src/services/learningEvents.ts",
      "src/services/gamification.ts",
      "src/features/learning/components/LearningWorkspace.tsx"
    ],
    "context_budget": "focused",
    "do_not_load_unless": [
      "docs/english-web-optimization-harness/source-packet.md only for repository evidence lookup or code-fact writeback",
      "docs/english-web-optimization-harness/continuity-ledger.md only for dependency boundary lookup or writeback",
      "docs/english-web-optimization-harness/feature-oracle.json only for EN-F004 status and evidence updates",
      "docs/english-web-optimization-harness/progress-log.md only for session status updates",
      "docs/english-web-optimization-harness/agent-handoff.md only for role handoff updates"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "src/pages/dashboard/ReadingPage.tsx",
      "src/pages/dashboard/ReadingPage.test.tsx",
      "src/data/readingContent.ts",
      "src/data/readingContent.test.ts",
      "src/services/learningEvents.ts",
      "src/services/learningEvents.strict.test.ts",
      "src/services/gamification.ts",
      "src/services/gamification.test.ts",
      "docs/english-web-optimization-harness/reports/en-04-reading-report.md",
      "docs/english-web-optimization-harness/reports/en-04-reading-critic.md"
    ],
    "do_not_edit": [
      "supabase/**",
      "api/supabase.js",
      "vercel.json",
      "src/services/billingGateway.ts",
      "src/pages/dashboard/ListeningPage.tsx",
      "src/pages/dashboard/PracticePage.tsx unless a failing regression proves reading handoff needs it",
      "package-lock.json",
      ".env*"
    ],
    "external_inputs": [
      "local seed reading passages",
      "optional existing AI generation endpoint only after approval"
    ],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["rg", "apply_patch", "npm validation commands", "Playwright browser checks"],
    "approval_required": ["AI provider credential use", "Supabase function change", "external content provider", "production deployment", "dependency addition"],
    "dangerous_commands": ["git reset --hard", "force push", "rm -rf", "production migration", "secret printing"]
  },
  "risk": {
    "tags": ["ui", "frontend", "ai", "eval", "privacy"],
    "data_mutation": true,
    "migration_required": false,
    "browser_required": true,
    "ai_eval_required": true,
    "external_service_required": false,
    "release_blocking": false
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
        "id": "focused-reading-tests",
        "cwd": ".",
        "command": "npm test -- --run src/pages/dashboard/ReadingPage.test.tsx src/data/readingContent.test.ts src/services/learningEvents.strict.test.ts src/services/gamification.test.ts",
        "expected": "Focused reading page, content, learning-event, and gamification tests pass.",
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
        "id": "browser-reading",
        "cwd": ".",
        "command": "BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-04-reading npm run test:ui-regression",
        "expected": "Browser regression captures /dashboard/reading without login redirect, blank page, error boundary, or horizontal overflow.",
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
      "After dev-server-precheck passes, open /dashboard/reading at 1440x960 and 390x844 in English light mode.",
      "Verify passage selection, available-passage list, question mix, estimated minutes, and start actions.",
      "Complete TFNG, MCQ, and short-answer flows and verify unanswered gate.",
      "Verify review screen with score, explanations, correct answer, evidence lines, retry, and choose-another-passage actions.",
      "Verify generated-passage CTA is honest about fallback or actual provider behavior."
    ],
    "regression_scope": [
      "Listening route remains unchanged after EN-04.",
      "Learning events remain parseable by Analytics.",
      "Gamification counts are not inflated by reading question count unless documented and accepted.",
      "Mobile reading layout has no horizontal overflow.",
      "Independent critic evidence confirms minimal-change scope."
    ],
    "compliance_gates": [
      "Generated-passage copy does not claim real AI generation when seed fallback is used.",
      "No external content is fetched without approval.",
      "Learning-event payload contains no secrets.",
      "Long passage and answer controls keep keyboard focus visible.",
      "Evidence-line review remains clear for screen readers and keyboard users."
    ],
    "acceptance_gates": [
      "Reading route shows passage, level, topic, estimated minutes, question mix, answer progress, score, and evidence review.",
      "Generated-passage behavior is truthful and testable.",
      "Short-answer scoring is tested or documented with residual risk.",
      "Review screen helps learners locate evidence lines and retry.",
      "Phase report includes validation evidence, browser screenshots, minimal-change scope, source packet writeback, feature oracle update, progress log update, handoff update, and independent critic approval."
    ],
    "rollback_plan": [
      "Revert EN-04 reading page, content, learning-event, gamification, and focused test changes.",
      "Do not remove learner progress data.",
      "If real AI generation or schema changes are required, stop and request approval."
    ]
  },
  "evidence": {
    "outputs": [
      "docs/english-web-optimization-harness/reports/en-04-reading-report.md",
      "docs/english-web-optimization-harness/reports/en-04-reading-critic.md",
      "product-audit-2026-06-28/en-04-reading/"
    ],
    "required_artifacts": [
      "phase report with Status line",
      "progress log entry",
      "feature oracle EN-F004 evidence update",
      "continuity ledger code-summary writeback",
      "source packet code facts update",
      "handoff update",
      "focused test output",
      "browser screenshots",
      "generated-passage fallback evidence",
      "independent critic artifact",
      "minimal-change scope notes"
    ],
    "waiver_policy": "A waived generated-passage or scoring gate must name route, behavior observed, alternate evidence, residual risk, and whether EN-05 may proceed.",
    "next_phase_handoff": "Unlock EN-05 only after reading scoring, evidence-line review, and generated-passage honesty are stable."
  },
  "stop_conditions": [
    "Stop if EN-03 dependency lacks passing or waived evidence.",
    "Stop if real AI generation requires provider credentials or Supabase function changes.",
    "Stop if learning-event or gamification semantics need broad cross-module changes.",
    "Stop if secret values or production provider changes are required."
  ]
}
```

## Coding Agent Contract

- PHASE_ID: EN-04
- GOAL_TARGET: Make Reading reliable across passage selection, answer gating, evidence-line review, honest generated-passage fallback, scoring, and learning-event evidence.
- GOAL_PROMPT: Complete EN-04 Reading Optimization for `.` by following `docs/english-web-optimization-harness/phase-EN-04.md`; work on EN-F004, preserve reading route and learning-event contracts, stay inside the named edit boundaries, and finish only after validation, browser, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: EN-03
- READ_FIRST: `docs/english-web-optimization-harness/context-profile.json`, `docs/english-web-optimization-harness/loop-state.json`, this file
- PRIMARY_CONTEXT: `src/pages/dashboard/ReadingPage.tsx`, `src/services/learningEvents.ts`, `src/services/gamification.ts`, `src/features/learning/components/LearningWorkspace.tsx`
- LIKELY_EDIT_PATHS: reading page and page test, optional reading data candidate/tests if the page is explicitly wired to them, learning-event strict tests, gamification tests, EN-04 report and critic files
- DO_NOT_EDIT: `supabase/**`, `api/supabase.js`, `vercel.json`, `src/services/billingGateway.ts`, Listening route, broad Practice route edits without failing-test proof, `package-lock.json`, `.env*`
- EXECUTION_MODE: plan-first; implement one reading slice; verify before completion; write evidence before handoff
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm test -- --run src/pages/dashboard/ReadingPage.test.tsx src/data/readingContent.test.ts src/services/learningEvents.strict.test.ts src/services/gamification.test.ts`; `npm run build`; `curl -sSf http://127.0.0.1:5173/ >/dev/null`; `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-04-reading npm run test:ui-regression`; `git diff --check`
- BROWSER_CHECKS: `/dashboard/reading` desktop 1440x960, mobile 390x844, English, select, reading, submit, review, evidence-line, generated-passage fallback
- REGRESSION_SCOPE: Listening route, analytics event parsing, gamification counts, mobile layout, minimal-change critic review
- COMPLIANCE_GATES: honest generation copy, no unapproved external content, no secret payloads, visible focus, accessible evidence review
- ROLLBACK_PLAN: revert EN-04 reading/content/event/test changes; stop before AI provider or schema changes
- ACCEPTANCE_GATES: passage and progress clear; generated fallback truthful; scoring documented; evidence review helpful; actor report, oracle update, source packet, continuity ledger, progress log, handoff, and critic approval complete
- EVIDENCE_OUTPUT: `docs/english-web-optimization-harness/reports/en-04-reading-report.md`
- STOP_CONDITIONS: EN-03 not passed or waived; real AI provider required; broad learning-event change required; secret or provider change required

## Task Spec

### UI Walk-Through Issues

1. Reading select screen uses a different outer route class than Listening and Pronunciation.
2. Desktop reading mode uses two scrollable columns that need mobile stack evidence.
3. Generated-passage CTA simulates latency and reuses seed passage with "(New)" title.
4. Long passage and questions lack visible section progress during the reading state.
5. Evidence lines only appear for questions that include `location`.
6. Review screen is useful but may under-support remediation links back to Practice or Vocabulary.
7. Route content is inline in `ReadingPage.tsx`; changing `src/data/readingContent.ts` alone will not change the rendered page unless the data path is connected.

### Functional Issues

1. File header claims AI generation via Supabase Edge Function, but implementation uses seed fallback with simulated delay.
2. Short-answer scoring accepts partial inclusion, which can produce false positives for very short input.
3. Very short sessions can record zero elapsed minutes.
4. `incrementReviewCount(user.id, total)` may mix reading question count with word review achievements.
5. Wrong-answer remediation does not write targeted evidence items.
6. Generated passage IDs use timestamps and need deterministic test handling.
7. Completion evidence must not describe the simulated fallback as live AI generation.

### Priority Optimization List

- P0: Make generated-passage CTA truthful: seed fallback, local generation, or approved provider path must be explicit.
- P0: Verify or repair short-answer scoring so short false positives are not accepted.
- P1: Add visible reading progress or section position for long passages.
- P1: Ensure evidence-line review exists or fallback explanation is clear for every question.
- P2: Align route shell spacing with other skill modules if it can stay inside EN-04.
- P2: Add remediation actions from missed reading questions to Practice or Vocabulary only if route contracts stay stable.

### Risks and Regression Points

- Real generation would require provider and function approval.
- Scoring changes can alter existing expected behavior.
- Event/gamification changes can affect Analytics and badges.
- Mobile two-column layout can overflow if not tested.
- Over-tightening answer checks can reject acceptable learner answers.

### Sub-Agent Conclusions

- UI agent: Evidence-line review is the differentiator; route consistency and mobile scroll are the main layout checks.
- Functional agent: Honest generated-passage behavior and short-answer scoring are the priority correctness gates.
- Quality agent: Focused content/event tests plus browser flow evidence are enough for EN-04 if provider work remains out of scope.

### Quantitative Acceptance Metrics

- 0 claims of live AI generation when the route uses seed fallback. Verification: browser copy and code inspection.
- 0 submissions allowed with unanswered questions. Verification: browser check and code path.
- 3 question types verified when present: TFNG, MCQ, short answer.
- 0 horizontal overflow pixels at `390x844` on `/dashboard/reading`. Verification: `test:ui-regression` summary.
- 1 actor report and 1 separate critic artifact exist before EN-F004 can move to passing.

## Problem Boundary

In scope: `/dashboard/reading`, reading content/tests, reading scoring, generated-passage fallback copy, learning-event and gamification semantics only if directly tied to reading evidence, browser screenshots, EN-04 report and critic artifact.

Out of scope: real external generation without approval, Supabase function edits, listening route edits, production deployment.

## Context Policy

Open only the four primary context paths before planning. Open AI gateway or Supabase files only if a blocker proves approved generation work is required.

## Requirements

### R1 Honest Generation State

The route must not imply live AI passage generation when it is using seeded fallback content.

### R2 Answer and Scoring Integrity

Answer gating, TFNG, MCQ, short-answer scoring, and review feedback must be deterministic and evidence-backed.

### R3 Evidence-Line Learning

Review must help learners connect wrong and correct answers to passage evidence or an explicit explanation.

### R4 Learning Evidence Integrity

Study session, learning event, and gamification updates must reflect reading behavior honestly.

### R5 Evidence Writeback

Actor report, critic artifact, oracle, progress log, source packet, continuity ledger, and handoff must be updated.

## Test and Regression Requirements

Run the validation commands in the Machine Contract. Capture select, reading, submit, review, evidence-line, and generated-passage states at desktop and mobile.

## Compliance and Safety Requirements

Do not fetch external content without approval. Do not request provider secrets. Keep focus visible and long text readable. Do not claim production AI behavior from local seed fallback.

## Rollback and Recovery

Rollback is a normal git revert of EN-04 touched files plus documentation updates. If real provider work becomes necessary, stop and document the blocker.

## Execution Capture

Write `reports/en-04-reading-report.md` with command outputs, screenshots, scoring evidence, generated fallback evidence, changed files, minimal-change rationale, oracle update, and blocker notes.

## Critic Protocol

Write `reports/en-04-reading-critic.md`. It must include `Critic Verdict: approved` or a documented waiver, the EN-F004 feature id, and `Actor Report Reviewed: docs/english-web-optimization-harness/reports/en-04-reading-report.md`.

## Acceptance Criteria

- EN-F004 has actor and critic evidence.
- Validation commands pass or blockers are documented.
- Browser checks cover reading flow, mobile, evidence-line state, and generated fallback.
- Source packet and continuity ledger contain EN-04 code facts.

## Risks

- Current generated-passage behavior is local fallback, not provider-backed generation.
- Scoring semantics are subjective for short answers.
- Event semantics can ripple into EN-05.
