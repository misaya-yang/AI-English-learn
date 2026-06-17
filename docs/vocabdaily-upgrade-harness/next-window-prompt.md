# VocabDaily Upgrade PRD Phase Harness Next Window Prompt

Use this prompt to start a fresh Codex, Claude Code, or Agent Skills-compatible window.

```text
Use $prd-phase-harness to continue the harness at `docs/vocabdaily-upgrade-harness`.

Target phase: VD-01 revisit
Target phase file: `docs/vocabdaily-upgrade-harness/phase-01-registration-and-login-recovery.md`
Target feature-oracle item: VD-F002

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
10. Open `supabase/migrations/20260617153000_auth_profile_bootstrap_rls.sql`.
11. Open only the target phase file and its `PRIMARY_CONTEXT` before planning.

Execution rule:
- Work on exactly one phase and one feature-oracle item.
- Follow the loop cycle: observe, select, execute, verify, record, decide.
- Stay inside the phase edit boundaries.
- Run the required validation and runtime checks.
- Summarize code facts back into the source packet and continuity ledger before handoff.
- Update the phase report, progress log, handoff file, continuity ledger, and oracle evidence before claiming completion.
- First ask for explicit confirmation before executing the prepared Supabase SQL. Do not execute schema/RLS changes without confirmation.
- After SQL execution, run `AUTH_FLOW_ACCOUNTS=3 npm run smoke:prod:auth-flow` and require both `functionalPassed` and `dbBootstrapPassed`.
- Return to VD-03 Product UI Redesign only after VD-F002 is passing again.
- Do not work on IELTS Anki cards until VD-03 is passing or explicitly blocked/waived.
- Stop and document blockers instead of guessing when credentials, production systems, destructive commands, or out-of-scope edits are required.
```
