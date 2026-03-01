# Supabase Edge Functions (AI Gateway)

This folder contains the first version of the AI gateway and content/member endpoints:

- `ai-chat`
- `ai-grade-writing`
- `ai-generate-sim-item`
- `ai-generate-micro-lesson`
- `content-units`
- `entitlement-check`

## Required secrets

Set in Supabase project secrets:

- `DEEPSEEK_API_KEY`

## Deploy example

```bash
supabase functions deploy ai-chat
supabase functions deploy ai-grade-writing
supabase functions deploy ai-generate-sim-item
supabase functions deploy ai-generate-micro-lesson
supabase functions deploy content-units
supabase functions deploy entitlement-check
```
