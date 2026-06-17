# VocabDaily Upgrade PRD Phase Harness Progress Log

**Created:** 2026-06-17

**Harness Folder:** `docs/vocabdaily-upgrade-harness`

## Current State

- Status: active
- Active phase: VD-04
- Active feature-oracle item: VD-F005
- Clean-state note: VD-00 code changes were committed, pushed, deployed, and production-smoked. VD-03 now uses `product-audit-2026-06-17/vd-03-learning-flow/` as local visual-regression evidence; screenshot images remain ignored by git.

## Session Log

| Date | Agent Role | Phase | Summary | Evidence | Next Step |
| --- | --- | --- | --- | --- | --- |
| 2026-06-17 | planner | VD-00 | Scaffold created for five sequential tasks. | `docs/vocabdaily-upgrade-harness` | Fill source packet and phase docs. |
| 2026-06-17 | generator | VD-00 | Resumed paused Supabase project, fixed Vercel Supabase proxy response encoding, added regression test, pushed commit `a766cf1`, deployed production `dpl_5LxAb5cj72MRod4coXbGpMatvxGq`. | `reports/vd-00-supabase-database-recovery-report.md` | Execute VD-01 browser UI auth flow. |
| 2026-06-17 | evaluator | VD-00 | Verified production smoke 8/8 and API signup/login probes through `/api/supabase` return user/access_token. | `npm run smoke:prod`, production Auth probes | Keep VD-F001 passing; do not advance beyond VD-01. |
| 2026-06-17 | generator/evaluator | VD-01 | Verified 3 new synthetic accounts can register through production `/register`, log in through production `/login` from fresh contexts, and remain on dashboard after reload. Invalid credentials stay on `/login` with readable error. | `reports/vd-01-registration-and-login-recovery-report.md` | Execute VD-02 dark mode repair. |
| 2026-06-17 | generator/evaluator | VD-01 | Revalidated production registration/login with 3 additional synthetic accounts: all reached `/dashboard/today`, all fresh-context logins and reloads stayed on dashboard, with 0 console errors and 0 failed Supabase requests. | `reports/vd-01-registration-and-login-recovery-report.md` | Continue VD-02. |
| 2026-06-17 | generator/evaluator | VD-02 | Repaired dark-mode tokens, theme pre-paint versioning, stale dark migration, and near-black regression checks. Deployed production `dpl_vNSef9xouqZ7NS5LdEbHfwe4LZZQ`; production smoke passed 8/8; logged-in production UI regression passed 25/25. | `reports/vd-02-dark-mode-repair-report.md`; `product-audit-2026-06-17/vd-02-production-online/summary.json` | Execute VD-03 product UI redesign. |
| 2026-06-17 | generator/evaluator | VD-01 revisit | Production registration/login functional path passed for 3 new accounts after deployments `dpl_J6TSfnzppU1BE8zu8TQuqqQu18TK` and `dpl_4GgdvnNx8imSzGW28zDPHPrmxC8j`, but strict capture still shows live Supabase `users` RLS 403 and dependent `profiles` 409. Prepared migration `20260617153000_auth_profile_bootstrap_rls.sql`; not executed at that point because schema/RLS changes required explicit confirmation. Added `npm run smoke:prod:auth-flow` as the repeatable post-SQL verifier. | `reports/vd-01-registration-and-login-recovery-report.md`; `supabase/migrations/20260617153000_auth_profile_bootstrap_rls.sql`; `scripts/prod-auth-flow.mjs` | Superseded by the post-SQL verification row below. |
| 2026-06-17 | generator/evaluator | VD-01 revisit | After user authorization, executed `20260617153000_auth_profile_bootstrap_rls.sql` in the Supabase in-app browser SQL Editor. Supabase returned `Success. No rows returned`. Post-SQL production verifier created 3 fresh synthetic accounts; all passed functional auth and DB bootstrap with `db4xx=0 dbFailed=0`. | `AUTH_FLOW_ACCOUNTS=3 npm run smoke:prod:auth-flow`; `reports/vd-01-registration-and-login-recovery-report.md` | Resume VD-03 product UI redesign. |
| 2026-06-17 | generator/evaluator | VD-03 | Completed and deployed the Product UI Redesign pass: light-first shared learning shell, calmer dark palette/version migration, shorter dashboard copy, flatter Today/Practice layouts, one Practice start CTA, and expanded route regression coverage. Local and production validation passed. | `reports/vd-03-product-ui-redesign-report.md`; production `dpl_HF6dRPDSm8v5o5NavXa2cjoyzUA4`; local learning-flow 160/160; production learning-flow 160/160; production smoke 8/8; production auth-flow 2/2 fresh accounts; `npm run lint`; `npm run check:i18n`; `npm run build`; `npm test -- --run` | Start VD-04 IELTS Anki-style card foundation. |
| 2026-06-17 | generator/evaluator | VD-04 | Added and deployed the first original IELTS Anki-style card foundation: 12-card deck, card schema, WordData and built-in word book mapping, vocabulary-bank entry point, Practice URL focus, Review manual URL focus, focused tests, and vocabulary browser assertion. | `reports/vd-04-ielts-anki-card-foundation-report.md`; commit `7158bf6`; production `dpl_Dd97VG7hdoqTEojyXs2pSFCsEvVm`; `npm run lint`; `npm run check:i18n`; `npm run build`; `npm test -- --run`; focused tests 18/18; local learning-flow 160/160; production smoke 8/8; production focused vocabulary 4/4 | Final handoff. |

## Known Blockers

- Supabase dashboard may continue to show transient `Checking...` text after resume, but production Auth and proxy checks are passing.
- VD-01 database recovery is complete as of the post-SQL 3-account production verifier. If future auth regressions appear, rerun `AUTH_FLOW_ACCOUNTS=3 npm run smoke:prod:auth-flow` before changing code.
- VD-03 local UI baseline is complete and VD-F004 is passing. If visual complaints continue, use the existing screenshot suite before changing tokens again.
- VD-04 is implemented, pushed, deployed, and production-smoked. If future regressions appear, start with `npm run smoke:prod`, the VD-04 focused tests, and the vocabulary production focused check.

## Clean Exit Checklist

- Phase report written or blocker documented.
- Feature oracle updated only for worked items.
- Validation evidence linked.
- Next target phase and prompt are clear.
