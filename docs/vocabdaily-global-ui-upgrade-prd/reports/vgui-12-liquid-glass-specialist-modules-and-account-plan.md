# VGUI-12 Liquid Glass Specialist Modules And Account Plan

Date: 2026-06-21
Status: planned
Feature oracle item: VGUI-F012

## Objective

Upgrade Reading, Listening, Grammar, Pronunciation, Writing, Exam, Learning Path, Memory, Leaderboard, Settings, and Profile so the remaining authenticated routes follow the same Liquid Glass rule set: shell and lightweight controls can be glass; passages, transcripts, writing feedback, prompts, memory details, forms, and profile data stay solid and readable.

## Plan

| Requirement / gate | Likely files | Validation / evidence |
| --- | --- | --- |
| Make module selectors, tabs, filter/search/action rows, and small mode controls use shared glass without wrapping long content. | `ReadingPage.tsx`, `ListeningPage.tsx`, `GrammarPage.tsx`, `PronunciationPage.tsx`, `WritingPage.tsx`, `LearningPathPage.tsx`, `MemoryCenterPage.tsx`, `LeaderboardPage.tsx`, `SettingsPage.tsx`, `ProfilePage.tsx`, exam components as needed | Browser matrix checks glass controls exist and dense content is not inside glass. |
| Keep passages, transcripts, explanations, feedback, forms, profile/account data, and exam workspace on solid surfaces with Apple-like radius/border rhythm. | Same route files plus `src/features/exam/components/**`, `src/features/pronunciation/components/**` | Desktop/mobile screenshots and no dense-inside-glass checks. |
| Replace visible off-palette hard-coded colors with semantic primary/warning/destructive/success/accent tokens. | Routes with `blue/green/red/amber/violet/cyan/slate` utility fragments | Lint/build and visual screenshot review. |
| Preserve semantics: account persistence, exam quota, scoring, TTS/speech state, route data, and module feedback behavior. | Route files only; no service/provider/schema changes | Focused module/account tests, full tests later in VGUI-13. |
| Record evidence and hand off to release gate. | Harness docs | VGUI-12 report, oracle update, source packet and continuity ledger writeback, strict validator later. |

## Boundaries

- Do not change account persistence contracts, exam quota semantics, AI/provider credentials, database migrations, billing behavior, or production data.
- Do not add dependencies.
- Do not place glass behind long-form learning content, settings/profile forms, transcripts, writing feedback, exam prompts, or memory details.

## Required Checks

- `npx vitest run src/pages/dashboard/ProfilePage.test.tsx src/pages/dashboard/SettingsPage.test.tsx src/pages/dashboard/VocabularyBankPage.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/features/learning/learningPathRouting.test.ts src/features/lexicon/lexicalEntry.test.ts`
- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- Browser evidence for the 11 VGUI-12 routes at desktop 1440x960 and mobile 390x844, light and dark.
