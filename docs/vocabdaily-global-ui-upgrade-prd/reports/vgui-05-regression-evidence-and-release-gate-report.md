# VGUI-05 Phase Report

**Phase:** VGUI-05 Regression Evidence And Release Gate

**Status:** passed with production provider warning

**Date:** 2026-06-17

---

## Summary

The global UI upgrade has passed the full local release gate, browser regression, Vercel production deployment, and production bad-token browser smoke. The app is deployed and aliased at `https://www.uuedu.online`.

One provider warning remains: the configured Supabase project ref `zjkbktdmwencnouwfrij.supabase.co` is not publicly resolvable. DNS-over-HTTPS returns NXDOMAIN for both A and AAAA records, so `npm run smoke:prod` cannot reach Supabase Auth, AI chat, or billing functions. The app now routes production Supabase traffic through `/api/supabase` and fails closed with a non-sensitive `upstreamHost` diagnostic instead of starting a refresh storm or using an implicit fallback. The current frontend bundle does not trigger the prior refresh-token storm: production bad-token smoke observed 0 refresh-token requests, cleared the stale token, migrated old dark preference to light, and redirected to login.

## Plan Followed

Plan file: `docs/vocabdaily-global-ui-upgrade-prd/reports/vgui-05-regression-evidence-and-release-gate-plan.md`

1. Ran full local validation: lint, i18n, build, and full Vitest suite.
2. Ran final UI regression for all scoped routes with desktop/mobile contact sheets.
3. Ran final learning-flow regression for light/dark/system, desktop/mobile, fast route switching, and retry/reveal interactions.
4. Ran pre-deploy production smoke and diagnosed Supabase provider reachability failure from the current network.
5. Verified local bad-token browser behavior: no refresh-token request, stale token cleared, redirect to login.
6. Deployed to Vercel production and confirmed alias to `https://www.uuedu.online`.
7. Ran post-deploy production smoke and production bad-token browser behavior.
8. Wrote release evidence and remaining risk.

## Validation Evidence

| Gate | Command or Check | Result | Notes |
| --- | --- | --- | --- |
| Lint | `npm run lint` | passed | ESLint completed with zero errors. |
| i18n | `npm run check:i18n` | passed | i18n key parity check passed. |
| Full tests | `npm test -- --run` | passed | 103 test files, 810 tests passed. |
| Build | `npm run build` | passed | Production build completed. Existing Browserslist age warning only. |
| Final UI regression | `BASE_URL=http://127.0.0.1:4174 UI_REGRESSION_OUT_DIR=product-audit-2026-06-17/global-ui/vgui-05-final-ui npm run test:ui-regression` | passed | 54 route checks, 10 scenarios, 0 failures; desktop and mobile contact sheets generated. |
| Final learning-flow regression | `BASE_URL=http://127.0.0.1:4174 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-17/global-ui/vgui-05-final-learning-flow npm run test:learning-flow-regression` | passed | 142 checks, 0 failures. |
| Local bad-token smoke | Playwright against `http://127.0.0.1:4174/dashboard/today` | passed | 0 refresh-token requests, 0 console errors, stale token cleared, redirected to `/login`. |
| Pre-deploy production smoke | `set -a; source .env; set +a; npm run smoke:prod` | provider warning | Frontend `/`, `/login`, `/pricing`, and `/word-of-the-day` returned 200. Supabase Auth, AI chat, and billing function checks failed with `fetch failed`. |
| Supabase reachability diagnosis | `curl -I $VITE_SUPABASE_URL/auth/v1/health` and DNS lookup | provider warning | Host resolved to `198.18.0.17`; curl failed with `LibreSSL SSL_connect: SSL_ERROR_SYSCALL`. |
| Vercel deploy | `npx vercel --prod --yes` | passed | Deployment `dpl_AmbxY5xomBkp4i3thgGBwKBFW6Vg` ready; alias `https://www.uuedu.online`. |
| Post-deploy production smoke | `set -a; source .env; set +a; npm run smoke:prod` | provider warning | Same as pre-deploy: frontend 200, Supabase provider fetch failed from current network. |
| Protected deployment URL smoke | `BASE_URL=https://ai-english-learn-noxvsc1tw-zedpl28174-3992s-projects.vercel.app npm run smoke:prod` | expected protection | Direct deployment URL returned 401 due Vercel deployment protection; production alias is the user-facing URL. |
| Production bad-token smoke | Playwright against `https://www.uuedu.online/dashboard/today` | passed | 0 refresh-token requests, 0 console errors, stale token cleared, old dark preference migrated to light, redirected to `/login`. |
| Production home smoke | Playwright against `https://www.uuedu.online/` | passed | H1 `今天练什么`, root theme `light`, body background `rgb(246, 247, 249)`. |
| Supabase proxy hardening | `npx vercel --prod --yes` then `npm run smoke:prod` | blocked by provider config | Latest deployment `dpl_DePiLpvEWvHxwZoaTdAqqqzMH65s` is READY and aliased. `/api/supabase/*` returns `502` with `upstreamHost: "zjkbktdmwencnouwfrij.supabase.co"`. Cloudflare DNS-over-HTTPS returns NXDOMAIN for that host; `api.supabase.com` itself is reachable. |

## Browser Evidence

- Final UI summary: `product-audit-2026-06-17/global-ui/vgui-05-final-ui/summary.json`
- Final UI contact sheets:
  - `product-audit-2026-06-17/global-ui/vgui-05-final-ui/contact-sheet-desktop.html`
  - `product-audit-2026-06-17/global-ui/vgui-05-final-ui/contact-sheet-mobile.html`
- Final UI screenshots: `product-audit-2026-06-17/global-ui/vgui-05-final-ui/screenshots/`
- Final learning-flow summary: `product-audit-2026-06-17/global-ui/vgui-05-final-learning-flow/summary.json`
- Final learning-flow screenshots: `product-audit-2026-06-17/global-ui/vgui-05-final-learning-flow/screenshots/`
- Production home screenshot: `product-audit-2026-06-17/global-ui/vgui-05-prod-home.png`

## Deployment Evidence

- Production URL: `https://www.uuedu.online`
- Vercel deployment URL: `https://ai-english-learn-avh4hriy0-zedpl28174-3992s-projects.vercel.app`
- Vercel deployment id: `dpl_DePiLpvEWvHxwZoaTdAqqqzMH65s`
- Inspector: `https://vercel.com/zedpl28174-3992s-projects/ai-english-learn/DePiLpvEWvHxwZoaTdAqqqzMH65s`
- Ready state: `READY`
- Target: `production`
- Alias: `https://www.uuedu.online`

## Release Notes

- Default and migrated user experience is light. Old stored non-light theme preferences migrate once to `light`.
- Manual dark mode remains available, but it is no longer near-black.
- Practice first wrong attempt does not reveal the answer; second wrong or explicit reveal shows answer; listening follows the same rule.
- Specialist modules, dashboard shell, and public/auth surfaces have passed final browser route coverage.
- Production Supabase reachability is blocked by the configured project ref. Restore the Supabase project DNS or update Vercel Production with a valid `VITE_SUPABASE_URL`/`SUPABASE_URL` plus `VITE_SUPABASE_ANON_KEY`/`SUPABASE_ANON_KEY`, then rerun `npm run smoke:prod`.

## Rollback Plan

If the UI release must be reverted, roll back Vercel deployment `dpl_AmbxY5xomBkp4i3thgGBwKBFW6Vg` from the Vercel dashboard or CLI, then revert the commit containing this phase.

## Handoff Notes

No further PRD phases remain. The only unresolved item is external Supabase project configuration: `zjkbktdmwencnouwfrij.supabase.co` returns NXDOMAIN from public DNS, while `api.supabase.com` is reachable. Frontend bad-token behavior has been verified locally and on production.
