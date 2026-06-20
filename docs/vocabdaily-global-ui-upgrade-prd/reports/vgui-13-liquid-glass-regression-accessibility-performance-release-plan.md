# VGUI-13 Liquid Glass Regression Accessibility Performance Release Plan

Date: 2026-06-21
Status: planned
Feature oracle item: VGUI-F013

## Objective

Prove the full Apple-inspired Liquid Glass redesign across every route, effect layer, accessibility preference, performance constraint, and release gate. Then, because the user explicitly requested it, commit, push, deploy, and run production UI review with subagents before final user acceptance.

## Plan

| Requirement / gate | Evidence |
| --- | --- |
| Static/unit/build readiness | `npm run lint`, `npm run check:i18n`, `npm test`, `npm run build` |
| Full route visual regression | `npm run test:ui-regression` against local dev server with a fresh output directory |
| Learning correctness | `npm run test:learning-flow-regression` against local dev server |
| Reduced preference proof | Custom Playwright check for reduced motion and reduced transparency on representative public/auth/dashboard routes |
| Performance proof | Local Playwright navigation/performance snapshot for `/` and `/dashboard/today` desktop/mobile |
| Harness integrity | `git diff --check` and strict PRD harness validator |
| Release | Commit, push, deploy to production, then production smoke |
| Online UI review | Spawn subagents to review production route families and collect/fix findings |

## Boundaries

- Deployment is approved by the user's current request.
- Do not change production provider dashboards, DNS, billing behavior, database schema, or production data.
- Repair only verified release-gate or production UI regressions.

## Required Outputs

- VGUI-13 report
- Full local regression evidence
- Production deployment evidence
- Online subagent review evidence
- Oracle VGUI-F013 update
- Source packet and continuity ledger writeback
