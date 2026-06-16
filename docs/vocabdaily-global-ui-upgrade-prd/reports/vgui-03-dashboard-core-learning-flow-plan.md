# VGUI-03 Phase Plan

**Phase:** VGUI-03 Dashboard Core Learning Flow

**Date:** 2026-06-17

## Scope

Upgrade the core dashboard learning flow while preserving VGUI-01 and VGUI-02 contracts:

- Today, Review, Practice, Chat, Vocabulary, and Analytics must share the same learning-workbench hierarchy.
- Practice must preserve the retry/reveal state machine.
- First wrong answers must not reveal the correct answer.
- Retry-correct outcomes must be recorded as recovered, not first-try correct.
- Dashboard dark mode must stop reading as a black cockpit.

## Steps

1. Inspect Practice attempt state, dashboard shell, shared learning components, and core dashboard routes.
2. Keep the existing attempt-state helper and tests as the behavior source of truth.
3. Tighten dark-mode tokens and hardcoded dark UI fragments so stored dark/system preference no longer produces black surfaces.
4. Move Practice answer feedback and options to semantic token colors with readable inline panels.
5. Replace command palette and coach review rail hardcoded white/dark classes with shared surface tokens.
6. Extend `scripts/learning-flow-regression.mjs` with seeded browser interaction checks for wrong/retry/reveal behavior.
7. Run focused tests, lint, i18n, build, and learning-flow regression.
8. Write report, oracle evidence, progress log, source packet, continuity ledger, and handoff notes.

## Risks To Check

- Visual polish could accidentally weaken the retry/reveal learning contract.
- A seeded browser route test could pass while real local data behaves differently.
- A non-black dark theme could become low contrast if hardcoded `dark:text-*` classes remain.

## Acceptance Evidence Required

- Focused Vitest suite for Practice, Review, Analytics, Vocabulary, attempt state, and session recap.
- Lint, i18n, and production build.
- Learning-flow browser regression with route matrix and seeded wrong/retry/reveal interactions.
- Screenshots for desktop/mobile, light/dark/system route states.
