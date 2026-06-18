# VGUI-07 Full Product UI Redesign Plan

**Date:** 2026-06-18
**Status:** active plan
**Reason:** User review found the previous release still looked like an AI SaaS template and did not feel like a complete English-learning product upgrade.

## Design Brief

VocabDaily is a daily English learning web app for Chinese-speaking learners. The redesign must make the app feel like a serious, modern learning tool: clear, quiet, task-first, and useful. The UI should answer "今天练什么" at a glance, avoid generic AI copy, and keep learning feedback inside the task area instead of relying on toasts or decorative panels.

## ImageGen Directions

Three Product Design ImageGen directions were generated for the full product language:

1. **Quiet Study Desk**
   Strength: clear dashboard hierarchy and disciplined light theme.
   Risk: still close to SaaS card language.

2. **Workbook Tabs**
   Strength: strongest fit for the requested direction. It uses workbook-like tabs, ruled sections, short labels, and less card stacking.
   Recommendation: use this as the primary visual target unless the user chooses otherwise.

3. **Reading Room**
   Strength: best learning atmosphere and spacious reading feel.
   Risk: can drift into gentle marketing language if not controlled.

## Current Direction Lock

Use a restrained blend of **Quiet Study Desk** and **Workbook Tabs**:

- Public/auth pages may use one real learning-desk image to make the product feel concrete.
- Dashboard pages should stay code-native and task-first, using rows, ruled sections, compact tabs, and inline feedback instead of fake screenshot art.
- Avoid abstract light waves, glass panels, glowing gradients, mascot imagery, and heavy black/charcoal first screens.
- Current project-bound homepage/auth asset: `public/vocabdaily-study-desk.jpg`. The active ImageGen concept is a quiet desk with notebook/cards and left-side negative space; because the built-in ImageGen call did not expose a filesystem path in this environment, the current committed asset is a real photographic fallback with the same slot and crop so it can be replaced by an exported ImageGen bitmap without changing code.

## Non-Negotiable UI Rules

- Default to light mode. Dark mode must be soft charcoal, never pure black or cockpit-style.
- Use system UI typography. Avoid rounded SaaS fonts and default Inter-looking hierarchy.
- Use short, functional copy. Prefer "复习", "新词", "短练", "再试一次", "看答案", "首答正确", "已修正", "需复习".
- Remove or demote copy that sounds like product self-explanation: "智能", "洞察", "成长旅程", "典型学习日", "工作台", "真正记得住", "个性化" when visible.
- Do not use "Suggested / 建议" as a general UI badge. Use concrete reasons or omit it.
- Do not reveal a correct answer after the first wrong attempt in any practice surface.
- Use inline feedback panels for learning states. Toasts are for transient system messages only.
- Avoid cards inside cards. Use spacing, rows, tabs, dividers, and section bands first.
- Keep semantic colors restrained: success, warning, danger, information. Do not let emerald/purple become the product identity.
- Every route must support light, dark, and system themes without blank/black transition blocks.

## Route Inventory And Required Work

### Public And Auth

- `/`
  - Replace marketing-style hero with app-first first viewport.
  - Show the daily flow with real product UI, not slogans.
  - Remove duplicate CTAs and label chips that only decorate.
- `/login`, `/register`, `/magic-link`, `/auth/callback`
  - Keep labels above inputs.
  - Replace emerald link/action accents with semantic primary tokens.
  - Shorten side rail copy and remove reassurance fluff.
- `/onboarding`
  - Remove dense emerald selection states.
  - Make level, target, and daily goal selection feel like setup steps, not a sales funnel.
- `/pricing`
  - Preserve billing fail-closed semantics.
  - Reduce marketing language and keep plan comparison plain.
- `/word-of-the-day`, `/demo`, `/terms`, `/privacy`
  - Align typography, link color, card shape, and empty/loading states with the selected visual system.

### Dashboard Core

- `/dashboard/today`
  - Rebuild around the selected ImageGen direction.
  - Make "今天练什么" the main information architecture.
  - Demote "任务依据" into a compact optional detail or remove it from the first viewport.
  - Keep current word, progress, and next action visible without nested cards.
- `/dashboard/review`
  - Keep FSRS due-only behavior.
  - Replace metadata rows using "·" with readable grouped labels.
  - Make answer reveal, grade buttons, interval text, and completion recap consistent with Practice.
- `/dashboard/practice`
  - Keep existing retry/reveal state machine.
  - Replace "建议/Suggested" badges with concrete labels.
  - First wrong state: wrong choice + hint + "再试一次"; no correct answer.
  - Second wrong or "看答案": reveal answer with readable explanation.
  - Right rail should show 首答正确 / 已修正 / 需复习.
- `/dashboard/chat`
  - Rename visible "coach mission/recommendations" language into Help, Short quiz, Review mistake, Rewrite sentence.
  - Reduce meta strips and separators.
  - Keep errors actionable without exposing internal request IDs unless expanded.
- `/dashboard/vocabulary`
  - Replace "mastered" visible language with "已会/已复习" where possible without changing stored status enum.
  - Keep word-book management dense but not card-heavy.
- `/dashboard/analytics`
  - Rename "insights" and "mission" visible labels into concrete progress language.
  - Reduce chart-card nesting and overcolored status accents.

### Skill Modules And Utility Screens

- `/dashboard/reading`
  - Keep passage, question, evidence, and review layout.
  - Avoid long explanatory status copy after submission.
- `/dashboard/listening`
  - Keep transcript and audio flow.
  - Remove topic AI content labels from product chrome where possible.
- `/dashboard/grammar`
  - Normalize CEFR chips and answer feedback to shared semantic tokens.
- `/dashboard/pronunciation`
  - Replace "lab" tone with record / compare / retry.
  - Keep score readable but avoid celebratory gauges as the main visual.
- `/dashboard/writing`
  - Replace "建议" with "改写", "最低项", "下一步".
  - Keep feedback structured and visible, not buried in cards.
- `/dashboard/exam`
  - Preserve IELTS preparation semantics.
  - Make scoring, rewrite, and next drill copy concrete.
- `/dashboard/learning-path`
  - Remove "Suggested next step" phrasing.
  - Present next lesson and route target as a simple sequence.
- `/dashboard/memory`
  - Clarify privacy and saved context without agent jargon.
- `/dashboard/leaderboard`
  - Keep as learning record, not social-game hype.
- `/dashboard/settings`, `/dashboard/profile`
  - Align forms, toggles, tabs, and danger zones with the same component rules.

## Shared Component TODO

- **Typography tokens**
  - Use system UI stack in `src/index.css` and `tailwind.config.js`.
  - Audit headings and controls for heavy/rounded AI SaaS feel.
- **Accent tokens**
  - Replace direct emerald/violet/purple visible accents with semantic tokens or primary.
  - Remove legacy global suppression once individual pages are migrated.
- **App shell**
  - Pick sidebar or workbook-tab navigation from selected concept.
  - Do not mix both as equal systems.
- **Learning shell**
  - Rename component comments and prop labels away from "cockpit/mission" where visible or future-facing.
  - Keep internal type names only if renaming would create unnecessary churn.
- **Skeleton/loading**
  - Keep lightweight route skeletons matching final layout.
  - Verify no full-screen black blocks on route/theme changes.
- **Forms**
  - Labels above inputs.
  - No placeholder-only labels.
  - Consistent primary/link colors.
- **Feedback**
  - Inline panels for wrong/retry/reveal/correct states.
  - Toasts only for save/copy/network events.
- **Copy**
  - Build a banned-word scan for visible UI: `智能|洞察|成长旅程|典型学习日|工作台|Suggested|建议|mission|cockpit`.
  - Keep allowed exceptions for legal text, AI content articles, internal tests, and domain terms.

## Implementation Phases

### VGUI-07A: Visual Target Lock

- Choose ImageGen direction.
- Extract tokens: background, text, muted, primary, border, row surface, danger/success/warning.
- Create a visual contract document with allowed copy and component model.

### VGUI-07B: Global Token And Copy Foundation

- Finish font stack and i18n copy cleanup.
- Fix obvious indentation/type issues in i18n.
- Replace public/auth emerald links and CTA accents with tokenized primary.
- Add or update copy tests where strings are asserted.

### VGUI-07C: Homepage And Auth Redesign

- Rebuild `/` from selected concept.
- Upgrade AuthShell, Login, Register, MagicLink, Onboarding.
- Capture desktop 1440 and mobile 390 screenshots in light/dark/system.

### VGUI-07D: Core Learning Flow

- Upgrade Today, Review, Practice as one connected flow.
- Verify first-wrong retry and reveal behavior again.
- Verify no answer leakage on first listening/choice error.

### VGUI-07E: Dashboard Modules

- Upgrade Chat, Vocabulary, Analytics.
- Upgrade Reading, Listening, Grammar, Pronunciation, Writing, Exam, Learning Path.
- Upgrade Memory, Leaderboard, Settings, Profile.

### VGUI-07F: Three-Pass Review And Release Gate

Pass 1, static:
- Route inventory checked.
- Banned copy scan reviewed.
- i18n parity checked.
- Direct color/font/style debt scan reviewed.

Pass 2, rendered:
- Desktop 1440x960 screenshots for every route.
- Mobile 390x844 screenshots for every route.
- Light/dark/system theme coverage.
- No horizontal overflow, text clipping, inaccessible contrast, or blank/black transitions.

Pass 3, functional:
- Registration/login/onboarding smoke.
- Today/review/practice flows.
- Choice first wrong, recovered, second wrong reveal.
- Listening first wrong, recovered, second wrong reveal.
- Writing quota/fallback and feedback state.
- Route switching stress and bad-token production smoke.

## Execution Note: Copy De-AI Pass

2026-06-18 update:

- Replaced visible slogan/explainer copy with task/state/result copy on Home, Auth, Practice, Chat, Writing, Reading, Listening, Grammar, Pronunciation, Exam, recap, leaderboard, placement, and upgrade surfaces.
- Reduced shared learning hero typography weight so dashboard pages no longer read like oversized SaaS hero sections.
- Replaced Chat's card-heavy empty state with a compact task list and renamed visible modes from diagnostic language to Ask / Practice / Review.
- Removed the visible `COACHING_POLICY` / Socratic wording from wrong-answer recovery chat handoff.
- Verified `npm run lint`, `npm run check:i18n`, `npm test -- --run`, `npm run build`, and `BASE_URL=http://127.0.0.1:5177 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-18/copy-deai-regression npm run test:learning-flow-regression`.
- Browser evidence: `product-audit-2026-06-18/copy-deai-regression/summary.json` reports 160 checks passed with screenshots across desktop/mobile and light/dark/system.

## Execution Note: Production Release

2026-06-18 update:

- Deployed production build `dpl_DLPLHsH3mfNGZ7Pk9vicZMiM5m1c` to `https://www.uuedu.online`.
- Verified `https://uuedu.online` redirects to the www production alias and the app shell returns 200.
- Ran `BASE_URL=https://www.uuedu.online npm run smoke:prod` with explicit Supabase env: 8 passed, 0 warned, 0 failed.
- Updated `scripts/prod-auth-flow.mjs` to accept the current onboarding final CTA and to treat lingering Today loading copy as blocked, then ran `AUTH_FLOW_ACCOUNTS=3 BASE_URL=https://www.uuedu.online AUTH_FLOW_OUT_DIR=product-audit-2026-06-18/prod-auth-flow-post-deploy-final npm run smoke:prod:auth-flow`.
- Production auth evidence: 3 synthetic accounts registered, completed onboarding, logged in again, opened Today/Practice/Review after loading settled, and reported 0 DB bootstrap 4xx/failed requests.

## Required Commands

```bash
npm run lint
npm run check:i18n
npm test -- --run
npm run build
LEARNING_FLOW_OUT_DIR=product-audit-2026-06-18/vgui-07-learning-flow npm run test:learning-flow-regression
BASE_URL=https://www.uuedu.online npm run smoke:prod
```

## Completion Criteria

- A selected ImageGen direction has been converted into shared tokens and components.
- Every route in `src/App.tsx` has at least one before/after screenshot at desktop and mobile.
- Every public/auth/dashboard/skill route has been reviewed 2-3 times: static, rendered, functional.
- All visible copy avoids the banned AI-feel terms unless justified as legal/domain content.
- Light/dark/system do not show black transition blocks or unreadable text.
- Practice and listening retry/reveal behavior still passes focused tests and browser flow.
- Checks pass: lint, i18n, tests, build, learning-flow regression, production smoke.
