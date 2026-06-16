# VLE-05 Learning Workbench UI System Report

## Phase Summary

- PHASE_ID: VLE-05
- Phase file: `docs/vocabdaily-learning-ecosystem-prd/phase-05-learning-workbench-ui-system.md`
- Executor: Codex
- Date: 2026-06-16
- Status: passed

## Scope Executed

- Planned work: Verify the Modern Learning Workbench UI contract across dashboard routes, themes, viewports, route fallbacks, and learning flows.
- Actual work: Audited the current light-first tokens, theme pre-paint, dashboard skeleton, `LearningWorkspace` semantic accents, dashboard routes, and regression scripts. Updated `scripts/ui-regression.mjs` so it follows current visible UI labels and creates desktop/mobile contact sheets.
- Scope expansions: The UI regression answer helper was changed from old `rounded-xl` class matching to semantic option/input interaction. This keeps the test aligned with the product instead of the old visual implementation.
- Scope not executed: No production deployment, no billing behavior change, no database migration, no AI prompt change.

## Evidence Inventory

| Evidence | Path or command | Result |
| --- | --- | --- |
| Plan | `docs/vocabdaily-learning-ecosystem-prd/reports/vle-05-learning-workbench-ui-system-plan.md` | Created |
| Focused dashboard tests | `npm test -- --run src/components/DashboardSkeleton.test.tsx src/features/learning/components src/pages/dashboard` | 9 files, 40 tests passed |
| Lint | `npm run lint` | Passed |
| i18n | `npm run check:i18n` | Passed |
| Build | `npm run build` | Passed |
| UI regression | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression/summary.json` | 54 route checks, 10 scenarios, 0 failed |
| Desktop contact sheet | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression/contact-sheet-desktop.html` | Created |
| Mobile contact sheet | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression/contact-sheet-mobile.html` | Created |
| Learning-flow regression | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/learning-flow/summary.json` | 114 checks passed, 0 failed |
| Evidence index | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/evidence-index.md` | Created |

## Implementation Notes

- `scripts/ui-regression.mjs` now accepts the current route-flow labels:
  - Reading: "开始这篇" / "Start this passage"
  - Listening: "开始这段" / "Start this clip"
  - Grammar: "开始这组" / "Start this set"
- The scenario answer helper now clicks visible answer options by semantic text patterns such as `True`, `False`, `Not Given`, and `A. ...`, then fills visible text inputs. It no longer depends on old `rounded-xl` card classes.
- The regression script writes `contact-sheet-desktop.html` and `contact-sheet-mobile.html`, each linking the current screenshot set for route and learning-flow visual review.
- Existing workbench UI contracts were verified:
  - light-first theme initialization with a pre-paint class
  - lightweight dashboard skeleton instead of full-screen black blocks
  - dark mode surfaces that avoid near-black page fills
  - semantic learning accents in `LearningWorkspace`
  - dashboard routes with current task-oriented copy

## Validation Results

| Gate | Command or check | Result | Notes |
| --- | --- | --- | --- |
| Lint | `npm run lint` | Passed | No ESLint errors |
| i18n | `npm run check:i18n` | Passed | Key parity check passed |
| Focused dashboard tests | `npm test -- --run src/components/DashboardSkeleton.test.tsx src/features/learning/components src/pages/dashboard` | Passed | 9 files, 40 tests |
| Build | `npm run build` | Passed | Production bundle completed; Browserslist data warning only |
| UI regression | `BASE_URL=http://127.0.0.1:4173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/ui-regression npm run test:ui-regression` | Passed | 54 route checks and 10 desktop/mobile scenarios |
| Learning-flow regression | `BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/ui-system/learning-flow npm run test:learning-flow-regression` | Passed | 114 checks |

## Acceptance Gate Results

| Acceptance gate | Result | Evidence |
| --- | --- | --- |
| Dashboard routes follow the shared learning workbench contract | Passed | UI regression screenshots and contact sheets |
| No route first viewport reads like a generic AI cockpit | Passed | Contact sheets and route body samples in `ui-regression/summary.json` |
| No full-screen black fallback or blank body | Passed | UI regression route checks; learning-flow route/theme checks |
| Desktop and mobile have no horizontal overflow | Passed | `horizontalOverflowPx` is 0 across passing route and scenario checks |
| Light, dark, and system themes remain readable during route switching | Passed | 114-check learning-flow regression and screenshots |
| Practice retry/reveal behavior remains intact after UI convergence | Passed | Learning-flow regression attempt checks |
| Reading, listening, grammar, writing, and pronunciation complete into recap states | Passed | UI regression scenario checks |

## Compliance Gate Results

| Compliance gate | Result | Evidence |
| --- | --- | --- |
| Icon-only and compact controls remain accessible enough for scripted role queries | Passed | UI regression uses role selectors for primary buttons |
| Status uses text, not color alone | Passed | Recap body samples show textual score/status labels |
| Chinese mode avoids accidental legacy English labels in core flows | Passed | Route and scenario body samples use Chinese primary labels with intentional English learning content |
| Dark mode avoids full-page black blocks | Passed | Learning-flow dark screenshots and checks |
| Reduced motion and route fallback remain non-blocking | Passed | Learning-flow route switch checks and dashboard skeleton tests |

## Rollback and Recovery

- Rollback path: Revert `scripts/ui-regression.mjs`, VLE-05 report files, and VLE-05 audit artifacts.
- Feature flags or toggles: None added.
- Data cleanup: None.
- Remaining release risk: UI evidence is local preview based. VLE-06 still needs release-level production smoke, including the previously reported Supabase refresh-token storm scenario.

## User Waivers

- Waived gate: None.
- Dependent phases may proceed: yes

## Next Phase Handoff

- Dependency unlocked: VLE-06 Regression Eval And Release.
- Important files changed: `scripts/ui-regression.mjs`, VLE-05 reports, and VLE-05 audit evidence.
- Known blockers: None for VLE-06 start.
- Recommended next phase: Run the full release readiness suite, production smoke, bad-token/auth refresh storm checks, git commit/push, and Vercel deployment only after release gates pass.
