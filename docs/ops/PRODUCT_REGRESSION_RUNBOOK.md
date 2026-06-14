# VocabDaily Product Regression Runbook

Last updated: 2026-06-13

Use this runbook after product, UI, learning-loop, auth, billing, or release
changes. It complements the automated smoke coverage in
`docs/ops/SMOKE_COVERAGE.md`; it does not replace unit tests or production
release checks.

## 1. Automated Baseline

Run these before declaring a product slice complete:

```bash
npm run lint
npm run check:i18n
npm run build
npm test -- --run
git diff --check
```

For deploy or staging checks, also run:

```bash
# HTTP and edge-function production smoke.
BASE_URL=https://www.uuedu.online npm run smoke:prod

# Playwright browser smoke against a running preview or deployed URL.
BASE_URL=http://127.0.0.1:4174 npm run test:e2e:smoke
BASE_URL=https://www.uuedu.online npm run test:e2e:smoke
```

`smoke:prod` requires explicit Supabase env:

```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

Use `JWT=...` only when validating authenticated edge-function behavior. Without
`JWT`, AI chat and billing checks should fail closed with `401`.

## 2. Browser Smoke Setup

Local app:

```bash
npm run dev
```

Production-like preview:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4174
```

Recommended viewports:

| Viewport | Size | Use |
|---|---:|---|
| Mobile | `390x844` | Primary mobile regression width |
| Desktop | `1440x900` | Main desktop layout |
| Wide desktop | `1728x1000` | Dense dashboard/chart checks |

For each route, inspect:

- no horizontal overflow at `390px`
- no text/control overlap
- no nested interactive controls for key CTAs
- primary CTA is visually obvious and semantically a single control
- skeletons and empty states explain the next action
- browser console has no new runtime errors

When using an interactive browser during agent work, keep one browser session and
navigate the current page rather than opening a pile of new tabs.

## 3. Core Route Matrix

Public routes:

| Route | Checks |
|---|---|
| `/` | Hero route loads, sample/demo entry visible, legal/footer links present |
| `/demo` | Anonymous sample lesson completes and does not write real user progress |
| `/login` | Real login visible, demo mode clearly marked, returning users redirect to dashboard |
| `/register` | Terms/privacy links visible, redirect query is preserved |
| `/magic-link` | Email form usable, auth copy localized |
| `/pricing` | Pro remains fail-closed when checkout is unavailable, waitlist intent works |
| `/word-of-the-day` | Anonymous CTAs route through auth; authenticated save/practice enters loop |
| `/terms` and `/privacy` | Legal placeholders/release-blocking review notice remain visible |

Core dashboard routes:

| Route | Checks |
|---|---|
| `/dashboard/today` | Exactly one primary mission, evidence chips explain why, next action writes evidence |
| `/dashboard/review` | Due, empty, wrong-answer, stubborn-recovery, and Coach handoff states |
| `/dashboard/practice` | Recommended mode honors learner style/level; local fallback works |
| `/dashboard/chat` | AI-unavailable banner offers retry and local Practice fallback |
| `/dashboard/vocabulary` | Lexicon language, entry detail, collocations, examples, and drill links |
| `/dashboard/analytics` | Real evidence only; no fabricated charts; empty cards have actions |
| `/dashboard/settings` | Learning controls, notifications, lifecycle preview, language/theme toggles |
| `/dashboard/profile` | CEFR, learning style, exam target, level/rank, Pro gate state |
| `/dashboard/learning-path` | Path recommendation, task routing, completion evidence |

Skill/support routes:

| Route | Checks |
|---|---|
| `/dashboard/reading` | IELTS reading drill loads and routes progress back to loop where applicable |
| `/dashboard/listening` | Listening drill loads, audio fallbacks do not block page |
| `/dashboard/grammar` | Rules and fill-in drills render without clipping |
| `/dashboard/pronunciation` | Microphone permission denial degrades gracefully |
| `/dashboard/writing` | AI quota/fallback copy is visible and writing input remains usable |
| `/dashboard/exam` | Exam prep copy, scoring gate, and route shell are localized |
| `/dashboard/memory` | Memory controls are privacy-first and do not expose unrelated data |
| `/dashboard/leaderboard` | Rankings load or empty state explains next action |

## 4. Seeded Personas

Use these personas for manual browser smoke. Prefer app flows and demo mode over
ad hoc local-storage edits. If direct seeding is necessary, record the seed
script in the regression note and remove temporary files before finishing.

| Persona | Setup | Must verify |
|---|---|---|
| Anonymous visitor | Clear site data or use a fresh browser context | Public CTAs do not imply saved progress; auth redirects preserve intent |
| Demo learner | Use the demo/local account CTA on `/login` | Demo badge is visible; no real-account promise is made |
| Empty learner | Demo or local user with no sessions/progress | Analytics and dashboards show actionable empty states, not fake history |
| Due-review learner | Seed or create at least 8 due review words | Today prioritizes review; Review shows due cards and recovery path |
| Stubborn-recovery learner | Mark a reviewed word wrong repeatedly | Review offers recovery/Coach handoff; no dead-end state |
| A1 foundation learner | Onboarding/profile level A1, general target | Today recommends foundation/high-frequency work |
| C1 IELTS learner | Onboarding/profile level C1, IELTS target | Today and Learning Path prioritize advanced output / IELTS-specific work |
| Auditory learner | Profile learning style auditory | Today/Practice favor pronunciation/listening/dictation where relevant |
| Reading-writing learner | Profile learning style reading | Today/Practice favor sentence frame, writing, or reading work |
| Pro-intent visitor | `/pricing`, submit monthly and yearly interest | Waitlist records intent once per cycle; checkout remains fail-closed |

## 5. Theme And Language Matrix

Always run at least one route in each row when a slice touches UI copy, layout,
or design tokens:

| Area changed | Required matrix |
|---|---|
| Public pages | `zh + light + mobile`, `en + light + desktop` |
| Dashboard shell/navigation | `zh + light + mobile`, `en + light + mobile` |
| Charts/analytics | `zh + light + desktop`, `en + dark + desktop`, `en + light + mobile` |
| Auth/onboarding | `zh + light + mobile`, `en + light + desktop` |
| Settings/Profile | `zh + light + mobile`, `en + dark + desktop` |

Product/domain terms that can remain untranslated when intentional:

- `VocabDaily`
- `FSRS`
- `Coach Impact`
- `Today`
- `IELTS`
- `CEFR`
- `XP`

Any other mixed Chinese/English text should be deliberate and documented in the
slice notes.

## 6. Screenshot Convention

Store intentional regression screenshots under:

```text
product-audit-YYYY-MM-DD/regression/<task-id>-<short-slug>/<route>-<state>-<viewport>.png
```

Examples:

```text
product-audit-2026-06-13/regression/P4-03-i18n-core/analytics-english-mobile.png
product-audit-2026-06-13/regression/P1-02-today-primary-mission/today-primary-desktop.png
```

Screenshot requirements:

- capture desktop and `390px` mobile for visual or layout work
- capture light and dark variants for chart/token work
- capture before/after only when the before state is useful evidence
- reference committed screenshots from the TODO or QA note
- delete temporary screenshots that are not referenced

## 7. Known External Dependencies

| Dependency | Affects | Expected fallback |
|---|---|---|
| Supabase URL and anon key | Auth, sync, edge functions, production smoke | Smoke fails fast if missing |
| Supabase JWT | Authenticated edge-function smoke | Without JWT, protected endpoints should return `401` |
| AI gateway / DeepSeek | Chat, Coach, writing feedback, exam scoring | User sees retry plus local Practice fallback |
| Billing provider secrets | Stripe/Alipay checkout | Pro checkout fails closed; waitlist remains usable |
| Browser notification permission | Lifecycle reminders | Permission denial shows explanatory status, not a crash |
| Microphone / speech APIs | Pronunciation and speaking practice | Permission denial or unsupported browser explains next step |
| TTS/audio playback | Listening and pronunciation helpers | Controls remain usable without autoplay |
| IndexedDB/localStorage | Offline learner data, demo mode, analytics | Malformed legacy data is sanitized or treated as empty |
| `sql.js` WASM | APKG/Anki import paths | Import UI should show failure copy rather than blocking app shell |

## 8. Release Notes Checklist

Before release, the owner-facing note should include:

- commit or build identifier
- automated command results
- browser smoke routes and personas used
- screenshot directory
- known environment noise, such as local Supabase connection failures
- unresolved release blockers, especially legal, billing, auth redirect, and AI gateway issues
