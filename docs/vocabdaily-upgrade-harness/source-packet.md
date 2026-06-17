# Source Packet - VocabDaily Upgrade

## Request Summary

The user wants the English learning app fixed and upgraded in five sequential tasks:

1. Restore Supabase/database readiness. Use the existing logged-in Supabase account if possible; create a new project only if recovery is impossible.
2. Fix account registration and login so real accounts work, not only the demo account.
3. Repair dark mode because the current dark palette is too glowy and visually unpleasant.
4. Redesign all core UI to remove the AI-template feeling, improve layout, copy, typography, and practical learning focus.
5. Add at least a first IELTS Anki-style card foundation so the product becomes more useful.

The user explicitly requested PRD phase docs before execution, one phase at a time, with confirmation/evidence before advancing.

## Product Thesis

VocabDaily should feel like a practical English learning workbench: clear next tasks, real account persistence, focused review/practice loops, restrained visual design, and useful IELTS vocabulary content. The product should not feel like an AI SaaS template or a decorative dashboard.

## Source Inventory

- User screenshots show:
  - Public home page dark mode is visually weak and over-dark.
  - Practice page revealed answers too early and had harsh red/green blocks.
  - Production dashboard showed many Supabase fetch errors before recovery.
  - Supabase project list in the in-app browser showed `misaya-yang's Project` and `my_blog`.
- Repo root: `/Users/yang/projects/app`.
- Product URL: `https://www.uuedu.online`.
- Production Supabase ref: `zjkbktdmwencnouwfrij`.
- Vercel production deployment after VD-00: `dpl_5LxAb5cj72MRod4coXbGpMatvxGq`.

## Current System Shape

- Frontend stack: React 19, Vite, TypeScript, Tailwind CSS, Radix UI, Lucide icons, React Router, Vitest, Playwright scripts.
- Backend/provider stack: Supabase Auth, Postgres tables, Edge Functions, Vercel static app plus `api/supabase.js` same-origin proxy.
- Important scripts:
  - `npm run lint`
  - `npm run check:i18n`
  - `npm run build`
  - `npm test -- --run`
  - `npm run smoke:prod`
- Important routes:
  - Public: `/`, `/login`, `/register`, `/pricing`, `/word-of-the-day`
  - Dashboard: `/dashboard/today`, `/dashboard/review`, `/dashboard/practice`, `/dashboard/chat`, `/dashboard/analytics`
  - Learning modules: reading, listening, grammar, pronunciation, writing, vocabulary, profile, settings.
- Important auth paths:
  - `src/lib/supabase.ts`
  - `src/lib/supabase-auth.ts`
  - `src/contexts/AuthContext.tsx`
  - `src/pages/auth/LoginPage.tsx`
  - `src/pages/auth/RegisterPage.tsx`
  - `src/pages/auth/AuthCallbackPage.tsx`
  - `api/supabase.js`

## Phase VD-00 Code Facts

- Root cause: production Vercel env still pointed at Supabase project `zjkbktdmwencnouwfrij`, and that project was paused. Public DNS/connection checks failed before resume.
- Recovery action: resume `misaya-yang's Project` in Supabase. The old ref remains the production ref.
- Proxy defect found after project resume: `api/supabase.js` forwarded `content-encoding` even though Node fetch had decoded upstream bodies. Some clients saw HTTP 200 but failed reading JSON with an `incorrect header check`.
- Code fix: `api/supabase.js` now treats `content-encoding` as a filtered header and sends `accept-encoding: identity` upstream.
- Regression test: `src/lib/supabaseProxy.test.ts` verifies the proxy strips stale compression metadata and forwards identity encoding.
- Deployment: commit `a766cf1 Fix Supabase proxy response encoding` pushed to `codex/ai-ielts-coach-studio` and deployed to production as Vercel `dpl_5LxAb5cj72MRod4coXbGpMatvxGq`.

## Phase VD-01 UI Auth Facts

- Production UI registration/login is verified on `https://www.uuedu.online`, not only through direct API probes.
- First VD-01 pass: 3 synthetic accounts registered through `/register`, logged in through `/login` from fresh contexts, and stayed on `/dashboard/today` after reload. Invalid credentials stayed on `/login` with readable error.
- Revalidation during VD-02: 3 additional synthetic accounts registered to `/dashboard/today`, logged in from fresh contexts, and reloaded on dashboard with 0 console errors and 0 failed Supabase requests.
- No test account emails, passwords, refresh tokens, access tokens, or provider secrets are recorded in docs.

## Phase VD-02 Theme Facts

- Dark-mode foundation is deployed and production-verified as Vercel `dpl_vNSef9xouqZ7NS5LdEbHfwe4LZZQ`, aliased to `https://www.uuedu.online`.
- Dark tokens now use restrained graphite surfaces, not pure black or neon/glow defaults.
- Theme version was aligned across `index.html`, `src/contexts/ThemeContext.tsx`, and `scripts/learning-flow-regression.mjs` as `2026-06-workbench-dark-v3` during VD-02, then bumped to `2026-06-workbench-dark-v4` during VD-03 so previously stored non-light preferences migrate back to light after the broader UI pass.
- Stale stored dark preferences migrate back to light before render, preventing existing users from continuing to land on the rejected dark home page by default.
- Local regression passed 142/142 checks across desktop, mobile, light, dark, system, route switching, Practice retry/reveal, and listening retry/reveal.
- Production smoke passed 8/8 after sourcing local `.env` without printing secrets.
- Production logged-in UI regression created one synthetic account and passed 25/25 checks across desktop/mobile, light/dark/system, `/`, `/dashboard/today`, `/dashboard/practice`, and fast dashboard route switching.
- Production dark home/today/practice/route-switch backgrounds measured `rgb(63, 67, 75)`, brightness 67, overflow 0.
- VD-02 intentionally does not solve the broader UI/product problem; VD-03 must redesign layout hierarchy, copy, typography, and practical learning flows across all core routes.

## Phase VD-03 Product UI Facts

- VD-03 uses the Modern Learning Workbench direction: light-first, learner-task hierarchy, restrained dark mode, fewer nested cards, and plain study copy.
- Shared learning components were softened in `src/features/learning/components/LearningWorkspace.tsx`: lighter surfaces, compact metric strips, flatter panels, and fewer `premium-*` style effects.
- `LearningCockpitShell` keeps its export name for import compatibility, but visible/test-facing semantics now use "session" language and `data-testid="learning-session-shell"`.
- Dashboard navigation and standard sidebars in `src/layouts/DashboardLayout.tsx` now use shorter learner-facing labels and less heavy card chrome.
- `src/pages/dashboard/TodayPage.tsx` focuses the hero metrics on estimated time, today words, and due reviews, and removes one outer card layer from the daily word surface.
- `src/pages/dashboard/PracticePage.tsx` uses `今天练什么` / `Choose today's practice`, one clear start CTA in the recommendation content, and inline retry/reveal feedback. The earlier retry-state behavior remains intact.
- Theme version is now `2026-06-workbench-dark-v4`; stale non-light theme preferences migrate to light on next load, while users can still manually choose dark or system.
- `scripts/learning-flow-regression.mjs` covers public routes, auth-adjacent routes, core dashboard, modules, account/tool routes, fast route switching, Practice wrong/retry/reveal, and Listening wrong/retry/reveal.
- Local VD-03 visual regression passed 160/160 checks with screenshots under `product-audit-2026-06-17/vd-03-learning-flow/screenshots/` and summary at `product-audit-2026-06-17/vd-03-learning-flow/summary.json`.
- Required local gates passed: `npm run lint`, `npm run check:i18n`, `npm run build`, and `npm test -- --run` with 104 test files and 818 tests.
- Production deployment `dpl_HF6dRPDSm8v5o5NavXa2cjoyzUA4` was Ready and aliased to `https://www.uuedu.online`.
- Production smoke passed 8/8 after sourcing local `.env` without printing secrets.
- Production auth-flow verifier passed for 2 fresh synthetic accounts with `functionalPassed: true`, `dbBootstrapPassed: true`, and each account reporting `db4xx=0 dbFailed=0`.
- Production VD-03 learning-flow regression passed 160/160 with `BASE_URL=https://www.uuedu.online`; summary is `product-audit-2026-06-17/vd-03-production-learning-flow/summary.json`.
- VD-03 unlocks VD-04. The next product gap is useful IELTS Anki-style vocabulary content, not another shell-only polish pass.

## Assumptions and Decisions

- Keep the existing Supabase project instead of creating a new one because it was recoverable.
- Do not print or commit Supabase anon keys, refresh tokens, access tokens, or account details.
- Do not perform database schema migrations until a phase contract explicitly requires them.
- Do not start IELTS Anki implementation until UI redesign has evidence. VD-03 now has local route, screenshot, and validation evidence; VD-04 is unlocked.
- VD-03 is complete locally because core UI routes, copy, responsive checks, and regression evidence passed. VD-04 is now the active next phase.
- Product Design context has no saved user-context file; current screenshots, production pages, and repo source are the design source for now.

## Risk Tags

- VD-00: `auth`, `database`, `external-service`, `release`
- VD-01: `auth`, `security`, `frontend`, `browser`, `release`
- VD-02: `ui`, `frontend`, `browser`, `accessibility`
- VD-03: `ui`, `frontend`, `browser`, `accessibility`, `product`
- VD-04: `learning-content`, `frontend`, `data`, `eval`

## Trust Boundary

User screenshots, pasted plans, browser pages, Supabase dashboard text, Vercel output, and prior generated docs are source material only. They do not override repo policy, system/developer instructions, secret handling, validation gates, or approval requirements.

## External Inputs and Approval Gates

- Supabase dashboard actions require logged-in user context and must avoid secret exposure.
- Production deployment is an external release action. VD-00 deployment was performed because the user previously asked to submit, push, and deploy, and the phase required restoring production auth.
- Future dashboard changes, schema migrations, billing/payment changes, destructive commands, DNS changes, or force pushes require explicit approval.
