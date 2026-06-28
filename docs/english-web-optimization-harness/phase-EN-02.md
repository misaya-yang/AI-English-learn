# Phase 02 - Speaking Optimization

> For agentic workers: enter plan-first mode before editing. Execute EN-02 only after EN-01 is passed or waived, update EN-F002 only, and leave durable speaking evidence.

**Goal:** Unify pronunciation and roleplay into a measurable speaking practice loop with clear microphone handling, AI fallback, local scoring, objective progress, and learning-center handoff.

**Architecture:** This phase spans `/dashboard/pronunciation` and the speaking/roleplay parts of `/dashboard/chat`. It must preserve existing chat runtime, quiz runtime, local scoring fallback, and speech-recognition boundaries.

**Tech Stack:** React 19, TypeScript, Web Speech API, Supabase Edge Function invocation through AI gateway, local scoring fallback, Radix UI, Tailwind CSS, Vitest, Playwright regression scripts.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "EN-02",
    "number": "02",
    "title": "Speaking Optimization",
    "status": "passed",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/english-web-optimization-harness",
    "phase_file": "docs/english-web-optimization-harness/phase-EN-02.md",
    "depends_on": ["EN-01"],
    "unlocks": ["EN-03"]
  },
  "goal": {
    "target": "Unify pronunciation and roleplay into a measurable speaking practice loop with clear microphone handling, AI fallback, local scoring, objective progress, and learning-center handoff.",
    "prompt": "Complete EN-02 Speaking Optimization for `.` by following `docs/english-web-optimization-harness/phase-EN-02.md`; work on EN-F002, preserve chat and pronunciation contracts, stay inside the named edit boundaries, and finish only after validation, browser, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/english-web-optimization-harness/reports/en-02-speaking-plan.md",
    "completion_report": "docs/english-web-optimization-harness/reports/en-02-speaking-report.md"
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
      "docs/english-web-optimization-harness/phase-EN-02.md"
    ],
    "primary_context": [
      "src/pages/dashboard/PronunciationPage.tsx",
      "src/hooks/usePronunciationSession.ts",
      "src/services/pronunciationScorer.ts",
      "src/pages/dashboard/ChatPage.tsx"
    ],
    "context_budget": "focused",
    "do_not_load_unless": [
      "docs/english-web-optimization-harness/source-packet.md only for repository evidence lookup or code-fact writeback",
      "docs/english-web-optimization-harness/continuity-ledger.md only for dependency boundary lookup or writeback",
      "docs/english-web-optimization-harness/feature-oracle.json only for EN-F002 status and evidence updates",
      "docs/english-web-optimization-harness/progress-log.md only for session status updates",
      "docs/english-web-optimization-harness/agent-handoff.md only for role handoff updates"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "src/pages/dashboard/PronunciationPage.tsx",
      "src/hooks/usePronunciationSession.ts",
      "src/services/pronunciationScorer.ts",
      "src/hooks/useSpeechRecognition.ts",
      "src/features/pronunciation/**",
      "src/features/chat/components/RoleplayMode.tsx",
      "src/features/chat/components/ScenarioSelector.tsx",
      "src/data/roleplayScenarios.ts",
      "src/services/pronunciationScorer.test.ts",
      "src/data/roleplayScenarios.test.ts",
      "docs/english-web-optimization-harness/reports/en-02-speaking-report.md",
      "docs/english-web-optimization-harness/reports/en-02-speaking-critic.md"
    ],
    "do_not_edit": [
      "supabase/**",
      "api/supabase.js",
      "vercel.json",
      "src/services/billingGateway.ts",
      "src/features/chat/runtime/requestPayload.ts unless a failing test proves a speaking payload bug",
      "package-lock.json",
      ".env*"
    ],
    "external_inputs": [
      "browser microphone permission",
      "Web Speech API availability",
      "optional pronunciation-assess edge function through existing gateway"
    ],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["rg", "apply_patch", "npm validation commands", "Playwright browser checks"],
    "approval_required": ["dependency addition", "AI provider credential use", "Supabase function change", "production deployment"],
    "dangerous_commands": ["git reset --hard", "force push", "rm -rf", "production migration", "secret printing"]
  },
  "risk": {
    "tags": ["ui", "frontend", "ai", "external-service", "auth", "privacy"],
    "data_mutation": true,
    "migration_required": false,
    "browser_required": true,
    "ai_eval_required": true,
    "external_service_required": true,
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
        "id": "focused-speaking-tests",
        "cwd": ".",
        "command": "npm test -- --run src/services/pronunciationScorer.test.ts src/data/roleplayScenarios.test.ts src/features/chat/components/chatVisualContract.test.ts src/features/chat/runtime/quizSequenceState.test.ts src/features/chat/utils/quickPrompts.test.ts",
        "expected": "Focused pronunciation, roleplay, and chat visual/runtime tests pass.",
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
        "id": "browser-speaking",
        "cwd": ".",
        "command": "BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-02-speaking npm run test:ui-regression",
        "expected": "Browser regression captures /dashboard/pronunciation and /dashboard/chat without login redirect, blank page, error boundary, or horizontal overflow.",
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
      "After dev-server-precheck passes, open /dashboard/pronunciation at 1440x960 and 390x844 in English light mode.",
      "Verify unsupported or denied microphone state gives a speaking fallback path instead of a dead end.",
      "Exercise word mode, sentence mode, model audio, record button lifecycle, result cards, phoneme issue state, local-only feedback, and session history.",
      "Open /dashboard/chat and verify whether roleplay is a visible route contract; if absent, record a blocker or bounded connection plan instead of claiming roleplay completion.",
      "Capture console and page-error summary for both routes."
    ],
    "regression_scope": [
      "Chat normal question flow remains usable.",
      "Chat quiz sequence answer-hiding policy remains intact.",
      "Pronunciation local scoring still works when AI assessment fails.",
      "Vocabulary-derived daily words still seed pronunciation practice.",
      "Independent critic evidence confirms minimal-change scope."
    ],
    "compliance_gates": [
      "Microphone permission denial is handled without crash or permission bypass.",
      "Speech transcripts are not logged with secrets or unrelated personal data.",
      "AI feedback fallback is disclosed when phoneme-level assessment is unavailable.",
      "Roleplay prompts do not instruct agents to reveal secrets or bypass policy.",
      "Accessible labels and focus states remain visible for record and navigation controls."
    ],
    "acceptance_gates": [
      "Speaking route communicates current target, mode, record state, score dimensions, and next action.",
      "Unsupported browser or microphone denial has a direct fallback to roleplay or text speaking practice.",
      "Roleplay scenario objectives, progress, key phrases, and completion score are visible, or the phase records a blocker proving the current Chat route does not expose them.",
      "Local-only pronunciation scoring is clearly labeled when AI feedback is unavailable.",
      "Phase report includes validation evidence, browser screenshots, minimal-change scope, source packet writeback, feature oracle update, progress log update, handoff update, and independent critic approval."
    ],
    "rollback_plan": [
      "Revert EN-02 pronunciation, speech hook, roleplay, and focused test changes.",
      "Do not modify or rollback AI provider credentials.",
      "If Supabase Edge Function behavior must change, stop and request approval."
    ]
  },
  "evidence": {
    "outputs": [
      "docs/english-web-optimization-harness/reports/en-02-speaking-report.md",
      "docs/english-web-optimization-harness/reports/en-02-speaking-critic.md",
      "product-audit-2026-06-28/en-02-speaking/"
    ],
    "required_artifacts": [
      "phase report with Status line",
      "progress log entry",
      "feature oracle EN-F002 evidence update",
      "continuity ledger code-summary writeback",
      "source packet code facts update",
      "handoff update",
      "focused test output",
      "browser screenshots",
      "microphone fallback evidence",
      "independent critic artifact",
      "minimal-change scope notes"
    ],
    "waiver_policy": "A waived microphone or AI feedback gate must name browser, permission state, local fallback evidence, residual risk, and whether EN-03 may proceed.",
    "next_phase_handoff": "Unlock EN-03 only after speaking practice has reliable fallback and roleplay progress evidence."
  },
  "stop_conditions": [
    "Stop if EN-01 dependency lacks passing or waived evidence.",
    "Stop if microphone or AI credentials are required and no local fallback evidence can be collected.",
    "Stop if chat runtime payload changes are required outside the approved speaking boundary.",
    "Stop if secret values or production provider changes are required."
  ]
}
```

## Coding Agent Contract

- PHASE_ID: EN-02
- GOAL_TARGET: Unify pronunciation and roleplay into a measurable speaking practice loop with clear microphone handling, AI fallback, local scoring, objective progress, and learning-center handoff.
- GOAL_PROMPT: Complete EN-02 Speaking Optimization for `.` by following `docs/english-web-optimization-harness/phase-EN-02.md`; work on EN-F002, preserve chat and pronunciation contracts, stay inside the named edit boundaries, and finish only after validation, browser, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: EN-01
- READ_FIRST: `docs/english-web-optimization-harness/context-profile.json`, `docs/english-web-optimization-harness/loop-state.json`, this file
- PRIMARY_CONTEXT: `src/pages/dashboard/PronunciationPage.tsx`, `src/hooks/usePronunciationSession.ts`, `src/services/pronunciationScorer.ts`, `src/pages/dashboard/ChatPage.tsx`
- LIKELY_EDIT_PATHS: pronunciation page, pronunciation hook/service/components, speech recognition hook, roleplay components/data, focused speaking tests, EN-02 report and critic files
- DO_NOT_EDIT: `supabase/**`, `api/supabase.js`, `vercel.json`, `src/services/billingGateway.ts`, broad chat request payloads without failing-test proof, `package-lock.json`, `.env*`
- EXECUTION_MODE: plan-first; implement one speaking slice; verify before completion; write evidence before handoff
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm test -- --run src/services/pronunciationScorer.test.ts src/data/roleplayScenarios.test.ts src/features/chat/components/chatVisualContract.test.ts src/features/chat/runtime/quizSequenceState.test.ts src/features/chat/utils/quickPrompts.test.ts`; `npm run build`; `curl -sSf http://127.0.0.1:5173/ >/dev/null`; `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-02-speaking npm run test:ui-regression`; `git diff --check`
- BROWSER_CHECKS: `/dashboard/pronunciation` and `/dashboard/chat` desktop 1440x960, mobile 390x844, English, Web Speech supported/unsupported or denied, pronunciation result, and roleplay visibility or blocker evidence
- REGRESSION_SCOPE: normal chat, quiz answer-hiding, local pronunciation scoring, vocabulary-derived daily words, minimal-change critic review
- COMPLIANCE_GATES: microphone denial, transcript privacy, AI fallback disclosure, safe roleplay prompts, accessible controls
- ROLLBACK_PLAN: revert EN-02 pronunciation, speech, roleplay, and test changes; stop before provider or function changes
- ACCEPTANCE_GATES: speaking target clear; fallback path direct; roleplay objectives visible; local-only scoring labeled; actor report, oracle update, source packet, continuity ledger, progress log, handoff, and critic approval complete
- EVIDENCE_OUTPUT: `docs/english-web-optimization-harness/reports/en-02-speaking-report.md`
- STOP_CONDITIONS: EN-01 not passed or waived; microphone/AI fallback unavailable; chat runtime broad edit required; secret or provider change required

## Task Spec

### UI Walk-Through Issues

1. Speaking experience is split between `/dashboard/pronunciation` and Chat roleplay without a unified module entry.
2. Unsupported SpeechRecognition state explains browser support but does not route to roleplay or text practice.
3. Record, stop, scoring, result, and history states need mobile evidence for control fit.
4. Phoneme issues can be empty when local scoring is used; the route needs a clearer "local-only" information hierarchy.
5. Roleplay active state looks like a compact sidebar card and needs viewport evidence for mobile speaking practice.
6. Voice input in Chat and record input in Pronunciation use separate fallback behavior.
7. Speaking uses Web Speech API recognition, not `getUserMedia` or `MediaRecorder`; browser evidence must match that boundary.

### Functional Issues

1. `listenOnce` does not resolve or reject on `onend` without a result; timeout behavior needs proof or repair.
2. Local scoring depends on transcript overlap and confidence, which can mis-score short utterances.
3. Pronunciation records remain in component session history, not a durable speaking-progress summary.
4. AI pronunciation assessment failure falls back silently except for the result's local-only marker.
5. Roleplay objectives need evidence that Chat integration can mark progress, not only display scenario data.
6. Microphone permission denial path is not represented in unit tests.
7. Existing roleplay components and scenario data are not proof that `/dashboard/chat` exposes a complete roleplay flow.

### Priority Optimization List

- P0: Add or verify microphone unsupported and denied fallback that leads to roleplay or text speaking practice.
- P0: Ensure record lifecycle cannot hang after no-speech `onend`.
- P1: Clarify local-only scoring and AI feedback availability in the result recap.
- P1: Connect roleplay objectives to visible speaking completion evidence.
- P2: Unify Speaking navigation labels between Pronunciation and Chat roleplay.
- P2: Improve mobile density for score radials, result history, and scenario objectives.

### Risks and Regression Points

- Web Speech API behavior differs across browsers.
- Fixing no-speech timeout can conflict with cancellation state.
- Chat roleplay changes can affect normal chat and quiz flows.
- AI gateway changes are out of scope unless approved.
- Persisting speaking evidence can touch broader learner model contracts.

### Sub-Agent Conclusions

- UI agent: The route needs fallback and progress clarity more than visual decoration; mobile record and scenario states are the highest-risk screens.
- Functional agent: The no-result speech lifecycle and AI fallback disclosure are the main correctness risks.
- Quality agent: Focused tests can cover scoring and roleplay data; browser evidence must cover microphone capability, route render, and chat regression.

### Quantitative Acceptance Metrics

- 0 hanging speech sessions after no-speech or cancelled recognition. Assumption: test can simulate recognizer end/error. Verification: focused unit test or mocked browser check.
- 2 speaking entry routes verified: `/dashboard/pronunciation` and `/dashboard/chat`.
- 3 score dimensions remain visible after a completed pronunciation attempt: accuracy, fluency, intonation.
- 1 explicit fallback path is visible when SpeechRecognition is unsupported or denied.
- 1 actor report and 1 separate critic artifact exist before EN-F002 can move to passing.

## Problem Boundary

In scope: pronunciation route, speech recognition hook, pronunciation scoring service, roleplay scenario UI/data, focused tests, browser evidence, EN-02 report and critic artifact.

Out of scope: new AI provider, Supabase Edge Function edits, billing, deployment, broad chat prompt redesign, new speech library.

## Context Policy

Open only the four primary context paths before planning. Open roleplay components, scenario data, or chat request payload files only if the initial Chat route inspection proves roleplay integration requires them.

## Requirements

### R1 Fallback-First Speaking

Unsupported browser, denied microphone, AI assessment failure, and local-only scoring must leave the learner with an understandable next action.

### R2 Stable Record Lifecycle

Recording must enter listening, scoring, done, error, or idle states without indefinite pending behavior.

### R3 Roleplay Progress Visibility

Scenario objectives, key phrases, progress, completion score, and exit path must be visible and usable.

### R4 Regression-Safe Chat Boundary

Roleplay work must not break normal chat, quiz canvas, answer-hiding, or history behavior.

### R5 Evidence Writeback

Actor report, critic artifact, oracle, progress log, source packet, continuity ledger, and handoff must be updated.

## Test and Regression Requirements

Run the validation commands in the Machine Contract. Capture pronunciation and chat screenshots at desktop and mobile. Record microphone support state and local-only AI fallback state.

## Compliance and Safety Requirements

Do not print transcripts containing private content in logs. Do not request AI provider secrets. Do not bypass microphone permissions. Do not alter production provider settings.

## Rollback and Recovery

Rollback is a normal git revert of EN-02 touched files plus documentation updates. If provider work becomes necessary, stop and document the blocker before editing protected paths.

## Execution Capture

Write `reports/en-02-speaking-report.md` with command outputs, screenshots, microphone state, changed files, minimal-change rationale, oracle update, and blocker notes.

## Critic Protocol

Write `reports/en-02-speaking-critic.md`. It must include `Critic Verdict: approved` or a documented waiver, the EN-F002 feature id, and `Actor Report Reviewed: docs/english-web-optimization-harness/reports/en-02-speaking-report.md`.

## Acceptance Criteria

- EN-F002 has actor and critic evidence.
- Validation commands pass or blockers are documented.
- Browser checks cover pronunciation, chat roleplay, mobile, and fallback state.
- Source packet and continuity ledger contain EN-02 code facts.

## Risks

- Web Speech API support cannot be assumed in every browser.
- Local scoring is weaker than AI phoneme analysis.
- Roleplay completion may require broader Chat integration if current state is display-only.
