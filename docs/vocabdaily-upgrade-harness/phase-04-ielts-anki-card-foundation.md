# Phase 04 - IELTS Anki Card Foundation

> For agentic workers: this phase is locked until VD-03 passes or is explicitly blocked/waived.

**Goal:** Ship a first useful IELTS Anki-style card foundation that plugs into the existing learning flow.

**Architecture:** The first deck should reuse existing vocabulary/review/practice concepts where possible, and avoid schema migration unless persistence truly requires it.

**Tech Stack:** TypeScript data models, existing review/practice services, FSRS-related scheduling where available, React UI entry point, Vitest.

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {"id": "VD-04", "number": "04", "title": "IELTS Anki Card Foundation", "status": "ready", "type": "implementation", "repo_path": "/Users/yang/projects/app", "docs_path": "docs/vocabdaily-upgrade-harness", "phase_file": "docs/vocabdaily-upgrade-harness/phase-04-ielts-anki-card-foundation.md", "depends_on": ["VD-03"], "unlocks": []},
  "goal": {"target": "Ship a first useful IELTS Anki-style card foundation that plugs into the existing learning flow.", "prompt": "Complete VD-04 IELTS Anki Card Foundation by following docs/vocabdaily-upgrade-harness/phase-04-ielts-anki-card-foundation.md; use VD-F005; define inspectable IELTS card data and one UI entry point without breaking existing review/practice behavior.", "plan_required": true, "plan_output": "docs/vocabdaily-upgrade-harness/reports/vd-04-ielts-anki-card-foundation-plan.md", "completion_report": "docs/vocabdaily-upgrade-harness/reports/vd-04-ielts-anki-card-foundation-report.md"},
  "runtime": {"feature_oracle": "docs/vocabdaily-upgrade-harness/feature-oracle.json", "loop_contract": "docs/vocabdaily-upgrade-harness/loop-contract.json", "loop_state": "docs/vocabdaily-upgrade-harness/loop-state.json", "progress_log": "docs/vocabdaily-upgrade-harness/progress-log.md", "handoff": "docs/vocabdaily-upgrade-harness/agent-handoff.md", "continuity_ledger": "docs/vocabdaily-upgrade-harness/continuity-ledger.md", "next_window_prompt": "docs/vocabdaily-upgrade-harness/next-window-prompt.md", "session_boot": {"read_progress": true, "run_baseline_check": true, "update_progress_before_exit": true}, "agent_roles": ["planner", "generator", "evaluator"]},
  "context": {"read_first": ["docs/vocabdaily-upgrade-harness/README.md", "docs/vocabdaily-upgrade-harness/phase-manifest.md", "docs/vocabdaily-upgrade-harness/reports/vd-03-product-ui-redesign-report.md"], "primary_context": ["src/data/**", "src/services/wordService.ts", "src/services/learningMissions.ts", "src/pages/dashboard/VocabularyBankPage.tsx", "src/pages/dashboard/ReviewPage.tsx", "src/pages/dashboard/PracticePage.tsx", "src/features/practice/**", "src/**/*.test.ts", "src/**/*.test.tsx"], "context_budget": "focused", "do_not_load_unless": ["external copyrighted wordlists", "database migrations", "payment files"]},
  "boundaries": {"likely_edit_paths": ["src/data/**", "src/services/**", "src/pages/dashboard/VocabularyBankPage.tsx", "src/pages/dashboard/ReviewPage.tsx", "src/pages/dashboard/PracticePage.tsx", "src/features/practice/**", "src/**/*.test.ts", "src/**/*.test.tsx", "docs/vocabdaily-upgrade-harness/**"], "do_not_edit": ["auth provider behavior", "billing/payment files", "supabase/migrations/** unless approved after blocker report", "large generated datasets"], "external_inputs": ["none by default"], "secrets_required": []},
  "tool_policy": {"allowed_tools": ["repo search", "shell validation", "browser UI check"], "approval_required": ["database migration", "external copyrighted content", "new dependency", "production deployment"], "dangerous_commands": ["git reset --hard", "rm -rf", "force push"]},
  "risk": {"tags": ["learning-content", "frontend", "data", "eval"], "data_mutation": false, "migration_required": "unknown", "browser_required": true, "ai_eval_required": true, "external_service_required": false, "release_blocking": true},
  "validation": {"commands": [{"id": "lint", "cwd": "/Users/yang/projects/app", "command": "npm run lint", "expected": "exit 0", "required": true}, {"id": "i18n", "cwd": "/Users/yang/projects/app", "command": "npm run check:i18n", "expected": "exit 0", "required": true}, {"id": "build", "cwd": "/Users/yang/projects/app", "command": "npm run build", "expected": "exit 0", "required": true}, {"id": "tests", "cwd": "/Users/yang/projects/app", "command": "npm test -- --run", "expected": "exit 0", "required": true}], "browser_checks": ["IELTS deck entry point is visible from vocabulary/review/practice flow", "one card can be reviewed without route errors", "desktop 1440x960 and mobile 390x844 have no clipped content"], "regression_scope": ["existing review/practice still works", "FSRS or current scheduling semantics not broken", "word-of-the-day and vocabulary bank still render"], "compliance_gates": ["content is original or generic enough to be safe", "no fake expert claims", "no fake precision", "Chinese hints are plain and useful", "deck can be audited in source"], "acceptance_gates": ["VD-F005 passing evidence recorded", "card schema documented", "seed deck has meaningful entries", "tests cover schema and entry point"], "rollback_plan": ["remove seed deck entry point and data files", "preserve prior UI/auth/theme fixes", "block if persistence requires migration"]},
  "evidence": {"outputs": ["docs/vocabdaily-upgrade-harness/reports/vd-04-ielts-anki-card-foundation-report.md"], "required_artifacts": ["schema notes", "seed content sample", "tests", "browser evidence", "oracle update"], "waiver_policy": "Missing content review, tests, or UI evidence requires blocker or user waiver.", "next_phase_handoff": "No downstream phase in this harness."},
  "stop_conditions": ["VD-03 is not passing", "useful deck requires unapproved migration", "content source is copyrighted or unclear", "existing FSRS model cannot be safely extended"]
}
```

## Coding Agent Contract

- PHASE_ID: VD-04
- GOAL_TARGET: Ship a first useful IELTS Anki-style card foundation that plugs into the existing learning flow.
- GOAL_PROMPT: Complete VD-04 IELTS Anki Card Foundation by following `docs/vocabdaily-upgrade-harness/phase-04-ielts-anki-card-foundation.md`; use VD-F005; define inspectable IELTS card data and one UI entry point without breaking existing review/practice behavior.
- DEPENDS_ON: VD-03
- READ_FIRST: `docs/vocabdaily-upgrade-harness/README.md`, `docs/vocabdaily-upgrade-harness/phase-manifest.md`, this file, `reports/vd-03-product-ui-redesign-report.md`
- PRIMARY_CONTEXT: `src/data/**`, word/review/practice services, vocabulary/review/practice pages, related tests
- LIKELY_EDIT_PATHS: data files, services, vocabulary/review/practice UI entry points, tests, harness docs
- DO_NOT_EDIT: auth provider behavior, billing/payment files, migrations without approval, large generated datasets
- EXECUTION_MODE: plan-first; content schema first; integrate narrowly; verify before completion
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm run build`; `npm test -- --run`
- BROWSER_CHECKS: IELTS deck entry point, one reviewable card, desktop/mobile no clipping
- REGRESSION_SCOPE: existing review/practice, FSRS scheduling, word-of-the-day, vocabulary bank
- COMPLIANCE_GATES: original/auditable content; no fake expert claims; no fake precision; useful Chinese hints
- ROLLBACK_PLAN: remove seed deck and UI entry; preserve prior fixes; block if migration is required
- ACCEPTANCE_GATES: schema documented; meaningful seed deck; tests; browser evidence; oracle update
- EVIDENCE_OUTPUT: `docs/vocabdaily-upgrade-harness/reports/vd-04-ielts-anki-card-foundation-report.md`
- STOP_CONDITIONS: VD-03 not passing; migration required; unclear copyrighted content; unsafe FSRS extension

## Task Spec

Create a first IELTS Anki-style card foundation that gives the app practical learning value beyond generic exercises.

## Problem Boundary

In scope: card schema, first seed deck, review/practice entry point, tests, and lightweight browser evidence. Out of scope: large imported datasets, copyrighted wordlists, paid content, and database migrations unless explicitly approved.

## Context Policy

Inspect existing vocabulary, review, practice, and FSRS-related code before inventing new structures. Prefer repo-native data shapes and small seed content.

## Requirements

### R1 Card Schema

Each card must include word, meaning, part of speech, collocations or phrase patterns, example sentence, Chinese hint, IELTS relevance tag, difficulty, and review tags.

### R2 Useful Seed Deck

The first deck must contain meaningful, inspectable entries. Do not create fake expert claims or fake precision.

### R3 Learning Flow Entry

The deck must be reachable from an existing vocabulary, review, or practice surface without breaking current flows.

### R4 Regression Safety

Existing review/practice behavior and FSRS semantics must remain intact.

## Test and Regression Requirements

- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- `npm test -- --run`
- Focused tests for card schema and deck availability.
- Browser check for one deck entry point and one reviewable card.

## Compliance and Safety Requirements

- Use original or generic educational content only.
- Do not copy copyrighted decks.
- Make Chinese hints useful and plain.
- Keep content auditable in source.

## Rollback and Recovery

Remove seed deck data and UI entry point if it regresses review/practice. Block the phase if persistence requires an unapproved migration.

## Execution Capture

Write `reports/vd-04-ielts-anki-card-foundation-report.md` with schema notes, sample cards, tests, UI evidence, and residual risks.

## Evaluator Protocol

Reject the phase if cards are generic filler, if content source is unclear, if tests are missing, or if current review/practice flows break.

## Acceptance Criteria

- Schema is documented.
- Seed deck is meaningful and inspectable.
- UI entry point exists.
- Tests and browser evidence pass.
- VD-F005 has evidence.

## Risks

- Content can feel fake if generated without editorial restraint.
- A migration may be needed for durable per-user scheduling.
- New deck logic can accidentally fork the existing review model.
