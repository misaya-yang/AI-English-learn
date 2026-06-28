# EN-04 Reading Plan

- Phase: EN-04
- Feature: EN-F004
- Status: planned
- Date: 2026-06-28

## Evidence Read

- Dependency evidence: EN-03 has `Status: passed` and `Critic Verdict: approved`; current filename-specific structure is verified by the custom contract audit because the upstream completion gate does not yet accept `phase-EN-xx` filenames.
- Phase contract: `docs/english-web-optimization-harness/phase-EN-04.md` requires honest generated-passage fallback, deterministic answer/scoring behavior, evidence-line review, learning-event/gamification integrity, browser evidence, and critic approval.
- Primary context opened: `src/pages/dashboard/ReadingPage.tsx`, `src/services/learningEvents.ts`, `src/services/gamification.ts`, `src/features/learning/components/LearningWorkspace.tsx`.

## Selected Slice

Implement EN-F004 inside `/dashboard/reading` without real AI generation, Supabase function edits, external content, schema changes, Listening/Practice edits, or dependency changes.

## Planned Changes

- `src/pages/dashboard/ReadingPage.tsx`: remove/soften live-AI generation claims in header/copy; label the generated-passage action as local built-in variation; use deterministic generated fallback ids; add pure answer scoring helpers; prevent very short short-answer false positives; disable submit until all answers are present; record at least 1 estimated reading minute; stop incrementing vocabulary review count for reading question totals; add event payload fields that distinguish generated fallback/source and answer count; show evidence review fallback for questions without explicit `location`.
- `src/pages/dashboard/ReadingPage.test.tsx`: add focused user-flow tests for generated fallback honesty, incomplete-submit gate, short-answer false-positive rejection, non-zero duration/event payload, no review-count inflation, and evidence fallback.
- Harness docs: write EN-04 report/critic and update oracle/state/log/handoff/source-packet/continuity after validation.

## Validation Commands

- `npm test -- --run src/pages/dashboard/ReadingPage.test.tsx`
- `npm test -- --run src/pages/dashboard/ReadingPage.test.tsx src/data/readingContent.test.ts src/services/learningEvents.strict.test.ts src/services/gamification.test.ts`
- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- `curl -sSf http://127.0.0.1:5173/ >/dev/null`
- `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-04-reading npm run test:ui-regression`
- `git diff --check`

## Browser Checks

- English light mode `/dashboard/reading` at 1440x960 and 390x844.
- Verify select screen, local variation/fallback copy, reading state, disabled incomplete submit, TFNG/MCQ/short-answer completion, review score, correct-answer reveal, evidence lines and fallback explanations.
- Capture console/page-error summary and screenshot paths.

## Boundaries

- No external AI/provider/Supabase function work.
- No Listening or Practice edits.
- `src/data/readingContent.ts` remains a candidate/test path unless the page is intentionally rewired, which is out of this selected slice.
