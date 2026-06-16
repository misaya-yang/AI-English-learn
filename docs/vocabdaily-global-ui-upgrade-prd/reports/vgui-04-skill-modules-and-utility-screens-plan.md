# VGUI-04 Execution Plan

**Phase:** VGUI-04 Skill Modules And Utility Screens

**Date:** 2026-06-17

## Goal

Bring specialist modules and utility routes up to the same light-first learning workbench standard as the core dashboard, while fixing the visible dark-mode regression that made the public home page feel like a black SaaS template.

## Scope

- Reading, Listening, Grammar, Pronunciation, Writing, Exam, Learning Path, Leaderboard, Memory, Settings, and Profile.
- Shared dashboard surfaces used by those routes.
- Regression scripts needed to prove those routes in light, dark, and system themes.
- Theme preference migration so old stored dark values do not keep returning existing users to the rejected black/grey experience.

## Steps

1. Review module screenshots from the VGUI-03 regression set and search for hardcoded dark, emerald, text-white, and heavy shadow classes.
2. Add the missing specialist routes to `scripts/learning-flow-regression.mjs`.
3. Add theme-version seeding to the regression script so dark-mode screenshots remain explicit tests after theme migration.
4. Migrate visible module leftovers from emerald/white/dark hardcoding to semantic tokens.
5. Add a theme preference version migration in `index.html` and `ThemeContext` so old dark preferences reset to light once.
6. Run focused module tests, lint, i18n, build, and the extended learning-flow regression.
7. Inspect representative desktop and mobile screenshots before marking VGUI-F005 passing.

## Acceptance Criteria

- Extended learning-flow regression covers Exam, Learning Path, Memory, and Leaderboard in addition to the prior route set.
- Public home defaults to light after an old stored dark preference migration.
- Manual dark mode renders as readable low-light surfaces, not black blocks.
- Exam, Memory, Learning Path, Vocabulary, Pronunciation, Review, Analytics, and shared upgrade/coach surfaces no longer depend on visible emerald/white/dark hardcoding for product hierarchy.
- No lint, i18n, focused-test, or build failures.

