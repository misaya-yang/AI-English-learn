# VD-01 Registration and Login Recovery Report

## Status

passing

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

## Observations

- Each login run recorded one `GET /api/supabase/rest/v1/profiles net::ERR_ABORTED` during page transition. This did not block login, session persistence, or dashboard access.
- The invalid-credential path logs expected 400/auth errors to console. This is acceptable as long as the user sees a readable failure and does not enter the dashboard.
- Emails, passwords, and tokens were intentionally omitted from this report.

## Files Changed

- Production code:
  - `src/pages/auth/RegisterPage.tsx`
- Regression coverage:
  - `src/pages/auth/AuthPages.i18n.test.tsx`
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
- Did not change provider settings, schema, billing, or production env vars.
- Did not use Chrome for authenticated browser checks.

## Rollback Plan

- No code rollback required.
- If future auth UI checks regress, keep VD-00 proxy fix intact and inspect `src/lib/supabase-auth.ts`, `src/contexts/AuthContext.tsx`, and auth pages before touching provider settings.

## Oracle Update

`VD-F002` is marked `passing` in `feature-oracle.json`.

## Next Phase Handoff

`VD-02 Dark Mode Repair` is unlocked. The next phase should focus only on theme tokens, loading states, route transition flashes, and readability. Do not start the broader product UI redesign until VD-02 has evidence.
