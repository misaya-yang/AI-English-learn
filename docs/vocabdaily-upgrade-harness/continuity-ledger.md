# VocabDaily Upgrade PRD Phase Harness Continuity Ledger

**Created:** 2026-06-17

**Harness Folder:** `docs/vocabdaily-upgrade-harness`

## Purpose

This file preserves cross-phase continuity for long-running agents. Treat it as the bridge between product intent, code facts, execution evidence, and the next agent's starting point.

## Phase Continuity Chain

| Phase | Feature | Depends On | Unlocks | Status | Handoff Boundary | Required Writeback |
| --- | --- | --- | --- | --- | --- | --- |
| VD-00 | VD-F001 | none | VD-01 | passing | production Supabase and proxy evidence | source packet, oracle, report |
| VD-01 | VD-F002 | VD-00 | VD-02 | passing | UI auth flow and database bootstrap pass for fresh production accounts | auth code facts, browser evidence, SQL execution evidence, report |
| VD-02 | VD-F003 | VD-01 | VD-03 | passing | theme token and loading-state evidence | theme decisions, screenshots, report |
| VD-03 | VD-F004 | VD-02 | VD-04 | passing | full UI audit and redesign evidence | route inventory, screenshots, copy audit, report |
| VD-04 | VD-F005 | VD-03 | none | ready | IELTS card schema/content evidence | content schema, tests, UI entry point, report |

## Interface Boundary Ledger

| Boundary | Current Fact | Source | Last Verified | Owner Phase |
| --- | --- | --- | --- | --- |
| Supabase project | Existing project `zjkbktdmwencnouwfrij` is recovered and remains production provider. | Supabase dashboard, production smoke | 2026-06-17 | VD-00 |
| Supabase proxy | `api/supabase.js` filters `content-encoding` and forces upstream `accept-encoding: identity`. | commit `a766cf1`, `src/lib/supabaseProxy.test.ts` | 2026-06-17 | VD-00 |
| Production deployment | Vercel deployment `dpl_5LxAb5cj72MRod4coXbGpMatvxGq` is Ready and aliased to `www.uuedu.online`. | `vercel inspect` | 2026-06-17 | VD-00 |
| Auth API | Production signup/login through `/api/supabase` returns `user` and `access_token`. | production probe | 2026-06-17 | VD-00 |
| Auth UI | Production UI created 3 synthetic accounts via `/register`, logged each in via `/login` from fresh contexts, and stayed on `/dashboard/today` after reload. Invalid credentials stayed on `/login` with readable error. | `reports/vd-01-registration-and-login-recovery-report.md` | 2026-06-17 | VD-01 |
| Auth UI revalidation | Production UI created 3 additional synthetic accounts; all registered to `/dashboard/today`, logged in from fresh contexts, and reloaded on dashboard with 0 console errors and 0 failed Supabase requests. | `reports/vd-01-registration-and-login-recovery-report.md` | 2026-06-17 | VD-01 |
| Auth database policy | After user authorization, executed `20260617153000_auth_profile_bootstrap_rls.sql` in the Supabase in-app browser SQL Editor; Supabase returned `Success. No rows returned`. Post-SQL verifier `AUTH_FLOW_ACCOUNTS=3 npm run smoke:prod:auth-flow` passed for 3 fresh accounts with `functionalPassed: true`, `dbBootstrapPassed: true`, and each account reported `db4xx=0 dbFailed=0`. | `reports/vd-01-registration-and-login-recovery-report.md`; `supabase/migrations/20260617153000_auth_profile_bootstrap_rls.sql`; `scripts/prod-auth-flow.mjs` | 2026-06-17 | VD-01 |
| Theme tokens | Dark mode now uses restrained graphite tokens, stale dark preferences migrate to light, and production logged-in route checks passed 25/25 after deployment `dpl_vNSef9xouqZ7NS5LdEbHfwe4LZZQ`. | `reports/vd-02-dark-mode-repair-report.md`; `product-audit-2026-06-17/vd-02-production-online/summary.json` | 2026-06-17 | VD-02 |
| Product UI | VD-03 established a light-first learning workspace baseline, reduced heavy cards/glow/cockpit language, simplified Today/Practice, bumped theme version to `2026-06-workbench-dark-v4`, deployed production `dpl_HF6dRPDSm8v5o5NavXa2cjoyzUA4`, and passed 160/160 learning-flow checks locally and on `https://www.uuedu.online`. | `reports/vd-03-product-ui-redesign-report.md`; `product-audit-2026-06-17/vd-03-learning-flow/summary.json`; `product-audit-2026-06-17/vd-03-production-learning-flow/summary.json` | 2026-06-17 | VD-03 |
| IELTS Anki content | No accepted first deck or schema yet. | user request | pending | VD-04 |

## Code Summary Writeback Rules

- After inspecting code, summarize discovered files, services, routes, schemas, tests, and runtime commands back into `source-packet.md`.
- Record cross-phase interface decisions here before handing off, especially API contracts, shared state, data shape, UI route assumptions, eval criteria, and rollback boundaries.
- If a phase changes a boundary another phase depends on, update that dependent phase's report handoff and the relevant oracle item notes.

## Current Continuity Status

- Active phase: VD-04
- Active feature-oracle item: VD-F005
- Current decision: VD-03 Product UI Redesign is locally passing and VD-04 is unlocked.
- Next action: Define the first IELTS Anki-style card schema, seed a useful deck, wire it into vocabulary/review/practice entry points, add tests, and record validation before completion.
