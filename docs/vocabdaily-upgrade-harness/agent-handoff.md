# VocabDaily Upgrade PRD Phase Harness Agent Handoff

**Created:** 2026-06-17

**Harness Folder:** `docs/vocabdaily-upgrade-harness`

## Planner Notes

- Five phases are fixed in `phase-manifest.md`.
- Product Design brief is already known from the user: English learning app, practical learning workbench, no AI-template copy, no glowy dark mode, desktop and mobile validation.
- Product Design user-context preflight found no saved context file, so current screenshots, production pages, and repo source are the source of truth.
- Next target phase is `VD-02 Dark Mode Repair`.

## Generator Notes

- Do not use Chrome unless the user explicitly asks for it. Use the in-app browser or CLI/browser test contexts.
- VD-00 and VD-01 are complete and should not be reworked unless smoke or auth UI checks regress.
- For VD-02, fix only dark mode, loading states, route-transition flashes, and readability.
- Likely files for VD-02 include `src/index.css`, shared layout/theme components, route fallback/loading components, public page shells, dashboard shells, and UI regression scripts.
- Keep test account data synthetic. Do not expose tokens.

## Evaluator Notes

- Reject VD-02 if evidence only covers mobile or only covers one public page.
- Reject VD-02 if dark mode remains large pure-black surfaces, glowy/neon, low-contrast, or route changes still flash black blocks.
- Require desktop `1440x960`, mobile `390x844`, and light/dark/system checks.

## Next Handoff

- Active role: generator/evaluator
- Active phase: VD-02
- Active feature-oracle item: VD-F003
- Required evidence before unlock: theme/token report, desktop/mobile screenshots, route switching check, repo checks, oracle update, continuity ledger update, and report `reports/vd-02-dark-mode-repair-report.md`.
