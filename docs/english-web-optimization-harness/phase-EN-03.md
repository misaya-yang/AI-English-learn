# Phase 03 - Listening Optimization

> For agentic workers: enter plan-first mode before editing. Execute EN-03 only after EN-02 is passed or waived, update EN-F003 only, and leave durable listening evidence.

**Goal:** Make Listening reliable across TTS/audio state, transcript discipline, answer progress, scoring, review feedback, and learning-event evidence.

**Architecture:** This phase works inside `/dashboard/listening`, preserving existing seed passages, browser SpeechSynthesis fallback, learning-event recording, and gamification boundaries unless a focused failing test proves a narrow correction is required.

**Tech Stack:** React 19, TypeScript, browser SpeechSynthesis, Tailwind CSS, Framer Motion, i18n, learning events, gamification service, Vitest, Playwright regression scripts.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "EN-03",
    "number": "03",
    "title": "Listening Optimization",
    "status": "passed",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/english-web-optimization-harness",
    "phase_file": "docs/english-web-optimization-harness/phase-EN-03.md",
    "depends_on": ["EN-02"],
    "unlocks": ["EN-04"]
  },
  "goal": {
    "target": "Make Listening reliable across TTS/audio state, transcript discipline, answer progress, scoring, review feedback, and learning-event evidence.",
    "prompt": "Complete EN-03 Listening Optimization for `.` by following `docs/english-web-optimization-harness/phase-EN-03.md`; work on EN-F003, preserve audio fallback and learning-event contracts, stay inside the named edit boundaries, and finish only after validation, browser, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/english-web-optimization-harness/reports/en-03-listening-plan.md",
    "completion_report": "docs/english-web-optimization-harness/reports/en-03-listening-report.md"
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
      "docs/english-web-optimization-harness/phase-EN-03.md"
    ],
    "primary_context": [
      "src/pages/dashboard/ListeningPage.tsx",
      "src/services/tts.ts",
      "src/services/learningEvents.ts",
      "src/services/gamification.ts"
    ],
    "context_budget": "focused",
    "do_not_load_unless": [
      "docs/english-web-optimization-harness/source-packet.md only for repository evidence lookup or code-fact writeback",
      "docs/english-web-optimization-harness/continuity-ledger.md only for dependency boundary lookup or writeback",
      "docs/english-web-optimization-harness/feature-oracle.json only for EN-F003 status and evidence updates",
      "docs/english-web-optimization-harness/progress-log.md only for session status updates",
      "docs/english-web-optimization-harness/agent-handoff.md only for role handoff updates"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "src/pages/dashboard/ListeningPage.tsx",
      "src/pages/dashboard/ListeningPage.test.tsx",
      "src/data/listeningContent.ts",
      "src/data/listeningContent.test.ts",
      "src/services/learningEvents.ts",
      "src/services/learningEvents.strict.test.ts",
      "src/services/gamification.ts",
      "src/services/gamification.test.ts",
      "docs/english-web-optimization-harness/reports/en-03-listening-report.md",
      "docs/english-web-optimization-harness/reports/en-03-listening-critic.md"
    ],
    "do_not_edit": [
      "supabase/**",
      "api/supabase.js",
      "vercel.json",
      "src/services/billingGateway.ts",
      "src/pages/dashboard/ReadingPage.tsx",
      "src/pages/dashboard/PracticePage.tsx unless a failing regression proves listening handoff needs it",
      "package-lock.json",
      ".env*"
    ],
    "external_inputs": [
      "browser SpeechSynthesis support",
      "local seeded learner data from regression scripts"
    ],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["rg", "apply_patch", "npm validation commands", "Playwright browser checks"],
    "approval_required": ["external audio storage", "Supabase schema change", "production deployment", "dependency addition"],
    "dangerous_commands": ["git reset --hard", "force push", "rm -rf", "production migration", "secret printing"]
  },
  "risk": {
    "tags": ["ui", "frontend", "browser", "privacy"],
    "data_mutation": true,
    "migration_required": false,
    "browser_required": true,
    "ai_eval_required": false,
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
        "id": "focused-listening-tests",
        "cwd": ".",
        "command": "npm test -- --run src/pages/dashboard/ListeningPage.test.tsx src/data/listeningContent.test.ts src/services/learningEvents.strict.test.ts src/services/gamification.test.ts",
        "expected": "Focused listening page, content, learning-event, and gamification tests pass.",
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
        "id": "browser-listening",
        "cwd": ".",
        "command": "BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-03-listening npm run test:ui-regression",
        "expected": "Browser regression captures /dashboard/listening without login redirect, blank page, error boundary, or horizontal overflow.",
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
      "After dev-server-precheck passes, open /dashboard/listening at 1440x960 and 390x844 in English light mode.",
      "Verify clip selection, play, pause, reset, skip-to-questions, and TTS unsupported copy.",
      "Verify transcript reveal behavior before questions and after submission.",
      "Answer all question types, verify submit gate, score recap, correct-answer reveal, explanations, and transcript review.",
      "Capture console and page-error summary plus screenshot paths."
    ],
    "regression_scope": [
      "Pronunciation and speaking routes remain usable after EN-03.",
      "Reading route is not changed by listening work.",
      "Learning events remain parseable by Analytics.",
      "Gamification counts are not inflated by listening question count unless documented and accepted.",
      "Independent critic evidence confirms minimal-change scope."
    ],
    "compliance_gates": [
      "Transcript reveal is deliberate and labeled.",
      "Audio/TTS unsupported state does not block learner progress.",
      "Learning-event payload contains no secrets.",
      "Settings TTS controls are honored by Listening or the phase report records the current inline-hook boundary.",
      "Icon-only audio controls have accessible names or surrounding labels.",
      "Browser autoplay and permission behavior is respected."
    ],
    "acceptance_gates": [
      "Listening route shows clip, level, duration, topic, answer progress, score, and review focus.",
      "Transcript access policy is clear before and after answering.",
      "All-answer gate prevents accidental incomplete submission.",
      "Scoring and explanation behavior is tested or documented with blocker evidence.",
      "Phase report includes validation evidence, browser screenshots, minimal-change scope, source packet writeback, feature oracle update, progress log update, handoff update, and independent critic approval."
    ],
    "rollback_plan": [
      "Revert EN-03 listening page, content, learning-event, gamification, and focused test changes.",
      "Do not remove learner progress data.",
      "If external audio assets or schema changes are required, stop and request approval."
    ]
  },
  "evidence": {
    "outputs": [
      "docs/english-web-optimization-harness/reports/en-03-listening-report.md",
      "docs/english-web-optimization-harness/reports/en-03-listening-critic.md",
      "product-audit-2026-06-28/en-03-listening/"
    ],
    "required_artifacts": [
      "phase report with Status line",
      "progress log entry",
      "feature oracle EN-F003 evidence update",
      "continuity ledger code-summary writeback",
      "source packet code facts update",
      "handoff update",
      "focused test output",
      "browser screenshots",
      "TTS fallback evidence",
      "independent critic artifact",
      "minimal-change scope notes"
    ],
    "waiver_policy": "A waived TTS or browser-audio gate must name browser, route, fallback path, alternate evidence, residual risk, and whether EN-04 may proceed.",
    "next_phase_handoff": "Unlock EN-04 only after listening scoring, transcript policy, and event evidence are stable."
  },
  "stop_conditions": [
    "Stop if EN-02 dependency lacks passing or waived evidence.",
    "Stop if reliable listening requires external audio storage or provider credentials.",
    "Stop if learning-event or gamification semantics need broad cross-module changes.",
    "Stop if secret values or production provider changes are required."
  ]
}
```

## Coding Agent Contract

- PHASE_ID: EN-03
- GOAL_TARGET: Make Listening reliable across TTS/audio state, transcript discipline, answer progress, scoring, review feedback, and learning-event evidence.
- GOAL_PROMPT: Complete EN-03 Listening Optimization for `.` by following `docs/english-web-optimization-harness/phase-EN-03.md`; work on EN-F003, preserve audio fallback and learning-event contracts, stay inside the named edit boundaries, and finish only after validation, browser, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: EN-02
- READ_FIRST: `docs/english-web-optimization-harness/context-profile.json`, `docs/english-web-optimization-harness/loop-state.json`, this file
- PRIMARY_CONTEXT: `src/pages/dashboard/ListeningPage.tsx`, `src/services/tts.ts`, `src/services/learningEvents.ts`, `src/services/gamification.ts`
- LIKELY_EDIT_PATHS: listening page and page test, optional listening data candidate/tests if the page is explicitly wired to them, learning-event strict tests, gamification tests, EN-03 report and critic files
- DO_NOT_EDIT: `supabase/**`, `api/supabase.js`, `vercel.json`, `src/services/billingGateway.ts`, Reading route, broad Practice route edits without failing-test proof, `package-lock.json`, `.env*`
- EXECUTION_MODE: plan-first; implement one listening slice; verify before completion; write evidence before handoff
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm test -- --run src/pages/dashboard/ListeningPage.test.tsx src/data/listeningContent.test.ts src/services/learningEvents.strict.test.ts src/services/gamification.test.ts`; `npm run build`; `curl -sSf http://127.0.0.1:5173/ >/dev/null`; `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-03-listening npm run test:ui-regression`; `git diff --check`
- BROWSER_CHECKS: `/dashboard/listening` desktop 1440x960, mobile 390x844, English, TTS supported or unsupported, transcript reveal, all-answer gate, score review
- REGRESSION_SCOPE: speaking routes, reading route, analytics event parsing, gamification counts, minimal-change critic review
- COMPLIANCE_GATES: transcript labeling, TTS fallback, no secret payloads, accessible audio controls, autoplay respect
- ROLLBACK_PLAN: revert EN-03 listening/content/event/test changes; stop before external audio or schema changes
- ACCEPTANCE_GATES: clip and progress clear; transcript policy clear; all-answer gate works; scoring documented; actor report, oracle update, source packet, continuity ledger, progress log, handoff, and critic approval complete
- EVIDENCE_OUTPUT: `docs/english-web-optimization-harness/reports/en-03-listening-report.md`
- STOP_CONDITIONS: EN-02 not passed or waived; external audio/provider required; broad learning-event change required; secret or provider change required

## Task Spec

### UI Walk-Through Issues

1. Listening prototype uses browser SpeechSynthesis; audio identity and duration are not real recordings.
2. Transcript can be revealed before answering, which can weaken listening-task discipline.
3. Stop and skip icon controls need explicit labels or visible purpose verification.
4. Question review and transcript review are split between main content and aside.
5. Available clips have no filters by level, topic, or question type.
6. Mobile long transcripts and question cards need overflow evidence.
7. Route content is inline in `ListeningPage.tsx`; changing `src/data/listeningContent.ts` alone will not change the rendered page unless the data path is connected.

### Functional Issues

1. TTS progress is estimated from transcript length rather than actual utterance progress.
2. Fill-blank and short-answer scoring uses exact lower-case comparison.
3. Listening completion records zero study minutes through `addStudySession(0, 0, xp, 0)`.
4. `incrementReviewCount(user.id, total)` may mix listening question count with word review achievements.
5. TTS unsupported state allows transcript reading but acceptance must prove answer flow remains coherent.
6. Learning event records completion but not transcript reveal or retry behavior.
7. Settings TTS enable/voice controls are not proven to drive Listening's inline TTS hook.

### Priority Optimization List

- P0: Make transcript reveal policy explicit and prevent accidental pre-answer transcript dependence if product intent requires listening-first behavior.
- P0: Verify or repair short-answer scoring to avoid false negatives for acceptable answer variants.
- P1: Record realistic time or disclose zero-time limitation in learning evidence.
- P1: Audit gamification count semantics for listening completion.
- P2: Add level/topic/question metadata filtering if it can stay within EN-03 boundaries.
- P2: Improve review focus layout so transcript, wrong answers, and explanation are easier to compare.

### Risks and Regression Points

- SpeechSynthesis support varies by browser and voice loading.
- Progress timer can drift from actual spoken audio.
- Event changes can affect Analytics.
- Gamification changes can affect profile badges and learning center summaries.
- Transcript gating can change the intended accessibility fallback.

### Sub-Agent Conclusions

- UI agent: Transcript discipline and audio-state clarity are the top experience risks; layout polishing comes after flow proof.
- Functional agent: Scoring and event/gamification semantics need focused tests before visual changes.
- Quality agent: Browser evidence must include both answer flow and TTS fallback; full UI regression catches route-level overflow.

### Quantitative Acceptance Metrics

- 0 submissions allowed with unanswered questions. Verification: browser check against disabled submit.
- 3 listening phases verified: select, listening, review.
- 3 answer types verified where present: MCQ, fill blank, short answer.
- 0 horizontal overflow pixels at `390x844` on `/dashboard/listening`. Verification: `test:ui-regression` summary.
- 1 actor report and 1 separate critic artifact exist before EN-F003 can move to passing.

## Problem Boundary

In scope: `/dashboard/listening`, listening content/tests, learning-event and gamification semantics only if directly tied to listening evidence, browser screenshots, EN-03 report and critic artifact.

Out of scope: external audio hosting, Supabase migrations, new TTS provider, reading module edits, production deployment.

## Context Policy

Open only the four primary context paths before planning. Open broader analytics or learning-center files only if a focused failing test proves event semantics must be traced downstream.

## Requirements

### R1 Audio State Clarity

Learners must understand whether they are using TTS audio, transcript fallback, or unsupported audio mode.

### R2 Transcript Discipline

Transcript reveal must be deliberate and clearly labeled before and after answering.

### R3 Answer and Scoring Integrity

Answer gating, scoring, explanation, and correct-answer reveal must be deterministic and evidence-backed.

### R4 Learning Evidence Integrity

Study session, learning event, and gamification updates must reflect listening behavior honestly.

### R5 Evidence Writeback

Actor report, critic artifact, oracle, progress log, source packet, continuity ledger, and handoff must be updated.

## Test and Regression Requirements

Run the validation commands in the Machine Contract. Capture listening select, audio, questions, and review states at desktop and mobile. Record TTS support status.

## Compliance and Safety Requirements

Do not use external audio assets without approval. Do not send transcripts to external services. Respect browser autoplay behavior and accessibility expectations.

## Rollback and Recovery

Rollback is a normal git revert of EN-03 touched files plus documentation updates. If external audio or schema changes become necessary, stop and document the blocker.

## Execution Capture

Write `reports/en-03-listening-report.md` with command outputs, screenshots, TTS support state, scoring evidence, changed files, minimal-change rationale, oracle update, and blocker notes.

## Critic Protocol

Write `reports/en-03-listening-critic.md`. It must include `Critic Verdict: approved` or a documented waiver, the EN-F003 feature id, and `Actor Report Reviewed: docs/english-web-optimization-harness/reports/en-03-listening-report.md`.

## Acceptance Criteria

- EN-F003 has actor and critic evidence.
- Validation commands pass or blockers are documented.
- Browser checks cover listening flow, mobile, transcript state, and answer gate.
- Source packet and continuity ledger contain EN-03 code facts.

## Risks

- TTS timing is approximate.
- Built-in clips are limited.
- Learning event changes can ripple into Analytics and Profile.
