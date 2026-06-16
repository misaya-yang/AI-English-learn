# VocabDaily Global UI Upgrade PRD Harness

Date: 2026-06-17
Owner: Product / Design / Engineering

## Harness Intent

This folder turns the global VocabDaily UI upgrade into an executable phase harness. It covers public pages, auth pages, dashboard, learning modules, account screens, theme states, accessibility, regression evidence, and release readiness.

The human product plan is in `PRD.md`. The machine-readable runtime is the phase harness in this folder.

## Coding Agent Loading Protocol

When assigned a phase goal:

1. Open this `README.md`.
2. Open `PRD.md`.
3. Open `phase-manifest.md`.
4. Open `loop-contract.json`, `loop-state.json`, `feature-oracle.json`, `progress-log.md`, `agent-handoff.md`, `continuity-ledger.md`, and `next-window-prompt.md`.
5. Locate the target phase by `PHASE_ID`.
6. Open only the target phase file and its `PRIMARY_CONTEXT`.
7. Plan before editing.
8. Stay inside the target phase `LIKELY_EDIT_PATHS`.
9. Verify with the named commands, browser checks, regression scope, compliance gates, rollback notes, evidence output, and acceptance gates.
10. Before exit, update the report, progress log, handoff, oracle evidence, source packet code facts, and continuity ledger.
11. Advance only after dependencies pass or a report explicitly waives them.

## Long-Running Runtime Protocol

Work in one phase and one feature-oracle item at a time:

- observe the current repo and evidence
- select the target phase and oracle item
- execute only that bounded slice
- verify with command and browser evidence
- record reports and state updates
- decide whether to continue, block, or hand off

Do not rely on hidden chat history. A fresh agent must be able to resume from the files in this folder.

## Source Packet

Read `source-packet.md` for current route inventory, stack, UI entry points, known risks, validation commands, worktree note, non-goals, and approval boundaries.

## Runtime Artifacts

| Artifact | Purpose |
| --- | --- |
| `loop-contract.json` | Control loop for observe, select, execute, verify, record, decide. |
| `loop-state.json` | Current phase, feature, iteration, status, and next action. |
| `feature-oracle.json` | Observable product acceptance cases. |
| `progress-log.md` | Session log and blockers. |
| `agent-handoff.md` | Planner, generator, and evaluator notes. |
| `continuity-ledger.md` | Cross-phase code facts, dependencies, and handoff boundaries. |
| `next-window-prompt.md` | Copy-ready fresh-window prompt. |

## Current System Shape

The app is a React/Vite/TypeScript English learning product with Tailwind CSS, Radix/shadcn-style local components, lucide icons, i18n, Supabase integration, dashboard routes, public/auth surfaces, and Playwright-based regression scripts.

Primary UI entry points:

- `src/index.css`
- `index.html`
- `src/App.tsx`
- `src/layouts/DashboardLayout.tsx`
- `src/features/learning/components/LearningWorkspace.tsx`
- `src/components/DashboardSkeleton.tsx`
- `src/pages/Home.tsx`
- `src/features/marketing/AuthShell.tsx`
- `src/pages/dashboard/**`
- `scripts/ui-regression.mjs`
- `scripts/learning-flow-regression.mjs`

## Assumptions and Decisions

- Use Modern Learning Workbench as the target direction.
- Build light mode first.
- Keep dark mode, but make it a calm reading mode.
- Use existing components and tokens rather than adding a new UI library.
- Treat earlier homepage and dark-token edits as exploratory until validated by this harness.
- Do not claim completion without route screenshots and command evidence.

## Phase Order

| Phase | Goal | Unlocks |
| --- | --- | --- |
| VGUI-00 Baseline UI Audit And Inventory | Capture route, theme, screenshot, code, and UI debt baseline. | VGUI-01 |
| VGUI-01 Design Tokens And App Shell | Stabilize tokens, theme init, skeletons, shared shells, and component rules. | VGUI-02 |
| VGUI-02 Public And Auth Surfaces | Redesign public, auth, onboarding, legal, and daily-word entry surfaces. | VGUI-03 |
| VGUI-03 Dashboard Core Learning Flow | Redesign Today, Review, Practice, Chat, Vocabulary, and Analytics. | VGUI-04 |
| VGUI-04 Skill Modules And Utility Screens | Redesign reading, listening, grammar, pronunciation, writing, exam, memory, leaderboard, settings, and profile. | VGUI-05 |
| VGUI-05 Regression Evidence And Release Gate | Prove global route coverage, theme stability, learning-flow behavior, and release readiness. | none |

## Roadmap Cohesion

The phase chain is:

```text
VGUI-00 -> VGUI-01 -> VGUI-02 -> VGUI-03 -> VGUI-04 -> VGUI-05
```

Each phase inherits decisions and evidence from the previous phase. If a phase changes shared tokens, route shells, learning state semantics, regression scripts, or release boundaries, it must update `source-packet.md` and `continuity-ledger.md`.

## Shared Harness Rules

- Do not edit production provider configuration in UI phases.
- Do not mutate production data.
- Do not use deployment as a substitute for local visual regression.
- Do not add a UI library without an explicit phase report and approval.
- Do not remove route coverage to make tests easier.
- Do not mark feature-oracle items passing without command, browser, screenshot, or report evidence.

## Global Non-Goals

- Billing semantics are unchanged.
- Production database schema is unchanged.
- Supabase provider reachability is not solved by this UI plan.
- Dark mode is not removed.
- Figma is not required for implementation.

## Global Compliance Gates

- Accessibility: keyboard focus, labels, contrast, not color-only feedback.
- i18n: Chinese and English copy must be intentional and not accidentally mixed.
- Auth: demo, logged-out, logged-in, and provider-failure states must be honest.
- Privacy: no secrets or direct personal contact/payment identifiers in screenshots or docs.
- Release: deployment requires explicit user approval.

## Standard Verification Commands

```bash
npm run lint
npm run check:i18n
npm run build
npm test -- --run
```

## Required Browser or Runtime Checks

Every implementation phase that changes UI must capture or cite evidence for:

- desktop 1440x960
- mobile 390x844
- light mode
- dark mode
- system mode where theme behavior is touched
- route switch behavior
- no horizontal overflow
- no blank or black full-screen fallback
- no unreadable low-contrast text
- no clipped CTA labels

## External Inputs and Approvals

- Local browser screenshots are allowed.
- Vercel deployment requires explicit approval.
- Production Supabase, billing, DNS, provider dashboard changes, migrations, and data mutation require explicit approval.

## New Window Prompt

Use `next-window-prompt.md` for a cold-start handoff. Prefer the exact `GOAL_PROMPT` from the target phase file when assigning implementation work.
