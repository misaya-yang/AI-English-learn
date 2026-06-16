# Next Window Prompt

Use the `prd-phase-harness` skill only if continuing the release audit. VLE-00 through VLE-06 are complete. Target phase: VLE-06 Regression Eval And Release. Target feature: `VLE-06-release`. Start from `docs/vocabdaily-learning-ecosystem-prd/reports/vle-06-regression-eval-and-release-report.md`.

Cold-start protocol and loading order:

1. Read `docs/vocabdaily-learning-ecosystem-prd/README.md`.
2. Read `docs/vocabdaily-learning-ecosystem-prd/phase-manifest.md`.
3. Read `docs/vocabdaily-learning-ecosystem-prd/loop-contract.json`.
4. Read `docs/vocabdaily-learning-ecosystem-prd/loop-state.json`.
5. Read `docs/vocabdaily-learning-ecosystem-prd/feature-oracle.json`.
6. Read `docs/vocabdaily-learning-ecosystem-prd/progress-log.md`.
7. Read `docs/vocabdaily-learning-ecosystem-prd/agent-handoff.md`.
8. Read `docs/vocabdaily-learning-ecosystem-prd/continuity-ledger.md`.
9. Read the target phase file and only its named primary context before planning.

Cold-start protocol and loading order:

1. Read `docs/vocabdaily-learning-ecosystem-prd/README.md`.
2. Read `docs/vocabdaily-learning-ecosystem-prd/phase-manifest.md`.
3. Read `docs/vocabdaily-learning-ecosystem-prd/loop-contract.json`.
4. Read `docs/vocabdaily-learning-ecosystem-prd/loop-state.json`.
5. Read `docs/vocabdaily-learning-ecosystem-prd/feature-oracle.json`.
6. Read `docs/vocabdaily-learning-ecosystem-prd/progress-log.md`.
7. Read `docs/vocabdaily-learning-ecosystem-prd/agent-handoff.md`.
8. Read `docs/vocabdaily-learning-ecosystem-prd/continuity-ledger.md`.
9. Read `docs/vocabdaily-learning-ecosystem-prd/reports/vle-06-regression-eval-and-release-report.md`.

If reopening the harness, execute exactly one phase and one feature: VLE-06 and `VLE-06-release`. Follow the loop cycle exactly: observe, select, execute, verify, record, decide. Stay inside edit boundaries unless a stop condition forces a documented blocker. Run validation before claiming any new release state, and write code summary writeback into the phase report, progress log, source packet, and continuity ledger if any source or release contract changes.

The next useful task is operational: investigate Supabase reachability for `zjkbktdmwencnouwfrij.supabase.co` from affected user networks. Preserve the shipped frontend, release evidence, and rollback notes. Stop conditions: stop before production migrations, billing behavior changes, force push, secret changes, or external provider changes without explicit approval.
