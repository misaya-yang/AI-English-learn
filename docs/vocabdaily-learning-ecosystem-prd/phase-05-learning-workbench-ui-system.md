# Phase 05 - Learning Workbench UI System

> For agentic workers: enter plan-first mode before editing. Execute this phase only, write the required evidence, and do not advance to the next phase until acceptance gates pass or blockers are documented.

**Goal:** Apply one coherent Modern Learning Workbench UI contract across the dashboard, with Vocabulary, Today, Practice, AI Coach, and skill pages reading as one product.

**Architecture:** This phase is a UI system and route-convergence phase. It should build on existing tokens, LearningWorkspace components, route registry, dashboard layout, and regression scripts instead of introducing a new design system.

**Tech Stack:** Tailwind design tokens, Radix UI, lucide-react, LearningWorkspace utilities, dashboard route registry, Playwright UI regression, Vitest visual contract tests.

---

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v2",
  "harness_role": "execution",
  "phase": {
    "id": "VLE-05",
    "number": "05",
    "title": "Learning Workbench UI System",
    "status": "ready",
    "type": "implementation",
    "repo_path": ".",
    "docs_path": "docs/vocabdaily-learning-ecosystem-prd",
    "phase_file": "docs/vocabdaily-learning-ecosystem-prd/phase-05-learning-workbench-ui-system.md",
    "depends_on": ["VLE-04"],
    "unlocks": ["VLE-06"]
  },
  "goal": {
    "target": "Converge dashboard routes onto a calm learning workbench UI with route templates, readable states, responsive layouts, and non-generic product copy.",
    "prompt": "Complete VLE-05 Learning Workbench UI System for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-05-learning-workbench-ui-system.md`; use existing tokens and components, remove old AI-dashboard and admin-page patterns, stay inside named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-05-learning-workbench-ui-system-plan.md",
    "completion_report": "docs/vocabdaily-learning-ecosystem-prd/reports/vle-05-learning-workbench-ui-system-report.md"
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
      "docs/vocabdaily-learning-ecosystem-prd/phase-05-learning-workbench-ui-system.md",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-04-ai-english-coach-and-skill-feedback-report.md"
    ],
    "primary_context": [
      "src/index.css",
      "src/App.tsx",
      "src/layouts/DashboardLayout.tsx",
      "src/features/learning/components/LearningWorkspace.tsx",
      "src/features/learning/components/LearningCockpitShell.tsx",
      "src/features/learning/routeRegistry.ts",
      "src/components/DashboardSkeleton.tsx",
      "src/components/ThemeToggle.tsx",
      "src/pages/dashboard/TodayPage.tsx",
      "src/pages/dashboard/ReviewPage.tsx",
      "src/pages/dashboard/PracticePage.tsx",
      "src/pages/dashboard/ChatPage.tsx",
      "src/pages/dashboard/VocabularyBankPage.tsx",
      "src/pages/dashboard/ReadingPage.tsx",
      "src/pages/dashboard/ListeningPage.tsx",
      "src/pages/dashboard/GrammarPage.tsx",
      "src/pages/dashboard/PronunciationPage.tsx",
      "src/pages/dashboard/WritingPage.tsx",
      "src/pages/dashboard/AnalyticsPage.tsx",
      "scripts/ui-regression.mjs",
      "scripts/learning-flow-regression.mjs"
    ],
    "context_budget": "broad",
    "do_not_load_unless": [
      "Marketing pages may be opened only if route-level theme tokens break public pages"
    ]
  },
  "boundaries": {
    "likely_edit_paths": [
      "src/index.css",
      "src/App.tsx",
      "src/layouts/DashboardLayout.tsx",
      "src/features/learning/components/**",
      "src/features/learning/routeRegistry.ts",
      "src/components/DashboardSkeleton.tsx",
      "src/components/ThemeToggle.tsx",
      "src/pages/dashboard/**",
      "src/components/**/*.test.tsx",
      "src/pages/dashboard/*.test.tsx",
      "scripts/ui-regression.mjs",
      "scripts/learning-flow-regression.mjs",
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-05-learning-workbench-ui-system-report.md",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/"
    ],
    "do_not_edit": [
      "parser logic unless UI tests show an import-state display defect",
      "AI prompt logic unless UI tests show a missing state label",
      "billing files",
      "production deployment config"
    ],
    "external_inputs": [
      "screenshots generated from local preview",
      "existing product-ui-audit contact sheets"
    ],
    "secrets_required": []
  },
  "tool_policy": {
    "allowed_tools": ["rg", "apply_patch", "npm validation commands", "Playwright screenshot regression", "local image inspection"],
    "approval_required": ["deployment", "external provider changes", "production data mutation"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "production migration", "force push"]
  },
  "risk": {
    "tags": ["frontend", "ui", "browser"],
    "data_mutation": false,
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
        "command": "npm test -- --run src/components/DashboardSkeleton.test.tsx src/features/learning/components src/pages/dashboard",
        "expected": "Focused dashboard UI and route component tests pass.",
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
        "id": "ui-regression",
        "cwd": ".",
        "command": "BASE_URL=http://127.0.0.1:4173 npm run test:ui-regression",
        "expected": "UI regression captures target routes with zero horizontal overflow and no error boundary.",
        "required": true
      },
      {
        "id": "learning-flow-regression",
        "cwd": ".",
        "command": "BASE_URL=http://127.0.0.1:4173 npm run test:learning-flow-regression",
        "expected": "Learning-flow regression passes across target routes, themes, and viewports.",
        "required": true
      }
    ],
    "browser_checks": [
      "Capture desktop 1440x960 screenshots for Today, Review, Practice, Chat, Vocabulary, Reading, Listening, Grammar, Pronunciation, Writing, Analytics, Settings, Profile.",
      "Capture mobile 390x844 screenshots for Today, Review, Practice, Chat, Vocabulary, Reading, Listening, Grammar, Pronunciation, Writing, Analytics, Settings, Profile.",
      "Switch light, dark, and system themes and confirm no full-screen black flash, blank body, unreadable text, or long skeleton.",
      "Navigate quickly between dashboard routes and confirm route fallback is lightweight.",
      "Inspect screenshots for text clipping, overlapping controls, nested cards, oversized hero copy inside tools, and accidental mixed-language labels."
    ],
    "regression_scope": [
      "Public pages still load with the same theme provider.",
      "Dashboard auth protection still works.",
      "Bottom navigation remains usable on 390px mobile.",
      "Search palette and sidebar route labels remain aligned with routeRegistry.",
      "Practice, Chat, Vocabulary, and skill pages retain their functional controls."
    ],
    "compliance_gates": [
      "All icon-only controls have accessible labels.",
      "Status uses text and shape, not color alone.",
      "Chinese mode does not show accidental English control labels outside intentional terms.",
      "Dark mode contrast remains readable without near-black full-page blocks.",
      "Reduced motion preference is respected for non-essential transitions."
    ],
    "acceptance_gates": [
      "Every dashboard route is classified as daily cockpit, active drill, coach room, lexicon console, analytics console, or settings profile.",
      "Each route uses the shared workbench spacing, radius, surface, type, and semantic accent rules.",
      "No route first viewport reads like a generic AI SaaS dashboard.",
      "No major dashboard route starts with a full-screen black skeleton or empty block.",
      "Desktop and mobile contact sheets show coherent visual hierarchy and no horizontal overflow."
    ],
    "rollback_plan": [
      "Rollback is reverting UI, token, route, and regression-script changes.",
      "Keep functional components and data services untouched unless a UI state label requires a small adapter.",
      "If theme initialization changes cause public-page regressions, restore the previous ThemeProvider and document the flash issue for a smaller patch."
    ]
  },
  "evidence": {
    "outputs": [
      "docs/vocabdaily-learning-ecosystem-prd/reports/vle-05-learning-workbench-ui-system-report.md",
      "product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/"
    ],
    "required_artifacts": ["phase report", "UI regression summary", "learning-flow summary", "desktop contact sheet", "mobile contact sheet"],
    "waiver_policy": "A route screenshot waiver must name route, viewport, theme, failure reason, and whether VLE-06 may proceed.",
    "next_phase_handoff": "Unlock VLE-06 only when UI regression evidence proves route coherence across desktop and mobile."
  },
  "stop_conditions": [
    "Stop if a UI change breaks core learning controls on Practice, Chat, Vocabulary, or Today.",
    "Stop if the route-level visual contract cannot be captured on mobile.",
    "Stop if theme switching produces unreadable text or a full-screen black surface."
  ]
}
```

## Coding Agent Contract

- PHASE_ID: VLE-05
- GOAL_TARGET: Converge dashboard routes onto a calm learning workbench UI with route templates, readable states, responsive layouts, and non-generic product copy.
- GOAL_PROMPT: Complete VLE-05 Learning Workbench UI System for `.` by following `docs/vocabdaily-learning-ecosystem-prd/phase-05-learning-workbench-ui-system.md`; use existing tokens and components, remove old AI-dashboard and admin-page patterns, stay inside named edit boundaries, and finish only after validation, browser checks, regression, compliance, rollback, evidence, and acceptance gates pass or blockers are documented.
- DEPENDS_ON: VLE-04
- READ_FIRST: `docs/vocabdaily-learning-ecosystem-prd/README.md`, `docs/vocabdaily-learning-ecosystem-prd/phase-manifest.md`, this file, `docs/vocabdaily-learning-ecosystem-prd/reports/vle-04-ai-english-coach-and-skill-feedback-report.md`
- PRIMARY_CONTEXT: `src/index.css`, `src/layouts/DashboardLayout.tsx`, `src/features/learning/components/LearningWorkspace.tsx`, `src/features/learning/routeRegistry.ts`, `src/components/DashboardSkeleton.tsx`, `src/pages/dashboard/**`, `scripts/ui-regression.mjs`, `scripts/learning-flow-regression.mjs`
- LIKELY_EDIT_PATHS: CSS tokens, dashboard layout, learning components, route registry, dashboard pages, UI tests, regression scripts, phase report, screenshots
- DO_NOT_EDIT: parser logic except display defects, AI prompt logic except state labels, billing files, production deployment config
- EXECUTION_MODE: plan-first; classify routes; apply shared UI contracts; verify screenshots before completion
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm test -- --run src/components/DashboardSkeleton.test.tsx src/features/learning/components src/pages/dashboard`; `npm run build`; `BASE_URL=http://127.0.0.1:4173 npm run test:ui-regression`; `BASE_URL=http://127.0.0.1:4173 npm run test:learning-flow-regression`
- BROWSER_CHECKS: full dashboard route screenshots on desktop and mobile, light/dark/system theme switching, fast route switching, visual inspection for clipping and mixed copy
- REGRESSION_SCOPE: public pages, auth protection, bottom nav, search palette, functional controls
- COMPLIANCE_GATES: accessible labels, text status, zh/en copy discipline, dark contrast, reduced motion
- ROLLBACK_PLAN: revert UI and script changes; restore ThemeProvider if theme init regresses public pages
- ACCEPTANCE_GATES: route classification complete; shared UI rules applied; no generic AI dashboard first viewport; no full-screen black fallback; contact sheets coherent
- EVIDENCE_OUTPUT: `docs/vocabdaily-learning-ecosystem-prd/reports/vle-05-learning-workbench-ui-system-report.md`
- STOP_CONDITIONS: core controls broken; mobile capture impossible; theme switching creates unreadable or black surfaces

## Task Spec

Make the product look and behave like one English learning workbench. The work is not decoration; visual hierarchy must support daily learning, lexicon ownership, practice retries, and coach evidence.

## Problem Boundary

In scope:

- Dashboard layout and shared learning surfaces.
- Route-level UI classification.
- Skeleton and theme behavior.
- Dashboard route copy and visual hierarchy.
- Regression capture and screenshot inspection.

Out of scope:

- New UI library.
- Marketing redesign unless theme changes break it.
- Feature logic rewrite.
- Deployment.

## Context Policy

Start from existing tokens and LearningWorkspace components. Do not create a parallel design system.

## Requirements

### R1 Route Templates

Classify and apply route templates: daily cockpit, active drill, coach room, lexicon console, analytics console, and settings profile.

### R2 Visual System

Use restrained surfaces, 6px radius, semantic accents, stable dimensions, readable type scale, and fewer nested cards.

### R3 Theme And Loading

Theme initialization, route fallback, and skeletons must avoid black flashes, blank bodies, and bulky placeholder blocks.

### R4 Product Copy

Replace generic AI-dashboard copy with concrete learning language: what to study, why it matters, what changed, and what to do next.

## Test and Regression Requirements

- UI regression for desktop and mobile.
- Learning-flow regression across themes.
- Focused dashboard component tests.
- Manual screenshot spot-check recorded in the report.

## Compliance and Safety Requirements

- Maintain accessibility labels and focus states.
- Keep status readable without color.
- Keep Chinese and English copy paths deliberate.
- Respect reduced-motion preferences.

## Rollback and Recovery

Rollback by reverting UI and token files. If a theme change causes a public-page regression, revert that slice and keep route UI changes that do not depend on it.

## Execution Capture

Use `docs/vocabdaily-learning-ecosystem-prd/reports/phase-report-template.md` and save the phase report at `docs/vocabdaily-learning-ecosystem-prd/reports/vle-05-learning-workbench-ui-system-report.md`.

## Evaluator Protocol

Judge contact sheets before judging individual components. A route passes only when the first viewport makes the next learning action clear and does not look like a generic SaaS panel stack.

## Acceptance Criteria

- Dashboard visual language is coherent across desktop and mobile.
- Theme switching and route loading are calm.
- VLE-06 can run release gates against a stable UI baseline.

## Risks

- Broad UI work can accidentally alter learning logic.
- Screenshot scripts can miss a state that real users reach through interaction.
- Over-polishing can hide clear learning actions if visual hierarchy is not checked.
