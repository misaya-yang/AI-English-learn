# VocabDaily Upgrade PRD Phase Harness Continuity Ledger

**Created:** 2026-06-17

**Harness Folder:** `docs/vocabdaily-upgrade-harness`

## Purpose

This file preserves cross-phase continuity for long-running agents. Treat it as the bridge between product intent, code facts, execution evidence, and the next agent's starting point.

## Phase Continuity Chain

| Phase | Feature | Depends On | Unlocks | Status | Handoff Boundary | Required Writeback |
| --- | --- | --- | --- | --- | --- | --- |
| VD-00 | VD-F001 | none | VD-01 | passing | production Supabase and proxy evidence | source packet, oracle, report |
| VD-01 | VD-F002 | VD-00 | VD-02 | blocked on SQL approval | UI auth flow passes, database policy cleanup pending | auth code facts, browser evidence, SQL execution evidence, report |
| VD-02 | VD-F003 | VD-01 | VD-03 | passing | theme token and loading-state evidence | theme decisions, screenshots, report |
| VD-03 | VD-F004 | VD-02 | VD-04 | ready | full UI audit and redesign evidence | route inventory, screenshots, copy audit, report |
| VD-04 | VD-F005 | VD-03 | none | locked | IELTS card schema/content evidence | content schema, tests, UI entry point, report |

## Interface Boundary Ledger

| Boundary | Current Fact | Source | Last Verified | Owner Phase |
| --- | --- | --- | --- | --- |
| Supabase project | Existing project `zjkbktdmwencnouwfrij` is recovered and remains production provider. | Supabase dashboard, production smoke | 2026-06-17 | VD-00 |
| Supabase proxy | `api/supabase.js` filters `content-encoding` and forces upstream `accept-encoding: identity`. | commit `a766cf1`, `src/lib/supabaseProxy.test.ts` | 2026-06-17 | VD-00 |
| Production deployment | Vercel deployment `dpl_5LxAb5cj72MRod4coXbGpMatvxGq` is Ready and aliased to `www.uuedu.online`. | `vercel inspect` | 2026-06-17 | VD-00 |
| Auth API | Production signup/login through `/api/supabase` returns `user` and `access_token`. | production probe | 2026-06-17 | VD-00 |
| Auth UI | Production UI created 3 synthetic accounts via `/register`, logged each in via `/login` from fresh contexts, and stayed on `/dashboard/today` after reload. Invalid credentials stayed on `/login` with readable error. | `reports/vd-01-registration-and-login-recovery-report.md` | 2026-06-17 | VD-01 |
| Auth UI revalidation | Production UI created 3 additional synthetic accounts; all registered to `/dashboard/today`, logged in from fresh contexts, and reloaded on dashboard with 0 console errors and 0 failed Supabase requests. | `reports/vd-01-registration-and-login-recovery-report.md` | 2026-06-17 | VD-01 |
| Auth database policy | Stricter production checks show 3/3 new accounts can complete register/onboarding/login/dashboard routes, but live Supabase still rejects authenticated `public.users` self-upsert with RLS 403 and then `public.profiles` returns 409 because the users parent row is missing. Prepared SQL migration `20260617153000_auth_profile_bootstrap_rls.sql`; execution requires explicit user confirmation. | `reports/vd-01-registration-and-login-recovery-report.md`; `supabase/migrations/20260617153000_auth_profile_bootstrap_rls.sql` | 2026-06-17 | VD-01 |
| Theme tokens | Dark mode now uses restrained graphite tokens, stale dark preferences migrate to light, and production logged-in route checks passed 25/25 after deployment `dpl_vNSef9xouqZ7NS5LdEbHfwe4LZZQ`. | `reports/vd-02-dark-mode-repair-report.md`; `product-audit-2026-06-17/vd-02-production-online/summary.json` | 2026-06-17 | VD-02 |
| Product UI | User rejected current UI as AI-feeling, monotonous, and poorly laid out. | screenshots and user feedback | 2026-06-17 | VD-03 |
| IELTS Anki content | No accepted first deck or schema yet. | user request | pending | VD-04 |

## Code Summary Writeback Rules

- After inspecting code, summarize discovered files, services, routes, schemas, tests, and runtime commands back into `source-packet.md`.
- Record cross-phase interface decisions here before handing off, especially API contracts, shared state, data shape, UI route assumptions, eval criteria, and rollback boundaries.
- If a phase changes a boundary another phase depends on, update that dependent phase's report handoff and the relevant oracle item notes.

## Current Continuity Status

- Active phase: VD-01 revisit
- Active feature-oracle item: VD-F002
- Current decision: Production UI auth is functionally passing, but strict database-policy recovery is pending explicit approval to execute the prepared Supabase SQL.
- Next action: Execute `supabase/migrations/20260617153000_auth_profile_bootstrap_rls.sql` only after user confirmation, then re-run 2-3 fresh production account checks and require no `users/profiles` 403/409 before returning to VD-03.
