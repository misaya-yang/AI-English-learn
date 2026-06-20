# VocabDaily Global UI Upgrade PRD Harness Continuity Ledger

**Created:** 2026-06-17

**Harness Folder:** `docs/vocabdaily-global-ui-upgrade-prd`

---

## Purpose

This file preserves cross-phase continuity for long-running agents. Treat it as the bridge between product intent, code facts, execution evidence, and the next agent's starting point.

## Phase Continuity Chain

| Phase | Feature | Depends On | Unlocks | Handoff Boundary | Required Writeback |
| --- | --- | --- | --- | --- | --- |
| VGUI-00 | VGUI-F001 | none | VGUI-01 | phase report plus handoff notes | source-packet and continuity-ledger code facts |
| VGUI-01 | VGUI-F002 | VGUI-00 | VGUI-02 | phase report plus handoff notes | source-packet and continuity-ledger code facts |
| VGUI-02 | VGUI-F003 | VGUI-01 | VGUI-03 | phase report plus handoff notes | source-packet and continuity-ledger code facts |
| VGUI-03 | VGUI-F004 | VGUI-02 | VGUI-04 | phase report plus handoff notes | source-packet and continuity-ledger code facts |
| VGUI-04 | VGUI-F005 | VGUI-03 | VGUI-05 | phase report plus handoff notes | source-packet and continuity-ledger code facts |
| VGUI-05 | VGUI-F006 | VGUI-04 | none | phase report plus handoff notes | source-packet and continuity-ledger code facts |
| VGUI-08 | VGUI-F008 | VGUI-05 | VGUI-09 | Liquid Glass research, route/effect plan, and reopened oracle chain | source-packet, phase-manifest, oracle, loop state, continuity-ledger code facts |
| VGUI-09 | VGUI-F009 | VGUI-08 | VGUI-10 | shared tokens, primitives, shell, motion, and reduced-preference proof | source-packet and continuity-ledger code facts |
| VGUI-10 | VGUI-F010 | VGUI-09 | VGUI-11 | public/auth/legal/pricing route proof | source-packet and continuity-ledger code facts |
| VGUI-11 | VGUI-F011 | VGUI-10 | VGUI-12 | core dashboard learning route and state proof | source-packet and continuity-ledger code facts |
| VGUI-12 | VGUI-F012 | VGUI-11 | VGUI-13 | specialist/account route proof | source-packet and continuity-ledger code facts |
| VGUI-13 | VGUI-F013 | VGUI-12 | none | full regression, accessibility, performance, and release proof | source-packet and continuity-ledger code facts |

## Interface Boundary Ledger

| Boundary | Current Fact | Source | Last Verified | Owner Phase |
| --- | --- | --- | --- | --- |
| Code entrypoints | Current entrypoints include `src/index.css`, `index.html`, `src/App.tsx`, `src/layouts/DashboardLayout.tsx`, `src/features/learning/components/LearningWorkspace.tsx`, `src/components/DashboardSkeleton.tsx`, `src/pages/**`, `src/features/marketing/AuthShell.tsx`, and regression scripts. | `source-packet.md` | 2026-06-17 | VGUI-00 |
| Edit boundary | UI phases may edit token, shell, route, shared learning component, and regression-script paths named in the phase contract. Provider, billing, database, and deployment changes require approval. | `source-packet.md` | 2026-06-17 | VGUI-00 |
| Validation boundary | Baseline commands are `npm run lint`, `npm run check:i18n`, `npm run build`, `npm test -- --run`, plus UI and learning-flow regression when browser evidence is required. | `source-packet.md` | 2026-06-17 | VGUI-00 |
| Handoff boundary | Do not unlock a dependent phase until report evidence, oracle evidence, progress log, and this ledger are updated. | phase report | 2026-06-17 | VGUI-00 |

## Code Summary Writeback Rules

- After inspecting code, summarize discovered files, services, routes, schemas, tests, and runtime commands back into `source-packet.md`.
- Record cross-phase interface decisions here before handing off, especially API contracts, shared state, data shape, UI route assumptions, eval criteria, and rollback boundaries.
- If a phase changes a boundary another phase depends on, update that dependent phase's report handoff and the relevant oracle item notes.
- If a second agent cannot identify the next concrete action from this file, `progress-log.md`, and `agent-handoff.md`, stop and write a blocker instead of guessing.

## Current Continuity Status

- Active phase: VGUI-13
- Active feature-oracle item: VGUI-F013
- Current decision: VGUI-12 passed with specialist/account route evidence, focused tests, lint, i18n, build, and source/continuity writeback.
- Next action: Execute VGUI-13 release gate, commit, push, deploy, and online subagent UI review.

## Phase Evidence Ledger

| Phase | Status | Evidence | Downstream Impact |
| --- | --- | --- | --- |
| VGUI-00 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-00-baseline-ui-audit-and-inventory-report.md`; `product-audit-2026-06-17/global-ui/baseline/summary.json` | VGUI-01 may proceed with a capturable all-route baseline. |
| VGUI-01 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-01-design-tokens-and-app-shell-report.md`; `product-audit-2026-06-17/global-ui/vgui-01-theme/summary.json` | VGUI-02 may proceed with stabilized light-first tokens, aligned theme pre-paint behavior, explicit root backgrounds, and quiet skeletons. |
| VGUI-02 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-02-public-and-auth-surfaces-report.md`; `product-audit-2026-06-17/global-ui/vgui-02-public-auth/summary.json` | VGUI-03 may proceed. Public/auth surfaces preserve fail-closed billing and auth behavior. |
| VGUI-03 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-03-dashboard-core-learning-flow-report.md`; `product-audit-2026-06-17/global-ui/vgui-03-learning-flow-v3/summary.json` | VGUI-04 may proceed. Practice retry/reveal behavior is now covered by real browser interactions and core dashboard dark surfaces are non-black. |
| VGUI-04 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-04-skill-modules-and-utility-screens-report.md`; `product-audit-2026-06-17/global-ui/vgui-04-modules-v2/summary.json` | VGUI-05 may proceed. Specialist modules are in the extended regression matrix, old dark preferences migrate to light, and visible module accents use semantic tokens. |
| VGUI-05 | passed with provider warning | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-05-regression-evidence-and-release-gate-report.md`; `product-audit-2026-06-17/global-ui/vgui-05-final-ui/summary.json`; `product-audit-2026-06-17/global-ui/vgui-05-final-learning-flow/summary.json` | No downstream PRD phases remain. Production deployment is live; Supabase reachability from this network remains an external warning. |
| VGUI-08 | planned/executed in current session | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-08-liquid-glass-research-baseline-and-route-plan-report.md` | VGUI-09 may proceed after strict harness validation records clean output. VGUI-08 does not prove visual completion; it creates the new completion contract. |
| VGUI-09 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-09-liquid-glass-tokens-motion-and-shell-report.md`; `product-audit-2026-06-20/liquid-glass/vgui-09-shell/summary.json` | VGUI-10 may proceed. Shared glass primitives, shell controls, reduced motion, reduced transparency, and positioning invariants have evidence. |
| VGUI-10 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-10-liquid-glass-public-auth-and-entry-surfaces-report.md`; `product-audit-2026-06-20/liquid-glass/vgui-10-public-auth/summary.json`; `product-audit-2026-06-20/liquid-glass/vgui-10-ui-regression/summary.json` | VGUI-11 may proceed. Public/auth/legal/sample/pricing/daily-word routes have shared glass navigation/control evidence while form/legal/pricing/word bodies remain solid. |
| VGUI-11 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-11-liquid-glass-dashboard-core-learning-report.md`; `product-audit-2026-06-20/liquid-glass/vgui-11-dashboard-core/summary.json`; `product-audit-2026-06-20/liquid-glass/vgui-11-learning-flow/summary.json` | VGUI-12 may proceed. Core dashboard routes have shared glass control evidence while workbook, review, chat, vocabulary, and analytics content remains solid. |
| VGUI-12 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-12-liquid-glass-specialist-modules-and-account-report.md`; `product-audit-2026-06-21/liquid-glass/vgui-12-specialist-account/summary.json` | VGUI-13 may proceed. Specialist/account routes have shared glass control evidence while long-form, feedback, form, and profile data remains solid. |
| VGUI-13 | local release gate passed, production pending | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-13-liquid-glass-regression-accessibility-performance-release-report.md`; `product-audit-2026-06-21/liquid-glass/vgui-13-ui-regression-final/summary.json`; `product-audit-2026-06-21/liquid-glass/vgui-13-learning-flow-final/summary.json`; `product-audit-2026-06-21/liquid-glass/vgui-13-reduced-preferences-final/summary.json`; `product-audit-2026-06-21/liquid-glass/vgui-13-performance-neutral-graphite/summary.json` | Commit, push, deploy, and online subagent review remain required before VGUI-F013 can pass. The accepted dark direction is neutral graphite/charcoal, not washed blue-gray. |

## VGUI-01 Code Facts

- `index.html` owns pre-paint theme resolution for `vocabdaily-theme`; it now validates stored values, sets `color-scheme`, and uses light/dark `theme-color` metadata.
- `src/contexts/ThemeContext.tsx` uses the same `vocabdaily-theme` storage key, normalizes invalid values, and writes `documentElement.style.colorScheme`.
- `src/index.css` defines light-first product tokens and a non-black dusk dark mode; `html` and `#root` now have explicit background color to avoid transparent root flashes.
- `src/components/DashboardSkeleton.tsx` keeps dashboard and public fallbacks lightweight and learning-specific.
- `src/pages/Home.tsx` is the accepted public-home direction for VGUI-02: concrete "今天练什么" copy, light-first layout, and no AI-workbench hero wording.

## VGUI-02 Code Facts

- `src/features/marketing/AuthShell.tsx` now uses icon list items for auth reassurance copy instead of decorative dot-prefix text.
- `src/pages/PricingPage.tsx` authenticated CTA now uses "进入今日任务" / "Go to Today"; checkout remains fail-closed while billing providers are unavailable.
- `src/pages/WordOfTheDayPage.tsx` and `src/pages/SampleLessonPage.tsx` use the shared `BrandMark`.
- VGUI-03 should not alter public/auth semantics unless a dashboard-core dependency proves it necessary.

## VGUI-03 Code Facts

- `src/features/practice/attemptState.ts` remains the Practice behavior contract: first wrong is retrying, retry-correct is recovered, second wrong or reveal is needs-review.
- `src/pages/dashboard/PracticePage.tsx` now uses semantic inline feedback classes and no longer depends on hardcoded green/red answer cards.
- `scripts/learning-flow-regression.mjs` now seeds a local regression word book and verifies Practice and listening retry/reveal behavior in browser.
- `src/index.css` dark tokens now produce a low-light grey-blue study surface, not a near-black dashboard.
- `src/components/SearchPalette.tsx` and `src/features/coach/CoachReviewRail.tsx` no longer hardcode white-on-dark surfaces.
- VGUI-04 should treat these token and feedback patterns as the module cleanup baseline.

## VGUI-04 Code Facts

- `index.html` and `src/contexts/ThemeContext.tsx` now share theme version `2026-06-workbench-light`; stale stored non-light values migrate once back to light.
- `scripts/learning-flow-regression.mjs` now covers Exam, Learning Path, Memory, and Leaderboard and seeds `vocabdaily-theme-version` for explicit dark-mode testing.
- Exam route components use semantic primary, accent-exam, success, warning, and danger tokens instead of emerald as a product accent.
- Memory, Vocabulary, Analytics, Review, Pronunciation, Chat, UpgradePrompt, BrandMark, CoachReviewRail, and DashboardLayout were cleaned for visible token consistency.
- VGUI-05 should not treat dark screenshots from earlier VGUI-04 runs as valid unless they come from `vgui-04-modules-v2` or later, because the first VGUI-04 run did not seed the theme version.

## VGUI-05 Code Facts

- Final local release gate passed: lint, i18n, build, and 103 Vitest files / 810 tests.
- Final UI regression passed with 54 route checks, 10 scenario checks, 0 failures, and desktop/mobile contact sheets.
- Final learning-flow regression passed with 142 checks and 0 failures.
- Vercel production deployment `dpl_AmbxY5xomBkp4i3thgGBwKBFW6Vg` is ready and aliased to `https://www.uuedu.online`.
- Production bad-token smoke passed: stale Supabase SDK token was cleared, no refresh-token requests were sent, old dark preference migrated to light, and the app redirected to `/login`.
- `npm run smoke:prod` still cannot reach Supabase from this network; the project host resolves to `198.18.0.17` and TLS fails, matching the user's earlier `ERR_CONNECTION_CLOSED` symptom.

## VGUI-08 Liquid Glass Reopen Facts

- The 2026-06-20 user objective requires all pages and all effects, not a sampled subset or a small style patch.
- Route scope is 11 public/auth/legal/entry routes and 17 authenticated dashboard routes from `src/App.tsx`.
- Web Liquid Glass is an approximation only. The implementation boundary is CSS tokens/utilities, `backdrop-filter`, `@supports`, dark-mode tokens, reduced-transparency fallback, reduced-motion fallback, existing `framer-motion`, and no new design-system dependency.
- Current worktree includes a first verified Liquid Glass slice: `GlassSurface`, Button `glass`/`glassPrimary`, Liquid Glass CSS utilities, public/auth selected routes, dashboard shell, bottom nav, theme/language controls.
- First verification found and fixed an important invariant: glass CSS cannot force `position: relative` on elements already using Tailwind `fixed` or `sticky`.
- VGUI-09 owns shared tokens, primitives, shell, and motion. VGUI-10 through VGUI-12 own route families. VGUI-13 owns full proof.

## VGUI-09 Liquid Glass Shell Facts

- Focused shell/component tests passed: 7 files / 17 tests.
- `npm run lint`, `npm run check:i18n`, and `npm run build` passed.
- Custom shell browser matrix passed 36 checks across `/`, `/pricing`, `/login`, `/dashboard/today`, `/dashboard/chat`, and `/dashboard/settings`.
- Browser modes included normal, `prefers-reduced-motion: reduce`, and `prefers-reduced-transparency: reduce`.
- Reduced transparency was emulated through Chromium CDP and verified that sampled glass layers compute `backdrop-filter: none`.
- VGUI-10 inherits shared shell primitives and must now cover every public/auth route body, not only the shell sample.

## VGUI-10 Liquid Glass Public/Auth Facts

- Focused public/auth tests passed: 7 files / 40 tests.
- `npm run lint`, `npm run check:i18n`, and `npm run build` passed after the public/auth updates.
- Custom VGUI-10 matrix passed 44/44 checks across 11 entry routes, desktop/mobile, and light/dark themes.
- Project UI regression also passed 54/54 route checks and 10/10 scenarios.
- `src/pages/WordOfTheDayPage.tsx` and `src/pages/LegalPage.tsx` now use shared `GlassSurface` floating headers instead of route-local `backdrop-blur` headers.
- `src/pages/PricingPage.tsx` uses semantic primary and warning tokens for Pro/fail-closed accents; checkout remains fail-closed when billing is unavailable.
- `src/pages/auth/OnboardingPage.tsx` now waits for `isLoading` before redirecting unauthenticated users, preventing valid local sessions from being sent to login during auth initialization.
- VGUI-11 should preserve this rule: route bodies with learning content stay solid; glass remains navigation/control only.

## VGUI-11 Liquid Glass Dashboard Core Facts

- Required focused dashboard tests passed: 8 files / 51 tests.
- Full `npm test` passed: 110 files / 840 tests.
- `npm run lint`, `npm run check:i18n`, and `npm run build` passed after the dashboard core updates.
- Learning-flow regression passed 160 checks at `product-audit-2026-06-20/liquid-glass/vgui-11-learning-flow/summary.json`.
- Custom dashboard core matrix passed 24/24 checks at `product-audit-2026-06-20/liquid-glass/vgui-11-dashboard-core/summary.json`, covering `/dashboard/today`, `/dashboard/review`, `/dashboard/practice`, `/dashboard/chat`, `/dashboard/vocabulary`, and `/dashboard/analytics` across desktop/mobile and light/dark.
- `src/index.css`, `StudyWorkbook`, `LearningWorkspace`, `SessionRecapCard`, and `CoachReviewRail` now keep workbook/review/rail surfaces solid with a calmer Apple-like radius and border rhythm.
- `PracticePage`, `ReviewPage`, `VocabularyBankPage`, `AnalyticsPage`, `ChatPage`, and chat support components now use shared glass only for route controls, filters, tabs, composer tools, and lightweight affordances.
- `ChatComposer` mobile quick prompts now wrap into full-width controls at 390px instead of clipping a horizontal prompt row.
- VGUI-12 inherits this invariant: specialist/account content remains solid; glass is reserved for shell, navigation, segmented controls, filters, and small action controls.

## VGUI-12 Liquid Glass Specialist/Account Facts

- Required module/account tests passed: 6 files / 19 tests.
- `npm run lint`, `npm run check:i18n`, and `npm run build` passed after the specialist/account updates.
- Custom specialist/account matrix passed 44/44 checks at `product-audit-2026-06-21/liquid-glass/vgui-12-specialist-account/summary.json`, covering `/dashboard/reading`, `/dashboard/listening`, `/dashboard/grammar`, `/dashboard/pronunciation`, `/dashboard/writing`, `/dashboard/exam`, `/dashboard/learning-path`, `/dashboard/memory`, `/dashboard/leaderboard`, `/dashboard/settings`, and `/dashboard/profile` across desktop/mobile and light/dark.
- Route controls, tabs, filters, select triggers, and small action rows now use shared glass controls where appropriate.
- Reading passages, listening transcripts, grammar explanations, writing bodies/feedback, exam prompts/feedback, memory details, settings forms, and profile/account data remain solid/readable.
- VGUI-13 inherits all VGUI-08 through VGUI-12 evidence and must now prove full-route regression, reduced preferences, performance, deployment, production smoke, and online subagent review.

## VGUI-13 Local Release Gate Facts

- The user rejected the first VGUI-13 dark visual result as too washed and too bright. The accepted local direction is direct neutral graphite/charcoal dark mode.
- `src/index.css` dark tokens now use a darker neutral app background and solid card surfaces instead of a blue-gray foggy cast.
- `src/themeContrast.test.ts` now guards the darker neutral range while still rejecting pure black.
- `scripts/learning-flow-regression.mjs` waits for loaded IELTS vocabulary content and uses the updated dark-background threshold.
- Reduced-transparency dark selectors were tightened and nested blur was removed for controls inside glass bars/panels.
- Final local checks passed: lint, i18n, 110 files / 840 tests, build, UI regression 54 route checks plus 10 scenarios, learning-flow 160 checks, reduced-preference 10 checks, and performance 8 checks with `stackedBlurredCount: 0`.
- VGUI-F013 remains incomplete until production deployment, production smoke/UI evidence, and online subagent review across every route family are complete.
