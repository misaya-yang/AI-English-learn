# Phase 01 - Vocabulary Optimization

> For agentic workers: enter plan-first mode before editing. Execute EN-01 only, update EN-F001 only, write evidence, and do not advance to EN-02 until acceptance gates pass or blockers are documented.

**Goal:** Make Vocabulary a coherent lexicon and wordbook center with English-mode polish, safe import/export, source-book context, and direct learning actions.

**Architecture:** This phase works inside the existing `/dashboard/vocabulary` route, lexicon mapper, wordbook data, export service, and focused tests. It must preserve local wordbook storage, built-in word data, custom word behavior, and Practice/Review route contracts.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Radix UI, lucide-react, i18n, localStorage/IndexedDB-backed learner data, Vitest, Playwright regression scripts.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "EN-01",
    "number": "01",
    "title": "Vocabulary Optimization",
    "status": "passed",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/english-web-optimization-harness",
    "phase_file": "docs/english-web-optimization-harness/phase-EN-01.md",
    "depends_on": [],
    "unlocks": ["EN-02"]
  },
  "goal": {
    "target": "Make Vocabulary a coherent lexicon and wordbook center with English-mode polish, safe import/export, source-book context, and direct learning actions.",
    "prompt": "Complete EN-01 Vocabulary Optimization for `.` by following `docs/english-web-optimization-harness/phase-EN-01.md`; work on EN-F001, preserve wordbook and route contracts, stay inside the named edit boundaries, and finish only after validation, browser, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/english-web-optimization-harness/reports/en-01-vocabulary-plan.md",
    "completion_report": "docs/english-web-optimization-harness/reports/en-01-vocabulary-report.md"
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
      "docs/english-web-optimization-harness/phase-EN-01.md"
    ],
    "primary_context": [
      "src/pages/dashboard/VocabularyBankPage.tsx",
      "src/features/lexicon/lexicalEntry.ts",
      "src/data/wordBooks.ts",
      "src/services/wordBookExport.ts"
    ],
    "context_budget": "focused",
    "do_not_load_unless": [
      "docs/english-web-optimization-harness/source-packet.md only for repository evidence lookup or code-fact writeback",
      "docs/english-web-optimization-harness/continuity-ledger.md only for dependency boundary lookup or writeback",
      "docs/english-web-optimization-harness/feature-oracle.json only for EN-F001 status and evidence updates",
      "docs/english-web-optimization-harness/progress-log.md only for session status updates",
      "docs/english-web-optimization-harness/agent-handoff.md only for role handoff updates"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "src/pages/dashboard/VocabularyBankPage.tsx",
      "src/features/lexicon/**",
      "src/data/wordBooks.ts",
      "src/services/wordBookExport.ts",
      "src/pages/dashboard/VocabularyBankPage.test.tsx",
      "src/features/lexicon/*.test.ts",
      "src/data/wordBooks.test.ts",
      "src/services/wordBookExport.test.ts",
      "docs/english-web-optimization-harness/reports/en-01-vocabulary-report.md",
      "docs/english-web-optimization-harness/reports/en-01-vocabulary-critic.md"
    ],
    "do_not_edit": [
      "supabase/**",
      "api/supabase.js",
      "vercel.json",
      "src/services/billingGateway.ts",
      "package-lock.json",
      ".env*",
      "docs/vocabdaily-global-ui-upgrade-prd/**",
      "docs/vocabdaily-upgrade-harness/**"
    ],
    "external_inputs": [
      "local seeded learner data from regression scripts",
      "user-provided wordbook files only when supplied during execution"
    ],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["rg", "apply_patch", "npm validation commands", "Playwright browser checks"],
    "approval_required": ["dependency addition", "Supabase schema change", "production deployment", "provider dashboard action"],
    "dangerous_commands": ["git reset --hard", "force push", "rm -rf", "production migration", "secret printing"]
  },
  "risk": {
    "tags": ["ui", "frontend", "auth", "database"],
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
        "id": "focused-vocabulary-tests",
        "cwd": ".",
        "command": "npm test -- --run src/features/lexicon/lexicalEntry.test.ts src/data/wordBooks.test.ts src/services/wordBookExport.test.ts src/pages/dashboard/VocabularyBankPage.test.tsx",
        "expected": "Focused lexicon, wordbook, export, and vocabulary page tests pass.",
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
        "id": "browser-vocabulary",
        "cwd": ".",
        "command": "BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-01-vocabulary npm run test:ui-regression",
        "expected": "Browser regression captures /dashboard/vocabulary without login redirect, blank page, error boundary, or horizontal overflow.",
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
      "After dev-server-precheck passes, open /dashboard/vocabulary at 1440x960 in English light mode and capture first viewport.",
      "Open /dashboard/vocabulary at 390x844 in English light mode and capture first viewport.",
      "Switch to dark mode on /dashboard/vocabulary and verify text, badges, dialogs, and filters remain readable.",
      "Use search, status filter, topic filter, word detail dialog, pronunciation button, Practice this word, Open review, import dialog, export dialog, active-book switch, and custom delete path without console errors.",
      "Verify English mode has no hard-coded Chinese labels in export dialog, stat cards, empty state, and detail action buttons; classify learner-content Chinese definitions separately from accidental UI chrome."
    ],
    "regression_scope": [
      "Today still reads the active wordbook and daily words.",
      "Review route still loads when reached from a vocabulary entry.",
      "Practice route still receives lexicon query parameters.",
      "Built-in books cannot be deleted.",
      "Independent critic evidence confirms minimal-change scope."
    ],
    "compliance_gates": [
      "Imported and custom word text is rendered safely as text or sanitized content.",
      "Icon-only controls keep aria-labels.",
      "Source and license remain visible for wordbooks.",
      "English and Chinese language modes do not leak accidental mixed copy.",
      "Vocabulary pronunciation/TTS behavior honors Settings controls or the phase report records the current boundary with evidence.",
      "Local learner data mutation is limited to vocabulary, wordbook, and progress operations."
    ],
    "acceptance_gates": [
      "Vocabulary first viewport exposes active book, total words, review need, and next learning action.",
      "Word detail includes definition, Chinese definition as intentional learner content, part of speech, phonetic, examples, collocations, source book, status, and drills when available.",
      "Import/export dialogs and result banners have English copy in English mode.",
      "Empty state presents direct add/import/built-in-book actions.",
      "Phase report includes validation evidence, browser screenshots, minimal-change scope, source packet writeback, feature oracle update, progress log update, handoff update, and independent critic approval."
    ],
    "rollback_plan": [
      "Revert EN-01 UI, lexicon, wordbook, export, and focused test changes.",
      "Do not rollback by deleting user wordbook data.",
      "If a schema or sync change becomes necessary, stop and request approval before editing protected paths."
    ]
  },
  "evidence": {
    "outputs": [
      "docs/english-web-optimization-harness/reports/en-01-vocabulary-report.md",
      "docs/english-web-optimization-harness/reports/en-01-vocabulary-critic.md",
      "product-audit-2026-06-28/en-01-vocabulary/"
    ],
    "required_artifacts": [
      "phase report with Status line",
      "progress log entry",
      "feature oracle EN-F001 evidence update",
      "continuity ledger code-summary writeback",
      "source packet code facts update",
      "handoff update",
      "focused test output",
      "browser screenshots",
      "independent critic artifact",
      "minimal-change scope notes"
    ],
    "waiver_policy": "A waived browser or import/export gate must name the route, viewport, unavailable API or file input, alternate evidence, residual risk, and whether EN-02 may proceed.",
    "next_phase_handoff": "Unlock EN-02 only after Vocabulary practice and review links, English copy, and lexicon evidence are stable."
  },
  "stop_conditions": [
    "Stop if safe import/export requires a new dependency without approval.",
    "Stop if vocabulary behavior needs Supabase schema or RLS edits.",
    "Stop if Practice or Review route contracts must change outside EN-01 boundaries.",
    "Stop if secret values or production data are required."
  ]
}
```

## Coding Agent Contract

- PHASE_ID: EN-01
- GOAL_TARGET: Make Vocabulary a coherent lexicon and wordbook center with English-mode polish, safe import/export, source-book context, and direct learning actions.
- GOAL_PROMPT: Complete EN-01 Vocabulary Optimization for `.` by following `docs/english-web-optimization-harness/phase-EN-01.md`; work on EN-F001, preserve wordbook and route contracts, stay inside the named edit boundaries, and finish only after validation, browser, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: none
- READ_FIRST: `docs/english-web-optimization-harness/context-profile.json`, `docs/english-web-optimization-harness/loop-state.json`, this file
- PRIMARY_CONTEXT: `src/pages/dashboard/VocabularyBankPage.tsx`, `src/features/lexicon/lexicalEntry.ts`, `src/data/wordBooks.ts`, `src/services/wordBookExport.ts`
- LIKELY_EDIT_PATHS: `src/pages/dashboard/VocabularyBankPage.tsx`, `src/features/lexicon/**`, `src/data/wordBooks.ts`, `src/services/wordBookExport.ts`, focused tests, EN-01 report and critic files
- DO_NOT_EDIT: `supabase/**`, `api/supabase.js`, `vercel.json`, `src/services/billingGateway.ts`, `package-lock.json`, `.env*`, other completed harness folders
- EXECUTION_MODE: plan-first; implement one vocabulary slice; verify before completion; write evidence before handoff
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm test -- --run src/features/lexicon/lexicalEntry.test.ts src/data/wordBooks.test.ts src/services/wordBookExport.test.ts src/pages/dashboard/VocabularyBankPage.test.tsx`; `npm run build`; `curl -sSf http://127.0.0.1:5173/ >/dev/null`; `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-01-vocabulary npm run test:ui-regression`; `git diff --check`
- BROWSER_CHECKS: `/dashboard/vocabulary` desktop 1440x960, mobile 390x844, light, dark, English, filters, dialogs, word actions, active-book switching, import/export
- REGRESSION_SCOPE: Today active book, Review route, Practice word links, built-in delete protection, minimal-change critic review
- COMPLIANCE_GATES: safe text rendering, aria labels, source/license visibility, i18n, local learner data boundary
- ROLLBACK_PLAN: revert EN-01 UI/service/test changes; do not delete user data; stop before schema or sync edits
- ACCEPTANCE_GATES: active-book context visible; complete word detail; English copy clean; empty state direct; actor report, oracle update, source packet, continuity ledger, progress log, handoff, and critic approval complete
- EVIDENCE_OUTPUT: `docs/english-web-optimization-harness/reports/en-01-vocabulary-report.md`
- STOP_CONDITIONS: dependency approval needed; Supabase schema needed; Practice/Review contracts require broad edits; secret or production data required

## Task Spec

### UI Walk-Through Issues

1. Export dialog title, description, and button labels are hard-coded in Chinese in `VocabularyBankPage.tsx`.
2. Stat cards for total, new, mastered, needs review, and learning are hard-coded in Chinese.
3. Empty search result state is hard-coded in Chinese.
4. Detail actions "mark mastered" and "start learning" are hard-coded in Chinese.
5. Empty state hides add/import actions behind an icon menu instead of a direct primary command.
6. Vocabulary route combines deck promotion, featured entry, book management, filters, stats, and rows with weak visual task order.

### Functional Issues

1. Export success and warning toasts are hard-coded in Chinese.
2. `Open review` links include query parameters that need Review route behavior evidence.
3. Word row uses `div role="button"` and needs keyboard activation verification.
4. Imported words without examples or collocations need useful drill fallback evidence.
5. Custom word delete has no undo or confirmation evidence.
6. `needsReviewCount` combines status and incorrect/correct counts locally; Review consistency needs regression evidence.
7. Vocabulary pronunciation calls shared TTS; Settings TTS toggle and voice behavior must be verified if pronunciation controls are touched.

### Priority Optimization List

- P0: Remove accidental Chinese copy from English mode for export dialog, stats, result banners, detail actions, empty search state, and toasts.
- P0: Prove Practice and Review links from a word detail reach valid routes without breaking existing route contracts.
- P1: Promote add/import/export actions into clearer direct commands for empty and loaded states.
- P1: Add or verify keyboard activation and focus behavior for word detail rows and icon-only controls.
- P2: Clarify hierarchy between IELTS deck promotion, featured word, book management, filters, and word rows.
- P2: Add safer copy or confirmation for custom deletion.

### Risks and Regression Points

- Wordbook local storage compatibility can regress Today daily words.
- Export format changes can break CSV or Anki TSV tests.
- Over-localizing source/license or IELTS terms can damage domain clarity.
- Dialog and dropdown changes can create nested interactive controls.
- Route-link changes can break Practice and Review handoff.
- TTS settings behavior can drift because Vocabulary calls shared speech helpers directly.

### Sub-Agent Conclusions

- UI agent: The primary route problem is mixed language plus weak task hierarchy; prioritize English-mode cleanup and direct action visibility before decorative changes.
- Functional agent: Preserve wordbook and export contracts; focus on link behavior, keyboard activation, import/export feedback, and deletion safety.
- Quality agent: Existing focused tests plus `test:ui-regression` can cover the module; acceptance still needs screenshots and independent critic evidence.

### Quantitative Acceptance Metrics

- 0 accidental Chinese strings visible in `/dashboard/vocabulary` English mode across export dialog, stats, empty search, detail actions, and toasts. Assumption: English-mode string count can be verified by browser body text and screenshot review.
- 0 horizontal overflow pixels at `390x844` in vocabulary route. Verification: `test:ui-regression` summary.
- 100 percent of icon-only controls in touched vocabulary UI have accessible labels. Verification: code inspection and browser query.
- 3 route actions work from a word detail: Practice this word, Open review, and play pronunciation. Verification: browser check.
- 1 actor report and 1 separate critic artifact exist before EN-F001 can move to passing.

## Problem Boundary

In scope: `/dashboard/vocabulary`, lexicon mapping, wordbook display, export/import feedback copy, focused tests, browser evidence, EN-01 report and critic artifact.

Out of scope: Supabase schema, billing, production deployment, external dictionary APIs, new content-provider integration, route renames.

## Context Policy

Open only the four primary context paths before planning. Open `source-packet.md` and `continuity-ledger.md` only for targeted evidence lookup or final writeback.

## Requirements

### R1 English-Mode Lexicon Copy

All user-facing vocabulary route copy touched by EN-01 must respect `isZh` or i18n.

### R2 Word Detail Action Integrity

Practice, Review, pronunciation, mark learned, mark mastered, and delete actions must remain reachable and understandable.

### R3 Wordbook Source Safety

Source, license, built-in/custom state, active state, and delete protection must stay visible.

### R4 Import/Export Feedback

Import/export results must report count, errors, and next action in the active language.

### R5 Evidence Writeback

Actor report, critic artifact, oracle, progress log, source packet, continuity ledger, and handoff must be updated.

## Test and Regression Requirements

Run the validation commands in the Machine Contract. Capture screenshots for `/dashboard/vocabulary` desktop and mobile. Document any command failure with exact output and alternate evidence.

## Compliance and Safety Requirements

Do not print secrets. Do not mutate production data. Do not alter Supabase schema, billing, deployment config, or package lockfiles. Keep imported/custom word rendering safe.

## Rollback and Recovery

Rollback is a normal git revert of EN-01 touched UI/service/test files plus documentation updates. Do not run data deletion. If a migration becomes necessary, stop before editing protected paths.

## Execution Capture

Write `reports/en-01-vocabulary-report.md` with command outputs, screenshots, changed files, minimal-change rationale, oracle update, and blocker notes.

## Critic Protocol

Write `reports/en-01-vocabulary-critic.md`. It must include `Critic Verdict: approved` or a documented waiver, the EN-F001 feature id, and `Actor Report Reviewed: docs/english-web-optimization-harness/reports/en-01-vocabulary-report.md`.

## Acceptance Criteria

- EN-F001 has actor and critic evidence.
- Validation commands pass or blockers are documented.
- Browser checks cover desktop, mobile, English, and theme readability.
- Source packet and continuity ledger contain EN-01 code facts.

## Risks

- Existing tests may not cover every dialog branch.
- Browser speech/TTS is already present through Vocabulary pronunciation; do not broaden it, but verify or record the Settings boundary if touched.
- Vocabulary UI changes can affect Today and Practice via shared wordbook assumptions.
