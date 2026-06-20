# VGUI-11 Liquid Glass Dashboard Core Learning Plan

Date: 2026-06-20
Status: planned
Feature oracle item: VGUI-F011

## Objective

Upgrade Today, Review, Practice, Chat, Vocabulary, and Analytics so the dashboard core uses the shared Liquid Glass navigation/control language while keeping workbook cards, answers, chat content, vocabulary lists, and charts on solid readable surfaces.

## Plan

| Requirement / gate | Likely files | Validation / evidence |
| --- | --- | --- |
| Keep core learning surfaces solid and Apple-like rather than paper-textured or glass-on-glass. | `src/index.css`, `src/features/learning/components/StudyWorkbook.tsx`, `src/features/learning/components/LearningWorkspace.tsx`, `src/features/learning/components/SessionRecapCard.tsx`, `src/features/coach/CoachReviewRail.tsx` | Focused dashboard tests; browser checks confirm dense content is not inside shared glass surfaces. |
| Preserve Practice first-wrong retry, retry-correct recovered, second-wrong/reveal, and listening retry/reveal behavior. | `src/pages/dashboard/PracticePage.tsx`, `src/features/practice/**` | Required Vitest command; learning-flow regression screenshots for retry/reveal states. |
| Keep Review due-only behavior and answer reveal/rating semantics intact. | `src/pages/dashboard/ReviewPage.tsx`, shared review rail only if styling requires it | Required Vitest command; browser route evidence. |
| Apply Liquid Glass only to lightweight dashboard controls: mode picker, small route controls, Chat header/tools/composer control affordances, Vocabulary filters, Analytics tabs/time range. | `src/pages/dashboard/ChatPage.tsx`, `src/features/chat/components/ChatComposer.tsx`, `src/pages/dashboard/VocabularyBankPage.tsx`, `src/pages/dashboard/AnalyticsPage.tsx` | Browser checks for glass shell/control presence and no glass under messages/lists/charts. |
| Remove old off-palette blue/slate/amber/red fragments where they are visible in core dashboard route bodies, replacing them with semantic primary/warning/destructive/success tokens. | `src/pages/dashboard/ReviewPage.tsx`, `PracticePage.tsx`, `VocabularyBankPage.tsx`, `AnalyticsPage.tsx`, chat banners/components as needed | Lint/build plus visual spot checks. |
| Record evidence and hand off cleanly. | Harness docs under `docs/vocabdaily-global-ui-upgrade-prd/**` | VGUI-11 report, oracle update, source-packet writeback, continuity-ledger update, strict harness validator. |

## Boundaries

- Do not change FSRS/review scheduling semantics, Practice attempt state semantics, Supabase schema, AI provider credentials, billing, or production deploy behavior.
- Do not add dependencies.
- Do not place glass wrappers around reading passages, answer explanations, long chat messages, vocabulary result cards, analytics charts, or form bodies.
- If a required visual change would require learning behavior changes, stop and document the blocker.

## Required Checks

- `npx vitest run src/pages/dashboard/PracticePage.test.tsx src/pages/dashboard/ReviewPage.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/pages/dashboard/VocabularyBankPage.test.tsx src/features/practice/attemptState.test.ts src/features/learning/sessionRecap.test.ts src/features/chat/components/ChatErrorBanner.test.tsx src/features/coach/reviewRailLogic.test.ts`
- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- Dashboard core browser evidence for `/dashboard/today`, `/dashboard/review`, `/dashboard/practice`, `/dashboard/chat`, `/dashboard/vocabulary`, and `/dashboard/analytics` at desktop 1440x960 and mobile 390x844, light and dark.
- Learning-flow or UI regression evidence for retry/reveal behavior.
