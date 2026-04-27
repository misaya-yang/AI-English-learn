# Claude Code UI Redesign Prompts

> Use these prompts from `/Users/yang/projects/app`.
> Recommended first run: `PHASE=UIR`.

## Prompt 1: Focused UI Reset Loop

Copy this into Claude Code:

```text
You are Claude Code working in /Users/yang/projects/app.

Run one strict harness-engine loop focused only on the VocabDaily UI visual reset.

Mandatory reading:

- docs/claude/HARNESS_ENGINE_RULES.md
- docs/claude/UI_MODERNIZATION_BRIEF.md
- docs/claude/VOCABDAILY_REQUIREMENTS_BACKLOG.md
- tail -160 harness_progress.md
- git status --short

Goal:

Move VocabDaily away from the current black-grid / emerald-glow / glassmorphism / giant-radius AI SaaS template look, toward the "Modern Learning Workbench" direction in docs/claude/UI_MODERNIZATION_BRIEF.md.

Pick the highest-priority incomplete UIR-* task from docs/claude/VOCABDAILY_REQUIREMENTS_BACKLOG.md.

Rules:

- Touch only the files needed for this UIR task.
- Preserve unrelated user/agent changes already in the worktree.
- Do not change billing semantics.
- Do not make checkout appear live.
- Do not add a new UI library.
- Do not redesign the dashboard in the same loop unless the selected task explicitly says so.
- Remove visual dependence on black background, decorative grid overlays, glass panels, glow shadows, and emerald-only accents.
- Make the UI feel like a serious English learning product, not an AI SaaS landing page.
- Treat mobile 375px as a first-class target.

Expected implementation style:

- Prefer light-first surfaces.
- Use smaller radii.
- Use semantic color roles instead of emerald everywhere.
- Make Chinese and English copy feel composed, not duplicated filler.
- Use hierarchy, spacing, and concrete learning content before decorative effects.
- Keep accessibility: semantic landmarks, visible focus, sufficient contrast.

Verification:

- npm run build
- Start local dev server.
- Browser smoke desktop and mobile for the routes named in the selected UIR task.
- Check no horizontal overflow, no clipped CTA text, no overlapping text, and no black/green/glass template feel.

Record:

- Append a harness_progress.md entry with Changed, Verified, Deploy, Risks, Next.
- Commit only your changes with a focused message.
- Do not push unless PUSH=true is provided.
```

## Prompt 2: Full Public Surface Pass

Use this after Prompt 1 succeeds:

```text
You are Claude Code working in /Users/yang/projects/app.

Run a small multi-route UI modernization pass across the public learning surfaces, using docs/claude/UI_MODERNIZATION_BRIEF.md as the design source of truth.

Scope:

- src/pages/Home.tsx
- src/features/marketing/AuthShell.tsx
- src/pages/PricingPage.tsx
- src/pages/WordOfTheDayPage.tsx
- src/index.css and tailwind.config.js only if needed for shared tokens

Do not touch dashboard pages unless necessary to keep shared tokens from breaking them.

Design target:

- Light-first Modern Learning Workbench.
- Learning-first copy and composition.
- Fewer glass cards, fewer glows, fewer decorative grids.
- Smaller geometry.
- Semantic accent palette.
- Mobile-first public routes.

Specific outcomes:

1. Homepage first viewport should clearly show an English learning workflow, not an abstract AI product pitch.
2. Login and register should feel calm, trustworthy, and fast.
3. Pricing should keep fail-closed honesty and read like a learning membership page, not a generic SaaS pricing table.
4. Word of the Day should feel like a daily study artifact with word, meaning, example, and action hierarchy.
5. Loading states should not dominate the visual impression.

Verification:

- npm run build
- Browser smoke:
  - /
  - /login
  - /register
  - /pricing
  - /word-of-the-day
- Test at mobile 375px and desktop.
- Include screenshots or concise visual notes in harness_progress.md.

Commit with:

refactor(ui): reset public surface visual language
```

## Prompt 3: Design Token Consolidation

Use this when public routes look acceptable but implementation still has scattered visual classes:

```text
You are Claude Code working in /Users/yang/projects/app.

Consolidate the visual language introduced by the UI modernization pass into reusable tokens and primitives.

Read:

- docs/claude/UI_MODERNIZATION_BRIEF.md
- src/index.css
- tailwind.config.js
- src/components/ui/*
- src/features/marketing/*
- src/pages/Home.tsx
- src/pages/PricingPage.tsx
- src/pages/auth/LoginPage.tsx
- src/pages/auth/RegisterPage.tsx

Goals:

- Reduce repeated hard-coded emerald, rounded-3xl, glass, glow, and grid utility patterns.
- Add or refine shared classes/tokens for:
  - page background
  - panel surface
  - learning card
  - primary/secondary CTA
  - status chips
  - bilingual label/meta treatment
- Keep dashboard pages compiling and visually acceptable.

Do not:

- introduce a new component library
- rewrite every component
- remove dark mode entirely
- change business logic

Verification:

- npm run build
- npm test -- --run if tests are affected
- Browser smoke public routes
- Quick dashboard smoke if shared tokens affect dashboard layout

Commit with:

refactor(ui): consolidate learning workbench design tokens
```

## Prompt 4: Dashboard Audit After Public Reset

Use this after public/auth pages are modernized:

```text
You are Claude Code working in /Users/yang/projects/app.

Audit and plan the authenticated dashboard visual modernization. Do not implement broad dashboard changes yet.

Read:

- docs/claude/UI_MODERNIZATION_BRIEF.md
- src/layouts/DashboardLayout.tsx
- src/features/learning/components/LearningCockpitShell.tsx
- src/features/learning/components/LearningWorkspace.tsx
- src/pages/dashboard/TodayPage.tsx
- src/pages/dashboard/ReviewPage.tsx
- src/pages/dashboard/PracticePage.tsx
- src/pages/dashboard/ChatPage.tsx

Output a new doc:

docs/claude/DASHBOARD_UI_MODERNIZATION_PLAN.md

The plan must include:

- current dashboard visual debt
- which surfaces still overuse black/glass/emerald/large radius
- target dashboard direction
- phased tasks with file scopes
- verification routes
- risks and non-goals

Do not change product code in this loop.

Run:

- git diff -- docs/claude/DASHBOARD_UI_MODERNIZATION_PLAN.md

Commit with:

docs(ui): plan dashboard visual modernization
```

