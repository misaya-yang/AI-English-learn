# VocabDaily Upgrade PRD Phase Harness Progress Log

**Created:** 2026-06-17

**Harness Folder:** `docs/vocabdaily-upgrade-harness`

## Current State

- Status: active
- Active phase: VD-03
- Active feature-oracle item: VD-F004
- Clean-state note: VD-00 code changes were committed, pushed, deployed, and production-smoked. The repo still has an unrelated untracked `product-audit-2026-06-17/` directory that should not be touched unless a later UI audit phase explicitly adopts it.

## Session Log

| Date | Agent Role | Phase | Summary | Evidence | Next Step |
| --- | --- | --- | --- | --- | --- |
| 2026-06-17 | planner | VD-00 | Scaffold created for five sequential tasks. | `docs/vocabdaily-upgrade-harness` | Fill source packet and phase docs. |
| 2026-06-17 | generator | VD-00 | Resumed paused Supabase project, fixed Vercel Supabase proxy response encoding, added regression test, pushed commit `a766cf1`, deployed production `dpl_5LxAb5cj72MRod4coXbGpMatvxGq`. | `reports/vd-00-supabase-database-recovery-report.md` | Execute VD-01 browser UI auth flow. |
| 2026-06-17 | evaluator | VD-00 | Verified production smoke 8/8 and API signup/login probes through `/api/supabase` return user/access_token. | `npm run smoke:prod`, production Auth probes | Keep VD-F001 passing; do not advance beyond VD-01. |
| 2026-06-17 | generator/evaluator | VD-01 | Verified 3 new synthetic accounts can register through production `/register`, log in through production `/login` from fresh contexts, and remain on dashboard after reload. Invalid credentials stay on `/login` with readable error. | `reports/vd-01-registration-and-login-recovery-report.md` | Execute VD-02 dark mode repair. |
| 2026-06-17 | generator/evaluator | VD-01 | Revalidated production registration/login with 3 additional synthetic accounts: all reached `/dashboard/today`, all fresh-context logins and reloads stayed on dashboard, with 0 console errors and 0 failed Supabase requests. | `reports/vd-01-registration-and-login-recovery-report.md` | Continue VD-02. |
| 2026-06-17 | generator/evaluator | VD-02 | Repaired dark-mode tokens, theme pre-paint versioning, stale dark migration, and near-black regression checks. Deployed production `dpl_vNSef9xouqZ7NS5LdEbHfwe4LZZQ`; production smoke passed 8/8; logged-in production UI regression passed 25/25. | `reports/vd-02-dark-mode-repair-report.md`; `product-audit-2026-06-17/vd-02-production-online/summary.json` | Execute VD-03 product UI redesign. |
| 2026-06-17 | generator/evaluator | VD-01 revisit | Production registration/login functional path passed for 3 new accounts after deployments `dpl_J6TSfnzppU1BE8zu8TQuqqQu18TK` and `dpl_4GgdvnNx8imSzGW28zDPHPrmxC8j`, but strict capture still shows live Supabase `users` RLS 403 and dependent `profiles` 409. Prepared migration `20260617153000_auth_profile_bootstrap_rls.sql`; not executed because schema/RLS changes require explicit confirmation. Added `npm run smoke:prod:auth-flow` as the repeatable post-SQL verifier. | `reports/vd-01-registration-and-login-recovery-report.md`; `supabase/migrations/20260617153000_auth_profile_bootstrap_rls.sql`; `scripts/prod-auth-flow.mjs` | Ask user to confirm SQL execution; after execution, run `AUTH_FLOW_ACCOUNTS=3 npm run smoke:prod:auth-flow` and require no `users/profiles` 403/409. |

## Known Blockers

- Supabase dashboard may continue to show transient `Checking...` text after resume, but production Auth and proxy checks are passing.
- Live Supabase `users` table currently rejects authenticated self-upsert with RLS 403 even when JWT `sub` matches body `id`. Do not claim database recovery complete until `supabase/migrations/20260617153000_auth_profile_bootstrap_rls.sql` is executed on production and fresh-account checks show no `users/profiles` 403/409.
- VD-03 is broad and must not be collapsed into theme token work. It needs full product/UI redesign evidence before VD-04 unlocks.

## Clean Exit Checklist

- Phase report written or blocker documented.
- Feature oracle updated only for worked items.
- Validation evidence linked.
- Next target phase and prompt are clear.
