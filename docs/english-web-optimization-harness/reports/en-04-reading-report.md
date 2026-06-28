# EN-04 Reading Report

- Status: passed
- Phase: EN-04
- Feature: EN-F004
- Actor: generator
- Date: 2026-06-28

## Scope

- Files inspected: `docs/english-web-optimization-harness/context-profile.json`, `docs/english-web-optimization-harness/loop-state.json`, `docs/english-web-optimization-harness/phase-EN-04.md`, `src/pages/dashboard/ReadingPage.tsx`, `src/services/learningEvents.ts`, `src/services/gamification.ts`, `src/features/learning/components/LearningWorkspace.tsx`.
- Files changed: `src/pages/dashboard/ReadingPage.tsx`, `src/pages/dashboard/ReadingPage.test.tsx`, EN-04 harness report/state files.
- Minimal Change: kept inline Reading seed passages and the local seed-based practice variation model; repaired misleading generation copy, answer gating, scoring strictness/variant acceptance, non-zero study duration, review-count inflation, evidence-note fallback, English chrome, mobile layout constraints, and focused component/browser coverage.

## Plan Followed

1. Confirmed EN-03 dependency evidence: `en-03-listening-report.md` has `Status: passed` and `en-03-listening-critic.md` has `Critic Verdict: approved`.
2. Opened only EN-04 primary context before planning, then recorded `docs/english-web-optimization-harness/reports/en-04-reading-plan.md`.
3. Used a read-only subagent discovery pass for route/content/test-boundary risks.
4. Implemented the smallest Reading-page-local slice.
5. Ran focused tests, focused contract tests, lint, i18n, build, dev-server precheck, UI regression, manual English browser checks, MCP browser snapshot/state check, full Vitest, and diff hygiene.

## Code Changes

| Area | Result |
|---|---|
| Generation honesty | The old simulated generated-passage path is now labeled as a `Built-in practice variation`. Copy states that no external AI or content provider is called. Local variation ids use `local-<seed>-<n>` and set `sourceType: local_fallback`. |
| Answer gating | Reading submit is disabled until all questions have answers and the question rail shows `Progress x/6`. |
| Scoring | Short answers now normalize punctuation/case/spacing, reject very short partial false positives such as `hip`, accept article variants such as `the hippocampus`, accept singular/plural variants such as `HVDC line`, and require every part of multi-answer responses. |
| Study session | Reading completion records at least one minute using `Math.max(1, ...)` instead of allowing zero-minute sessions. |
| Gamification | Reading completion no longer calls `incrementReviewCount`, avoiding inflation of vocabulary review achievements with reading question count. |
| Learning event | Completion payload now includes `durationMinutes`, `answerCount`, `questionTypes`, `sourceType`, and `generatedFallback`. |
| Evidence review | Review now renders either `Evidence in passage` for located answers or `Evidence note` for passage-level inference questions, so every item has a visible evidence cue. |
| English/mobile UI | Reading shell uses `learning-open-route`; English mode uses `Passage` instead of accidental `文章`; mobile avoids forced nested column scrolling and wraps the title/control header safely. |

## Validation Evidence

| Command or check | Result | Evidence |
|---|---|---|
| `npm test -- --run src/pages/dashboard/ReadingPage.test.tsx` | passed | 1 file, 10 tests passed |
| `npm test -- --run src/pages/dashboard/ReadingPage.test.tsx src/data/readingContent.test.ts src/services/learningEvents.strict.test.ts src/services/gamification.test.ts` | passed | 4 existing files, 64 tests passed; `src/services/learningEvents.strict.test.ts` is the repository's learning-events contract file. |
| `npm run lint` | passed | ESLint exited 0 |
| `npm run check:i18n` | passed | i18n key parity check passed |
| `npm run build` | passed | TypeScript and Vite build exited 0; existing Browserslist caniuse-lite age warning only |
| `curl -sSf http://127.0.0.1:5173/ >/dev/null` | passed | Dev server precheck exited 0 |
| `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-04-reading npm run test:ui-regression` | passed | `product-audit-2026-06-28/en-04-reading/summary.json`: 54/54 route checks and 10/10 scenarios passed |
| EN-04 manual English Playwright check | passed | `product-audit-2026-06-28/en-04-reading/manual-english/result.json`: 22 assertions and 8 screenshots passed |
| EN-04 MCP browser check | passed | `product-audit-2026-06-28/en-04-reading/mcp-browser-snapshot.md`, `product-audit-2026-06-28/en-04-reading/mcp-browser-reading.png`, and `product-audit-2026-06-28/en-04-reading/mcp-browser-state.json` |
| `npm test -- --run` | passed | 116 files, 878 tests passed |
| `git diff --check` | passed | No whitespace errors |

## Browser Evidence

| Route | Viewport | Theme | Language | Evidence |
|---|---:|---|---|---|
| `/dashboard/reading` | 1440x960 | light | zh seed | `product-audit-2026-06-28/en-04-reading/screenshots/desktop-reading.png`; no overflow, blank page, error boundary, or login redirect |
| `/dashboard/reading` | 390x844 | light | zh seed | `product-audit-2026-06-28/en-04-reading/screenshots/mobile-reading.png`; no overflow, blank page, error boundary, or login redirect |
| `/dashboard/reading` completion | 1440x960 | light | zh seed | `product-audit-2026-06-28/en-04-reading/screenshots/desktop-scenario-reading-completion.png`; review state and score recap captured |
| `/dashboard/reading` completion | 390x844 | light | zh seed | `product-audit-2026-06-28/en-04-reading/screenshots/mobile-scenario-reading-completion.png`; review state captured with 0 horizontal overflow |
| `/dashboard/reading` select | 1440x960 | light | en | `product-audit-2026-06-28/en-04-reading/manual-english/screenshots/desktop-select.png`; honest built-in variation copy verified |
| `/dashboard/reading` empty reading | 1440x960 | light | en | `product-audit-2026-06-28/en-04-reading/manual-english/screenshots/desktop-reading-empty.png`; `Progress 0/6`, disabled submit, and `Passage` label verified |
| `/dashboard/reading` completed answers | 1440x960 | light | en | `product-audit-2026-06-28/en-04-reading/manual-english/screenshots/desktop-reading-complete.png`; `Progress 6/6` and enabled submit verified |
| `/dashboard/reading` review | 1440x960 | light | en | `product-audit-2026-06-28/en-04-reading/manual-english/screenshots/desktop-review-perfect.png`; article short-answer variant produced `Reading score 6/6` |
| `/dashboard/reading` local variation | 1440x960 | light | en | `product-audit-2026-06-28/en-04-reading/manual-english/screenshots/desktop-local-variation-reading.png`; `Practice variation` title and English passage label verified |
| `/dashboard/reading` local variation review | 1440x960 | light | en | `product-audit-2026-06-28/en-04-reading/manual-english/screenshots/desktop-local-variation-review.png`; local fallback completed with `Reading score 6/6` |
| `/dashboard/reading` select | 390x844 | light | en | `product-audit-2026-06-28/en-04-reading/manual-english/screenshots/mobile-select.png`; honest fallback copy and 0 horizontal overflow verified |
| `/dashboard/reading` empty reading | 390x844 | light | en | `product-audit-2026-06-28/en-04-reading/manual-english/screenshots/mobile-reading-empty.png`; mobile English label, disabled submit, and 0 horizontal overflow verified |
| `/dashboard/reading` MCP browser | app browser | light | en | `product-audit-2026-06-28/en-04-reading/mcp-browser-state.json`: `h1` is `IELTS Academic Reading`, `horizontalOverflowPx` is `0`, honest fallback copy present, no accidental Chinese `文章` label |

## Feature Oracle Updates

| Feature | Status | Evidence |
|---|---|---|
| EN-F004 | passing | This report, focused ReadingPage tests, full Vitest, lint, i18n, build, UI regression, manual English browser evidence, MCP browser evidence, and diff hygiene |

## Regression Evidence

| Area | Result | Notes |
|---|---|---|
| Reading all-answer gate | passed | Focused test and browser check verify disabled submit until all answers are present. |
| Reading short-answer false positives | passed | Focused test verifies `hip` does not receive credit for `hippocampus`. |
| Short-answer acceptable variants | passed | Focused tests verify `the hippocampus`, `HVDC line`, and `land costs and energy requirements` score correctly. |
| Generated fallback honesty | passed | Focused test and browser check verify local fallback copy and payload `sourceType: local_fallback`, `generatedFallback: true`. |
| Learning event payload | passed | Focused test verifies source type, generated fallback flag, duration, answer count, question types, score, accuracy, and XP. |
| Gamification review count | passed | Focused test verifies `incrementReviewCount` is not called by reading completion. |
| Listening and speaking routes | passed | UI regression kept `/dashboard/listening`, `/dashboard/pronunciation`, and `/dashboard/chat` green after EN-04. |
| Analytics event parsing | passed | `learningEvents.strict.test.ts`, full Vitest, and UI regression passed; no event schema or storage table changes were made. |

## Compliance Evidence

| Gate | Result | Notes |
|---|---|---|
| No false live-AI claim | passed | Reading no longer says it generates fresh provider-backed content; copy explicitly states the practice variation comes from built-in passages. |
| Evidence review visible | passed | Every review item now has an `Evidence in passage` or `Evidence note` section. |
| Honest learning progress | passed | Reading records non-zero estimated minutes and no longer increments vocabulary review count from reading questions. |
| No secret payloads | passed | New event payload contains only passage id, level, score, duration, XP, counts, question type list, source type, and generated fallback flag. |
| Mobile layout | passed | Manual English mobile check and UI regression show 0 horizontal overflow. |
| Protected areas | passed | No Supabase schema/functions, provider, billing, deployment, package lock, secret, or dependency files were changed. |

## Blockers

- None for EN-04.
- Residual boundary: Reading still uses inline `SEED_PASSAGES` in `ReadingPage.tsx`; `src/data/readingContent.ts` remains a candidate/test path.
- Residual boundary: `Built-in practice variation` is deterministic local fallback, not live AI generation. This is intentional and now explicit.
- Residual boundary: Reading evidence events prove local/demo behavior only; remote Supabase sync remains outside EN-04 because no schema, RLS, or production auth flow was changed.

## Handoff

- Next action: execute EN-05 Learning Center using `docs/english-web-optimization-harness/phase-EN-05.md`.
- Dependent phase unlock: EN-05 is unlocked after EN-F004 passes and critic approval is recorded.
- Carry-forward: EN-05 should verify that Today, Review, Analytics, Settings, Profile, and Learning Path reflect or honestly bound EN-01 through EN-04 progress without assuming local/demo browser state proves production Supabase sync.
