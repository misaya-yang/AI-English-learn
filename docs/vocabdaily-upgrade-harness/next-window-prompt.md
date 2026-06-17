# VocabDaily Upgrade PRD Phase Harness Next Window Prompt

Use this prompt to start a fresh Codex, Claude Code, or Agent Skills-compatible window.

```text
Use $prd-phase-harness to continue the harness at `docs/vocabdaily-upgrade-harness`.

Target phase: post-VD-04 user feedback or new phase
Target phase file: `docs/vocabdaily-upgrade-harness/phase-04-ielts-anki-card-foundation.md`
Target feature-oracle item: VD-F005

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
11. Open `docs/vocabdaily-upgrade-harness/reports/vd-03-product-ui-redesign-report.md`.
12. Open only the target phase file and its `PRIMARY_CONTEXT` before planning.

Execution rule:
- Work on exactly one phase and one feature-oracle item.
- Follow the loop cycle: observe, select, execute, verify, record, decide.
- Stay inside the phase edit boundaries.
- Run the required validation and runtime checks.
- Summarize code facts back into the source packet and continuity ledger before handoff.
- Update the phase report, progress log, handoff file, continuity ledger, and oracle evidence before claiming completion.
- VD-F002 is passing again: the prepared Supabase SQL was executed after user authorization and `AUTH_FLOW_ACCOUNTS=3 npm run smoke:prod:auth-flow` passed with both `functionalPassed` and `dbBootstrapPassed`.
- VD-F004 is passing and deployed: VD-03 completed the product UI redesign baseline, local learning-flow passed 160/160, production learning-flow on `https://www.uuedu.online` passed 160/160, production smoke passed 8/8, and production auth-flow passed for 2 fresh accounts with DB bootstrap.
- VD-04 IELTS Anki Card Foundation is implemented and deployed: original 12-card deck, WordData/built-in book mapping, vocabulary entry point, Practice URL focus, Review manual URL focus, focused tests, full tests, local learning-flow 160/160, production deployment `dpl_Dd97VG7hdoqTEojyXs2pSFCsEvVm`, production smoke 8/8, and focused production vocabulary 4/4.
- Continue only from user feedback or a new requested phase. Do not reopen the five completed phases unless a verifier regresses.
- Do not rework UI shell or Supabase/auth unless the existing verification commands regress.
- Stop and document blockers instead of guessing when credentials, production systems, destructive commands, or out-of-scope edits are required.
```
