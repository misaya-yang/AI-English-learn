# EN-05 Learning Center Report

- Status: passed
- Phase: EN-05
- Feature: EN-F005
- Actor: generator
- Date: 2026-06-28

## Scope

- Files inspected: `src/pages/dashboard/TodayPage.tsx`, `src/pages/dashboard/ReviewPage.tsx`, `src/pages/dashboard/AnalyticsPage.tsx`, `src/pages/dashboard/SettingsPage.tsx`, `src/pages/dashboard/ProfilePage.tsx`, `src/pages/dashboard/LearningPathPage.tsx`, `src/data/localStorage.ts`, `src/lib/localDb.ts`, EN-05 tests and harness docs.
- Files changed: `src/pages/dashboard/TodayPage.tsx`, `src/pages/dashboard/ReviewPage.tsx`, `src/pages/dashboard/AnalyticsPage.tsx`, `src/pages/dashboard/SettingsPage.tsx`, `src/pages/dashboard/ProfilePage.tsx`, `src/data/localStorage.ts`, `src/lib/localDb.ts`, `src/pages/dashboard/SettingsPage.test.tsx`, `src/data/localStorage.settings.test.ts`.
- Minimal change: localized accidental English-mode learning-center chrome, aligned Today hard-word copy with actual daily-flag semantics, guarded Settings notification preview by real permission state, expanded clear-data coverage to localStorage namespaces plus IndexedDB database deletion, and added focused tests for the changed contracts.

## Repository-Discovered Issues

### UI Walkthrough Issues

| ID | Evidence | Resolution |
|---|---|---|
| UI-01 | `SettingsPage.tsx` tabs rendered `通用/通知/学习/账号` in English mode. | Tabs now render `General/Notifications/Learning/Account` through `copy.tabs`. |
| UI-02 | Settings notification, lifecycle, learning, audio, account, and danger-zone copy mixed Chinese labels in English mode. | Added English/ZH `copy` entries for those sections and controls. |
| UI-03 | Today workbench exposed Chinese learner fields and hard/bookmark/share labels as route chrome in English mode. | Workbench labels, chips, buttons, toasts, share text, and topic labels now branch on `isZh`; Chinese definitions/examples are hidden in English workbench chrome. |
| UI-04 | Review card used Chinese labels and could expose long card text without robust wrapping. | Review labels now branch on `isZh`; recall word uses `break-words` and compact sizing. |
| UI-05 | Profile quota/material labels showed Chinese entitlement names in English mode. | Quota labels now map to English names: Writing feedback, Reading materials, Q&A chat, Exam feedback, Listening materials. |
| UI-06 | Settings select rows and tab list could compress on mobile. | General/audio/account rows now use mobile-first stacked layout; tab list is horizontally safe. |

### Functional Issues

| ID | Evidence | Resolution |
|---|---|---|
| FN-01 | Today `markTodayWordHard` only writes daily hard flags, but copy implied review scheduling. | English/ZH toast now states scheduling updates only after rating in Review. |
| FN-02 | Settings lifecycle preview could claim a reminder would send while notification permission was denied or pending. | `actionableLifecyclePreview` is null unless notifications are supported and granted; status explains denied/pending/unsupported states. |
| FN-03 | Settings clear-data removed known `KEYS` but left Today flags, learning missions/profile, auth keys, and IndexedDB artifacts. | `clearAllData` removes `vocabdaily_`, `vocabdaily-`, Supabase/auth key families, and `language`; `clearLocalDbData` closes and deletes the app IndexedDB database after confirmation. |
| FN-04 | Destructive clear-data browser verification could accidentally wipe active manual evidence if confirmed live. | Browser check opens the dialog and cancels; unit test confirms `clearAllData` and `clearLocalDbData` are called only after destructive confirmation. |
| FN-05 | Analytics retention/risk labels contained Chinese suffixes in English mode. | 30-day activity and risk-detail labels now render English copy outside Chinese mode. |
| FN-06 | Review hard/recovery and Profile freeze toasts had Chinese-only feedback. | Toasts now branch on current language. |

## Priority Optimization Checklist

| Priority | Item | Result |
|---|---|---|
| P0 | Do not claim notification reminders will send unless permission is granted. | Fixed and tested in `SettingsPage.test.tsx`; browser evidence shows denied state does not show `This reminder would be sent now`. |
| P0 | Clear-data must either clear IndexedDB or disclose boundary. | Fixed by adding `clearLocalDbData()` and confirmation wiring; unit tests verify both localStorage and IndexedDB clear calls. |
| P0 | Today hard-word copy must not promise review-queue mutation that code does not perform. | Fixed; copy now says Review scheduling updates after rating in Review. |
| P1 | Remove accidental Chinese route chrome from Today, Review, Analytics, Settings, and Profile in English mode. | Fixed and verified by manual English route sweep: `chineseLeakRoutes: []`. |
| P1 | Preserve mobile learning-center layouts without horizontal overflow. | Verified by UI regression, learning-flow regression, and manual English route sweep; max overflow `0`. |
| P1 | Add tests for clear-data and lifecycle permission gating. | Added/updated `SettingsPage.test.tsx` and `localStorage.settings.test.ts`. |
| P2 | Keep Learning Path read-only in this phase unless evidence shows a defect. | No code change; browser checks verified route loads in English mode with no overflow. |
| P2 | Avoid refactoring shared state architecture during copy/clear-data fixes. | Preserved `UserDataContext`, route ids, Supabase, sync queue, providers, dependencies, and package lock. |

## Validation Evidence

| Command or check | Result | Evidence |
|---|---|---|
| `npm test -- --run src/pages/dashboard/SettingsPage.test.tsx` | Passed, 1 file / 5 tests | Settings notification permission, preview gating, language persistence, and destructive confirmation tests passed. |
| `npm test -- --run src/pages/dashboard/ReviewPage.test.tsx src/pages/dashboard/AnalyticsPage.test.tsx src/pages/dashboard/SettingsPage.test.tsx src/pages/dashboard/ProfilePage.test.tsx src/services/reviewWindows.test.ts src/services/retentionInsights.test.ts src/services/reminderService.test.ts` | Passed, 7 files / 44 tests | Focused EN-05 page/service contract. Vitest emitted jsdom's non-fatal `Not implemented: navigation to another Document` from reload. |
| `npm test -- --run src/data/localStorage.settings.test.ts src/services/todayWorkbenchPersistence.test.ts src/services/learningMissions.test.ts src/services/learningPathProgress.test.ts src/services/gamification.test.ts` | Passed, 5 files / 105 tests | Clear-data namespace coverage plus Today/mission/path/gamification state tests. |
| `npm run lint` | Passed | ESLint completed with no findings. |
| `npm run check:i18n` | Passed | `i18n key parity check passed.` |
| `npm run build` | Passed | `tsc -b && vite build` completed after the positive-streak fix; only Browserslist data-age warning. |
| `npm test -- --run` | Passed, 116 files / 880 tests | Whole Vitest suite passed after the positive-streak fix. Vitest emitted jsdom's non-fatal reload navigation warning. |
| `git diff --check` | Passed | No whitespace errors. |
| `curl -I --max-time 5 http://127.0.0.1:5173/dashboard/settings` | Passed | Dev server returned `HTTP/1.1 200 OK`. |

## Browser Evidence

| Route or check | Viewport | Theme | Language | Evidence |
|---|---:|---|---|---|
| UI regression | desktop/mobile | script light seed | zh seed | `product-audit-2026-06-28/en-05-learning-center/ui-regression/summary.json`: 54 route checks passed, 10 scenarios passed, failures `0`. |
| Learning-flow regression | desktop/mobile | light/dark/system | zh seed | `product-audit-2026-06-28/en-05-learning-flow/summary.json`: 160 checks passed, failures `0`; this matches the phase contract output path. |
| Manual English route sweep | desktop/mobile | light | en | `product-audit-2026-06-28/en-05-learning-center/manual-english/result.json`: 12 route checks, failures `0`, max overflow `0`, `chineseLeakRoutes: []`. |
| Positive streak Today state | desktop | light | en | `product-audit-2026-06-28/en-05-learning-center/manual-english-positive-streak/result.json`: `3-day streak` visible, `连续 3 天` absent, overflow `0`. |
| Settings denied notification preview | mobile | light | en | `manual-english/result.json`: `settingsPermissionGated: true`, denied/pending/unsupported copy present, no `This reminder would be sent now`. |
| Settings clear-data confirmation | mobile | light | en | `manual-english/result.json`: `destructiveDialogGuarded: true`, dialog mentions IndexedDB and non-undoable action; browser check cancels instead of confirming. |
| MCP internal browser Today check | desktop browser | light | en | `product-audit-2026-06-28/en-05-learning-center/mcp-browser-today-state.json`, `mcp-browser-today-snapshot.txt`, `mcp-browser-today.png`. |

## Quantitative Acceptance Metrics

| Metric | Target | Result | Assumption and verification |
|---|---:|---:|---|
| EN-05 manual route failures | 0 | 0 | Assumption: local/demo English browser state is valid for UI and local-state acceptance. Verification: `manual-english/result.json`. |
| EN-05 manual max horizontal overflow | <= 2 px | 0 px | Verification: desktop/mobile route sweep in `manual-english/result.json`. |
| Accidental English-mode Chinese learning-center chrome | 0 routes | 0 routes | Assumption: Chinese learner content would be acceptable only when intentionally exposed. Verification: EN-05 sweep found `chineseLeakRoutes: []`. |
| Positive-streak English chip | English chip visible, Chinese chip absent | `3-day streak` visible; `连续 3 天` absent | Verification: `manual-english-positive-streak/result.json`. |
| UI regression failures | 0 | 0 | Verification: 54 route checks and 10 scenarios in `ui-regression/summary.json`. |
| Learning-flow failures | 0 | 0 | Verification: 160 checks in `learning-flow-regression/summary.json`. |
| Focused EN-05 tests | all pass | 44 + 105 tests pass | Verification: focused Vitest command outputs above. |
| Whole Vitest | all pass | 116 files / 880 tests pass | Verification: full Vitest command output. |

## Subagent Conclusions

| Agent | Conclusion | Outcome |
|---|---|---|
| UI agent | Found Settings tabs/sections, Today/Review/Profile English-mode leaks, mobile tab/select compression, Review long-word wrapping risks, and later a positive-streak Today leak. | EN-05 fixed those routes, added a positive-streak browser check, and verified Learning Path without code change. |
| Functional agent | Found clear-data namespace/IndexedDB residue, Today hard-copy/due-queue drift, and notification preview overclaim risk. | EN-05 fixed clear-data and copy/permission gates; no production sync claim made. Real IndexedDB deletion is covered by helper implementation plus mocked call-path tests, not an integration deletion test. |
| Quality agent | Recommended focused Settings/Profile/Review/Analytics tests, storage clear-data tests, browser route sweep, and whole-flow regression; first critic pass requested writeback and path reconciliation. | EN-05 executed focused suites, full Vitest, UI regression, contract-path learning-flow regression, manual English browser sweep, positive-streak check, and final harness writeback. |

## Risk and Regression Points

| Risk | Status | Mitigation |
|---|---|---|
| Local/demo evidence could be mistaken for production Supabase sync proof. | Residual | Report labels browser validation as local/demo only; no Supabase/provider claims. |
| `clearLocalDbData` deletes the app IndexedDB database after confirmation. | Controlled residual | Confirmation dialog is guarded; browser test does not execute destructive confirmation; unit test mocks and verifies call path. Real `deleteDB` execution is not integration-tested in this phase. |
| Notification permission varies by browser and cannot be bypassed. | Controlled | Copy and preview are permission-gated; denied/pending/unsupported states are accepted paths. |
| Today hard daily flag still does not directly schedule FSRS review. | Controlled | Copy now states scheduling happens after rating in Review; no behavior overclaim remains. |
| jsdom reload warning appears in Vitest output. | Non-failing | Tests pass; warning comes from jsdom's unimplemented page reload after mocked destructive confirmation. |

## Feature Oracle Updates

| Feature | Status | Evidence |
|---|---|---|
| EN-F005 | passing | `docs/english-web-optimization-harness/reports/en-05-learning-center-report.md`; `product-audit-2026-06-28/en-05-learning-center/ui-regression/summary.json`; `product-audit-2026-06-28/en-05-learning-flow/summary.json`; `product-audit-2026-06-28/en-05-learning-center/manual-english/result.json`; `product-audit-2026-06-28/en-05-learning-center/manual-english-positive-streak/result.json`; MCP browser evidence files. |

## Compliance Evidence

| Gate | Result | Notes |
|---|---|---|
| Repository-only input | Passed | All implementation and harness claims cite repo files, local tests, and local browser evidence. |
| Protected areas | Passed | No Supabase schema/functions, providers, billing, Vercel config, dependencies, package lock, secrets, or deployment changes. |
| Destructive operations | Passed | Live browser did not confirm clear-data; unit tests mock clear path. |
| Whole-demand regression | Passed | UI regression, learning-flow regression, full Vitest, lint, i18n, build, and diff hygiene passed after EN-05 edits. |
| Independent critic | Passed | Turing first pass returned `changes_requested`; the positive-streak leak, evidence path mismatch, and runtime writeback gaps were addressed. Final approval is recorded in `en-05-learning-center-critic.md`. |

## Blockers and Alternate Paths

| Blocker | Alternate path |
|---|---|
| Production Supabase sync not proven by local/demo evidence. | Keep EN-05 as local UI/state acceptance; require approved production smoke for sync claims. |
| Notification permission cannot be programmatically forced in normal browser checks. | Verify denied/pending/unsupported copy and permission-gated preview; do not bypass browser permission. |
| Live destructive clear-data confirmation should not run in manual evidence. | Verify dialog guard in browser and clear call path in unit tests. |

## Handoff

- Next action: none for the current implementation phases. For fresh-window reuse, run the custom contract audit in `next-window-prompt.md`; the upstream strict validator currently fails on the requested `phase-EN-xx` filenames until patched.
- Dependent phase unlock: EN-05 is the final phase; no downstream module remains.
