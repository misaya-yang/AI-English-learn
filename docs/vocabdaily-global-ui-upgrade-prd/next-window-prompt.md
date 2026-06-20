# VocabDaily Global UI Upgrade PRD Harness Next Window Prompt

Use this prompt to start a fresh Codex, Claude Code, or Agent Skills-compatible window.

```text
Use $prd-phase-harness to continue the harness at `docs/vocabdaily-global-ui-upgrade-prd`.

Target phase: VGUI-13 (completed; resume only for fresh user acceptance feedback)
Target phase file: `docs/vocabdaily-global-ui-upgrade-prd/phase-13-liquid-glass-regression-accessibility-performance-release.md`
Target feature-oracle item: VGUI-F013

Cold-start protocol:
1. Open `docs/vocabdaily-global-ui-upgrade-prd/README.md`.
2. Open `docs/vocabdaily-global-ui-upgrade-prd/phase-manifest.md`.
3. Open `docs/vocabdaily-global-ui-upgrade-prd/loop-contract.json`.
4. Open `docs/vocabdaily-global-ui-upgrade-prd/loop-state.json`.
5. Open `docs/vocabdaily-global-ui-upgrade-prd/feature-oracle.json`.
6. Open `docs/vocabdaily-global-ui-upgrade-prd/progress-log.md`.
7. Open `docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md`.
8. Open `docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md`.
9. Open `docs/vocabdaily-global-ui-upgrade-prd/source-packet.md`.
10. Open only the target phase file and its PRIMARY_CONTEXT before planning.

Execution rule:
- Work on exactly one phase and one feature-oracle item.
- Treat VGUI-00 through VGUI-07 as historical baseline only.
- Treat VGUI-08, VGUI-09, VGUI-10, VGUI-11, and VGUI-12 as passed evidence for the 2026-06-20 Liquid Glass chain.
- Follow the loop cycle: observe, select, execute, verify, record, decide.
- Stay inside the VGUI-13 edit boundaries.
- Treat this phase as release/evaluation first. Repair only verified regressions caused by VGUI-09 through VGUI-12.
- Preserve all public/auth/dashboard/specialist/account behavior and keep dense content on solid readable surfaces.
- Use the shared glass system only for dashboard navigation, shell controls, search/account/language/theme controls, and lightweight control affordances.
- VGUI-13 validation has passed: lint, i18n, 111 files / 843 tests, build, local UI regression 54 route checks plus 10 scenarios, learning-flow 160 checks, reduced-preference 10 checks, performance 8 checks with no stacked glass blur, production UI regression 54 route checks plus 10 scenarios, and production dark/touch proof.
- Preserve the accepted dark direction: neutral graphite/charcoal, not washed blue-gray or foggy bright glass.
- Final deployment `dpl_8aMLaKFPAA5a5JzQ4yaEFhcNXYJ6` is aliased to `https://www.uuedu.online`; online subagent UI review passed across every route family.
- No VGUI harness phase remains open. Continue only if the user gives fresh acceptance feedback or asks for another release.
- Summarize code facts back into the source packet and continuity ledger before handoff.
- Update the phase report, progress log, handoff file, continuity ledger, loop state, and oracle evidence before claiming completion.
- Stop and document blockers instead of guessing when credentials, production systems, destructive commands, new dependencies, or out-of-scope edits are required.
```
