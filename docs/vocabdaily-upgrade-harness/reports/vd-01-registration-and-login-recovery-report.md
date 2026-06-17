# VD-01 Registration and Login Recovery Report

## Status

functional-passing / database-policy-sql-pending

## Scope

Prove production UI registration and login works for real new accounts, not only the demo account or direct Supabase API calls.

## Actions

- Used production site `https://www.uuedu.online`.
- Created 3 synthetic test accounts through the visible `/register` form.
- For each account, used a fresh browser context to log in through `/login`.
- Reloaded after each login to confirm session persistence.
- Tested invalid credentials to confirm the app stays on `/login` and shows readable failure.

## Validation Evidence

- Account 1:
  - Register submit enabled: yes.
  - Registration final path: `/dashboard/today`.
  - Login final path: `/dashboard/today`.
  - Reload stayed on dashboard: yes.
- Account 2:
  - Register submit enabled: yes.
  - Registration final path: `/dashboard/today`.
  - Login final path: `/dashboard/today`.
  - Reload stayed on dashboard: yes.
- Account 3:
  - Register submit enabled: yes.
  - Registration final path: `/dashboard/today`.
  - Login final path: `/dashboard/today`.
  - Reload stayed on dashboard: yes.
- Invalid credentials:
  - Final path: `/login`.
  - Readable error detected: yes.
- Revalidation after VD-02 planning:
  - Production site: `https://www.uuedu.online`.
  - 3 additional synthetic accounts were created through the visible `/register` form.
  - All 3 registration runs ended at `/dashboard/today`.
  - All 3 fresh-context login runs ended at `/dashboard/today`.
  - All 3 reload checks stayed on `/dashboard/today`.
  - Console error count: 0 for each registration and login run.
  - Failed Supabase request count: 0 for each registration and login run.
- Production smoke from VD-00 remains passing: `npm run smoke:prod` passed 8/8 after deployment `dpl_5LxAb5cj72MRod4coXbGpMatvxGq`.
- 2026-06-17 production recheck:
  - Production site: `https://www.uuedu.online`.
  - A new synthetic account successfully submitted registration with 0 console errors, 0 failed requests, and 0 bad Supabase responses.
  - The new account correctly reached first-run onboarding. A separate run exposed a race where AuthContext could mark the user authenticated before the register handler navigated to onboarding, briefly sending the new account to `/dashboard/today` loading state.
  - Fixed the race by locking the registration flow to onboarding before calling `register()`, then resetting that lock only on registration failure.
  - Added an auth-page regression test for the race.
- 2026-06-17 post-deploy recheck:
  - 3 new synthetic accounts completed `register -> onboarding -> dashboard -> fresh login -> dashboard/today -> dashboard/practice -> dashboard/review`.
  - The functional path passed for all 3 accounts, but console/network capture still showed remote profile sync errors.
  - Root cause 1: `registerUser` updated the `users` table after signup, but a zero-row update does not error; `profiles.user_id` could then fail its `users(id)` foreign key during onboarding.
  - Root cause 2: `saveLearningProfile` sent `learning_style` to `user_learning_profiles`, but the shipped migration table does not include that column.
  - Follow-up fix: registration and login now explicitly upsert the public `users` row by auth user id, and remote `user_learning_profiles` sync now sends only columns present in the current schema.
- 2026-06-17 stricter production recheck after deployment `dpl_4GgdvnNx8imSzGW28zDPHPrmxC8j`:
  - 3 new synthetic accounts again completed the full functional path.
  - Remaining server errors: `users?on_conflict=id` returned 403 under an authenticated user JWT, and `profiles?on_conflict=user_id` returned 409 because the public `users` parent row was still missing.
  - JWT probe confirmed the request used role `authenticated` and `sub` matched the `users.id` being written; the failure is a live Supabase RLS/trigger mismatch, not a missing browser session.
  - Added migration `supabase/migrations/20260617153000_auth_profile_bootstrap_rls.sql` to repair the live database policy/trigger. It has not been executed on production yet because schema/RLS changes require explicit user confirmation.
  - Code-only follow-up: `user_learning_profiles` now upserts with `onConflict: 'user_id'` to avoid duplicate-key 409 on repeated saves.
- 2026-06-17 code-only deployment `dpl_BxFZXXKqCd3FiQRWHhbh7bwovizc`:
  - Production smoke passed 8/8.
  - A one-account production check confirmed the functional route still works and `user_learning_profiles` no longer appears in the bad-response list.
  - Remaining errors are limited to `users?on_conflict=id` 403 and `profiles?on_conflict=user_id` 409, which are the prepared SQL migration's scope.

## Observations

- Each login run recorded one `GET /api/supabase/rest/v1/profiles net::ERR_ABORTED` during page transition. This did not block login, session persistence, or dashboard access.
- The invalid-credential path logs expected 400/auth errors to console. This is acceptable as long as the user sees a readable failure and does not enter the dashboard.
- Emails, passwords, and tokens were intentionally omitted from this report.

## Files Changed

- Production code:
  - `src/pages/auth/RegisterPage.tsx`
  - `src/lib/supabase-auth.ts`
  - `src/services/learningMissions.ts`
- Database migration prepared, pending execution:
  - `supabase/migrations/20260617153000_auth_profile_bootstrap_rls.sql`
- Regression coverage:
  - `src/pages/auth/AuthPages.i18n.test.tsx`
  - `src/services/learningMissions.test.ts`
- Harness evidence updated:
  - `feature-oracle.json`
  - `loop-state.json`
  - `progress-log.md`
  - `agent-handoff.md`
  - `continuity-ledger.md`
  - `next-window-prompt.md`

## Compliance Gates

- Used synthetic test accounts only.
- Did not print account emails, passwords, refresh tokens, access tokens, or Supabase secrets.
- Did not execute production schema/RLS changes without confirmation. A migration has been prepared for review.
- Did not change billing or production env vars.
- Did not use Chrome for authenticated browser checks.

## Rollback Plan

- Code rollback: revert commits `35a7758`, `588d341`, and the pending `user_learning_profiles` upsert change if auth regressions appear.
- SQL rollback, if the prepared migration is later executed: drop the newly named `Authenticated users can ...` and `Service role can manage ...` policies, then restore the previous `handle_new_auth_user()` function definition from the prior schema snapshot.
- If future auth UI checks regress, keep VD-00 proxy fix intact and inspect `src/lib/supabase-auth.ts`, `src/contexts/AuthContext.tsx`, and auth pages before touching provider settings.

## Oracle Update

`VD-F002` is functionally passing for registration/login navigation, but database-policy verification remains pending until the prepared Supabase SQL is executed and 2-3 fresh accounts show no `users/profiles` 403/409 errors.

## Next Phase Handoff

`VD-02 Dark Mode Repair` is unlocked. The next phase should focus only on theme tokens, loading states, route transition flashes, and readability. Do not start the broader product UI redesign until VD-02 has evidence.
