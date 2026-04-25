# VocabDaily Enterprise PRD

> Version: 2026-04-25
> Audience: Claude Code long-running agents, product engineers, reviewers
> Product goal: turn VocabDaily from a feature-rich English app into a serious AI-native learning product with measurable learning outcomes.

## 1. Current Baseline

Production recovery is complete:

- Vercel latest Production deployment is Ready.
- `https://www.uuedu.online/login` returns 200.
- Supabase Auth health returns 200.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist in Vercel Production, Preview, and Development.
- Billing is fail-closed until real Stripe/Alipay secrets are provided.

Recent implemented work:

- Billing webhook and checkout now fail closed when provider secrets are missing.
- Billing RLS was tightened so clients cannot self-upgrade subscriptions or entitlements.
- Production Supabase env now fails fast instead of silently falling back.
- Shared `COACHING_POLICY` exists for the client and Supabase `ai-chat` function.
- `coachingActions` can now be persisted into a local coach review queue.

Important remaining limitation:

- Real Stripe/Alipay payment secrets are not present. Do not fake payment success. Keep checkout fail-closed.

## 2. North Star

VocabDaily should feel like a personal English coach, not a template dashboard.

The user should always know:

- What should I learn now?
- Why this task matters for my goal?
- What did I get wrong?
- What should I do next?
- How is my English actually improving?

## 3. Product Principles

### 3.1 Learning Evidence Over UI State

Any action that claims learning happened must write durable evidence:

- learned word
- hard word
- wrong answer
- retry attempt
- completed micro lesson
- coach feedback
- scheduled review
- weak topic update

Do not mark progress only in local component state.

### 3.2 Coach First, Chat Second

The AI experience is not a generic chatbot. The coach must:

- diagnose before teaching
- ask Socratic follow-up questions
- give tiny challenges
- encourage specifically
- adapt to burnout, backlog, exam goal, and weak topics
- convert errors into future review actions

### 3.3 Daily Loop Beats Feature Count

The core product loop is:

1. Check in with the learner.
2. Select the smallest useful mission.
3. Practice one thing.
4. Give feedback.
5. Schedule review or reinforcement.
6. Recap and set the next step.

Do not build isolated features that do not improve this loop.

### 3.4 Fail Closed For Money And Permissions

Billing, entitlements, webhooks, and subscription state must fail closed.

Rules:

- No provider config means no checkout success.
- Webhooks must verify real secrets.
- Client code cannot write billing entitlements.
- Supabase functions are deployed separately from Vercel.
- Vercel deploys only the frontend.

## 4. Target User Personas

### Exam Sprint Learner

Wants IELTS/TOEFL/CET improvement with visible score impact.

Needs:

- daily exam plan
- writing correction
- speaking roleplay
- weak skill diagnosis
- realistic practice and review

### Busy Professional

Has 10-20 minutes per day and wants workplace English.

Needs:

- business email and meeting scenarios
- low-friction daily plan
- vocabulary in workplace context
- coach accountability without pressure

### Fragile Motivation Learner

Wants consistency but often falls behind.

Needs:

- recovery mode
- tiny missions
- gentle reminders
- clear wins
- no shame from backlog

### Self-Directed Power User

Wants control and transparency.

Needs:

- analytics
- review queue visibility
- custom goals
- roleplay and practice selection
- exportable learning evidence

## 5. Enterprise Quality Bar

Every shipped slice must improve at least one of these:

- learning outcome
- coaching intelligence
- daily retention loop
- UI clarity
- reliability/security

Every shipped slice must include:

- tests for core logic
- `npm run build`
- browser smoke for UI work
- progress ledger entry
- commit with focused scope

## 6. Success Metrics

Primary:

- Day-7 retention
- daily mission completion rate
- review completion rate
- wrong-answer-to-review conversion rate
- coach action persistence rate

Secondary:

- chat response usefulness rating
- average daily learning minutes
- retry completion rate
- review backlog recovery rate
- exam practice streak

Guardrail:

- no payment fail-open
- no entitlement self-upgrade
- no production hardcoded Supabase fallback
- no unverified AI-generated learning completion

## 7. MVP Enterprise Experience

The first mature version must include:

- Today page as a learning mission cockpit.
- Coach that knows learner context and creates review actions.
- Review page that shows due review items only, plus separate reinforcement.
- Practice page that writes mistakes and evidence.
- Chat page that surfaces coaching actions and next steps.
- Learning Path that progresses from evidence, not manual checkboxes.
- Clear production deployment and Supabase release checklist.

