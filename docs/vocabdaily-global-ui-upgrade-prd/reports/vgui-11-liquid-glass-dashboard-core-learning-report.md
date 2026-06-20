# VGUI-11 Liquid Glass Dashboard Core Learning Report

Date: 2026-06-20
Status: passed
Feature oracle item: VGUI-F011

## Summary

Executed the core dashboard Liquid Glass phase for Today, Review, Practice, Chat, Vocabulary, and Analytics. The dashboard shell and lightweight controls now use the shared glass language, while workbook sheets, review cards, chat messages, vocabulary content, analytics cards, and chart areas remain on solid readable surfaces.

This report does not claim specialist modules, settings/profile, or the final full-route release gate are complete. Those remain VGUI-12 and VGUI-13.

## Plan Followed

- Reworked shared learning surfaces toward solid Apple-like cards with a consistent radius, border, and highlight rhythm.
- Kept dense learning and analytics content out of glass containers.
- Applied glass only to lightweight route controls, Chat composer/tools, Vocabulary filters, Analytics tabs/time range, and existing shell controls.
- Replaced visible off-palette dashboard fragments with semantic primary, warning, destructive, success, and feature accent tokens.
- Preserved Practice attempt-state behavior, Review due-only behavior, Chat semantics, vocabulary data contracts, and analytics calculations.
- Fixed mobile Chat quick prompts so long prompt buttons wrap into visible full-width controls instead of being clipped at the viewport edge.

## Files Changed

- `src/index.css`
- `src/features/learning/components/LearningWorkspace.tsx`
- `src/features/learning/components/StudyWorkbook.tsx`
- `src/features/learning/components/SessionRecapCard.tsx`
- `src/features/coach/CoachReviewRail.tsx`
- `src/pages/dashboard/TodayPage.tsx`
- `src/pages/dashboard/ReviewPage.tsx`
- `src/pages/dashboard/PracticePage.tsx`
- `src/pages/dashboard/ChatPage.tsx`
- `src/pages/dashboard/VocabularyBankPage.tsx`
- `src/pages/dashboard/AnalyticsPage.tsx`
- `src/features/chat/components/ChatComposer.tsx`
- `src/features/chat/components/ChatErrorBanner.tsx`
- `src/features/chat/components/ChatArtifactRenderer.tsx`
- `src/features/chat/components/ChatMessageBubble.tsx`
- `src/features/chat/components/ChatHistorySidebar.tsx`
- `src/features/chat/components/ThinkingStatusCard.tsx`
- `src/features/chat/components/DatabaseStatusBanner.tsx`
- `src/features/chat/components/ScenarioSelector.tsx`
- `src/features/chat/components/RoleplayMode.tsx`

## Validation Evidence

| Gate | Command / evidence | Result |
| --- | --- | --- |
| Required focused dashboard tests | `npx vitest run src/pages/dashboard/PracticePage.test.tsx src/pages/dashboard/ReviewPage.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/pages/dashboard/VocabularyBankPage.test.tsx src/features/practice/attemptState.test.ts src/features/learning/sessionRecap.test.ts src/features/chat/components/ChatErrorBanner.test.tsx src/features/coach/reviewRailLogic.test.ts` | passed: 8 files, 51 tests |
| Full test suite | `npm test` | passed: 110 files, 840 tests |
| Lint | `npm run lint` | passed |
| i18n parity | `npm run check:i18n` | passed |
| Production build | `npm run build` | passed; existing Browserslist `caniuse-lite` age warning only |
| VGUI-11 dashboard core matrix | custom Playwright matrix against `http://127.0.0.1:5176` using local demo auth | passed: 24/24 checks |
| Learning-flow regression | `BASE_URL=http://127.0.0.1:5176 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-20/liquid-glass/vgui-11-learning-flow npm run test:learning-flow-regression` | passed: 160 checks |

## Browser Evidence

VGUI-11 dashboard core matrix:

- Summary: `product-audit-2026-06-20/liquid-glass/vgui-11-dashboard-core/summary.json`
- Screenshots: `product-audit-2026-06-20/liquid-glass/vgui-11-dashboard-core/screenshots/`
- Routes: `/dashboard/today`, `/dashboard/review`, `/dashboard/practice`, `/dashboard/chat`, `/dashboard/vocabulary`, `/dashboard/analytics`
- Viewports: desktop 1440x960 and mobile 390x844
- Themes: light and dark
- Checks: route stays authenticated, expected route content is visible, no error boundary, no horizontal overflow, shared glass controls exist, dense content is not inside a glass surface, and visible controls are not clipped.

Learning-flow regression:

- Summary: `product-audit-2026-06-20/liquid-glass/vgui-11-learning-flow/summary.json`
- Screenshots: `product-audit-2026-06-20/liquid-glass/vgui-11-learning-flow/screenshots/`
- Checks: 160 passed, including seeded learning-flow and retry/reveal behavior.

## Semantic Preservation Notes

- `src/features/practice/attemptState.ts` was not changed.
- FSRS/review scheduling logic and Review due-only behavior were not changed.
- Vocabulary import/export/data contracts were not changed.
- Chat provider, memory, and send/retry semantics were not changed.
- Analytics metrics and calculations were not changed.
- No new dependencies were added.

## Source Packet Writeback

`source-packet.md` now records VGUI-11 dashboard core facts, including the solid learning-surface rule, Chat quick-prompt mobile fix, focused/full test evidence, and dashboard matrix evidence.

## Continuity Ledger Update

`continuity-ledger.md` now records VGUI-11 as passed and hands off to VGUI-12. Downstream phases inherit:

- dense content stays solid
- glass is for shell/navigation/control layers only
- visible off-palette route accents should continue moving to semantic tokens
- mobile prompt/control rows must wrap or fit at 390px rather than relying on clipped horizontal edges

## Deviations And Blockers

No active blocker.

The custom dashboard matrix was calibrated during execution: initial runs either inspected logged-out `/login` content or counted accessible skip links and below-fold vertical scroll positions as clipping. The final evidence uses local-demo auth per context and checks visible horizontal/text clipping only.

## Acceptance Gate Status

- Six dashboard core routes have light/dark desktop/mobile evidence: passed.
- Focused tests, full tests, lint, i18n, and build: passed.
- Learning-flow regression evidence exists: passed.
- Dense learning, chat, vocabulary, and analytics surfaces remain solid/readable: passed.
- Learning correctness and data contracts preserved: passed.
- VGUI-F011 can be marked passing.

## Next Phase

Execute VGUI-12 Liquid Glass Specialist Modules And Account.

Target feature-oracle item: VGUI-F012.
