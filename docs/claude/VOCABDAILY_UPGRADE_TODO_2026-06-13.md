# VocabDaily Upgrade TODO And Regression Plan

Date: 2026-06-13
Owner: Product / Engineering
Status: execution backlog

## Upgrade North Star

VocabDaily should upgrade from a broad English-learning toolbox into a daily learning coach:

1. The learner opens the app and sees the single most useful task for today.
2. The system explains why the task matters.
3. The learner completes one focused learning action.
4. The action writes durable evidence.
5. The coach turns the result into review, retry, or the next lesson.
6. The learner sees progress in language they can trust.

This plan keeps the existing product breadth, but makes Today, Coach, Review, and Lexicon the core loop. Other modules become tools that the loop can route into.

## Regression Baseline

Run these after every vertical slice unless the slice explicitly does not touch the app runtime.

- `npm run build`
- `npm run lint`
- `npm run check:i18n`
- `npm test`
- Browser smoke at desktop and 390px mobile:
  - `/`
  - `/login`
  - `/register`
  - `/pricing`
  - `/word-of-the-day`
  - `/dashboard/today` with authenticated or seeded local state
  - `/dashboard/review` with due and empty states
  - `/dashboard/analytics` in light and dark mode when analytics code changes

For every UI slice, capture before/after screenshots and verify:

- no horizontal overflow at 390px
- no overlapping text or controls
- primary CTA is visible and unambiguous
- light and dark themes preserve contrast
- Chinese and English states do not show accidental mixed copy

## P0 - Trust, Correctness, And Visible Breakage

### P0-01 Fix Auth And Marketing CTA Semantics

Status: done

Completed: 2026-06-13

Implementation:

- Replaced public-page `Link` wrapping `Button` patterns with `Button asChild` single-link controls in `src/pages/WordOfTheDayPage.tsx`.
- Replaced public-page `Link` wrapping `Button` patterns with `Button asChild` single-link controls in `src/pages/PricingPage.tsx`.
- Audited `Home`, auth pages, Pricing, and Word of the Day for the same nested-interactive pattern.

Verification:

- `rg -n -U '<Link[^>]*>\s*\n\s*<Button|<a[^>]*>\s*\n\s*<Button' src/pages/WordOfTheDayPage.tsx src/pages/PricingPage.tsx src/pages/Home.tsx src/pages/auth/LoginPage.tsx src/pages/auth/RegisterPage.tsx` returned no matches.
- Browser smoke on `/`, `/pricing`, and `/word-of-the-day` at desktop and 390px mobile found `nestedInteractiveCount: 0` and no horizontal overflow.
- Browser DOM snapshot confirmed Word of the Day CTAs render as single `link` nodes for `Start Learning`, `Add to My Word Bank`, and `Start Free Journey`.
- After screenshots captured under `product-audit-2026-06-13/regression/P0-01-cta-semantics/`.
- Direct keyboard Tab focus progression could not be observed because the in-app browser keypress API kept `document.activeElement` on `body`; semantic DOM evidence above was used for this slice.
- `npm run lint` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run check:i18n` passed.
- `npm test` passed: 73 files, 678 tests.

Problem:
Several public CTAs render nested interactive controls such as `Link` wrapping `Button`. This can confuse screen readers, keyboard focus, and click tracking.

Scope:

- Replace nested `Link` + `Button` patterns with one semantic control.
- Audit public pages for repeated patterns:
  - `src/pages/WordOfTheDayPage.tsx`
  - `src/pages/PricingPage.tsx`
  - `src/pages/Home.tsx`
  - auth pages if shared CTA components are involved

Acceptance:

- Each CTA is either one anchor styled as a button or one button with explicit navigation handler.
- Keyboard tab order reaches each CTA once.
- Public CTA styling remains visually unchanged.

Regression:

- Run `npm run lint`.
- Run `npm run build`.
- Browser smoke `/`, `/pricing`, `/word-of-the-day` at desktop and 390px.
- Keyboard check: Tab through each CTA and confirm focus appears once per action.

### P0-02 Replace Registration Legal Placeholders

Status: done

Completed: 2026-06-13

Implementation:

- Added `src/pages/LegalPage.tsx` as a shared pre-launch legal page for `/terms` and `/privacy`.
- Added public routes for `/terms` and `/privacy` in `src/App.tsx`.
- Replaced registration Terms and Privacy `to="#"` placeholders with real routes in `src/pages/auth/RegisterPage.tsx`.
- Added Terms / Privacy footer links to Home, Pricing, and Word of the Day public surfaces.
- Legal pages include product name, effective date, contact placeholder, data-use summary, subscription/cancellation language, and an explicit release-blocking legal review notice.

Verification:

- `rg -n 'to="#"|href="#"' src/pages src/components` returned no matches.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm test` passed: 73 files, 678 tests.
- Browser smoke on `/register`, `/terms`, and `/privacy` at desktop and 390px mobile confirmed the routes load, legal links are present on register, required legal-page content is visible, no nested interactive controls were found, and no horizontal overflow was detected.
- After screenshots captured under `product-audit-2026-06-13/regression/P0-02-legal-links/`.

Problem:
Register page Terms and Privacy links point to `#`, which weakens user trust and launch readiness.

Scope:

- Add real `/terms` and `/privacy` routes or route to externally owned legal pages.
- Update `src/pages/auth/RegisterPage.tsx`.
- Add footer/legal navigation where appropriate.

Acceptance:

- Register links open real pages.
- Pages contain at least product name, effective date, contact placeholder, data-use summary, and subscription/cancellation language if pricing remains visible.
- Missing final legal copy is clearly marked as release-blocking in the page source or docs, not hidden behind `#`.

Regression:

- Run `npm run build`.
- Browser smoke `/register`, `/terms`, `/privacy` at desktop and mobile.
- Check links open without reload errors.
- Check no `to="#"` remains for legal links with `rg 'to="#|href="#"' src/pages src/components`.

### P0-03 Make Demo Mode Deterministic And Non-Mutating

Status: done

Completed: 2026-06-13

Implementation:

- Added `startDemoSession()` in `src/lib/supabase-auth.ts` to create a deterministic local demo user through the existing local-auth storage path.
- Exposed `startDemoSession()` through `src/contexts/AuthContext.tsx`.
- Replaced LoginPage's previous demo flow, which attempted remote login and registration, with one local demo-session action.
- Added login-page copy explaining that demo mode does not create a real account and stores demo data only in the current browser.
- Added visible Demo / 演示 badges to Dashboard account areas for local-auth users.

Verification:

- Focused tests passed: `npm test -- src/lib/supabase-auth.demo.test.ts src/pages/auth/AuthPages.i18n.test.tsx`.
- New service test confirms `startDemoSession()` writes a local demo user, does not create Supabase access/refresh tokens, and does not call Supabase `signUp` or `setSession`.
- New LoginPage test confirms clicking demo calls `startDemoSession()` and does not call `login()` or `register()`.
- `rg -n "register\(|register,|demoEmail|VITE_DEMO_PASSWORD|Demo@123456|try login|create account then login" src/pages/auth/LoginPage.tsx src/contexts/AuthContext.tsx src/lib/supabase-auth.ts` found no old LoginPage demo registration path; only the normal AuthContext `register` provider remains.
- Browser smoke on `/login` confirmed the local demo CTA and no-real-account helper copy.
- Browser click on demo navigated to `/dashboard/today`; DOM snapshot confirmed `Demo Learner`, Demo / 演示 badge, and Today content.
- Browser smoke on demo dashboard found no horizontal overflow.
- After screenshots captured under `product-audit-2026-06-13/regression/P0-03-demo-mode/`.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm test` passed: 74 files, 680 tests.

Problem:
Demo login can attempt to register or reuse a shared demo account in Supabase. A demo CTA should not mutate live auth state.

Scope:

- Replace live demo registration with a deterministic local demo session, seeded mock profile, or clearly gated dev-only demo.
- Update `src/pages/auth/LoginPage.tsx` and auth provider behavior if needed.
- Ensure production builds do not create demo users.

Acceptance:

- Clicking demo login never creates a Supabase auth user.
- Demo state is visibly labeled as demo.
- Demo can enter dashboard with seeded learning data, or the CTA is hidden in production until sandbox support exists.
- Failure copy explains the real state instead of a generic unavailable message.

Regression:

- Unit test demo handler or auth helper.
- Run `npm test`.
- Browser smoke `/login`; click demo in dev and confirm dashboard/demo label.
- In production-mode env simulation, confirm no demo registration path is reachable.

### P0-04 Make Word Of The Day Auth-Aware

Status: done

Completed: 2026-06-13

Implementation:

- Added auth-aware Word of the Day behavior in `src/pages/WordOfTheDayPage.tsx`.
- Anonymous users still see registration CTAs.
- Authenticated users see `Go to Today`, `Save to My Word Bank`, and `Practice This Word` actions instead of registration CTAs.
- Saving the daily word calls `addCustomWord()` and updates the saved state.
- Renamed the synthetic previous-words area to a public archive and added copy that explicitly says these are sample words, not personal learning history.
- Localized core page labels, date formatting, CTA copy, footer legal links, and tab labels based on the current app language.
- Added theme and language controls to the Word of the Day header.

Verification:

- Added `src/pages/WordOfTheDayPage.test.tsx`.
- Focused test passed: `npm test -- src/pages/WordOfTheDayPage.test.tsx`.
- Tests cover anonymous signup CTAs, authenticated save/practice CTAs, save action dispatch, Chinese labels, and removal of the old `Previous Words / 往期单词` framing.
- Browser authenticated smoke on `/word-of-the-day` confirmed `进入今日任务`, `保存到我的词库`, `练这个词`, no anonymous free-journey CTA, public-archive copy, no nested interactive controls, and no horizontal overflow.
- Browser save action changed the page into saved state.
- Browser anonymous smoke on `/word-of-the-day` at desktop and 390px mobile confirmed registration links, no authenticated practice CTA, public-archive copy, no nested interactive controls, and no horizontal overflow.
- After screenshots captured under `product-audit-2026-06-13/regression/P0-04-word-of-day-auth/`.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm test` passed: 75 files, 683 tests.

Problem:
Word of Day acts like a marketing card. It does not let authenticated learners save the word directly, and previous words are synthetic static data.

Scope:

- Detect authenticated state.
- For authenticated users, change primary action to save/add/review the word.
- For anonymous users, keep registration CTA.
- Replace synthetic "previous words" framing with either "more examples" or real local/user history.
- Localize page copy and date formatting through the app language.

Acceptance:

- Logged-out users see a clear signup path.
- Logged-in users can add the word to their word bank or start a focused drill.
- The page never presents generated static words as personal history.
- Date, labels, and CTA copy honor the current language setting.

Regression:

- Add tests for logged-in and logged-out CTA selection.
- Run `npm test -- src/pages/WordOfTheDayPage*` or nearest available page tests.
- Browser smoke `/word-of-the-day` anonymous.
- Browser smoke authenticated `/word-of-the-day` with seeded user state.
- Run `npm run check:i18n`.

### P0-05 Repair Profile Level And Gamification Consistency

Status: done

Completed: 2026-06-13

Implementation:

- Added complete CEFR display mapping in `src/pages/dashboard/ProfilePage.tsx`, including `C2 -> Proficiency`.
- Replaced Profile's local level-number and rank-title duplication with canonical `computeLevel()` and `getLevelName()` from `src/services/gamification.ts`.
- Updated `src/services/gamification.ts` comments so the service is clearly the source of truth for level thresholds.
- Added `src/pages/dashboard/ProfilePage.test.tsx` to pin C2 display and verify Profile consumes the canonical gamification helpers.
- Repaired remaining nested `Link`/`Button` CTA semantics found during the wider scan in `src/pages/dashboard/ProfilePage.tsx`, `src/components/UpgradePrompt.tsx`, and `src/pages/auth/MagicLinkPage.tsx`.

Verification:

- Focused tests passed: `npm test -- src/pages/dashboard/ProfilePage.test.tsx src/services/gamification.test.ts`.
- Focused CTA/auth regression passed after the nested-interactive follow-up: `npm test -- src/pages/dashboard/ProfilePage.test.tsx src/pages/auth/AuthPages.i18n.test.tsx`.
- Full test suite passed: `npm test` reported 76 files and 685 tests.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `git diff --check` passed.
- Static nested-interactive scan passed with no matches: `rg -n -U '<Link[^>]*>\s*\n\s*<Button|<a[^>]*>\s*\n\s*<Button' src/pages src/components`.
- Browser smoke on `/dashboard/profile` with a demo user edited to C2 confirmed `C2`, `Proficiency`, shared level/rank display, no nested interactive controls, and no horizontal overflow on desktop and 390px mobile.
- Browser smoke on `/dashboard/analytics` confirmed the same demo XP renders `Level 1` and `Novice`, with no nested interactive controls and no horizontal overflow.
- Screenshots captured under `product-audit-2026-06-13/regression/P0-05-profile-gamification/`.
- Browser console showed Supabase entitlement REST `ERR_CONNECTION_CLOSED` in the local demo session; the page fell back to free quota and this was treated as environment noise, not a P0-05 regression.

Problem:
Profile supports C2 selection, but C2 display mapping is missing. Profile also duplicates level computation that should come from the canonical gamification service.

Scope:

- Add C2 display description.
- Replace local level-threshold logic in `src/pages/dashboard/ProfilePage.tsx` with shared helpers from `src/services/gamification.ts`.
- Add a regression test that pins C2 display and shared level calculation.

Acceptance:

- C2 profile renders a description and does not fall through to blank UI.
- Profile, Analytics, and gamification service show the same level for the same XP.
- No duplicated threshold table remains in Profile.

Regression:

- Run focused Profile/gamification tests.
- Run `npm test`.
- Browser smoke `/dashboard/profile` with C2 seeded profile.
- Check Analytics level display still matches Profile.

### P0-06 Improve Today Accessibility Controls

Status: done

Completed: 2026-06-13

Implementation:

- Extracted the Today word selector into `src/pages/dashboard/TodayWordNavigation.tsx`.
- Added an explicit word-navigation landmark with `aria-label` in Chinese and English.
- Added a labelled dot group for choosing today's word.
- Added descriptive `aria-label` values to previous/next icon buttons and each word dot.
- Added `aria-current="step"` to the active word dot so the current word is programmatically exposed.
- Kept existing visual states for current, learned, hard, and default dots.
- Added `src/pages/dashboard/TodayWordNavigation.test.tsx` for English and Chinese accessibility labels, current-step state, and click behavior.

Verification:

- Focused test passed: `npm test -- src/pages/dashboard/TodayWordNavigation.test.tsx`.
- `npm run lint` passed.
- Full test suite passed: `npm test` reported 77 files and 687 tests.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run check:i18n` passed.
- `git diff --check` passed.
- Browser smoke on `/dashboard/today` confirmed `今日单词导航`, `选择今天的单词`, 10 labelled word dots, exactly one `aria-current="step"`, no nested interactive controls, and no horizontal overflow on desktop and 390px mobile.
- Keyboard smoke confirmed Tab can move from the next-word button into the current word dot and onward to the next dot; Enter on the focused second dot changed the active word and moved `aria-current` to that dot.
- Screenshots captured under `product-audit-2026-06-13/regression/P0-06-today-accessibility/`.

Problem:
Today word navigation dots rely on `title` and do not expose a strong accessible name.

Scope:

- Add `aria-label` to word navigation dots.
- Add group label or navigation landmark for the word selector.
- Confirm active state is exposed with `aria-current` or equivalent.

Acceptance:

- Screen-reader label describes the target word or position.
- Active word state is programmatically exposed.
- Visual design remains unchanged.

Regression:

- Add or update component test for button labels if test harness exists.
- Run `npm run lint`.
- Browser keyboard smoke `/dashboard/today`; Tab and arrow/focus behavior remain usable.
- Optional accessibility scan if local tooling exists.

### P0-07 Tokenize Analytics Charts And Light-Mode Contrast

Status: done

Completed: 2026-06-13

Implementation:

- Expanded `useChartColors()` in `src/pages/dashboard/AnalyticsPage.tsx` into a centralized chart palette backed by CSS theme tokens.
- Replaced scattered hardcoded Recharts hex colors with semantic token slots for words, XP, minutes, topic slices, retention buckets, vocabulary statuses, heatmap cells, FSRS curve, baseline curve, and radar fill/stroke.
- Routed overview, words, retention, vocabulary distribution, and radar chart axes/grid/tooltip styles through theme-aware colors.
- Replaced the light-mode low-contrast `text-emerald-200/80` retention explanation with tokenized success text.
- Tokenized the learning heatmap cells and legend so light/dark mode use the same theme source.

Verification:

- `npm run lint` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run check:i18n` passed.
- Full test suite passed: `npm test` reported 77 files and 687 tests.
- `git diff --check` passed.
- Static search passed for hardcoded chart hex and low-contrast class removal. The remaining `stroke=`/`fill=` matches are tokenized as `colors.*`: `rg -n "#[0-9A-Fa-f]{3,6}|text-emerald-200|stroke=" src/pages/dashboard/AnalyticsPage.tsx`.
- Browser smoke on `/dashboard/analytics` confirmed overview and retention tabs render charts in light and dark mode with no nested interactive controls and no horizontal overflow.
- Screenshots captured under `product-audit-2026-06-13/regression/P0-07-analytics-chart-tokens/`.

Problem:
Analytics still has hardcoded chart fills/strokes and some light-mode low-contrast text.

Scope:

- Route chart colors through `useChartColors()` or CSS variables.
- Replace hardcoded emerald/light text where it appears on light surfaces.
- Verify overview, retention, skill, and radar charts.

Acceptance:

- Charts remain legible in light and dark mode.
- No hardcoded chart hex colors remain in `AnalyticsPage.tsx` unless documented as data palette tokens.
- Tooltips match the current theme.

Regression:

- Run `npm run build`.
- Browser smoke `/dashboard/analytics` in light and dark mode.
- Capture screenshots for overview and retention tabs.
- Search check: `rg '#[0-9A-Fa-f]{3,6}|text-emerald-200|stroke=' src/pages/dashboard/AnalyticsPage.tsx`.

### P0-08 Review Supabase Development Fallback Safety

Status: done

Completed: 2026-06-13

Implementation:

- Changed `src/lib/supabase.ts` so the source-level Supabase dev fallback is no longer automatic in non-production modes.
- Added explicit fallback gating: only `MODE=test` or `VITE_ALLOW_SUPABASE_DEV_FALLBACK=true` can use the shared development project when both Supabase env vars are missing.
- Kept production fail-fast behavior and made `VITE_ALLOW_SUPABASE_DEV_FALLBACK=true` unable to bypass production missing-env errors.
- Prevented partial env mixing: a configured URL cannot be paired with the fallback anon key, or vice versa.
- Updated `src/lib/supabase.test.ts` for default non-prod fail-fast, explicit fallback opt-in, test-mode fallback, prod fail-fast, and partial-env rejection.
- Updated `.env.example` to document the local-only fallback flag.
- Updated `docs/ops/SUPABASE_RELEASE_CHECKLIST.md` to require Supabase env vars, forbid fallback flag on Vercel Preview/Production, document auth redirect/RLS/anon-key checks, and call out fallback project rotation if it ever stops being dev-only.
- Removed hardcoded Supabase fallback credentials from `scripts/prod-smoke.mjs`, `scripts/e2e-smoke.mjs`, and `scripts/functional-check-real-auth.mjs`.

Verification:

- Focused Supabase env tests passed: `npm test -- src/lib/supabase.test.ts` reported 11 tests.
- `npm run lint` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run check:i18n` passed.
- Full test suite passed on retry after an unrelated parallel-load timeout: `npm test` reported 77 files and 691 tests.
- `npm test -- src/services/coachReviewQueue.test.ts` passed after the earlier full-suite timeout, confirming the timeout was not caused by P0-08 changes.
- `git diff --check` passed.
- Production smoke missing-env check failed fast as expected: `env -u VITE_SUPABASE_URL -u VITE_SUPABASE_ANON_KEY -u SUPABASE_URL -u SUPABASE_ANON_KEY node scripts/prod-smoke.mjs` exited 1 with an explicit missing Supabase env message.
- Credential scan confirmed app/scripts now only keep the shared project credentials behind the explicit opt-in constants in `src/lib/supabase.ts`; remaining matches are local `.env`, historical docs, and tests that assert the project ref is not exposed in UI copy.

Problem:
The app has a source-level development Supabase URL and anon fallback. This is only acceptable if it points to a non-sensitive dev project with strict RLS.

Scope:

- Confirm fallback project is dev-only.
- Document the intended behavior in `src/lib/supabase.ts` or ops docs.
- Consider replacing fallback with explicit local `.env` requirement.

Acceptance:

- Production still fails fast when env vars are missing.
- No real user data can be accessed through default dev config.
- Release checklist includes RLS and fallback verification.

Regression:

- Run `npm run build` with normal dev env.
- Run production-mode missing-env check if script exists.
- Verify `docs/ops/SUPABASE_RELEASE_CHECKLIST.md` mentions env, auth redirects, RLS, and anon key expectations.

## P1 - Activation And Daily Coach Loop

### P1-01 Add Goal-Based Onboarding Placement

Status: done

Completed: 2026-06-13

Implementation:

- Added `src/services/onboardingPlacement.ts` as the source of truth for onboarding placement rules.
- Added the `IELTS Academic Core` built-in word book in `src/data/wordBooks.ts`, backed by B1-C1 academic/STEM vocabulary instead of the A1 fallback.
- Expanded `src/pages/auth/OnboardingPage.tsx` from 4 steps to 5: level, learning target, daily rhythm, topics, and starter-plan confirmation.
- Added exam target, target score, exam deadline, and daily study minutes to onboarding preferences.
- Auto-adds `Academic` as a preferred topic when IELTS/TOEFL is selected, then maps IELTS users to `IELTS Academic Core` and `IELTS Preparation`.
- The final onboarding step now explains the chosen starter book, path, first mission, and reasons before the learner starts.
- On completion, onboarding persists both the auth profile fields and the placement result through `setActiveBook()` and `updateLearningProfile()`.
- Updated auth page tests to mock `UserDataContext` and verify onboarding completion selects the IELTS academic active book.

Verification:

- Focused tests passed: `npm test -- src/services/onboardingPlacement.test.ts src/pages/auth/AuthPages.i18n.test.tsx` reported 2 files and 13 tests.
- Full test suite passed: `npm test` reported 78 files and 697 tests.
- `npm run lint` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run check:i18n` passed.
- `git diff --check` passed.
- Browser smoke verified a returning authenticated user navigating to `/login` lands on `/dashboard/today`, not onboarding.
- Browser smoke verified C1 + IELTS onboarding at desktop and mobile widths shows `IELTS Academic Core`, `IELTS Preparation`, and C1-specific rationale on the confirmation step.
- Screenshots and text evidence captured under `product-audit-2026-06-13/regression/P1-01-onboarding-placement/`.

Problem:
New users can fall back to A1 Foundation even when they are B1/C1 or IELTS-focused.

Scope:

- Add or refine onboarding questions:
  - current level
  - exam target
  - daily minutes
  - preferred topics
  - deadline if exam-focused
- Map answers to starter book, first mission, and learning path.
- Persist result in learning profile and active book.

Acceptance:

- A C1 or IELTS user does not land in A1 by default.
- A beginner still receives A1 safely.
- Onboarding outcome explains "why we chose this plan".

Regression:

- Unit test placement mapping.
- Test active book selection after onboarding.
- Browser smoke first-run onboarding at mobile and desktop.
- Verify returning users are not forced through onboarding again.

### P1-02 Make Today The Single Primary Daily Surface

Status: done

Completed: 2026-06-13

Implementation:

- Changed `src/pages/dashboard/TodayPage.tsx` so the Today hero uses `DailyCoachPlan` as the single source for title, explanation, estimated time, primary CTA, and secondary actions.
- Removed the separate Coach CTA card that competed with the mission hero; Daily Coach evidence now appears as passive evidence chips under the hero.
- Kept only one primary cockpit action in the hero and capped secondary actions to two outline actions.
- When the primary mission is the current Today surface, the primary CTA scrolls to the vocabulary workspace instead of navigating back to the same route.
- Added stable `data-cockpit-action="primary|secondary"` markers in `LearningCockpitShell` for primary-action regression checks.
- Updated the no-active-book empty state to route back to onboarding with `redirect=/dashboard/today`, making the recovery path diagnostic/onboarding-oriented instead of generic browsing.
- Expanded `DailyCoachPlan` tests to assert mission evidence includes the exam target and active book context.

Verification:

- Focused tests passed: `npm test -- src/features/learning/dailyCoachPlan.test.ts src/features/learning/components/LearningCockpitShell.test.tsx` reported 2 files and 18 tests.
- Full test suite passed: `npm test` reported 78 files and 698 tests.
- `npm run lint` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run check:i18n` passed.
- `git diff --check` passed.
- Browser smoke on `/dashboard/today` verified exactly one `[data-cockpit-action="primary"]`, two secondary actions, visible evidence chips, and no mobile horizontal overflow.
- Screenshots captured under `product-audit-2026-06-13/regression/P1-02-today-primary-mission/`.

Problem:
The app has many modules, but the learner still needs stronger guidance on what to do next.

Scope:

- Ensure Today renders one primary mission above secondary tools.
- Show reason, estimated time, source signal, and next action.
- Hide feature-catalog style choices behind secondary actions.
- Keep deterministic fallback when AI is unavailable.

Acceptance:

- Today has exactly one primary CTA.
- Mission reason references real evidence: due count, weak topic, exam target, streak recovery, or active book.
- Empty states route to diagnostic/onboarding rather than generic browsing.

Regression:

- Unit test `DailyCoachPlan` decision cases.
- Component test Today primary mission count.
- Browser smoke `/dashboard/today`:
  - new user
  - due review user
  - weak-topic user
  - exam-target user
  - offline/AI-unavailable state

### P1-03 Build Public Try-A-Sample Lesson

Status: done

Completed: 2026-06-13

Implementation:

- Added `src/features/sample/SampleLesson.tsx`, a state-only public sample lesson with one word, one recall prompt, immediate feedback, product-loop summary, and a contextual "save this progress" CTA.
- Added `src/pages/SampleLessonPage.tsx` and public route `/demo`.
- Updated the homepage hero and example-session card so visitors can enter the sample lesson from `/`.
- The sample lesson does not create accounts, write word progress, write word-bank entries, or modify `vocabdaily_` local storage keys.
- Authenticated users who finish the sample can continue to Today; anonymous users are sent to registration with `redirect=/dashboard/today`.

Verification:

- Focused tests passed: `npm test -- src/features/sample/SampleLesson.test.tsx src/pages/Home.i18n.test.tsx` reported 2 files and 5 tests.
- Full test suite passed: `npm test` reported 79 files and 702 tests.
- `npm run lint` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run check:i18n` passed.
- `git diff --check` passed.
- Browser smoke verified `/` exposes `/demo` links.
- Browser smoke verified `/demo` at desktop and mobile widths can complete the sample, shows the contextual save-progress CTA, and does not change existing `vocabdaily_` local storage keys.
- Screenshots captured under `product-audit-2026-06-13/regression/P1-03-public-sample-lesson/`.

Problem:
Homepage explains the product but does not let visitors feel the learning loop before registration.

Scope:

- Add a lightweight sample lesson on the homepage or `/demo`.
- Include one word, one recall prompt, one feedback state, and one CTA to save progress.
- Avoid creating accounts or writing real user data before signup.

Acceptance:

- Visitor can complete a sample interaction in under 60 seconds.
- Result copy demonstrates the product loop.
- Signup CTA is contextual: "save this progress" rather than generic "get started".

Regression:

- Component tests for sample lesson states.
- Browser smoke `/` and sample route at desktop/mobile.
- Verify anonymous sample data does not appear in real user word bank after login unless explicitly imported.

### P1-04 Route Word Of The Day Into The Learning Loop

Status: done

Completed: 2026-06-13

Implementation:

- Updated `src/pages/WordOfTheDayPage.tsx` so authenticated saves call both `addCustomWord()` and `markWordAsLearned()` when the word has no existing progress.
- Saved Word of the Day entries now become reviewable learning items with local progress status `learning` and a due review date.
- Added an authenticated practice link to `/dashboard/practice?word=<word>` that also ensures the word enters the learning loop.
- Added a Coach action with word-specific prompt/context to `/dashboard/chat?focus=<word>&prompt=<prompt>`.
- Anonymous save/practice/Coach links now route through registration with contextual redirects instead of dropping word context.
- Updated copy to explain that saved words enter the word bank and later review.

Verification:

- Focused tests passed: `npm test -- src/pages/WordOfTheDayPage.test.tsx` reported 1 file and 4 tests.
- Full test suite passed: `npm test` reported 79 files and 703 tests.
- `npm run lint` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run check:i18n` passed.
- `git diff --check` passed.
- Browser smoke verified authenticated Word of the Day shows save, practice, and Coach actions; save writes the word into `vocabdaily_custom_words` and creates local `vocabdaily_progress` with status `learning`.
- Browser smoke verified anonymous Word of the Day routes save/practice/Coach through `/register?redirect=...` and has no mobile horizontal overflow.
- Screenshots captured under `product-audit-2026-06-13/regression/P1-04-word-of-day-loop/`.

Problem:
Word of Day is isolated from Today, Review, and Coach.

Scope:

- Let users save Word of Day into Lexicon/word bank.
- Create a review item or evidence event when a user practices it.
- Add a Coach action: explain, make mnemonic, or generate example.

Acceptance:

- Word of Day can become a reviewable learning item.
- Saved state persists locally/offline and syncs where applicable.
- Coach receives word context when launched from the page.

Regression:

- Unit test save/practice event creation.
- Browser smoke anonymous and authenticated Word of Day.
- Review page shows due/saved item only when it should.

### P1-05 Add Pro Waitlist And Demand Signal

Status: done

Completed: 2026-06-13

Implementation:

- Added `src/features/marketing/proWaitlist.ts` to persist local Pro interest signals under `vocabdaily_pro_waitlist_intents`.
- Captured `planId`, billing cycle, source, optional goal metadata, user id when available, language, and timestamp.
- Added duplicate handling per billing cycle so repeated monthly or yearly submissions do not create duplicate rows.
- Updated `src/pages/PricingPage.tsx` so the fail-closed Pro card now offers a "Notify me when Pro opens" action while still never creating a checkout session.
- Added success, duplicate, and failure toast states.
- Kept the Pro checkout branch gated behind real checkout availability; no Stripe, Alipay, or checkout CTA appears while `getCheckoutStatus()` returns `coming_soon`.
- Gave the existing 600-item `coachReviewQueue` cap test a local 15-second budget because it reliably passes alone but can exceed Vitest's default 5-second test timeout during full-suite concurrent IndexedDB/syncQueue work.

Verification:

- Added `src/features/marketing/proWaitlist.test.ts`.
- Updated `src/pages/PricingPage.test.tsx` for waitlist creation, duplicate handling, yearly billing capture, and no checkout invocation.
- Focused tests passed: `npm test -- src/features/marketing/proWaitlist.test.ts src/pages/PricingPage.test.tsx`.
- Browser smoke on `/pricing` desktop confirmed clicking waitlist keeps the URL at `/pricing`, writes one monthly Pro intent locally, changes the button to recorded state, shows no checkout-like links, and has no horizontal overflow.
- Browser smoke on `/pricing` at 390px mobile confirmed no horizontal overflow and valid Pro card width.
- Browser smoke after toggling yearly confirmed monthly and yearly Pro interest are stored separately and no checkout-like links appear.
- Screenshots and snapshots captured under `product-audit-2026-06-13/regression/P1-05-pro-waitlist/`.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm test -- --run` passed: 80 files, 709 tests.

Problem:
Pricing is honest about Pro being unavailable, but it loses user intent.

Scope:

- Add "Notify me" or waitlist capture for Pro.
- Store intent locally, Supabase table, form endpoint, or email provider depending on product decision.
- Include plan, billing cycle, and optional goal metadata.

Acceptance:

- User can express Pro interest without checkout.
- Duplicate submissions are handled gracefully.
- Pricing page keeps fail-closed behavior for real checkout.

Regression:

- Unit/integration test submit success and failure states.
- Browser smoke `/pricing` mobile/desktop.
- Confirm no checkout session is created when waitlist is used.

## P2 - Learning Depth And Personalization

### P2-01 Make Learning Style Real Or Remove It

Status: done

Completed: 2026-06-13

Decision:

- Chose Option A: keep learning style and make it visible in recommendations, Coach prompts, and Practice defaults.
- Rationale: onboarding/profile already collect this preference, and the existing Today/Practice/Coach surfaces had low-risk places to honor it without inventing a new flow.

Implementation:

- Added `src/features/learning/learningStylePersonalization.ts` as the shared style contract for visual, auditory, kinesthetic, and reading learners.
- Added `learningStyle` to `LearningProfile` and normalized legacy profiles without the field to `visual`.
- Synced learning style from auth/profile and onboarding placement into `learningMissions`.
- Persisted `learning_style` to the profile sync payload and mission meta.
- Updated `buildDailyCoachPlan()` so Today shows a visible learning-style evidence chip, adds a style-specific nudge to the hero brief, and passes style guidance into the Coach handoff prompt.
- Updated `recommendationEngine` so modality recommendations differ by learning style.
- Added `src/features/practice/recommendedMode.ts` so Practice defaults change by style while still prioritizing heavy due-review pressure.
- Updated `PracticePage` to use the style-aware default mode and show a "why" metric explaining the recommendation source.
- Added style guidance to chat learner goal context so Coach instructions remain consistent after handoff.

Verification:

- Added tests for `learningStylePersonalization` usage through `dailyCoachPlan`, `recommendationEngine`, `recommendedMode`, `learningMissions`, profile sync, onboarding placement, and chat learner context.
- Focused tests passed: `npm test -- src/features/learning/dailyCoachPlan.test.ts src/features/practice/recommendedMode.test.ts src/services/recommendationEngine.test.ts src/services/learningMissions.test.ts src/services/profileLearningSync.test.ts src/services/onboardingPlacement.test.ts src/features/chat/utils/learnerContext.test.ts`.
- Browser smoke with a demo user set to `auditory` confirmed Today shows `偏好: 听说优先`, Today hero includes the pronunciation/dictation nudge, and Practice defaults to `Listening Quiz / 听力测验`.
- Browser smoke with the same demo user set to `reading` confirmed Today shows `偏好: 读写路径`, Today hero includes sentence-frame/short-writing copy, and Practice defaults to `Writing Practice / 写作练习`.
- Browser smoke at 390px mobile confirmed no horizontal overflow for Today and Practice after style-specific copy changes.
- Screenshots captured under `product-audit-2026-06-13/regression/P2-01-learning-style/`.
- `npm run lint` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm run check:i18n` passed.
- `npm test -- --run` passed: 81 files, 716 tests.

Problem:
Profile collects learning style, but recommendations do not meaningfully use it.

Scope:

- Option A: use learning style to change modality recommendations, coach prompts, and autoplay defaults.
- Option B: remove it from onboarding/profile until the product can honor it.

Acceptance:

- If kept, visual/auditory/kinesthetic/reading choices affect at least one visible recommendation and one practice default.
- If removed, no dead preference remains in profile payloads or copy.

Regression:

- Unit test recommendation output by learning style.
- Browser smoke profile edit -> Today recommendation changes or field no longer appears.
- Ensure saved legacy profiles do not crash.

### P2-02 Use CEFR In Recommendation Ranking

Status: done

Completed: 2026-06-13

Implementation:

- Added `src/features/learning/cefrPersonalization.ts` as the shared CEFR normalization and banding contract.
- Updated `recommendationEngine` so missing/invalid CEFR safely falls back to B1, A1/A2 emphasize foundation input, C1/C2 emphasize advanced precision/output, and B2+ IELTS/score targets surface exam-facing writing practice before generic variety.
- Updated `learningEngine` so Today's primary daily vocabulary task uses CEFR-aware titles and descriptions:
  - A1/A2: concrete foundation input, pronunciation, meaning, one usable sentence.
  - B1/B2: balanced new-word and review growth.
  - C1/C2: advanced vocabulary, collocations, academic usage, and short production.
- Updated the Daily Coach plan title behavior so CEFR-specific daily-vocabulary titles are visible in the Today hero, not buried in a secondary task.
- Added `learningStyle` to the learning-overview query key so profile changes refresh Today personalization.

Verification:

- Added `src/services/learningEngine.test.ts`.
- Updated `src/services/recommendationEngine.test.ts` and `src/features/learning/dailyCoachPlan.test.ts`.
- Focused tests passed: `npm test -- src/services/recommendationEngine.test.ts src/services/learningEngine.test.ts src/features/learning/dailyCoachPlan.test.ts`.
- Browser smoke in one reused tab with an A1 demo profile confirmed Today shows `先打稳基础高频词`, concrete pronunciation/meaning copy, and no horizontal overflow.
- Browser smoke in the same reused tab with a C1 IELTS demo profile confirmed Today shows `把高级词推进到输出里`, collocation/academic-usage copy, `IELTS 7.5` target evidence, and no horizontal overflow.
- Screenshots captured under `product-audit-2026-06-13/regression/P2-02-cefr-ranking/`.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm test -- --run` passed: 82 files, 722 tests.

Problem:
Recommendation engine accepts CEFR but does not strongly use it in ranking.

Scope:

- Use CEFR to filter or weight recommended lessons, words, and difficulty.
- Add boundary behavior for A1 and C2.
- Ensure exam goals can override generic CEFR when appropriate.

Acceptance:

- A1 and C1 users receive visibly different recommended content.
- IELTS target can prioritize exam-relevant B2/C1 work.
- Fallback remains safe when CEFR is missing.

Regression:

- Unit tests for A1, B2 IELTS, C1, C2, and missing-level users.
- Snapshot or focused tests for Today/Path recommendation copy.
- Browser smoke seeded users at different levels.

### P2-03 Add FSRS Learner Controls

Status: done

Completed: 2026-06-13

Implementation:

- Added FSRS learner-control fields to `UserSettings`: daily new-word limit, max review count, target retention, and exam-week boost.
- Added sanitization/defaults in `localStorage` so legacy users get simple defaults: 10 new words, 24 reviews, 90% target retention, boost off.
- Preserved the previous profile/book daily-goal behavior until a user explicitly saves a daily new-word limit.
- Added `src/services/learnerControls.ts` to apply settings to the learner model:
  - caps daily new words by `dailyNewWordLimit`
  - caps daily review target by `maxReviewCount`
  - biases higher target retention toward more review and fewer new words
  - enables sprint mode for exam-week boost unless recovery/burnout protection should win
- Updated `UserDataContext` so Today mission creation, active-book summary, and Review due queue use the saved settings.
- Updated Today's local learner model path to use the same learner controls, fixing a mismatch where the mission used the cap but the Today rail still showed uncapped review targets.
- Added a Settings > Learning card with plain-language controls and tradeoff copy.
- Added regression coverage that saving learner controls preserves unrelated preferences such as theme, reminder, sound, and font size.

Verification:

- Added `src/services/learnerControls.test.ts`.
- Added `src/data/localStorage.settings.test.ts`.
- Focused tests passed: `npm test -- src/services/learnerControls.test.ts src/data/localStorage.settings.test.ts src/services/learnerModel.test.ts src/services/learningMissions.test.ts` with 4 files and 68 tests.
- Browser smoke in one reused tab on 390px mobile:
  - Settings page showed `FSRS 学习强度`, daily new-word limit, max review count, target retention, and exam-week boost controls with no horizontal overflow.
  - Seeded settings `dailyNewWordLimit: 6`, `maxReviewCount: 5`, `targetRetention: 0.95`, `examWeekBoost: true`.
  - Today regenerated 6 daily words, mission tasks `学习 6 个新词` and `复习 5 个到期卡片`, and the Today learner-model rail showed `新词 6 / 复习 5` with no stale `复习 10`.
  - Review used 10 raw due progress records but rendered a 5-card review round: `剩余 FSRS 卡 5`, `当前卡片 1 / 5`, `已完成 0 / 5`.
  - No horizontal overflow on Settings, Today, or Review mobile views.
- Screenshots captured under `product-audit-2026-06-13/regression/P2-03-fsrs-controls/`.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm test` passed: 84 files, 730 tests.

Problem:
Serious learners need control over daily new words, max reviews, desired retention, and exam-week intensity.

Scope:

- Add settings for:
  - daily new word limit
  - max review count
  - target retention
  - exam-week boost mode
- Feed settings into Today and Review queues.

Acceptance:

- Settings alter review/new-word workload.
- Defaults stay simple for casual users.
- Copy explains tradeoffs in plain language.

Regression:

- Unit test queue sizing with each setting.
- Browser smoke Settings -> Today/Review workload updates.
- Verify reset/clear data flows do not lose unrelated settings unexpectedly.

### P2-04 Add Stubborn Word Recovery

Status: done

Completed: 2026-06-13

Implementation:

- Added `src/features/learning/stubbornRecovery.ts` as the pure recovery-plan builder for stubborn FSRS cards.
- Reused existing FSRS thresholds (`lapses >= 3` or `difficulty >= 8`) and exposed recovery triggers: `lapse`, `difficulty`, and `both`.
- Generated a different treatment for stubborn cards:
  - mnemonic hook
  - collocation swap drill
  - confusing-word / contrast note
  - short production task
  - Coach handoff prompt
- Updated Review so revealed stubborn cards show a dedicated recovery panel before rating.
- Added learner feedback buttons:
  - `This helped` / `这个练法有帮助`
  - `Still confusing` / `还是容易混淆`
- Persisted recovery outcomes through three paths:
  - structured evidence: `evidence.review.recovery_marked`
  - coach/overview event: `review.stubborn_recovery`
  - strict path-progress event: `mistake_resolved` for helped, `practice_wrong` for still confusing
- Updated learning overview weakness derivation so unresolved recovery (`still_confusing`) strengthens retention weakness signals for Coach/Today.
- Kept normal Review rating flow intact; recovery feedback does not advance the card or replace FSRS rating.

Verification:

- Added `src/features/learning/stubbornRecovery.test.ts`.
- Updated `src/services/evidenceEvents.test.ts`.
- Updated `src/services/learningEngine.test.ts`.
- Updated `src/pages/dashboard/ReviewPage.test.tsx`.
- Focused tests passed: `npm test -- src/features/learning/stubbornRecovery.test.ts src/services/evidenceEvents.test.ts src/services/learningEngine.test.ts src/pages/dashboard/ReviewPage.test.tsx src/features/learning/reviewQueue.test.ts` with 5 files and 35 tests.
- Browser smoke in the same reused tab on 390px mobile:
  - Seeded `w1 abandon` as a stubborn FSRS card with `lapses: 3`, `difficulty: 8.4`, and one due review.
  - Review reveal showed the recovery panel with mnemonic hook, collocation swap, confusion guard, production task, and Coach handoff.
  - Marking `这个练法有帮助` updated the UI and wrote:
    - `evidence.review.recovery_marked` with `outcome: helped`
    - `review.stubborn_recovery`
    - strict `mistake_resolved`
  - Clicking `忘记` after recovery completed the review round and wrote `evidence.review.rated` with `rating: again` plus strict `review_completed`.
  - No horizontal overflow was detected on recovery or completion states.
- Screenshots captured under `product-audit-2026-06-13/regression/P2-04-stubborn-recovery/`.
- Browser console showed existing Supabase sync `ERR_CONNECTION_CLOSED` requests for remote tables during local/demo state; local IndexedDB evidence writes succeeded and no recovery UI exception was observed.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm test` passed: 85 files, 738 tests.

Problem:
Repeated mistakes need adaptive recovery, not just another flashcard.

Scope:

- Detect repeated wrong answers or low FSRS ratings.
- Generate or surface mnemonic, collocation drill, confusing-word note, and short production task.
- Persist recovery outcome as evidence.

Acceptance:

- A stubborn word gets a different treatment than a normal due word.
- User can mark whether the recovery helped.
- Recovery feeds Coach and Review.

Regression:

- Unit test stubborn-word detection thresholds.
- Test recovery evidence event creation.
- Browser smoke Review wrong-answer path and Coach handoff.

### P2-05 Turn Learning Path Into Specific Lessons

Status: done

Completed: 2026-06-13

Implementation:

- Added `src/features/learning/learningPathRouting.ts` as the shared resolver from path lesson to concrete task target.
- Each path lesson now opens a specific URL with path context:
  - `pathId`
  - `pathLesson`
  - `lessonType`
- Learning Path nodes now show the exact target surface, such as Today vocabulary set, Coach roleplay, Grammar drill, Practice drill, or FSRS review round.
- Replaced bare local toggle completion with evidence-backed completion:
  - `completeLearningPathLesson()` stores local completion plus `lessonEvidence`.
  - `lesson.completed` structured evidence is written through `recordEvidence()`.
  - a strict `session_ended` path-progress event is written with `source: learning_path_lesson`.
- Updated the Learning Path UI so completion only counts after evidence is recorded, and each completed node shows evidence source and date.
- Updated suggested next step and primary CTA to open the exact next lesson.
- Added Today-side active-path next-step card so Today can surface the next concrete path node when a learner has an active path.
- Legacy path progress without `lessonEvidence` now normalizes safely to an empty evidence map.

Verification:

- Added `src/features/learning/learningPathRouting.test.ts`.
- Updated `src/services/learningPathProgress.test.ts`.
- Focused tests passed: `npm test -- src/features/learning/learningPathRouting.test.ts src/services/learningPathProgress.test.ts src/services/evidenceEvents.test.ts src/pages/dashboard/ReviewPage.test.tsx` with 4 files and 26 tests.
- Browser smoke in one reused tab on 390px mobile:
  - Seeded `daily-english` as the active path.
  - Learning Path showed concrete targets and `lesson.completed` evidence requirements for each node.
  - `打开下一课：基本问候` opened `/dashboard/today?pathId=daily-english&pathLesson=de-l1&lessonType=vocabulary`.
  - Today showed `学习路径下一步`, the exact path lesson, and `打开具体任务`.
  - Recording evidence for `de-l1` updated Learning Path to `1/16`, showed `证据：lesson.completed`, and stored local `lessonEvidence`.
  - IndexedDB contained `evidence.lesson.completed` for `de-l1` and strict `session_ended` with `source: learning_path_lesson`.
  - No horizontal overflow was detected.
- Screenshots captured under `product-audit-2026-06-13/regression/P2-05-learning-path-specific-lessons/`.
- Browser console showed existing Supabase sync `ERR_CONNECTION_CLOSED` requests for remote tables during local/demo state; local IndexedDB evidence writes succeeded.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm test` passed: 86 files, 742 tests.

Problem:
Learning Path can still feel like routing into generic modules rather than a true course path.

Scope:

- Bind each path node to a concrete lesson, drill, word group, or coach mission.
- Show completion evidence per node.
- Let Today select the next path node when appropriate.

Acceptance:

- Clicking a path item opens the exact task promised.
- Completion updates the path state.
- Path does not claim completion without evidence events.

Regression:

- Unit test path-node routing and completion derivation.
- Browser smoke Learning Path -> task -> completion -> path update.
- Verify old paths migrate or degrade gracefully.

### P2-06 Upgrade Lexicon From Word Bank To Language Knowledge

Status: done

Completed: 2026-06-13

Implementation:

- Extended `src/features/lexicon/lexicalEntry.ts` so `LexicalEntry` now derives common mistake notes from collocations and synonyms.
- Kept the adapter safe for sparse imported words: missing examples, collocations, memory notes, and etymology degrade to empty arrays or fallback copy instead of `undefined`.
- Updated `src/pages/dashboard/VocabularyBankPage.tsx` so the visible product language and entry detail behave as Lexicon:
  - list cards render via `toLexicalEntry()`
  - cards show localized lexical summary, collocation preview, CEFR level, topic, and IELTS relevance
  - detail dialog renders sense, examples, collocations, common mistakes, memory notes, and drill templates
  - detail dialog adds direct `Lexicon drill` and `Review` CTAs with `source=lexicon` and `wordId`
- Kept `/dashboard/vocabulary` route intact while visible page copy says Lexicon / 词典.
- Left import/export/book-management flows unchanged except for detail rendering through the adapter.

Verification:

- Updated `src/features/lexicon/lexicalEntry.test.ts`.
- Focused test passed: `npm test -- src/features/lexicon/lexicalEntry.test.ts` with 1 file and 3 tests.
- Browser smoke in one reused tab on 390px mobile:
  - `/dashboard/vocabulary?q=afraid&p2lexicon=entry` showed Lexicon copy, collocation preview, IELTS relevance, and no `undefined`.
  - Opening `afraid` detail showed Sense, Examples, Collocations, Common mistakes, Drills, `开始 Lexicon drill`, and `加入复习回合`.
  - Practice CTA resolved to `/dashboard/practice?source=lexicon&wordId=w27&q=afraid`.
  - Review CTA resolved to `/dashboard/review?source=lexicon&wordId=w27`.
  - No horizontal overflow was detected.
- Screenshots captured under `product-audit-2026-06-13/regression/P2-06-lexicon-knowledge/`.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm test` passed: 86 files, 742 tests.

Problem:
Vocabulary is useful, but the product language should move toward a real Lexicon: senses, collocations, examples, mistakes, and drills.

Scope:

- Introduce or extend `LexicalEntry` around existing `WordData`.
- Show collocations, example sentences, memory notes, and common mistakes.
- Keep `/dashboard/vocabulary` route working while visible language can say Lexicon.

Acceptance:

- Existing word data renders through the Lexicon model.
- Imported words degrade safely when optional fields are missing.
- Users can start a drill or review from a Lexicon entry.

Regression:

- Unit test adapter for complete and sparse word data.
- Browser smoke Vocabulary/Lexicon list and detail views.
- Verify import flow still works for Anki/custom words.

## P3 - Growth, Revenue, And Retention

### P3-01 Add Weekly Learning Recap

Status: done

Completed: 2026-06-13

Implementation:

- Added `src/features/learning/weeklyRecap.ts` as the evidence-backed weekly recap aggregator.
- Weekly recap now derives:
  - strengthened distinct words from `evidence.vocab.learned`, successful review ratings, and correct practice evidence
  - review-debt trend from `again` / `hard` review ratings, unresolved stubborn recovery, and currently due progress
  - strongest skill from vocabulary, review recall, and practice accuracy signals
  - weakest recurring pattern from review debt, practice misses, and low active-day consistency
  - next-week recommendation with a real target route
- Empty/no-evidence state no longer claims progress; it directs the learner to complete one Today task first.
- Updated Analytics > AI 洞察 weekly report card into `证据周报`:
  - strengthened words
  - active days
  - review-debt signals
  - evidence highlights
  - strongest/weakest signal
  - CTA to the evidence-backed next step

Verification:

- Added `src/features/learning/weeklyRecap.test.ts`.
- Focused test passed: `npm test -- src/features/learning/weeklyRecap.test.ts` with 1 file and 3 tests.
- Browser smoke in one reused tab on 390px mobile:
  - Opened `/dashboard/analytics?p3weekly=recap`.
  - Switched to `AI 洞察`.
  - Confirmed `证据周报`, strengthened-word metric, active-day metric, review-debt metric, recommendation copy, and `打开下一步` CTA.
  - Verified CTA href for `打开下一步` resolved to `/dashboard/review` when review debt was the weakest pattern.
  - Verified old fake comparative claim copy such as `超过平均水平` did not appear.
  - No horizontal overflow was detected.
- Screenshots captured under `product-audit-2026-06-13/regression/P3-01-weekly-recap/`.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm test` passed: 87 files, 745 tests.

Problem:
Streak alone does not prove progress or motivate serious learners.

Scope:

- Generate weekly recap from evidence events:
  - words strengthened
  - review debt trend
  - strongest skill
  - weakest recurring pattern
  - next week recommendation

Acceptance:

- Recap is evidence-backed.
- No progress claim appears without data.
- Share/export is optional and privacy-aware.

Regression:

- Unit test recap aggregation with empty, normal, and heavy-review weeks.
- Browser smoke recap card in dashboard.
- Verify private data is not exposed in share output.

### P3-02 Add Shareable Word Card Or Progress Card

Status: done

Completed: 2026-06-13

Implementation:

- Added `src/features/share/wordShareCard.ts` to generate a 1200x630 SVG Word of the Day card, public share text, and safe SVG filenames.
- Wired Word of the Day sharing to prefer Web Share API file sharing with an `image/svg+xml` card.
- Added a privacy-safe fallback that copies public share text and downloads the SVG when native file sharing is unavailable.
- Added accessible share button labeling and kept shared content on the public `/word-of-the-day` URL instead of the current user/session URL.

Verification:

- Added `src/features/share/wordShareCard.test.ts`.
- Extended `src/pages/WordOfTheDayPage.test.tsx` to cover file-share payloads and copy/download fallback.
- Focused tests passed: `npm test -- src/features/share/wordShareCard.test.ts src/pages/WordOfTheDayPage.test.tsx` with 2 files and 9 tests.
- Browser smoke in the reused single tab on `/word-of-the-day?p3share=card` confirmed:
  - share button label is `分享单词卡`
  - `navigator.share` receives `vocabdaily-refute.svg` as `image/svg+xml`
  - public share URL is `/word-of-the-day`
  - no private fields such as `streak`, `XP`, or `reviewCount` appear in the share payload
  - no horizontal overflow at 390px mobile
- Screenshot captured under `product-audit-2026-06-13/regression/P3-02-share-card/`.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm test` passed: 88 files, 750 tests.

Problem:
The app has few organic sharing moments.

Scope:

- Add shareable card for Word of Day, weekly recap, or streak recovery.
- Use real visual asset/rendering path, not placeholder ASCII/CSS art.
- Keep personal data opt-in.

Acceptance:

- User can copy/share a card.
- Shared content does not expose private study history unless explicitly chosen.
- Card is visually consistent with the Modern Learning Workbench style.

Regression:

- Browser smoke share action on supported browsers.
- Fallback check when Web Share API is unavailable.
- Visual screenshot desktop/mobile.

### P3-03 Clarify Pro Packaging

Status: done

Completed: 2026-06-13

Implementation:

- Added `src/features/marketing/proPackaging.ts` as the shared Pro packaging contract.
- Reframed Free as the daily learning loop: Today task, FSRS review, core practice, and basic progress.
- Reframed Pro as the deep-learning package: AI coach expansion, IELTS writing/speaking scoring, advanced analytics, custom wordbook imports, and weekly plan/recap.
- Updated `src/pages/PricingPage.tsx` to show explicit Free vs Pro jobs-to-be-done before the plan cards.
- Updated the Pro coming-soon card to explain the actual launch package and keep waitlist capture separate from checkout.
- Updated `src/components/UpgradePrompt.tsx` so quota gates explain why Pro matters and route to the waitlist when checkout is not live.
- Updated Profile's AI quota upsell to point to the Pro waitlist/value proposition instead of promising a live "unlimited AI" upgrade.
- Updated `src/services/billingGateway.ts` subscription feature labels so older entitlement/feature-gate surfaces do not drift from Pricing.

Verification:

- Added `src/features/marketing/proPackaging.test.ts`.
- Added `src/components/UpgradePrompt.test.tsx`.
- Extended `src/pages/PricingPage.test.tsx` to pin Free/Pro jobs-to-be-done, Pro package features, waitlist copy, and no priority-support drift.
- Extended `src/services/billingGateway.test.ts` to pin learning-outcome Pro packaging.
- Focused tests passed: `npm test -- src/pages/dashboard/ProfilePage.test.tsx src/features/marketing/proPackaging.test.ts src/components/UpgradePrompt.test.tsx src/pages/PricingPage.test.tsx src/services/billingGateway.test.ts` with 5 files and 35 tests.
- Browser smoke in the reused single tab on `/pricing?p3pro=packaging` confirmed:
  - Free and Pro jobs-to-be-done are visible.
  - IELTS scoring, custom imports, and weekly planning are present.
  - Clicking waitlist stores one monthly Pro intent locally and does not change the URL.
  - No Stripe, Alipay, checkout, or `Upgrade to Pro` dead path is visible while checkout is unavailable.
  - No horizontal overflow at 390px mobile.
- Browser smoke in the reused single tab on `/dashboard/profile?p3pro=gate` confirmed:
  - Profile AI quota card shows the shared Pro value proposition.
  - `查看 Pro 等待名单` is visible.
  - Old `升级 Pro 解锁无限 AI 功能` copy is gone.
  - No horizontal overflow at 390px mobile.
- Existing browser console errors during smoke were Supabase `user_entitlements` `ERR_CONNECTION_CLOSED` / auth fallback messages, not UI runtime failures.
- Screenshots captured under `product-audit-2026-06-13/regression/P3-03-pro-packaging/`.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm test` passed: 90 files, 758 tests.

Problem:
The paid tier needs a stronger reason to exist before checkout is enabled.

Scope:

- Decide Pro value:
  - unlimited AI coach
  - IELTS writing/speaking scoring
  - advanced analytics
  - custom wordbook imports
  - weekly plan and recap
- Align pricing page, feature gates, and waitlist copy.

Acceptance:

- Pricing page clearly separates Free and Pro jobs-to-be-done.
- Locked features explain why and how to join waitlist.
- No dead checkout path exists without provider secrets.

Regression:

- Browser smoke Pricing and gated feature entry points.
- Test fail-closed checkout remains intact.
- Verify waitlist and checkout are separate flows.

### P3-04 Improve Lifecycle Notifications

Status: done

Completed: 2026-06-13

Implementation:

- Added `src/features/learning/lifecycleNotifications.ts` as a pure rule engine for lifecycle nudges.
- Added notification rules for review debt, streak risk, exam-week plan, and weekly recap ready.
- Added lifecycle reminder settings to `UserSettings`: `lifecycleReminders`, `quietHoursStart`, and `quietHoursEnd`.
- Kept lifecycle reminders opt-in by default and added settings sanitization for quiet-hour time values.
- Updated `src/hooks/useStudyReminder.ts` so scheduled browser notifications can use dynamic learner-state copy and `null` explicitly means "do not schedule".
- Mounted lifecycle reminder scheduling in `src/layouts/DashboardLayout.tsx`, so dashboard pages can schedule from current due words, streak, mission completion, profile target, and settings.
- Added a Settings notification panel for lifecycle reminder opt-in, quiet hours, and a preview of the exact reminder title/body/link that would be sent.
- Added `?tab=notifications` deep-link support for Settings so notification controls can be opened directly.

Verification:

- Added `src/features/learning/lifecycleNotifications.test.ts`.
- Added `src/pages/dashboard/SettingsPage.test.tsx`.
- Updated `src/data/localStorage.settings.test.ts` for lifecycle defaults and sanitization.
- Focused tests passed: `npm test -- src/features/learning/lifecycleNotifications.test.ts src/data/localStorage.settings.test.ts src/services/reminderService.test.ts src/pages/dashboard/SettingsPage.test.tsx` with 4 files and 28 tests.
- Browser smoke in the reused single tab on `/dashboard/settings?tab=notifications&p3lifecycle=1` confirmed:
  - notification tab deep-link opens directly.
  - lifecycle reminder preview references real learner state (`考试计划检查点`) and links to `/dashboard/today?focus=exam-week`.
  - lifecycle switch can disable reminders and changes the preview to `智能提醒已关闭`.
  - quiet-hour controls render on mobile.
  - no horizontal overflow at 390px mobile.
- Screenshot captured under `product-audit-2026-06-13/regression/P3-04-lifecycle-notifications/`.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm test` passed: 92 files, 768 tests.

Problem:
Users need timely recovery nudges, not generic reminders.

Scope:

- Add notification rules for:
  - review debt rising
  - streak risk
  - exam-week plan
  - weekly recap ready
- Keep opt-in and quiet hours.

Acceptance:

- Notification copy references real learner state.
- Users can disable reminders.
- No reminder fires for completed tasks.

Regression:

- Unit test scheduling rules.
- Browser smoke settings toggle.
- Verify notification permission denial degrades gracefully.

## P4 - Polish, Performance, And Release Discipline

### P4-01 Reduce Initial Bundle Pressure

Status: done

Completed: 2026-06-13

Implementation:

- Removed the global `UserDataProvider` wrapper from `src/App.tsx` so public routes do not load the learner data layer on first paint.
- Added a lazy `UserDataRouteProvider` route wrapper for routes that actually need learner state:
  - `/word-of-the-day`
  - `/onboarding`
  - `/dashboard/*`
- Updated `lazyWithRetry()` typing so lazy route wrappers with required `children` props are supported without weakening runtime behavior.

Verification:

- Production build before this slice showed `index` at about `543.29 kB / gzip 179.27 kB`.
- Production build after this slice shows `index-Bqqvlh6j.js` at `369.51 kB / gzip 120.37 kB`.
- The user data layer is now split into route-loaded chunks, including `UserDataRouteProvider-C_uvb2ME.js` and `UserDataContext-B8OM1lGE.js`.
- Browser same-tab smoke on `/` confirmed the homepage loads without crash, no horizontal overflow, and no `UserDataContext`, `learningEvents`, `wordDatabase`, or local-storage learner resources in the current resource list.
- Browser same-tab smoke on `/word-of-the-day` confirmed the public daily-word route still loads and intentionally pulls the user data provider for save/practice actions.
- Browser same-tab smoke on `/dashboard/today` confirmed the authenticated dashboard still loads with learner state and no `useUserData` provider error.
- Browser error log after the route smokes returned zero errors.
- Mobile screenshot captured under `product-audit-2026-06-13/regression/P4-01-bundle-pressure/`.
- Focused tests passed: `npm test -- src/pages/WordOfTheDayPage.test.tsx src/pages/auth/AuthPages.i18n.test.tsx src/pages/dashboard/SettingsPage.test.tsx` with 3 files and 17 tests.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed.
- `npm test` passed: 92 files, 768 tests.

Problem:
Build warns about large chunks. Charts, markdown, syntax highlighting, and large vendors can slow initial load.

Scope:

- Analyze bundle output.
- Lazy-load heavy dashboard-only vendors.
- Split chart/markdown/highlight dependencies away from public first load.

Acceptance:

- Public first-load bundle size decreases measurably.
- Existing lazy routes still load reliably.
- Skeleton state feels intentional, not stuck.

Regression:

- Run `npm run build` and compare chunk sizes.
- Browser smoke first load `/`, `/login`, `/dashboard/today`.
- Check no blank lazy-loaded route after hard refresh.

### P4-02 Standardize Loading And Empty States

Status: done

Completed: 2026-06-13

Implementation:

- Added named loading states for dashboard lazy loading, public page lazy loading, and protected-route auth confirmation.
- Updated Today's learner-plan loading fallback so the hero says it is reading word-book, due-review, and weakness signals before recommending the next action.
- Added an AI-unavailable fallback action in Chat: users can retry or continue with local Practice instead of hitting a dead end.
- Reworked Analytics empty states so empty evidence renders actionable empty cards instead of blank charts:
  - no activity trend
  - no topic evidence
  - no study duration
  - no vocabulary trend
  - no heatmap signal
  - no FSRS retention estimate
  - no review-window signal
  - no forgetting-risk ranking
  - no Coach impact loop
  - no vocabulary distribution / radar evidence
- Removed the fake Analytics fallback where topic distribution could use today's candidate words and Coach Impact could default to `IELTS writing` without evidence.
- Fixed malformed legacy `vocabdaily_sessions` storage so `getStudySessions()` and `recordStudySession()` safely treat non-array session storage as empty instead of throwing.

Verification:

- Added tests for dashboard/public skeleton copy, auth loading copy, Chat AI-unavailable fallback, Analytics no-evidence states, and malformed study-session storage.
- Focused tests passed: `npm test -- src/components/DashboardSkeleton.test.tsx src/components/auth/RequireAuth.test.tsx src/features/chat/components/ChatErrorBanner.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/data/localStorage.settings.test.ts` with 5 files and 12 tests.
- `npm run lint` passed after the implementation pass.
- `npm run build` passed after the implementation pass.
- Browser same-tab smoke with seeded empty user `p4-empty@example.com` on `/dashboard/analytics?p4empty=2` confirmed overview empty states render, no crash, no horizontal overflow.
- Browser same-tab smoke on Analytics `记忆保留` tab confirmed FSRS retention, review-window, and forgetting-risk empty states render with next actions and no horizontal overflow.
- Browser same-tab smoke on Analytics `Coach Impact` tab confirmed no fake `IELTS writing` focus appears and no horizontal overflow.
- Browser console after the storage fix returned zero errors.
- Mobile screenshot captured under `product-audit-2026-06-13/regression/P4-02-loading-empty-states/`.
- Final `npm run lint` passed.
- Final `npm run check:i18n` passed.
- Final `npm run build` passed.
- Final `npm test` passed: 96 files, 776 tests.

Problem:
Some screens briefly show generic skeletons or empty states that do not teach the user what to do next.

Scope:

- Define loading/empty-state copy patterns:
  - loading learner plan
  - no active book
  - no due reviews
  - no analytics yet
  - AI unavailable
- Replace vague states with actionable ones.

Acceptance:

- Every empty state has one clear next action.
- Loading copy matches the actual operation.
- No empty state fabricates learning history.

Regression:

- Component tests where practical.
- Browser smoke seeded empty states.
- Visual QA mobile/desktop.

### P4-03 Complete I18n For Public And Core Dashboard Pages

Status: done

Completed: 2026-06-13

Implementation:

- Converted the Analytics page from mixed Chinese/English literals to language-aware copy for:
  - header and range labels
  - overview stat labels
  - tab labels
  - chart titles/subtitles
  - no-evidence empty states and actions
  - retention/review-window/risk sections
  - Coach Impact and weekly insights
- Updated Analytics date bucketing so month/year labels use the active UI language.
- Kept product/domain terms such as `VocabDaily`, `FSRS`, `Coach Impact`, `Today`, and `IELTS` as intentional product vocabulary.
- Converted dashboard skeletons, public page skeletons, and protected-route auth loading into bilingual named loading states.
- Converted DashboardLayout shell metadata, navigation descriptions, mobile drawers, account menus, progress labels, and primary learning CTA copy to language-aware text.
- Added English regression coverage for Analytics and loading/auth states.
- Fixed a time-dependent Settings notification test by pinning system time to midday so lifecycle reminder assertions do not fail during configured quiet hours.

Verification:

- Focused tests passed: `npm test -- src/components/DashboardSkeleton.test.tsx src/components/auth/RequireAuth.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx` with 3 files and 9 tests.
- Settings lifecycle reminder test passed after de-flaking: `npm test -- src/pages/dashboard/SettingsPage.test.tsx --run` with 1 file and 3 tests.
- `npm run lint` passed.
- `npm run check:i18n` passed.
- `npm run build` passed with the existing Browserslist and large chunk warnings.
- `npm test -- --run` passed: 96 files, 779 tests.
- `git diff --check` passed.
- Browser same-tab smoke on `/dashboard/analytics?p4i18n=en2` at 390px confirmed English shell copy appears, the old Chinese Analytics shell subtitle does not appear, English empty states render, Chinese empty-state copy does not appear, and horizontal overflow is `0`.
- Mobile screenshot captured under `product-audit-2026-06-13/regression/P4-03-i18n-core/`.

Problem:
Many pages mix Chinese and English literals even though i18n checks pass.

Scope:

- Inventory hardcoded user-facing strings.
- Prioritize:
  - Word of Day
  - Settings
  - Analytics
  - Profile
  - Today
- Move copy into translation files or explicitly mark non-localized product names.

Acceptance:

- Language toggle changes all major user-facing labels on priority pages.
- Dates and numbers use locale-aware formatting.
- No accidental bilingual duplicates.

Regression:

- Run `npm run check:i18n`.
- Browser smoke priority pages in Chinese and English.
- Search check for obvious hardcoded strings in touched files.

### P4-04 Add Product Regression Harness Notes

Status: done

Completed: 2026-06-13

Implementation:

- Added `docs/ops/PRODUCT_REGRESSION_RUNBOOK.md` as the durable product regression guide.
- Documented the automated baseline commands, including lint, i18n parity, production build, full Vitest suite, and whitespace check.
- Added local and production-like browser smoke setup, recommended viewport sizes, and per-route inspection expectations.
- Added route matrices for public pages, core dashboard pages, and support/skill routes.
- Added seeded persona guidance for anonymous, demo, empty learner, due-review, stubborn-recovery, A1, C1 IELTS, learning-style, and Pro-intent checks.
- Added theme/language matrix rules and explicitly documented product terms that may remain untranslated.
- Added screenshot naming/storage conventions under `product-audit-YYYY-MM-DD/regression/<task-id>-<slug>/`.
- Added known external dependencies and expected fallbacks for Supabase, AI gateway, billing, notifications, microphone, audio, storage, and APKG import paths.
- Linked the new runbook from `docs/ops/SMOKE_COVERAGE.md` and `docs/ops/SUPABASE_RELEASE_CHECKLIST.md`.

Verification:

- Validated the runbook file exists and is referenced from ops docs with `rg`.
- `git diff --check` passed after the documentation edits.
- Baseline gates already passed during the P4-03/P4-04 closeout:
  - `npm run lint`
  - `npm run check:i18n`
  - `npm run build`
  - `npm test -- --run` with 96 files and 779 tests

Problem:
Future agents need a durable way to know what to check after product changes.

Scope:

- Update or add ops QA docs with:
  - core routes
  - seeded personas
  - screenshot expectations
  - theme/language matrix
  - known external dependencies

Acceptance:

- A new engineer can run the regression suite without reading old chat context.
- Docs distinguish automated tests from manual browser checks.
- Screenshots have a stable storage convention.

Regression:

- Validate docs links.
- Run core baseline commands.
- Confirm no temporary screenshots are committed unless intentionally referenced.

## Suggested Execution Order

1. P0-01 through P0-08: remove trust, semantic, and correctness debt.
2. P1-01 and P1-02: make onboarding and Today decide the learner's next action.
3. P1-03 through P1-05: improve activation and demand capture.
4. P2-01 through P2-06: make personalization and learning depth real.
5. P3-01 through P3-04: add retention, sharing, and monetization clarity.
6. P4-01 through P4-04: reduce performance and QA debt before release.

## Done Definition For Each Item

An item is not done until all of the following are true:

- The implementation is complete for the stated scope.
- Acceptance criteria are met with current-state evidence.
- Regression checks listed for the item have passed or a blocked check is documented with reason.
- Public routes remain usable on desktop and 390px mobile if the item touches UI.
- No unrelated user changes were reverted.
- Any new temporary audit artifacts are either intentionally documented or removed.

## P5 - Product And UI Next Upgrade Wave

Status: planned

Added: 2026-06-13

Context:

- This is a current-state re-audit after P0-P4 items above were marked done.
- Product target is VocabDaily AI, an English learning app, not a blog or content site.
- Current evidence includes `README.md`, `PRD_V2.md`, `VocabDaily_AI_优化计划_v3.md`, current React routes, current dashboard components, screenshots in `product-audit-2026-06-13/`, and source review of Today, Review, Practice, Chat, Onboarding, DashboardLayout, and shared learning components.
- `npm run build` passed on 2026-06-13. `npm run lint` passed on 2026-06-13.
- Build still reports the existing Browserslist freshness warning and large chunks, especially charts, markdown, index, ChatPage, DashboardLayout, TodayPage, Supabase vendor, and learningEvents.

Product read:

VocabDaily is no longer missing basic features. The bigger risk is that the product now has too many capable surfaces: Today, Review, Practice, Coach, Exam, Pronunciation, Writing, Reading, Listening, Grammar, Learning Path, Analytics, Memory, Vocabulary, Leaderboard, Pricing, Word of the Day, and Sample Lesson. The next upgrade should make the daily learning loop feel obvious, fast, and emotionally sustainable.

Design read:

- Redesign mode: Preserve.
- Audience: Chinese-speaking English learners, exam learners, working adults, and habit-driven learners who need a clear next action.
- UI language: calm learning cockpit, friendly coach, credible exam prep.
- Avoid: generic AI SaaS hero, fake dashboards, raw feature catalog, excessive cards, raw emoji in serious learning states, hidden primary action below dense panels.
- Suggested dials: `DESIGN_VARIANCE 5`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 6`.

### P5-01 Make Mobile Learning Sessions Truly One-Handed

Problem:
Mobile dashboard has bottom navigation and mobile screenshots pass basic overflow checks, but the active learning surfaces still behave like compressed desktop workspaces. Today, Practice, and Review often require vertical scanning before the learner reaches the concrete action.

Evidence:

- `P1-02-today-primary-mobile.png` shows the mission hero, progress card, and bottom metric pill competing for the first screen.
- `practice-reading-mobile.png` shows a large mode hero before the mode list.
- `review-stubborn-recovery-mobile.png` shows useful recovery content, but rating actions sit after a long panel and can compete with bottom nav.

Scope:

- Design mobile-first variants for Today, Review, Practice, and Coach.
- Use a fixed session footer only for active session actions, not for passive metrics.
- Keep bottom nav visible on non-session browsing, but hide or compress it during full-screen review/practice states when it competes with answer buttons.
- Convert Review rating controls into a thumb-zone bottom action dock after answer reveal.
- Convert Practice active questions into a single-card session frame with progress, prompt, answer, and next action visible without hunting.

Acceptance:

- 390x844 Today: the primary action and first concrete learning workspace are visible before the learner scrolls past 1.2 screens.
- 390x844 Review after reveal: Again, Hard, Good, Easy are visible without scrolling past unrelated guidance.
- 390x844 Practice active question: question, answer input/options, and submit action are visible together.
- Bottom nav does not cover any primary action, toast, input, or rating button.
- Safe area is respected on iPhone-style viewports.

Regression:

- Add a mobile layout smoke script for `/dashboard/today`, `/dashboard/review`, `/dashboard/practice`, and `/dashboard/chat`.
- Measure `primaryActionY`, `workspaceY`, `bottomNavOverlap`, and `horizontalOverflow`.
- Screenshot both empty and active-session states.

### P5-02 Compress Today From "Mission Poster" To "Daily Command Bar"

Problem:
P1-02 correctly made Today one primary mission, but the hero now reads like a large poster. On desktop it wastes vertical space; on mobile it pushes the actual word workbench lower than necessary.

Scope:

- Keep `LearningCockpitShell`, but add a compact Today variant.
- Turn the reason chip, title, estimated time, due count, and progress into a single daily command bar.
- Move large progress card details into a collapsible or right rail on desktop.
- Keep one primary CTA and at most two secondary actions.
- Remove duplicate progress signals between hero metrics, sidebar, sticky mobile pill, and word workspace.

Acceptance:

- Today desktop: word workbench begins in the first viewport below the command bar.
- Today mobile: learner sees "what to do now" plus the first word card without a long dashboard preamble.
- The page still exposes source signal, estimated time, words left, and due reviews.
- Automated check confirms exactly one primary cockpit action.

Likely files:

- `src/pages/dashboard/TodayPage.tsx`
- `src/features/learning/components/LearningCockpitShell.tsx`
- `src/features/learning/components/LearningWorkspace.tsx`
- `src/layouts/DashboardLayout.tsx`

### P5-03 Redesign Practice As A Mode Picker Plus Active Drill

Problem:
Practice has strong runtime logic, but the UI mixes "recommended mode", "mode catalog", and "active drill" in one page rhythm. The learner can understand it, but it does not yet feel as quick as a daily micro-practice tool.

Scope:

- Split Practice into two explicit states:
  - Picker state: recommended mode, 4 mode choices, estimated time, why this mode.
  - Active state: one prompt, one input/choice set, one submit action, one explanation.
- Use a segmented control or compact mode chips, not stacked large cards for every mode.
- Make "Recommended for today" visually decisive, but still allow changing mode.
- Add short recovery paths when there are no daily words, no listening queue, quota exhausted, or AI writing feedback unavailable.

Acceptance:

- 390x844 picker: recommended mode and at least two alternatives are visible without deep scroll.
- Active quiz/listening/writing state has no decorative panels between question and action.
- Each mode has loading, empty, error, and complete states.
- Session completion routes to Coach or Review based on mistakes, not generic "done".

Likely files:

- `src/pages/dashboard/PracticePage.tsx`
- `src/features/practice/recommendedMode.ts`
- `src/features/practice/runtime.ts`
- `src/features/learning/components/SessionRecapCard.tsx`

### P5-04 Make Review Feel Like Memory Training, Not A Settings Panel

Problem:
Review uses FSRS correctly and includes stubborn-word recovery, but guidance and statistics can dominate the active memory act. The highest-value moment is recall, reveal, rate, then optional recovery.

Scope:

- Add a compact review session shell:
  - top: remaining count and current card
  - center: recall/reveal card
  - bottom: reveal or rating dock
- Move rating guide into a small help drawer.
- Make stubborn recovery a focused interstitial only when triggered, not a large always-competing side panel.
- Keep keyboard shortcuts visible but not visually heavy.

Acceptance:

- Learner can complete a review round with one thumb on mobile.
- Rating buttons meet tap target size and are not hidden under nav.
- Stubborn recovery result writes evidence as it does today.
- Coach review rail remains available but secondary.

Likely files:

- `src/pages/dashboard/ReviewPage.tsx`
- `src/features/learning/stubbornRecovery.ts`
- `src/features/coach/CoachReviewRail.tsx`

### P5-05 Productize Coach As The Loop Router

Problem:
Coach is powerful, but "Diagnose / Drill / Review" plus tools and evidence can still feel like an expert console. The product promise is stronger if Coach always starts from a current learner state and produces a next action.

Scope:

- Add Coach entry templates from Today, Review, Practice, Word of the Day, Lexicon, and Analytics.
- Add a visible "Coach outcome" pattern:
  - explain
  - create drill
  - schedule review
  - save memory
  - update weak spot
- Make quick prompts stateful, based on due count, current word, latest mistakes, exam target, and learning path.
- Separate diagnostic evidence from the chat transcript so the learner sees "why Coach suggested this" without reading logs.

Acceptance:

- Every core learning surface can open Coach with a prefilled, contextual task.
- A Coach drill can write evidence that appears in Review or Practice.
- Chat empty state does not look like a generic AI chat app.
- AI unavailable state still gives a deterministic fallback drill.

Likely files:

- `src/pages/dashboard/ChatPage.tsx`
- `src/features/chat/components/ChatWelcome.tsx`
- `src/features/chat/utils/quickPrompts.ts`
- `src/features/coach/*`
- `src/services/coachingActionRouter.ts`

### P5-06 Simplify Navigation Around Four Mental Buckets

Problem:
Dashboard has many routes. The sidebar is accurate, but a learner should not need to parse a product org chart before studying.

Proposed buckets:

- Today: current mission.
- Train: Review, Practice, Pronunciation, Writing, Reading, Listening, Grammar.
- Coach: Chat, Memory, Coach reviews.
- Track: Learning Path, Exam Prep, Analytics, Vocabulary.

Scope:

- Keep existing routes and slugs.
- Rework desktop sidebar grouping and mobile More sheet labels.
- Use the route registry as source of truth so nav, page titles, and search stay consistent.
- Add "last used" and "recommended next" placement in More.

Acceptance:

- Core mobile bottom nav stays to 5 items: Today, Coach, Practice or Review, Track, More.
- Desktop sidebar primary area shows fewer top-level choices, with skills folded under Train.
- Search palette still reaches all routes.
- No route is removed.

Likely files:

- `src/layouts/DashboardLayout.tsx`
- `src/components/BottomNavBar.tsx`
- `src/features/learning/routeRegistry.ts`
- `src/components/SearchPalette.tsx`

### P5-07 Create A Distinct Visual Asset System For Learning, Not AI

Problem:
The app has a calm visual system, but it still relies mostly on cards, icons, and text. It needs a more memorable learning identity without becoming childish or generic AI.

Visual territories to explore:

1. Focused study cockpit: quiet command surfaces, progress as evidence, strong typography, minimal color.
2. Friendly exam coach: supportive, structured, slightly warmer, more human feedback moments.
3. Language field notebook: word cards, examples, collocations, mistakes, and drills as physical study artifacts.

Scope:

- Define 6 to 8 reusable visual assets:
  - daily mission illustration
  - word-card share background
  - empty state for no due reviews
  - Coach diagnosis visual
  - IELTS sprint visual
  - pronunciation waveform visual
  - streak recovery visual
  - sample lesson visual
- Use real/generated bitmap assets or production-quality illustrations, not div-art fake screenshots.
- Keep one accent family per surface and tokenize any new color.

Acceptance:

- Landing, onboarding, empty states, and share cards no longer feel like only icon + card layouts.
- Assets have reserved dimensions and do not introduce CLS.
- Decorative assets use empty alt; meaningful assets have accurate alt text.
- Visual identity still works in light and dark theme.

Likely files:

- `src/pages/Home.tsx`
- `src/features/marketing/*`
- `src/features/share/wordShareCard.ts`
- `src/features/learning/components/*`
- `public/` assets folder if new images are added.

### P5-08 Replace Raw Emotional Emoji With Designed Motivation

Problem:
The app uses some raw emoji for streak and topics. That is acceptable in topic selection, but serious learning status should feel designed and accessible.

Evidence:

- `TodayPage.tsx` uses raw fire emoji for streak display.
- `recommendationEngine.ts` and `gamification.ts` include emoji icons in service-level data.
- Topic onboarding uses emoji as visual labels.

Scope:

- Keep emoji only where the user is choosing casual interest topics.
- Replace streak, XP, achievement, and recommendation emoji with icon components or small designed badges.
- Move visual symbols out of service data where possible; services should return semantic keys, UI should decide presentation.
- Add reduced-motion fallback for confetti and streak animation.

Acceptance:

- No raw emoji appears in core dashboard learning status, toasts, or service-derived UI.
- Topic onboarding still remains friendly.
- Screen reader labels do not announce decorative emoji unexpectedly.

Likely files:

- `src/pages/dashboard/TodayPage.tsx`
- `src/services/recommendationEngine.ts`
- `src/services/gamification.ts`
- `src/components/StreakCounter.tsx`

### P5-09 Run A Copy And I18n Pass On Core Learning Surfaces

Problem:
The app supports Chinese and English, but some components still mix Chinese labels, English mode names, and technical product terms in the same state. That weakens trust for English learners who rely on Chinese explanations.

Scope:

- Audit visible strings in:
  - Today
  - Review
  - Practice
  - Coach
  - Onboarding
  - Pricing
  - Word of the Day
  - Analytics
- Move hardcoded strings into i18n where they are user-facing.
- Standardize intent labels:
  - Start today's plan
  - Clear review
  - Practice weak spot
  - Ask Coach
  - Save word
  - Continue path
- Avoid fake-precise claims on public marketing pages unless backed by real measurement.

Acceptance:

- `npm run check:i18n` passes.
- English mode does not display Chinese-only learning copy on core routes.
- Chinese mode can still show English words, phonetics, examples, and target phrases.
- Public copy avoids unsupported claims such as fake exact seconds or fake performance deltas.

Likely files:

- `src/i18n/index.ts`
- `src/pages/Home.tsx`
- `src/pages/LandingPage.tsx`
- `src/pages/dashboard/*`
- `src/features/*`

### P5-10 Add A Dedicated UI Layout Regression Gate

Problem:
The runbook is strong, and screenshots exist, but layout risk is still mostly manual. UI changes need numeric checks that fail when key learning actions drop too low or get covered.

Scope:

- Add a script similar to a product layout audit:
  - start app or consume a running app
  - seed demo/local state
  - measure desktop and 390px mobile
  - capture key y-positions and overlap
- Routes:
  - `/`
  - `/demo`
  - `/onboarding`
  - `/dashboard/today`
  - `/dashboard/review`
  - `/dashboard/practice`
  - `/dashboard/chat`
  - `/dashboard/analytics`
  - `/dashboard/pricing` if behind dashboard later
- Persist latest JSON under `product-audit-YYYY-MM-DD/layout-checks.json`.

Acceptance:

- Fails if horizontal overflow exists at 390px.
- Fails if primary learning action is hidden below a threshold.
- Fails if bottom nav overlaps active action controls.
- Fails if mobile input is hidden behind nav in Chat or Practice.

Likely files:

- `scripts/`
- `docs/ops/PRODUCT_REGRESSION_RUNBOOK.md`
- `package.json`

### P5-11 Replace `h-screen` Shells With Dynamic Viewport-Safe Shells

Problem:
Several app shells use `h-screen`. This can jump or clip on mobile browsers because mobile viewport height changes when browser chrome appears.

Evidence:

- `DashboardLayout.tsx` uses `h-screen` for learning and standard shells.
- Several public pages use `min-h-screen`, which is safer than fixed height but still should be checked for mobile browser chrome behavior.

Scope:

- Replace dashboard fixed shells with `min-h-[100dvh]` or `h-[100dvh]` only where overflow containers are explicitly controlled.
- Audit fixed headers, bottom nav, chat composer, and active practice controls.
- Define a shared app-shell class so future pages do not reintroduce viewport bugs.

Acceptance:

- Mobile browser chrome changes do not hide bottom nav or action buttons.
- Chat composer remains visible while typing.
- Practice and Review action docks remain above safe area.

Likely files:

- `src/layouts/DashboardLayout.tsx`
- `src/components/BottomNavBar.tsx`
- `src/pages/dashboard/ChatPage.tsx`
- `src/index.css`

### P5-12 Continue Bundle And Interaction Performance Work

Problem:
Build passes, but the production bundle still has large chunks. Some are expected, but a learning app should feel instant on mobile.

Current build signals:

- `charts-vendor` around 455 kB.
- `markdown-vendor` around 328 kB.
- app `index` around 371 kB.
- `ChatPage` around 145 kB.
- `learningEvents` around 160 kB.
- `DashboardLayout` and `TodayPage` around 60 kB each.
- `sql-wasm` around 660 kB.

Scope:

- Ensure charts are only loaded for Analytics.
- Ensure markdown/highlight only load in Chat or content surfaces that need them.
- Check why `learningEvents` forms a large shared chunk.
- Lazy-load heavy Coach panels, quiz canvas, markdown rendering, and chart tabs.
- Add route-level loading skeletons that match the final layout.

Acceptance:

- First dashboard route does not load chart or markdown vendors unless needed.
- Today interaction becomes available before non-critical analytics/chat code loads.
- Lighthouse or local performance smoke shows no major main-thread block during Today first render.

Likely files:

- `src/App.tsx`
- `src/pages/dashboard/AnalyticsPage.tsx`
- `src/pages/dashboard/ChatPage.tsx`
- `src/services/learningEvents.ts`
- `vite.config.ts`

### P5-13 Make Pricing And Pro States Feel Trustworthy Before Payment Is Live

Problem:
Pricing is clearer after P3-03, but paid conversion needs careful trust handling while checkout is not live.

Scope:

- Keep fail-closed copy.
- Add a clear "Pro not open yet" state wherever UpgradePrompt appears.
- Capture demand with waitlist or contact intent, not a fake checkout.
- Make Pro benefits concrete by showing locked examples:
  - deeper writing feedback
  - custom material
  - advanced weekly plan
  - richer pronunciation scoring

Acceptance:

- No UI implies checkout works if billing is disabled.
- Upgrade buttons route to waitlist, not broken payment.
- Free users understand exactly what is available today.

Likely files:

- `src/pages/PricingPage.tsx`
- `src/components/UpgradePrompt.tsx`
- `src/features/marketing/proPackaging.ts`
- `src/services/billingGateway.ts`

### P5-14 Preserve Current Strengths

Do not regress these:

- Existing route breadth and lazy-loaded route architecture.
- FSRS review correctness and typed evidence events.
- Demo mode deterministic local session.
- Auth-aware Word of the Day.
- Goal-based onboarding placement.
- Single primary Today mission invariant.
- Coach review queue and stubborn-word recovery.
- Light/dark theme token system.
- Existing Radix/shadcn component primitives.
- Current tests and regression evidence.

### P5 Suggested Execution Order

1. P5-10 and P5-11: add numeric UI checks and viewport-safe shells first.
2. P5-01 and P5-02: make mobile Today and active sessions faster.
3. P5-03 and P5-04: refactor Practice and Review into clearer session states.
4. P5-05 and P5-06: make Coach and navigation route the whole learning loop.
5. P5-07 and P5-08: add distinct learning visuals and designed motivation.
6. P5-09: clean copy and i18n after UI structure stabilizes.
7. P5-12 and P5-13: continue performance and monetization trust work.
