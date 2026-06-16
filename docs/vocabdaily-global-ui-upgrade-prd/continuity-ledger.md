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

- Active phase: VGUI-05
- Active feature-oracle item: VGUI-F006
- Current decision: VGUI-05 passed with provider warning.
- Next action: Commit and push the branch; follow up only on external Supabase reachability if needed.

## Phase Evidence Ledger

| Phase | Status | Evidence | Downstream Impact |
| --- | --- | --- | --- |
| VGUI-00 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-00-baseline-ui-audit-and-inventory-report.md`; `product-audit-2026-06-17/global-ui/baseline/summary.json` | VGUI-01 may proceed with a capturable all-route baseline. |
| VGUI-01 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-01-design-tokens-and-app-shell-report.md`; `product-audit-2026-06-17/global-ui/vgui-01-theme/summary.json` | VGUI-02 may proceed with stabilized light-first tokens, aligned theme pre-paint behavior, explicit root backgrounds, and quiet skeletons. |
| VGUI-02 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-02-public-and-auth-surfaces-report.md`; `product-audit-2026-06-17/global-ui/vgui-02-public-auth/summary.json` | VGUI-03 may proceed. Public/auth surfaces preserve fail-closed billing and auth behavior. |
| VGUI-03 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-03-dashboard-core-learning-flow-report.md`; `product-audit-2026-06-17/global-ui/vgui-03-learning-flow-v3/summary.json` | VGUI-04 may proceed. Practice retry/reveal behavior is now covered by real browser interactions and core dashboard dark surfaces are non-black. |
| VGUI-04 | passed | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-04-skill-modules-and-utility-screens-report.md`; `product-audit-2026-06-17/global-ui/vgui-04-modules-v2/summary.json` | VGUI-05 may proceed. Specialist modules are in the extended regression matrix, old dark preferences migrate to light, and visible module accents use semantic tokens. |
| VGUI-05 | passed with provider warning | `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-05-regression-evidence-and-release-gate-report.md`; `product-audit-2026-06-17/global-ui/vgui-05-final-ui/summary.json`; `product-audit-2026-06-17/global-ui/vgui-05-final-learning-flow/summary.json` | No downstream PRD phases remain. Production deployment is live; Supabase reachability from this network remains an external warning. |

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
