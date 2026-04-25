# Production Smoke Coverage Audit (OPS-03)

Last verified: 2026-04-25

This audit compares the contract in OPS-03 against the actual checks in
`scripts/prod-smoke.mjs` (run via `npm run smoke:prod`). The Playwright-based
public-route smoke (`scripts/e2e-smoke.mjs`, `npm run test:e2e:smoke`) is a
secondary signal and is referenced where relevant.

## Acceptance vs implementation

| OPS-03 acceptance | Where covered | Status |
|---|---|---|
| Login page returns 200 | `prod-smoke.mjs` check 1 — `GET ${BASE_URL}/login` | Covered |
| Supabase Auth health 200 | `prod-smoke.mjs` check 3 — `GET /auth/v1/health` with apikey | Covered |
| App shell loads | `prod-smoke.mjs` check 2 — `GET ${BASE_URL}/` | Covered (HTTP-level only) |
| AI chat endpoint availability OR graceful unauthenticated fallback | `prod-smoke.mjs` check 4 — `POST /functions/v1/ai-chat`. With `JWT` env, asserts 200 + non-empty body. Without JWT, asserts 401 (fail-closed) | Covered |
| Pricing checkout fail-closed without provider secrets | `prod-smoke.mjs` check 5 — `POST /functions/v1/billing-create-checkout`. With JWT and missing secrets, asserts 503; with secrets, 2xx must contain a real Stripe/Alipay URL or it warns | Covered |

## Gaps and observations

1. **App-shell content not asserted.** Check 2 only verifies HTTP 200, not
   that the response body actually contains the React shell mount point
   (`<div id="root">`). A misconfigured Vercel rewrite could serve a 200
   error page and still pass. Suggested follow-up: assert the response
   body contains `id="root"` or a known meta tag.
2. **Pricing route itself is not hit.** OPS-03 names "pricing checkout"
   which the smoke covers via the edge function, but the public
   `/pricing` page is not GET-checked. Suggested follow-up: add a 200
   check for `${BASE_URL}/pricing` so a regression in the route would be
   caught even when the user has not generated a JWT.
3. **No assertion that fail-closed billing returns a JSON `error`
   payload.** Check 5 trusts the status code only; a future change that
   accidentally returns 503 with a misleading "checkout pending" body
   would still pass. Suggested follow-up: when 503, also assert
   `response.json().error` exists.
4. **Auth redirect URL not exercised.** The auth health endpoint is hit,
   but there is no check that `${BASE_URL}/auth/callback` is reachable.
   Worth adding when redirect URL drift has caused incidents.
5. **Word of the Day public route uncovered.** WOTD is part of the
   public surface and could regress without the smoke noticing.
   Suggested follow-up: add `GET ${BASE_URL}/word-of-the-day` 200.
6. **Playwright smoke (`npm run test:e2e:smoke`) is decoupled** and runs
   against `BASE_URL` (default `http://127.0.0.1:4174`). It is not part
   of `smoke:prod`; operators must run it explicitly post-deploy. Worth
   documenting in the release checklist (already noted in §6 of
   `SUPABASE_RELEASE_CHECKLIST.md`).

## Out of scope for this audit

- Modifying the smoke script — that is the Dev agent's task.
- Adding new edge function checks beyond the OPS-03 acceptance list.
- Asserting authenticated learner flows (the OPS-03 contract explicitly
  forbids requiring real user credentials).
