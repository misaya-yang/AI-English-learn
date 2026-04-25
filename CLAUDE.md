# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Vite dev server
npm run build            # tsc -b && vite build (typecheck is part of build)
npm run lint             # ESLint (flat config in eslint.config.js)
npm test                 # Vitest, single run
npm run test:watch       # Vitest watch
npm run test:coverage    # Vitest coverage
npm run check:i18n       # Verify en/zh keys in src/i18n/index.ts stay in sync
npm run test:e2e:smoke   # Playwright public-route smoke (needs running server at BASE_URL, default http://127.0.0.1:4174)
```

Run a single Vitest file: `npx vitest run src/services/fsrs.test.ts` (or `npm test -- --run path/to/file.test.ts`).

`vitest.config.ts` only globs `src/**/*.test.{ts,tsx}`. The top-level `tests/` directory contains legacy `node:test` files that are **not** executed by `npm test`. Don't add new tests there — colocate next to the source under `src/`.

## Architecture

Vite + React 19 + TypeScript SPA on top of Supabase (Postgres, Auth, Edge Functions). Path alias `@` → `src/` is configured in both `vite.config.ts` and `vitest.config.ts`.

### Routing & shell

`src/App.tsx` mounts `ThemeProvider → AuthProvider → UserDataProvider → Router`, all routes use `lazyWithRetry` for code-split chunks. Authenticated app lives under `/dashboard/*` inside `src/layouts/DashboardLayout.tsx`; the dashboard sub-pages are in `src/pages/dashboard/`. Public pages (`Home`, `LandingPage`, `Login`, `Register`, `Pricing`, `WordOfTheDay`) are in `src/pages/`. Vercel rewrites all paths to `index.html` (`vercel.json`).

### Offline-first data layer

The product is designed so most learning flows still work without backend reachability.

- `src/lib/localDb.ts` — IndexedDB stores (`word_progress`, `review_logs`, `sync_queue`) via `idb`. Falls back to in-memory when IndexedDB is unavailable.
- `src/data/localStorage.ts` — legacy localStorage layer for settings, word books, custom words; still the read path for several features.
- `src/services/syncQueue.ts` — pending writes drain to Supabase with retry/idempotency keys.
- `src/contexts/UserDataContext.tsx` is the orchestration layer — UI components should go through this rather than touching localStorage / Supabase directly.
- `src/lib/wordProgressSync.ts` — canonical normalization between local and server word-progress payloads (used both client-side and inside Supabase code).

### Supabase client

`src/lib/supabase.ts` resolves env via `resolveSupabaseEnv`. **Dev mode** falls back to a hardcoded dev project; **production mode** (`import.meta.env.PROD`) throws if `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing — never silently degrade in prod. Mirror this fail-fast posture for any new prod-required env.

### AI gateway

Client → Supabase Edge Function flow lives in `src/services/aiGateway.ts`. It attaches a Bearer access token from `supabase.auth.getSession()`; `AuthRequiredError` and `EdgeFunctionError` are the typed failures callers should handle.

Edge functions live in `supabase/functions/<name>/index.ts` and share helpers in `supabase/functions/_shared/` (`auth.ts`, `cors.ts`, `deepseek.ts`, `context-engine.ts`, `coaching-policy.ts`, `memory-engine.ts`, `tool-router.ts`, `supabase-admin.ts`). Backend LLM calls hit DeepSeek (`DEEPSEEK_API_KEY`). Required secrets and the full deploy command list are in `supabase/functions/README.md`.

**Vercel does not deploy Supabase functions or migrations.** A push deploys the frontend only; backend changes need `supabase db push --linked` and `supabase functions deploy <name>` separately.

### Coaching policy (duplicated module — keep in sync)

`src/features/coach/coachingPolicy.ts` and `supabase/functions/_shared/coaching-policy.ts` are intentional byte-identical copies. The client builds chat requests with this contract; the Edge Function consumes it server-side. The module has no imports and uses only portable TypeScript so it can run in both Node/Vite and Deno. A test enforces the two copies match — when editing one, edit both.

The policy emits structured `coaching_actions` from chat replies; `src/services/coachingActionRouter.ts` turns `schedule_review` / `retry_with_hint` actions into `coachReviewQueue` entries.

### Domain services

`src/services/` is the domain layer (no React). Notable modules:

- `fsrs.ts` — FSRS-5 spaced repetition (the SRS algorithm, do not regress to SM-2). `fsrsMigration.ts` upgrades old SM-2 payloads.
- `learningEngine.ts`, `learnerModel.ts`, `learningMissions.ts`, `learningPathProgress.ts`, `recommendationEngine.ts` — adaptive planning + missions.
- `mistakeCollector.ts`, `coachReviewQueue.ts`, `reviewWindows.ts` — error capture → review queue.
- `gamification.ts`, `socialLeaderboard.ts`, `reminderService.ts` — engagement loops.
- `aiGateway.ts`, `aiExamCoach.ts`, `chatArtifacts.ts`, `memoryCenter.ts`, `tts.ts`, `pronunciationScorer.ts`, `writingAnalytics.ts`, `retentionInsights.ts` — AI surfaces.
- `billingGateway.ts` — entitlement reads. Billing must stay **fail-closed**: missing Stripe/Alipay config returns 503; clients cannot write entitlements (RLS enforced in `supabase/migrations/20260424120000_billing_fail_closed_rls.sql`).

`src/features/<area>/` holds feature-specific runtime/state/components (chat, coach, exam, learning, paths, practice, pronunciation, social, writing, calendar). UI primitives live in `src/components/ui/` (shadcn/Radix style) and feature-agnostic widgets in `src/components/`.

### Type contracts

`src/types/core.ts` is the authoritative domain type module (CEFR, Skill, FSRSState, Word, Rating, etc.). Older duplicate types still exist in `src/data/localStorage.ts` and `src/data/wordBooks.ts` for backward compat; prefer importing from `src/types/`.

## Working in this repo

- Path alias is `@/...` everywhere — match existing imports.
- Tests colocate with source under `src/**`. Vitest uses `jsdom` and the global setup is `src/test/setup.ts` (jest-dom matchers).
- The build runs `tsc -b` first, so a passing `npm run build` also confirms typechecking.
- `dist/` is gitignored output — never edit by hand.
- The `harness_progress.md`, `RALPH_PROMPT*.md`, `HARNESS_ENGINE_RALPH_GUIDE.md`, `CLAUDE_CODE_RALPH_PROMPT.md`, and everything under `docs/claude/` describe an autonomous Ralph loop runbook. Treat them as runbooks for that workflow, not as binding rules for one-off tasks unless the user invokes that loop.
