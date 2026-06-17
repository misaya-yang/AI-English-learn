# VD-00 Supabase Database Recovery Report

## Status

passing

## Scope

Restore the production Supabase backend and verify the same-origin Vercel proxy used by `https://www.uuedu.online` can reach Auth and Edge Functions without unreadable response bodies.

## Actions

- Confirmed production Vercel env pointed at Supabase ref `zjkbktdmwencnouwfrij`.
- Confirmed the Supabase project existed in the user's organization as `misaya-yang's Project` and was paused.
- Resumed the existing project instead of creating a new Supabase project.
- Verified the project URL became reachable at `https://zjkbktdmwencnouwfrij.supabase.co`.
- Fixed `api/supabase.js` so the proxy does not forward stale `content-encoding` after Node fetch decodes upstream bodies.
- Added `src/lib/supabaseProxy.test.ts` to lock the proxy response encoding behavior.
- Committed and pushed `a766cf1 Fix Supabase proxy response encoding`.
- Deployed production Vercel deployment `dpl_5LxAb5cj72MRod4coXbGpMatvxGq`.

## Validation Evidence

- `npm run lint`: passed.
- `npm run check:i18n`: passed.
- `npm run build`: passed.
- `npm test -- --run`: passed, 104 test files and 816 tests.
- `npm run smoke:prod`: passed, 8 passed, 0 warned, 0 failed.
- Production Supabase proxy health: `GET https://www.uuedu.online/api/supabase/auth/v1/health -> 200`.
- Direct Supabase health: `GET https://zjkbktdmwencnouwfrij.supabase.co/auth/v1/health -> 200`.
- Production signup probe through proxy: HTTP 200 with `user` and `access_token` keys present.
- Production password login probe through proxy: HTTP 200 with `user` and `access_token` keys present.
- Vercel inspect: production deployment `dpl_5LxAb5cj72MRod4coXbGpMatvxGq` is `Ready` and aliased to `https://www.uuedu.online`.

## Files Changed

- `api/supabase.js`
- `src/lib/supabaseProxy.test.ts`

## Compliance Gates

- Secrets were not printed or committed.
- No new Supabase project was created.
- No schema migration was run.
- No destructive command was used.
- Production deployment was followed by production smoke.

## Rollback Plan

- Revert commit `a766cf1` if the proxy fix regresses production behavior.
- If Supabase pauses again, resume the same project or move to a new project only after a new provider plan and env update report.

## Oracle Update

`VD-F001` is marked `passing` in `feature-oracle.json`.

## Next Phase Handoff

`VD-01 Registration and Login Recovery` is unlocked. It must prove the browser UI registration and login flows, not only API-level Auth calls.
