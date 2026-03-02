# Supabase Edge Functions (AI Gateway)

This folder contains the first version of the AI gateway and content/member endpoints:

- `ai-chat`
- `ai-grade-writing`
- `ai-generate-sim-item`
- `ai-generate-micro-lesson`
- `content-units`
- `entitlement-check`
- `ai-generate-track-unit`
- `ai-validate-content`
- `billing-create-checkout`
- `billing-webhook-stripe`
- `billing-webhook-alipay`
- `memory-list`
- `memory-remember`
- `memory-delete`
- `memory-pin`
- `memory-clear-expired`

## Required secrets

Set in Supabase project secrets:

- `DEEPSEEK_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `APP_BASE_URL`
- `TAVILY_API_KEY` (optional; web search is skipped when absent)
- `EMBEDDING_API_URL` (optional; if absent, local hash embeddings are used)
- `EMBEDDING_API_KEY` (optional)
- `EMBEDDING_MODEL` (optional)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_YEARLY`
- `ALIPAY_APP_ID`
- `ALIPAY_PRIVATE_KEY`
- `ALIPAY_PUBLIC_KEY`
- `ALIPAY_NOTIFY_URL`

## Deploy example

```bash
supabase functions deploy ai-chat
supabase functions deploy ai-grade-writing
supabase functions deploy ai-generate-sim-item
supabase functions deploy ai-generate-micro-lesson
supabase functions deploy content-units
supabase functions deploy entitlement-check
supabase functions deploy ai-generate-track-unit
supabase functions deploy ai-validate-content
supabase functions deploy billing-create-checkout
supabase functions deploy billing-webhook-stripe
supabase functions deploy billing-webhook-alipay
supabase functions deploy memory-list
supabase functions deploy memory-remember
supabase functions deploy memory-delete
supabase functions deploy memory-pin
supabase functions deploy memory-clear-expired
```
