# VocabDaily Upgrade PRD Phase Harness Agent Handoff

**Created:** 2026-06-17

**Harness Folder:** `docs/vocabdaily-upgrade-harness`

## Planner Notes

- Five phases are fixed in `phase-manifest.md`.
- Product Design brief is already known from the user: English learning app, practical learning workbench, no AI-template copy, no glowy dark mode, desktop and mobile validation.
- Product Design user-context preflight found no saved context file, so current screenshots, production pages, and repo source are the source of truth.
- Next target phase is `VD-04 IELTS Anki Card Foundation`.

## Generator Notes

- Do not use Chrome unless the user explicitly asks for it. Use the in-app browser or CLI/browser test contexts.
- VD-00, VD-01, and VD-02 are complete and should not be reworked unless smoke, auth UI checks, or theme checks regress.
- VD-01 was revisited after a stricter production check. After user authorization, migration `supabase/migrations/20260617153000_auth_profile_bootstrap_rls.sql` was executed in the Supabase in-app browser SQL Editor and returned `Success. No rows returned`. `AUTH_FLOW_ACCOUNTS=3 npm run smoke:prod:auth-flow` passed with `functionalPassed: true`, `dbBootstrapPassed: true`, and each account reported `db4xx=0 dbFailed=0`.
- VD-02 deployed production `dpl_vNSef9xouqZ7NS5LdEbHfwe4LZZQ`; production smoke passed 8/8 and production logged-in UI regression passed 25/25.
- For VD-03, focus on the actual product UI: layout hierarchy, copy, typography, task clarity, core page ergonomics, and full route visual review.
- Do not treat VD-03 as another token-only pass. The user explicitly rejected the current UI as AI-feeling and poorly laid out.
- VD-03 is now passing and deployed. It produced `reports/vd-03-product-ui-redesign-report.md`, expanded `scripts/learning-flow-regression.mjs`, and passed 160/160 learning-flow checks across public, auth-adjacent, dashboard, module, account/tool, route-switch, Practice retry/reveal, and Listening retry/reveal flows locally and on `https://www.uuedu.online`.
- VD-03 production deployment `dpl_HF6dRPDSm8v5o5NavXa2cjoyzUA4` was Ready and aliased to `https://www.uuedu.online`; production smoke passed 8/8 and production auth-flow passed for 2 fresh accounts with DB bootstrap.
- The local validation gates passed after VD-03 edits: `npm run lint`, `npm run check:i18n`, `npm run build`, and `npm test -- --run`.
- VD-04 should focus on the IELTS Anki-style card foundation instead of another broad shell polish pass.
- Keep test account data synthetic. Do not expose tokens.

## Evaluator Notes

- VD-03 acceptance gates are satisfied locally. If rechecking, require desktop `1440x960`, mobile `390x844`, and light/dark/system checks across public, auth-adjacent, dashboard, and learning-module routes.
- For VD-04, reject content work if it only creates import buttons without a useful seeded IELTS card schema/deck and at least one review/practice entry point.

## Next Handoff

- Active role: generator/evaluator
- Active phase: VD-04
- Active feature-oracle item: VD-F005
- Required evidence before unlock: IELTS card schema, seeded useful card/deck data, vocabulary/review/practice entry point, tests for schema/deck availability/UI entry, validation output, oracle update, continuity ledger update, and report `reports/vd-04-ielts-anki-card-foundation-report.md`.
