# VLE-06 Regression Eval And Release Report

## Phase Summary

- PHASE_ID: VLE-06
- Phase file: `docs/vocabdaily-learning-ecosystem-prd/phase-06-regression-eval-and-release.md`
- Executor: Codex
- Date: 2026-06-16
- Status: shipped with provider/network blocker documented
- Release decision: ship frontend upgrade, keep Supabase reachability as unresolved production risk

## Deployment

| Item | Value |
| --- | --- |
| Vercel deployment id | `dpl_14ifbn7oSx6jG5zFE4rFrrWN3wDU` |
| Vercel deployment URL | `https://ai-english-learn-inv5tmwfa-zedpl28174-3992s-projects.vercel.app` |
| Production alias | `https://www.uuedu.online` |
| Vercel inspect URL | `https://vercel.com/zedpl28174-3992s-projects/ai-english-learn/14ifbn7oSx6jG5zFE4rFrrWN3wDU` |
| Ready state | `READY` |
| Deployment note | Bare deployment URL returned `401`; production alias returned `200` and is the smoke target. |

## Scope Executed

- Planned work: Run full validation, browser regression, production smoke, bad-token auth smoke, deployment, post-deploy smoke, rollback notes, and release evidence.
- Actual work: Ran all local release gates, deployed to Vercel production, verified the production alias, and captured production smoke results.
- Scope expansions: Added `.gitignore` coverage for `product-audit-*/**/downloads/` so browser download byproducts do not pollute commits.
- Scope not executed: No Supabase migration, no Supabase Edge Function deploy, no production env value change, no billing behavior change.

## Evidence Inventory

| Evidence | Path or command | Result |
| --- | --- | --- |
| Plan | `docs/vocabdaily-learning-ecosystem-prd/reports/vle-06-regression-eval-and-release-plan.md` | Created |
| Lint | `npm run lint` | Passed |
| i18n | `npm run check:i18n` | Passed |
| Build | `npm run build` | Passed |
| Full unit suite | `npm test -- --run` | 103 files, 810 tests passed |
| Diff whitespace | `git diff --check` | Passed |
| Release UI regression | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/ui-regression/summary.json` | 54 route checks, 10 scenarios, 0 failed |
| Release learning-flow regression | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/learning-flow/summary.json` | 114 checks passed, 0 failed |
| Pre-deploy production smoke | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/prod-smoke.txt` | Frontend passed; Supabase reachability failed |
| Post-deploy production smoke | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/prod-smoke-post-deploy.txt` | Frontend passed; Supabase reachability failed |
| Production public browser smoke | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/e2e-prod-smoke-post-deploy.json` | 5 public routes passed, 0 console errors |
| Bad-token smoke | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/bad-token-smoke-post-deploy.json` | 0 refresh requests, 0 console errors |
| Release evidence index | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/evidence-index.md` | Created |

## Validation Results

| Gate | Command or check | Result | Notes |
| --- | --- | --- | --- |
| Lint | `npm run lint` | Passed | No ESLint errors |
| i18n | `npm run check:i18n` | Passed | Key parity check passed |
| Full unit suite | `npm test -- --run` | Passed | 810 tests |
| Build | `npm run build` | Passed | Vite production build completed; Browserslist age warning only |
| Diff whitespace | `git diff --check` | Passed | No whitespace errors |
| UI regression | `BASE_URL=http://127.0.0.1:4173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/ui-regression npm run test:ui-regression` | Passed | 54 route checks, 10 scenarios |
| Learning-flow regression | `BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/release/learning-flow npm run test:learning-flow-regression` | Passed | 114 checks |
| Vercel deploy | `npx vercel --prod --yes` | Passed | Deployment ready and aliased to production |
| Post-deploy public smoke | `BASE_URL=https://www.uuedu.online E2E_REPORT_PATH=... npm run test:e2e:smoke` | Passed | Public routes only; auth skipped because no test credentials/JWT |
| Post-deploy bad-token smoke | custom Playwright smoke | Passed | Redirects to login, clears stale auth cache, no refresh storm |
| Production Supabase smoke | `BASE_URL=https://www.uuedu.online npm run smoke:prod` | Provider/network blocker | Frontend 200 checks passed; Supabase TLS fetch failed |

## Production Smoke Classification

The production frontend is reachable:

- `/login`: 200
- `/`: 200
- `/pricing`: 200
- `/word-of-the-day`: 200
- Playwright public smoke: `/`, `/pricing`, `/login`, `/register`, `/word-of-the-day` all 200 with 0 console errors

The Supabase project domain is not reachable from the current network:

- `https://zjkbktdmwencnouwfrij.supabase.co/auth/v1/health`: TLS connection closed before response
- `https://zjkbktdmwencnouwfrij.supabase.co/`: TLS connection closed before response
- `npm run smoke:prod`: Supabase Auth, AI chat, and billing edge-function checks fail with `fetch failed`

This matches the earlier user-observed production symptom: Supabase requests closed at the network layer. The bad-token route no longer creates a refresh storm, but authenticated Supabase-backed features still depend on provider reachability.

## Acceptance Gate Results

| Acceptance gate | Result | Evidence |
| --- | --- | --- |
| Required local commands pass | Passed | lint, i18n, build, full Vitest, diff check |
| Desktop and mobile regression artifacts exist | Passed | release UI regression summaries and contact sheets |
| Practice retry/reveal and listening no-expected-first-error behavior remain green | Passed | release learning-flow regression |
| Production frontend is reachable | Passed | prod smoke frontend checks and Playwright public smoke |
| Bad-token auth does not refresh storm | Passed | post-deploy bad-token smoke, 0 refresh requests |
| Production Supabase health is reachable | Blocked | TLS connection closed to Supabase project domain |
| Deployment completed | Passed | Vercel deployment `dpl_14ifbn7oSx6jG5zFE4rFrrWN3wDU` |

## Compliance Gate Results

| Compliance gate | Result | Evidence |
| --- | --- | --- |
| No secrets printed or committed | Passed | Smoke output prints only Supabase URL, not anon key |
| Billing fail-closed behavior unchanged | Passed | No billing source edits; billing smoke cannot reach provider due Supabase TLS blocker |
| Auth refresh failure does not loop | Passed | Bad-token smoke cleared cached session and redirected to login |
| AI provider failure does not block core local/demo flows | Passed | Learning-flow regression and local-auth chat storage policy |
| Production deployment had prior user request | Passed | User requested commit, push, and Vercel deployment earlier in the thread |

## Rollback and Recovery

Frontend rollback:

- Use Vercel to promote the previous known-good production deployment, or revert the release commit and run `npx vercel --prod --yes` again.

Supabase rollback:

- No Supabase function was deployed in this phase.
- If later Supabase functions are changed, redeploy the previous known-good function bundle with `supabase functions deploy <function-name>` after approval.

Database rollback:

- No database migration was run in this phase.
- If a future migration is required, use a forward revert migration after backup confirmation.

Feature rollback:

- Revert the release commit to remove the learning ecosystem upgrade from the frontend.
- If a smaller rollback is required, hide new route entry points and keep the local-auth bad-token/session cleanup behavior.

## Monitoring Checklist

Watch these first after release:

- Browser console count on `/dashboard/today` for Supabase network failures.
- Supabase Auth health reachability from the target user region.
- `/auth/v1/token?grant_type=refresh_token` request count during stale-session visits.
- Chat, writing, pronunciation Edge Function reachability.
- Pricing checkout fail-closed behavior.
- Vercel deployment health and 4xx/5xx rate for `www.uuedu.online`.

## Unresolved Risks

- Supabase project domain is currently unreachable from this environment and matched the user screenshot symptom. This is not fixed by a frontend deploy. It needs Supabase project/network/DNS/region investigation or an app-level fallback strategy for production users in affected networks.
- Authenticated AI, billing, and sync smoke with a real JWT was not run because no production test JWT was available.
- The bare Vercel deployment URL returned 401; production alias is the verified public URL.

## Next Action

- Investigate Supabase reachability for `zjkbktdmwencnouwfrij.supabase.co` from the affected user network.
- If Supabase remains blocked in the target region, add a production-grade fallback or proxy strategy before relying on Supabase-backed authenticated flows there.
