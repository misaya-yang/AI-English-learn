# VD-03 Product UI Redesign Plan

## Design Read

English learning product UI for daily learners, not a marketing site or AI cockpit. The visual direction is a calm, practical learning workspace: plain copy, task-first hierarchy, low decoration, readable light/dark surfaces, and dense enough information for repeated study.

## Route Inventory

- Public: `/`, `/login`, `/register`, `/pricing`, `/word-of-the-day`.
- Auth-adjacent: `/onboarding`, `/magic-link`, `/auth/callback`.
- Core dashboard: `/dashboard/today`, `/dashboard/review`, `/dashboard/practice`, `/dashboard/chat`, `/dashboard/analytics`.
- Learning modules: `/dashboard/reading`, `/dashboard/listening`, `/dashboard/grammar`, `/dashboard/pronunciation`, `/dashboard/writing`, `/dashboard/vocabulary`, `/dashboard/exam`, `/dashboard/learning-path`.
- Account/tools: `/dashboard/memory`, `/dashboard/leaderboard`, `/dashboard/profile`, `/dashboard/settings`.

## Current Findings

- Shared copy and component naming still expose an AI-template mental model: `LearningCockpitShell`, cockpit comments, `premium-*` classes, hero framing, and abstract mission language.
- Dashboard navigation is too visually heavy for a learning task. It has repeated bordered cards, square icon boxes, and explanatory microcopy competing with the current exercise.
- Today page still has nested panels in the main word surface and right rail. The learner has to parse too many boxes before acting.
- Several pages use generic analytics/coaching/product words where concrete learner copy is enough.
- Existing regression scripts already cover required desktop/mobile and route checks. They should be extended or reused rather than replaced.

## Implementation Slices

1. Shared learning shell and navigation
   - Rename visible/test-facing cockpit language to learning session language while preserving public component exports if needed.
   - Reduce sidebar visual weight, keep active route and daily progress clear, and remove extra boxed hierarchy.
   - Make dashboard route descriptions shorter and learner-facing.

2. Today, Review, Practice primary flows
   - Keep the current retry/reveal functionality intact.
   - Make the current task, why it matters, feedback, and next action the dominant hierarchy.
   - Replace nested card stacks with section dividers, compact rails, and inline feedback panels.

3. Dashboard/module consistency pass
   - Normalize page headers, empty states, action bars, and rail cards across chat, analytics, vocabulary, reading, listening, grammar, pronunciation, writing, profile, and settings.
   - Remove awkward copy and reduce decorative "premium/glow/hero" styling where visible.

4. Regression and evidence
   - Capture screenshots at desktop `1440x960` and mobile `390x844`.
   - Run light/dark/system route checks.
   - Record copy audit and route inventory in `vd-03-product-ui-redesign-report.md`.

## Validation Gates

- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- `npm test -- --run`
- `npm run test:learning-flow-regression` with `LEARNING_FLOW_OUT_DIR=product-audit-2026-06-17/vd-03-learning-flow`
- Route screenshots and summaries for every inventory route.

## Boundaries

- Do not change auth provider behavior, Supabase migrations, billing fail-closed semantics, or add a new UI library.
- Do not start VD-04 IELTS Anki cards until VD-03 is passing.
- Do not expose synthetic account credentials or provider tokens in reports.
