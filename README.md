# VocabDaily AI

AI-native English learning app focused on daily vocabulary growth, FSRS review, guided practice, IELTS prep, and conversational tutoring.

## What It Includes

- FSRS-based spaced repetition with offline-first progress storage
- Daily learning cockpit: `Today`, `Review`, `Practice`, `Coach`, `Exam Prep`
- AI chat tutor backed by Supabase Edge Functions
- Writing feedback, pronunciation practice, memory center, analytics, onboarding
- PWA-capable Vite frontend with Supabase auth and sync

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind, Framer Motion
- Data/Auth: Supabase
- Local persistence: IndexedDB via `idb`
- Testing: Vitest + Testing Library
- Deployment: Vercel for the frontend, Supabase for database/functions

## Local Development

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

3. Fill the required frontend env vars in `.env`

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- optional demo account vars if you use the demo login flow

4. Start the app

```bash
npm run dev
```

## Quality Checks

```bash
npm test
npm run build
npm run lint
```

## Project Structure

- `src/pages/dashboard/` core product surfaces
- `src/services/` learning engine, AI adapters, personalization, sync
- `src/data/` bundled content, seed data, local storage models
- `src/lib/` Supabase, IndexedDB, shared infra
- `supabase/migrations/` schema and RLS changes
- `supabase/functions/` AI and billing edge functions

## Deployment

### Frontend

Pushes to the connected branch can auto-deploy to Vercel. This covers the Vite app only.

### Supabase

Supabase migrations and Edge Functions are not deployed by Vercel. When backend changes are included, deploy them separately:

```bash
supabase db push --linked
supabase functions deploy ai-chat
supabase functions deploy ai-grade-writing
supabase functions deploy pronunciation-assess
supabase functions deploy memory-list memory-remember memory-delete memory-pin memory-clear-expired
```

See `supabase/functions/README.md` for the full list and required secrets.

## Notes

- The frontend can run with partial backend availability because many learning flows have local fallbacks.
- The highest-value backend path for production is `ai-chat` plus the grading and memory functions.
- Vercel rewrites are configured in `vercel.json`.
