# VocabDaily Upgrade PRD Phase Harness Continuity Ledger

**Created:** 2026-06-17

**Harness Folder:** `docs/vocabdaily-upgrade-harness`

## Purpose

This file preserves cross-phase continuity for long-running agents. Treat it as the bridge between product intent, code facts, execution evidence, and the next agent's starting point.

## Phase Continuity Chain

| Phase | Feature | Depends On | Unlocks | Status | Handoff Boundary | Required Writeback |
| --- | --- | --- | --- | --- | --- | --- |
| VD-00 | VD-F001 | none | VD-01 | passing | production Supabase and proxy evidence | source packet, oracle, report |
| VD-01 | VD-F002 | VD-00 | VD-02 | passing | UI auth flow evidence | auth code facts, browser evidence, report |
| VD-02 | VD-F003 | VD-01 | VD-03 | ready | theme token and loading-state evidence | theme decisions, screenshots, report |
| VD-03 | VD-F004 | VD-02 | VD-04 | locked | full UI audit and redesign evidence | route inventory, screenshots, copy audit, report |
| VD-04 | VD-F005 | VD-03 | none | locked | IELTS card schema/content evidence | content schema, tests, UI entry point, report |

## Interface Boundary Ledger

| Boundary | Current Fact | Source | Last Verified | Owner Phase |
| --- | --- | --- | --- | --- |
| Supabase project | Existing project `zjkbktdmwencnouwfrij` is recovered and remains production provider. | Supabase dashboard, production smoke | 2026-06-17 | VD-00 |
| Supabase proxy | `api/supabase.js` filters `content-encoding` and forces upstream `accept-encoding: identity`. | commit `a766cf1`, `src/lib/supabaseProxy.test.ts` | 2026-06-17 | VD-00 |
| Production deployment | Vercel deployment `dpl_5LxAb5cj72MRod4coXbGpMatvxGq` is Ready and aliased to `www.uuedu.online`. | `vercel inspect` | 2026-06-17 | VD-00 |
| Auth API | Production signup/login through `/api/supabase` returns `user` and `access_token`. | production probe | 2026-06-17 | VD-00 |
| Auth UI | Production UI created 3 synthetic accounts via `/register`, logged each in via `/login` from fresh contexts, and stayed on `/dashboard/today` after reload. Invalid credentials stayed on `/login` with readable error. | `reports/vd-01-registration-and-login-recovery-report.md` | 2026-06-17 | VD-01 |
| Theme tokens | User rejected current dark mode as too ugly/glowy/black. | screenshots and user feedback | 2026-06-17 | VD-02 |
| Product UI | User rejected current UI as AI-feeling, monotonous, and poorly laid out. | screenshots and user feedback | 2026-06-17 | VD-03 |
| IELTS Anki content | No accepted first deck or schema yet. | user request | pending | VD-04 |

## Code Summary Writeback Rules

- After inspecting code, summarize discovered files, services, routes, schemas, tests, and runtime commands back into `source-packet.md`.
- Record cross-phase interface decisions here before handing off, especially API contracts, shared state, data shape, UI route assumptions, eval criteria, and rollback boundaries.
- If a phase changes a boundary another phase depends on, update that dependent phase's report handoff and the relevant oracle item notes.

## Current Continuity Status

- Active phase: VD-02
- Active feature-oracle item: VD-F003
- Current decision: Supabase backend and production UI auth are complete; repair dark mode next.
- Next action: Execute VD-02 and do not start full UI redesign or IELTS Anki work until VD-02 passes or is explicitly blocked.
