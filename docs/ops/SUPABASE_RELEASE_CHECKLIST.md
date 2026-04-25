# Supabase Release Checklist

> Audience: anyone preparing or shipping a backend change to VocabDaily.
> Vercel auto-deploys the Vite frontend on push to `main`. **It does not
> deploy Supabase migrations or Edge Functions.** Use this checklist for
> every backend release.

## 0. Prerequisites

- Supabase CLI installed and linked to the production project:
  ```bash
  supabase --version            # 1.180+ recommended
  supabase link --project-ref <ref>   # only once per machine
  ```
- You are signed into the Supabase dashboard with a role that can read
  policies, secrets, and functions.
- The branch you are releasing has a green `npm run build` and
  `npx vitest run` locally.
- Production env vars on Vercel are still present:
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_BASE_URL`.

## 1. Migrations

### Plan
- List the new migration files since the last release:
  ```bash
  git diff --name-only origin/main...HEAD -- supabase/migrations/
  ```
- For each new migration, confirm:
  - It is additive or has a documented rollback.
  - It does not introduce client-writable RLS on `subscriptions`,
    `entitlements`, `pro_users`, or any billing-adjacent table. (See
    `20260424120000_billing_fail_closed_rls.sql` for the canonical
    fail-closed shape.)
  - It does not loosen RLS on `learning_events`, `chat_sessions`,
    `chat_messages`, `chat_quiz_items`, `user_word_progress`, or
    `agent_memory_*`.

### Apply
- Push to the linked production project:
  ```bash
  supabase db push --linked
  ```
- Or, if you prefer manual control: copy each migration's SQL into the
  Supabase Dashboard's SQL Editor and run it. Record the run timestamp
  in this PR.

### Verify
- Inspect RLS for any table the migration touched:
  ```bash
  supabase db remote sql --linked --file - <<'SQL'
    SELECT polname, polcmd, polqual::text
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('subscriptions', 'entitlements');
  SQL
  ```
- Run a representative `SELECT` from the new table/columns with the
  service role key to confirm shape. Then run the same query with the
  anon key to confirm RLS rejects it (where appropriate).

## 2. Edge Functions

### Plan
- List the function folders that changed:
  ```bash
  git diff --name-only origin/main...HEAD -- supabase/functions/
  ```
- For each touched function, identify:
  - Did `supabase/functions/_shared/*` change? If yes, every function
    that imports it needs to be redeployed.
  - Does the function rely on a new secret? If yes, set it before
    deploying (Section 3) or the function will return 500 on the
    first call.
  - Did the response shape change? If yes, the frontend version that
    consumes it must already be deployed (Vercel preview is fine).

### Deploy
- Deploy a single function:
  ```bash
  supabase functions deploy <function-name>
  ```
- Deploy the full coach + memory stack (use this when
  `supabase/functions/_shared/coaching-policy.ts` changes — both
  copies must stay byte-identical, see QA-02 guard test):
  ```bash
  supabase functions deploy ai-chat
  supabase functions deploy ai-grade-writing
  supabase functions deploy pronunciation-assess
  supabase functions deploy memory-list
  supabase functions deploy memory-remember
  supabase functions deploy memory-delete
  supabase functions deploy memory-pin
  supabase functions deploy memory-clear-expired
  ```
- Deploy billing only when Stripe/Alipay-bound code changes:
  ```bash
  supabase functions deploy billing-create-checkout
  supabase functions deploy billing-webhook-stripe
  supabase functions deploy billing-webhook-alipay
  ```

### Verify
- Hit the function with a real Bearer token from the prod project:
  ```bash
  curl -sS -X POST "$SUPABASE_URL/functions/v1/ai-chat" \
    -H "Content-Type: application/json" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $JWT" \
    -d '{"messages":[{"role":"user","content":"healthcheck"}]}' \
    | jq '.provider, .agentMeta.coachingPolicyVersion'
  ```
  Expect `"edge"` (or `"fallback"` if `DEEPSEEK_API_KEY` is intentionally
  missing) and a non-empty policy version.
- Check function logs for the last 5 minutes:
  ```bash
  supabase functions logs <function-name> --since 5m
  ```

## 3. Secrets

### Required (the function will not work without these)
- `DEEPSEEK_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `APP_BASE_URL`

### Required for billing (fail-closed without them)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_YEARLY`
- `ALIPAY_APP_ID`
- `ALIPAY_PRIVATE_KEY`
- `ALIPAY_PUBLIC_KEY`
- `ALIPAY_NOTIFY_URL`

### Optional (graceful degradation when missing)
- `TAVILY_API_KEY` — disables web search.
- `EMBEDDING_API_URL` / `EMBEDDING_API_KEY` / `EMBEDDING_MODEL` — falls
  back to local hash embeddings.

### Rotate / set
```bash
supabase secrets set DEEPSEEK_API_KEY=$(cat ~/.secrets/deepseek)  # never commit
supabase secrets list   # confirm presence; values are not displayed
```

**Never paste a secret into a commit or PR description.** If a secret
ends up in git history, rotate it immediately and force-push only after
rotating the upstream credential.

## 4. Auth redirect URLs

When the production domain or any preview alias changes:
- Supabase Dashboard → Authentication → URL Configuration
- Add the new URL under both **Site URL** and **Redirect URLs**.
- Confirm `auth/callback` is reachable on the new domain:
  ```bash
  curl -sI "$APP_BASE_URL/auth/callback" | head -1
  ```
- After the change, perform a real magic-link login from a clean
  browser to confirm the redirect lands on `/dashboard/today`.

## 5. RLS verification

Before declaring the release done, confirm none of the high-risk tables
expose write access to the anon role:

```bash
supabase db remote sql --linked --file - <<'SQL'
  SELECT
    tablename,
    polname,
    polcmd,
    polroles::text
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'subscriptions',
      'entitlements',
      'pro_users',
      'billing_events',
      'usage_quota'
    )
  ORDER BY tablename, polname;
SQL
```

Expected: every policy on these tables either targets the service role
only, or restricts INSERT/UPDATE/DELETE to a server-side function.

## 6. Production smoke

Run after migrations + functions have been deployed:

```bash
# Frontend reachable
curl -sI https://www.uuedu.online/login | head -1
# Expect: HTTP/2 200

# Supabase Auth health
curl -sI "$SUPABASE_URL/auth/v1/health" | head -1
# Expect: HTTP/2 200

# Edge function reachable (replace JWT with a fresh prod session token)
curl -sS -X POST "$SUPABASE_URL/functions/v1/ai-chat" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $JWT" \
  -d '{"messages":[{"role":"user","content":"healthcheck"}]}' \
  | jq -e '.content // .error'

# Billing fail-closed when secrets are missing (intentional 503)
curl -sS -X POST "$SUPABASE_URL/functions/v1/billing-create-checkout" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $JWT" \
  -d '{"plan":"pro_monthly"}' -i | head -1
# Expect: HTTP/2 503 when STRIPE_* secrets are absent.
```

For UI-impacting changes, also run the playwright smoke locally
against the prod URL:

```bash
BASE_URL=https://www.uuedu.online npm run test:e2e:smoke
```

## 7. Rollback

### Migrations
- Most migrations are additive (new tables, new columns with defaults,
  new policies). Roll back by reversing the change in a new migration,
  not by editing or dropping the original file.
- For a destructive migration that broke production:
  1. Identify the offending migration's filename from the deploy log.
  2. Write a follow-up migration `<timestamp>_revert_<original>.sql`
     that undoes the change. Keep both files in git so the audit
     trail is intact.
  3. Deploy with `supabase db push --linked`.
  4. Communicate the data shape change to anyone running offline
     analytics.

### Edge functions
- Re-deploy the previous git revision of the function:
  ```bash
  git checkout <prev-sha> -- supabase/functions/<name>
  supabase functions deploy <name>
  git checkout HEAD -- supabase/functions/<name>   # restore working tree
  ```
- Versions are not durably rolled back by Supabase — the latest deploy
  wins. Keep the rollback PR open so the next deploy of `<name>` is
  guaranteed to include the same fix or a forward-compatible change.

### Secrets
- Rotation only — never delete and re-add without confirming downstream
  callers can absorb the brief 500 spike. Set the new value first
  (`supabase secrets set …`), confirm function logs show the new value
  picked up (functions reload secrets on cold start), then revoke the
  old credential at the provider.

### Auth redirect URLs
- Removing a URL takes effect immediately and will break any browser
  tabs mid-flow. Add the new URL first, ship the frontend that
  produces it, then remove the old URL after ≥24h of no
  `auth/callback?error=invalid_redirect` errors in the logs.

## 8. Post-release

- Update the `harness_progress.md` ledger with the deployed shas, the
  exact `supabase functions deploy` invocations, and any
  `supabase secrets set` keys that changed.
- Tag the release locally if you want a stable revert anchor:
  ```bash
  git tag -a backend-$(date +%Y%m%d-%H%M) -m "Backend release"
  git push origin --tags
  ```
- If billing or RLS changed, copy the prod RLS audit query from
  Section 5 into the PR description so future reviewers see the
  expected shape.
