# Phase 01 - Lexicon And Wordbook Ecosystem

> For agentic workers: enter plan-first mode before editing. Execute this phase only, write the required evidence, and do not advance to the next phase until acceptance gates pass or blockers are documented.

**Goal:** Make Vocabulary the learner-owned lexicon center: wordbooks, word details, mastery lanes, active-book context, and evidence links should be understandable before import improvements begin.

**Architecture:** This phase builds on the existing wordbook model and UI. It should not replace the parser or scheduler. It turns the current vocabulary bank from a management page into the central learning asset surface.

**Tech Stack:** React, TypeScript, Tailwind, Radix UI, lucide-react, local wordbook services, FSRS progress, Vitest, Playwright screenshots.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v2",
  "harness_role": "execution",
  "phase": {
    "id": "VLE-01",
    "number": "01",
    "title": "Lexicon And Wordbook Ecosystem",
    "status": "ready",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-learning-ecosystem-prd",
    "phase_file": "docs/vocabdaily-learning-ecosystem-prd/phase-01-lexicon-and-wordbook-ecosystem.md",
    "depends_on": ["VLE-00"],
    "unlocks": ["VLE-02"]
  },
  "goal": {
    "target": "Redesign Vocabulary into a lexicon and wordbook center with clear wordbook metadata, mastery lanes, word detail actions, and learning evidence links.",
    "prompt": "Complete VLE-01 Lexicon And Wordbook Ecosystem for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-01-lexicon-and-wordbook-ecosystem.md`; keep the existing wordbook data model compatible, improve the vocabulary experience and tests, stay inside the named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-01-lexicon-and-wordbook-ecosystem-plan.md",
    "completion_report": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-01-lexicon-and-wordbook-ecosystem-report.md"
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
      "docs/vocabdaily-learning-ecosystem-prd/phase-01-lexicon-and-wordbook-ecosystem.md",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-report.md"
    ],
    "primary_context": [
      "src/pages/dashboard/VocabularyBankPage.tsx",
      "src/data/wordBooks.ts",
      "src/data/localStorage.ts",
      "src/features/lexicon/lexicalEntry.ts",
      "src/contexts/UserDataContext.tsx",
      "src/features/learning/routeRegistry.ts",
      "src/services/fsrs.ts",
      "src/services/evidenceEvents.ts",
      "src/components/AddWordDialog.tsx",
      "src/components/ImportWordBookDialog.tsx",
      "src/components/ImportAnkiApkgDialog.tsx"
    ],
    "context_budget": "focused",
    "do_not_load_unless": [
      "Supabase schema files may be opened only if local wordbook persistence needs a migration or sync contract update"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "src/pages/dashboard/VocabularyBankPage.tsx",
      "src/features/lexicon/**",
      "src/data/wordBooks.ts",
      "src/data/localStorage.ts",
      "src/contexts/UserDataContext.tsx",
      "src/services/evidenceEvents.ts",
      "src/pages/dashboard/*.test.tsx",
      "src/features/lexicon/*.test.ts",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-01-lexicon-and-wordbook-ecosystem-report.md",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/"
    ],
    "do_not_edit": [
      "supabase/functions/billing-*",
      "src/services/billingGateway.ts",
      "vercel.json"
    ],
    "external_inputs": [
      "synthetic built-in wordbook data",
      "user-provided deck samples only when explicitly supplied"
    ],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["rg", "apply_patch", "npm validation commands", "Playwright browser checks"],
    "approval_required": ["database migration", "production data mutation", "deployment", "external deck download"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "production migration", "force push"]
  },
  "risk": {
    "tags": ["frontend", "ui", "database"],
    "data_mutation": "local learner wordbook data",
    "migration_required": "possible",
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
        "id": "tests",
        "cwd": ".",
        "command": "npm test -- --run src/features/lexicon src/pages/dashboard/VocabularyBankPage.test.tsx src/services/evidenceEvents.test.ts",
        "expected": "Focused lexicon and evidence tests pass.",
        "required": true
      },
      {
        "id": "build",
        "cwd": ".",
        "command": "npm run build",
        "expected": "Production build completes.",
        "required": true
      }
    ],
    "browser_checks": [
      "Open /dashboard/vocabulary at desktop 1440x960 in light mode and capture the first viewport.",
      "Open /dashboard/vocabulary at mobile 390x844 in light mode and capture the first viewport.",
      "Switch to dark mode on /dashboard/vocabulary and confirm text remains readable.",
      "Use search, status filter, topic filter, play pronunciation, practice-this-word link, active-book switch, custom word delete, and export dialog without console errors."
    ],
    "regression_scope": [
      "Today still reads the active wordbook and shows daily words.",
      "Review still reads progress and due words.",
      "Practice links from a vocabulary word still route with source and wordId query parameters.",
      "Existing CSV and APKG import dialogs remain reachable."
    ],
    "compliance_gates": [
      "Imported or custom word text is rendered as text or sanitized HTML only.",
      "Every icon-only lexicon action has an aria-label.",
      "Wordbook source and license remain visible for imported and built-in books.",
      "Deleting a custom word or book must not delete built-in content."
    ],
    "acceptance_gates": [
      "Vocabulary first viewport explains active wordbook, total words, review status, and next learning action.",
      "Word detail view includes definition, Chinese definition, part of speech, phonetic, examples, collocations, CEFR level, IELTS relevance, and evidence/progress status when available.",
      "Wordbook list shows source, license, word count, level range, topic tags, active state, and safe delete state.",
      "Mastery lanes show new, learning, review, mastered, and hard/needs-review counts without relying only on color.",
      "Empty state gives import, add-word, and built-in-book actions."
    ],
    "rollback_plan": [
      "If no migration is created, rollback is reverting changed UI/service/test files.",
      "If a migration is created after approval, write a paired down migration or data cleanup script and verify it on a non-production database before release."
    ]
  },
  "evidence": {
    "outputs": [
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-01-lexicon-and-wordbook-ecosystem-report.md",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/"
    ],
    "required_artifacts": ["phase report", "focused test output", "desktop screenshot", "mobile screenshot", "dark-mode screenshot"],
    "waiver_policy": "Browser screenshot waivers must name the route, viewport, and reason capture failed.",
    "next_phase_handoff": "Unlock VLE-02 only when the lexicon surface can clearly host import preview, mapping, and portability state."
  },
  "stop_conditions": [
    "Stop if the current wordbook persistence contract cannot represent the required UI metadata without a migration and migration approval is absent.",
    "Stop if vocabulary changes break Today active-book selection.",
    "Stop if imported or custom word text cannot be displayed safely."
  ]
}
```

## Coding Agent Contract

- PHASE_ID: VLE-01
- GOAL_TARGET: Redesign Vocabulary into a lexicon and wordbook center with clear wordbook metadata, mastery lanes, word detail actions, and learning evidence links.
- GOAL_PROMPT: Complete VLE-01 Lexicon And Wordbook Ecosystem for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-01-lexicon-and-wordbook-ecosystem.md`; keep the existing wordbook data model compatible, improve the vocabulary experience and tests, stay inside the named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: VLE-00
- READ_FIRST: `docs/vocabdaily-learning-ecosystem-prd/README.md`, `docs/vocabdaily-learning-ecosystem-prd/phase-manifest.md`, this file, `docs/vocabdaily-learning-ecosystem-prd/reports/vle-00-baseline-product-audit-report.md`
- PRIMARY_CONTEXT: `src/pages/dashboard/VocabularyBankPage.tsx`, `src/data/wordBooks.ts`, `src/data/localStorage.ts`, `src/features/lexicon/lexicalEntry.ts`, `src/contexts/UserDataContext.tsx`, `src/features/learning/routeRegistry.ts`
- LIKELY_EDIT_PATHS: `src/pages/dashboard/VocabularyBankPage.tsx`, `src/features/lexicon/**`, `src/data/wordBooks.ts`, `src/data/localStorage.ts`, `src/contexts/UserDataContext.tsx`, `src/services/evidenceEvents.ts`, focused tests, phase report, lexicon screenshots
- DO_NOT_EDIT: billing functions, billing gateway, Vercel config, production deployment settings
- EXECUTION_MODE: plan-first; preserve existing data compatibility; implement in small slices; verify before handoff
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm test -- --run src/features/lexicon src/pages/dashboard/VocabularyBankPage.test.tsx src/services/evidenceEvents.test.ts`; `npm run build`
- BROWSER_CHECKS: /dashboard/vocabulary desktop 1440x960, mobile 390x844, light, dark, filters, word actions, active-book switching, export dialog
- REGRESSION_SCOPE: Today active book, Review due words, Practice word links, import dialog reachability
- COMPLIANCE_GATES: safe rendering, aria labels, source/license visibility, built-in delete protection
- ROLLBACK_PLAN: revert UI/service/test files; if approved migration appears, include paired rollback and non-production verification
- ACCEPTANCE_GATES: active wordbook context visible; word detail complete; wordbook metadata complete; mastery lanes explicit; empty state routes to import/add/built-in actions
- EVIDENCE_OUTPUT: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-01-lexicon-and-wordbook-ecosystem-report.md`
- STOP_CONDITIONS: migration needed without approval; Today active-book regression; unsafe text rendering

## Task Spec

Turn Vocabulary into the anchor surface for the product. It should answer: what words do I own, where did they come from, how well do I know them, what can I do next, and how does this word connect to practice or review?

## Problem Boundary

In scope:

- Vocabulary page information architecture.
- Word detail and active-book context.
- Mastery lane metrics.
- Wordbook metadata and empty states.
- Tests and screenshots for the vocabulary experience.

Out of scope:

- APKG parser redesign.
- Community deck marketplace.
- AI coach prompt changes.
- Production data migration without approval.

## Context Policy

Read the baseline report before editing. Do not load Chat or Practice implementation unless a route handoff from Vocabulary breaks and a blocker is documented.

## Requirements

### R1 Lexicon Home

The first viewport must show active wordbook, word count, review pressure, primary next action, and a representative word detail preview.

### R2 Word Detail

Each word detail must show lexical data, examples, collocations, status, source book, and actions for practice, review, pronunciation, and export where supported.

### R3 Wordbook Management

Wordbooks must feel like learning assets: source, license, level range, topic tags, word count, active state, and progress snapshot are visible.

### R4 Empty And Low-Data States

When no custom content exists, the page must route learners to built-in books, add word, import CSV, and import Anki APKG without presenting the app as empty or broken.

## Test and Regression Requirements

- Add or update tests for wordbook metadata, empty state actions, active-book switching, and word detail rendering.
- Keep existing import dialog tests passing.
- Capture desktop and mobile screenshots.

## Compliance and Safety Requirements

- Do not execute imported or custom text.
- Preserve source and license fields.
- Keep delete controls unavailable for built-in books.
- Keep every status understandable without color.

## Rollback and Recovery

Rollback is reverting changed files and restoring prior vocabulary behavior. If a migration is approved and created, include a reverse migration or data cleanup path in the phase report.

## Execution Capture

Use `docs/vocabdaily-learning-ecosystem-prd/reports/phase-report-template.md` and save the phase report at `docs/vocabdaily-learning-ecosystem-prd/reports/vle-01-lexicon-and-wordbook-ecosystem-report.md`.

## Evaluator Protocol

Evaluate with a real learner question: "I imported or selected a wordbook; can I understand what is in it, how I am doing, and what to do next without opening another page?"

## Acceptance Criteria

- Vocabulary no longer reads primarily as a database manager.
- Wordbook ownership, source, progress, and next action are clear on desktop and mobile.
- VLE-02 has a stable surface for import preview and mapping.

## Risks

- Current local storage shape may not support all desired metadata.
- Richer word detail could crowd mobile if not staged carefully.
- Active-book changes can accidentally alter Today and Review behavior.
