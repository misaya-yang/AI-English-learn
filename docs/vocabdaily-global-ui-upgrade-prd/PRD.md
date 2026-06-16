# VocabDaily Global UI Upgrade PRD

Date: 2026-06-17
Owner: Product / Design / Engineering
Status: planning harness, not implemented

## 1. Product Intent

VocabDaily should feel like an English learning app that helps a learner decide what to do today, complete the task, understand mistakes, and come back tomorrow. The current UI still has visible debt from the AI SaaS template direction: dark heavy surfaces, generic cards, repeated accent colors, route loading blocks, and copy that sometimes sounds like a prompt result instead of product language.

The upgrade goal is not to decorate the app. It is to make every route answer three learner questions quickly:

1. What should I do now?
2. Why is this task useful?
3. What happened after I answered, wrote, listened, or reviewed?

## 2. Design Read

Reading this as an existing English learning web app for daily learners and exam-focused users, with a calm learning-workbench language. The direction is light-first, task-first, low-noise, readable, and specific to English practice.

Design dials:

- DESIGN_VARIANCE: 4. Use clear structure before visual drama.
- MOTION_INTENSITY: 2. Use feedback motion only, no decorative loops.
- VISUAL_DENSITY: 5. Dashboard routes can be useful and compact, public pages stay simpler.

Target aesthetic: Modern Learning Workbench.

Avoid:

- black cockpit backgrounds
- emerald everywhere
- glass panels and glow shadows
- decorative grid overlays
- huge hero text inside product tools
- generic AI copy such as cockpit, typical day, unleash, smart platform, AI-powered workflow

Use:

- paper-like light surfaces
- softened dark mode that is readable, not black
- slate ink, muted blue, sage, amber, rose as semantic colors
- compact task queues, inline feedback, honest loading states
- plain product copy that says what the learner will do

## 3. Scope

This PRD covers all visible UI routes and shared components in the current app.

### Public And Marketing

- `/`
- `/pricing`
- `/word-of-the-day`
- `/demo`
- `/terms`
- `/privacy`

### Auth And Onboarding

- `/login`
- `/register`
- `/magic-link`
- `/auth/callback`
- `/onboarding`

### Dashboard Core

- `/dashboard/today`
- `/dashboard/review`
- `/dashboard/practice`
- `/dashboard/chat`
- `/dashboard/vocabulary`
- `/dashboard/analytics`

### Skill Modules

- `/dashboard/reading`
- `/dashboard/listening`
- `/dashboard/grammar`
- `/dashboard/pronunciation`
- `/dashboard/writing`
- `/dashboard/exam`
- `/dashboard/learning-path`
- `/dashboard/leaderboard`
- `/dashboard/memory`

### Account And Settings

- `/dashboard/settings`
- `/dashboard/profile`

### Shared UI

- `src/index.css`
- `src/App.tsx`
- `src/layouts/DashboardLayout.tsx`
- `src/features/learning/components/LearningWorkspace.tsx`
- `src/features/learning/components/LearningCockpitShell.tsx`
- `src/components/DashboardSkeleton.tsx`
- `src/components/ThemeToggle.tsx`
- `src/components/BottomNavBar.tsx`
- `src/components/ui/**`
- `scripts/ui-regression.mjs`
- `scripts/learning-flow-regression.mjs`

## 4. Current Problems To Fix

### P0 Learning Trust

- Wrong-answer feedback must not reveal answers too early.
- Feedback should live near the question, not only in toast notifications.
- Retry, reveal, recovered, and needs-review states must be visually distinct and semantically recorded.

### P0 Visual Trust

- Dark mode still reads as large charcoal blocks on public surfaces.
- Some cards use hard borders and low-contrast text in a way that feels flat and heavy.
- Route fallback and skeleton states can look like black blocks during navigation.
- Repeated card panels make public pages and dashboards feel like the same AI template.

### P1 Product Clarity

- Public homepage should say "today's practice" in practical terms, not abstract AI coaching.
- Auth pages should feel fast and calm, with demo and account semantics clear.
- Word of the Day should feel like a study artifact, not a marketing page.
- Dashboard route headers should tell the learner what to do next and why.

### P1 UI Consistency

- Shared route shells, sidebars, top bars, panels, badges, feedback panels, and bottom navigation need one radius, spacing, and token system.
- Light, dark, and system theme should be treated as first-class modes.
- Mobile and desktop should be reviewed equally. The desktop 1440 experience must not be treated as an afterthought.

### P2 Coverage

- Reading, listening, grammar, pronunciation, writing, exam, analytics, settings, and profile need the same quality bar as Today and Practice.
- Empty, loading, error, retry, success, and blocked states need route-level acceptance criteria.

## 5. Target UI System

### 5.1 Tokens

Token goals:

- Light mode is the default brand expression.
- Dark mode is a reading mode, not a black cockpit.
- `primary` should not be the only semantic accent.
- Use semantic accents by learning intent:
  - memory: sage or soft green
  - practice: blue
  - coach: indigo or cyan
  - exam: amber
  - success: green
  - warning: amber
  - danger: rose

Acceptance:

- No route relies on pure black or near-black full-screen surfaces.
- No major route uses emerald as the default color for every CTA, badge, chart, and icon.
- `premium-panel`, `premium-panel-soft`, `glass`, `glow-*`, and grid utilities are either removed from user-facing layouts or mapped to quiet surfaces.
- Dark mode text, buttons, form fields, and revealed-answer panels pass readable contrast.

### 5.2 Geometry

Use a small radius system:

- controls: 6px to 8px
- cards and panels: 8px to 10px
- large media or modal surfaces: 12px max
- pills only for compact status chips and segmented controls

Acceptance:

- No route has a mixed shape system where pill buttons sit inside square card layouts without reason.
- Nested card-in-card structures are removed unless the inner card is an actual repeated item.

### 5.3 Type And Copy

Copy rules:

- Use direct labels: 今天练什么, 复习, 新词, 练习, 再试一次, 看答案, 需要复习.
- Do not use decorative labels that explain the UI instead of the task.
- Do not use "AI design" wording in primary product copy.
- Chinese and English should each read naturally, not like one is a subtitle of the other.

Acceptance:

- The first screen of every major route has one clear user action.
- Toasts are not the primary source of learning feedback.
- Button labels fit at desktop and mobile widths.

### 5.4 Motion And Loading

Motion rules:

- Keep route transitions quick and quiet.
- Loading states should match final layout shape.
- Do not hide slow loading with decorative animation.
- Respect reduced motion.

Acceptance:

- Route switching between dashboard pages does not show a full-screen black block.
- Skeletons do not dominate the viewport for stable local data.
- Focus and active states are visible on keyboard navigation.

## 6. Global Route Acceptance Matrix

| Area | Routes | First Screen Must Show | Required States |
| --- | --- | --- | --- |
| Public | `/`, `/pricing`, `/word-of-the-day`, `/demo`, `/terms`, `/privacy` | Product purpose, primary action, clear navigation | guest, authenticated where relevant, mobile menu, loading |
| Auth | `/login`, `/register`, `/magic-link`, `/auth/callback`, `/onboarding` | Form purpose, next step, trust copy | validation, loading, error, demo, legal links |
| Today | `/dashboard/today` | Today's tasks and next action | due words, no due words, partial progress, completed |
| Review | `/dashboard/review` | Review queue and grading action | empty queue, due queue, rating, completed |
| Practice | `/dashboard/practice` | Current question and retry path | answering, retrying, revealed, recovered, next |
| Coach | `/dashboard/chat` | Coach prompt and current context | local auth, remote unavailable, message loading, error |
| Vocabulary | `/dashboard/vocabulary` | Wordbook state and import/search action | empty, imported, duplicate, detail, export |
| Analytics | `/dashboard/analytics` | Learning trend and useful summary | empty data, partial data, filtered data |
| Skills | reading, listening, grammar, pronunciation, writing, exam | Current task and completion action | empty, active, feedback, recap |
| Account | settings, profile | Account state and editable controls | save, validation, theme switch, language switch |

## 7. Phase Plan

### VGUI-00 Baseline UI Audit And Inventory

Purpose: create the evidence baseline before redesign work.

Deliverables:

- route inventory with owner files
- screenshot set for desktop 1440x960 and mobile 390x844
- light, dark, and system theme notes
- current UI debt list grouped by severity
- source packet and continuity ledger updates

Acceptance:

- Every route in the scope table is either captured or has a named blocker.
- The report identifies current token, shell, copy, contrast, spacing, and loading problems.
- Current uncommitted UI exploration changes are recorded separately from completed work.

### VGUI-01 Design Tokens And App Shell

Purpose: fix the foundation so later pages do not fight the theme.

Deliverables:

- revised light and dark tokens in `src/index.css`
- route pre-paint and theme initialization audit
- quiet `DashboardSkeleton` and `PageSkeleton`
- shared shell decisions for public pages and dashboard
- component rules for buttons, cards, badges, tabs, fields, and panels

Acceptance:

- `/`, `/login`, `/dashboard/today`, `/dashboard/practice`, and `/dashboard/settings` render readable light and dark modes.
- Fast route switching does not show a black or blank body.
- Shared components expose states needed by downstream phases.

### VGUI-02 Public And Auth Surfaces

Purpose: make the public entry and account flows feel like an English learning product.

Deliverables:

- homepage learning-first layout
- pricing page visual simplification with billing honesty preserved
- Word of the Day as a study artifact
- login, register, magic link, auth callback, and onboarding shell refresh
- legal footer and mobile menu checks

Acceptance:

- First viewport answers what the learner can do today.
- Auth pages show clear form purpose, demo behavior, legal links, and errors.
- Public pages have no nested interactive controls, no clipped CTA text, and no black SaaS hero.

### VGUI-03 Dashboard Core Learning Flow

Purpose: make Today, Review, Practice, Chat, Vocabulary, and Analytics feel like one learning system.

Deliverables:

- shared dashboard header hierarchy
- left navigation visual de-emphasis during active learning
- Today task queue with clear next action
- Review and Practice feedback states
- Coach local or remote availability states
- Vocabulary import/search/detail states
- Analytics empty and partial-data states

Acceptance:

- Practice wrong-answer first attempt does not reveal the answer.
- Recovered answers are visually and semantically separate from first-try correct answers.
- Dashboard pages use consistent spacing, surface, accent, and typography.
- The desktop 1440 layout is useful, not just stretched mobile.

### VGUI-04 Skill Modules And Utility Screens

Purpose: bring all learning modules up to the same UI quality bar.

Deliverables:

- reading, listening, grammar, pronunciation, writing, exam, learning path, leaderboard, memory center, profile, and settings UI pass
- per-module active, empty, loading, error, and completion states
- pronunciation and listening feedback panels that do not depend only on toast
- settings and profile form contrast and save states

Acceptance:

- Each module has one primary action in the first viewport.
- Every module has a readable mobile layout at 390x844.
- No module uses an old cockpit, black-block, or nested-card pattern.

### VGUI-05 Regression Evidence And Release Gate

Purpose: prove the redesign is coherent before commit, push, or deploy.

Deliverables:

- updated `scripts/ui-regression.mjs`
- updated `scripts/learning-flow-regression.mjs`
- desktop and mobile contact sheets
- theme switching evidence
- route-switching evidence
- release report with known risks

Acceptance:

- `npm run lint` passes.
- `npm run check:i18n` passes.
- `npm run build` passes.
- `npm test -- --run` passes or the report lists exact failing tests and owners.
- UI regression covers every route in this PRD.
- Learning-flow regression covers retry, reveal, recovered, listening retry, and recap states.

## 8. Verification Plan

Minimum commands:

```bash
npm run lint
npm run check:i18n
npm run build
npm test -- --run
```

Focused UI checks:

```bash
BASE_URL=http://127.0.0.1:4173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-17/global-ui npm run test:ui-regression
BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-17/global-ui-learning npm run test:learning-flow-regression
```

Viewports:

- desktop 1440x960
- mobile 390x844

Themes:

- light
- dark
- system

## 9. Non-Goals

- Do not change billing semantics.
- Do not hide provider outages behind optimistic UI.
- Do not require new UI libraries.
- Do not introduce Figma-only artifacts that cannot be executed in code.
- Do not change production database schema in this UI PRD.
- Do not deploy without an explicit release phase report.
- Do not remove dark mode. Make it readable and calm.

## 10. Current Worktree Note

At PRD creation time, the worktree contains exploratory changes in:

- `src/index.css`
- `src/pages/Home.tsx`

These changes are not treated as completed PRD work until they are reviewed against this plan, validated, and captured in a phase report.
