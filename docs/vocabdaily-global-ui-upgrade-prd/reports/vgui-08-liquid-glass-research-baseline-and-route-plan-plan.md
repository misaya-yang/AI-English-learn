# VGUI-08 Liquid Glass Research Baseline And Route Plan

Date: 2026-06-20
Status: executed

## Objective

Reopen the historical global UI harness for the new Apple-inspired Liquid Glass full-site request. The output must be a runnable plan, not a chat-only roadmap or a small sampled UI patch.

## Scope

In scope:

- all routes in `src/App.tsx`
- all dashboard routes in `src/features/learning/routeRegistry.ts`
- shared glass primitives, shell navigation, mobile bottom nav, search, theme/language controls, account trigger, segmented controls, hover/press states, route reveal, skeletons, focus states, reduced motion, and reduced transparency
- validation and evidence gates for full-route completion

Out of scope:

- production deployment
- provider dashboard changes
- billing provider semantics
- database migrations
- secret access

## Execution Steps

1. Read `prd-phase-harness` Build mode instructions.
2. Inspect existing global UI harness.
3. Search current frontend guidance for Liquid Glass, `backdrop-filter`, reduced transparency, reduced motion, and animation performance.
4. Inventory route and component boundaries from current repo files.
5. Add VGUI-08 through VGUI-13 phase contracts.
6. Add VGUI-F008 through VGUI-F013 feature-oracle items.
7. Update source packet, phase manifest, loop state, progress log, handoff, continuity ledger, and next-window prompt.
8. Run `git diff --check`.
9. Run strict harness validation with quality score.

## Validation Gates

- `git diff --check`
- `python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-global-ui-upgrade-prd --strict --quality-score`

## Completion Rule

VGUI-08 is complete only when the new Liquid Glass objective is represented as a validated phase chain and the next executable phase is VGUI-09. It does not mean the full visual redesign is complete.
