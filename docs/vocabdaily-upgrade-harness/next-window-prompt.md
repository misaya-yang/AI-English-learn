# VocabDaily Upgrade PRD Phase Harness Next Window Prompt

Use this prompt to start a fresh Codex, Claude Code, or Agent Skills-compatible window.

```text
Use $prd-phase-harness to continue the harness at `docs/vocabdaily-upgrade-harness`.

Target phase: VD-03 Product UI Redesign
Target phase file: `docs/vocabdaily-upgrade-harness/phase-03-product-ui-redesign.md`
Target feature-oracle item: VD-F004

Cold-start protocol:
1. Open `docs/vocabdaily-upgrade-harness/README.md`.
2. Open `docs/vocabdaily-upgrade-harness/phase-manifest.md`.
3. Open `docs/vocabdaily-upgrade-harness/loop-contract.json`.
4. Open `docs/vocabdaily-upgrade-harness/loop-state.json`.
5. Open `docs/vocabdaily-upgrade-harness/feature-oracle.json`.
6. Open `docs/vocabdaily-upgrade-harness/progress-log.md`.
7. Open `docs/vocabdaily-upgrade-harness/agent-handoff.md`.
8. Open `docs/vocabdaily-upgrade-harness/continuity-ledger.md`.
9. Open `docs/vocabdaily-upgrade-harness/reports/vd-01-registration-and-login-recovery-report.md`.
10. Open `docs/vocabdaily-upgrade-harness/reports/vd-02-dark-mode-repair-report.md`.
11. Open only the target phase file and its `PRIMARY_CONTEXT` before planning.

Execution rule:
- Work on exactly one phase and one feature-oracle item.
- Follow the loop cycle: observe, select, execute, verify, record, decide.
- Stay inside the phase edit boundaries.
- Run the required validation and runtime checks.
- Summarize code facts back into the source packet and continuity ledger before handoff.
- Update the phase report, progress log, handoff file, continuity ledger, and oracle evidence before claiming completion.
- VD-F002 is passing again: the prepared Supabase SQL was executed after user authorization and `AUTH_FLOW_ACCOUNTS=3 npm run smoke:prod:auth-flow` passed with both `functionalPassed` and `dbBootstrapPassed`.
- Continue VD-03 Product UI Redesign with full route inventory, non-AI copy, learning task hierarchy, and desktop/mobile light/dark/system checks.
- Do not work on IELTS Anki cards until VD-03 is passing or explicitly blocked/waived.
- Stop and document blockers instead of guessing when credentials, production systems, destructive commands, or out-of-scope edits are required.
```
