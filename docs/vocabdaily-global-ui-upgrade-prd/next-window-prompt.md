# VocabDaily Global UI Upgrade PRD Harness Next Window Prompt

Use this prompt to start a fresh Codex, Claude Code, or Agent Skills-compatible window.

```text
Use $prd-phase-harness to continue the harness at `docs/vocabdaily-global-ui-upgrade-prd`.

Target phase: VGUI-05
Target phase file: `docs/vocabdaily-global-ui-upgrade-prd/phase-05-regression-evidence-and-release-gate.md`
Target feature-oracle item: VGUI-F006

Cold-start protocol:
1. Open `docs/vocabdaily-global-ui-upgrade-prd/README.md`.
2. Open `docs/vocabdaily-global-ui-upgrade-prd/PRD.md`.
3. Open `docs/vocabdaily-global-ui-upgrade-prd/phase-manifest.md`.
4. Open `docs/vocabdaily-global-ui-upgrade-prd/loop-contract.json`.
5. Open `docs/vocabdaily-global-ui-upgrade-prd/loop-state.json`.
6. Open `docs/vocabdaily-global-ui-upgrade-prd/feature-oracle.json`.
7. Open `docs/vocabdaily-global-ui-upgrade-prd/progress-log.md`.
8. Open `docs/vocabdaily-global-ui-upgrade-prd/agent-handoff.md`.
9. Open `docs/vocabdaily-global-ui-upgrade-prd/continuity-ledger.md`.
10. Open only the target phase file and its `PRIMARY_CONTEXT` before planning.

Execution rule:
- Work on exactly one phase and one feature-oracle item.
- Follow the loop cycle: observe, select, execute, verify, record, decide.
- Stay inside the phase edit boundaries.
- Run the required validation and runtime checks.
- Summarize code facts back into the source packet and continuity ledger before handoff.
- Update the phase report, progress log, handoff file, continuity ledger, and oracle evidence before claiming completion.
- Stop and document blockers instead of guessing when credentials, production systems, destructive commands, or out-of-scope edits are required.
```
