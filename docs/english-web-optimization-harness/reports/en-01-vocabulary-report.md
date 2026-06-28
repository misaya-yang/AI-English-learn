# EN-01 Vocabulary Report

- Status: passed
- Phase: EN-01
- Feature: EN-F001
- Actor: generator
- Date: 2026-06-28

## Scope

- Files inspected: `docs/english-web-optimization-harness/context-profile.json`, `docs/english-web-optimization-harness/loop-state.json`, `docs/english-web-optimization-harness/phase-EN-01.md`, `src/pages/dashboard/VocabularyBankPage.tsx`, `src/features/lexicon/lexicalEntry.ts`, `src/data/wordBooks.ts`, `src/services/wordBookExport.ts`, `src/components/AddWordDialog.tsx`, `src/components/ImportWordBookDialog.tsx`, `src/components/ImportAnkiApkgDialog.tsx`.
- Files changed: `src/pages/dashboard/VocabularyBankPage.tsx`, `src/components/AddWordDialog.tsx`, `src/components/ImportWordBookDialog.tsx`, `src/components/ImportAnkiApkgDialog.tsx`, `src/pages/dashboard/VocabularyBankPage.test.tsx`, EN-01 harness report/state files.
- Minimal Change: localized accidental English-mode Vocabulary/import/export chrome, added direct empty-state add/import buttons, added safe Enter/Space activation for `div role="button"` word rows, fixed controlled AddWordDialog cancel, and added focused tests for those behaviors. No route, schema, dependency, provider, billing, or package-lock changes.
- Scope expansion: import/add dialog files were included because Vocabulary opens them directly and EN-01 acceptance requires import/export dialog English copy.

## Validation Evidence

| Command or check | Result | Evidence |
|---|---|---|
| `npm test -- --run src/pages/dashboard/VocabularyBankPage.test.tsx` | passed | 1 file, 9 tests passed |
| `npm test -- --run src/features/lexicon/lexicalEntry.test.ts src/data/wordBooks.test.ts src/services/wordBookExport.test.ts src/pages/dashboard/VocabularyBankPage.test.tsx` | passed | 4 files, 21 tests passed |
| `npm run lint` | passed | ESLint exited 0 |
| `npm run check:i18n` | passed | i18n key check exited 0 |
| `npm run build` | passed | TypeScript and Vite build exited 0; only Browserslist caniuse-lite age warning |
| `curl -sSf http://127.0.0.1:5173/ >/dev/null` | passed | Dev server precheck exited 0 |
| `BASE_URL=http://127.0.0.1:5173 UI_REGRESSION_OUT_DIR=product-audit-2026-06-28/en-01-vocabulary npm run test:ui-regression` | passed | `product-audit-2026-06-28/en-01-vocabulary/summary.json`: 54/54 checks passed; Vocabulary desktop/mobile had 0 overflow and no login redirect |
| English Vocabulary Playwright check | passed | `product-audit-2026-06-28/en-01-vocabulary/manual-english/result.json` |
| Dark/dialog Playwright check | passed | `product-audit-2026-06-28/en-01-vocabulary/manual-english/dark-and-dialogs-result.json` |
| Post-critic Playwright check | passed | `product-audit-2026-06-28/en-01-vocabulary/manual-english/post-critic-result.json`: nested pronunciation keyboard/click did not open detail; controlled AddWordDialog Cancel closed |
| `npm test -- --run` | passed | 114 files, 857 tests passed |
| `git diff --check` | passed | No whitespace errors |

## Browser Evidence

| Route | Viewport | Theme | Language | Evidence |
|---|---:|---|---|---|
| `/dashboard/vocabulary` | 1440x960 | light | en | `product-audit-2026-06-28/en-01-vocabulary/manual-english/desktop-vocabulary.png`; asserted Lexicon, Total words, New, Built-in, Mastered, Needs review, keyboard detail, export dialog, no targeted Chinese chrome |
| `/dashboard/vocabulary` | 390x844 | light | en | `product-audit-2026-06-28/en-01-vocabulary/manual-english/mobile-vocabulary.png`; asserted Lexicon, Total words, New, Built-in, dictionary/word-book section, no targeted Chinese chrome |
| `/dashboard/vocabulary` | 1440x960 | light | en | `product-audit-2026-06-28/en-01-vocabulary/manual-english/desktop-export-dialog.png`; asserted `Export vocabulary`, `CSV (words only)`, `Anki import format (TXT)` |
| `/dashboard/vocabulary` | 1440x960 | dark | en | `product-audit-2026-06-28/en-01-vocabulary/manual-english/desktop-dark-vocabulary.png`; asserted route renders without console errors |
| `/dashboard/vocabulary` | 1440x960 | dark | en | `product-audit-2026-06-28/en-01-vocabulary/manual-english/desktop-dark-empty-search.png`; asserted `No words found` and `Adjust filters or import a new word book.` |
| `/dashboard/vocabulary` | 1440x960 | dark | en | `product-audit-2026-06-28/en-01-vocabulary/manual-english/desktop-dark-anki-import-dialog.png`; asserted Add word, CSV/TSV import, and Anki import dialog English copy |
| `/dashboard/vocabulary` | 1440x960 | light | en | `product-audit-2026-06-28/en-01-vocabulary/manual-english/post-critic-vocabulary.png`; asserted nested pronunciation keyboard/click did not open detail and controlled AddWordDialog Cancel closed |
| all regression routes | desktop/mobile | light | zh seed | `product-audit-2026-06-28/en-01-vocabulary/summary.json`; 54/54 passed, including Vocabulary desktop/mobile screenshots |

## Feature Oracle Updates

| Feature | Status | Evidence |
|---|---|---|
| EN-F001 | passing | This report, `docs/english-web-optimization-harness/reports/en-01-vocabulary-critic.md`, focused tests, full Vitest, build/lint/i18n, UI regression, and manual English browser evidence |

## Regression Evidence

| Area | Result | Notes |
|---|---|---|
| Practice link contract | passed | Existing Vocabulary tests still assert `/dashboard/practice?source=lexicon&wordId=...&q=...` |
| Review link contract | passed | Existing Vocabulary tests still assert `/dashboard/review?source=lexicon&wordId=...` |
| Built-in book delete protection | passed | Existing Vocabulary tests still cover built-in/custom action surface; no delete logic changed |
| Import/export services | passed | `wordBooks.test.ts`, `wordBookExport.test.ts`, and browser export/import-dialog checks passed |
| Full app unit regression | passed | `npm test -- --run`: 114 files, 857 tests passed |
| Browser route regression | passed | `test:ui-regression`: 54/54 checks passed |
| Critic-requested regressions | passed | Unit and browser checks cover nested audio keyboard bubbling and controlled AddWordDialog Cancel |

## Compliance Evidence

| Gate | Result | Notes |
|---|---|---|
| Safe text rendering | passed | No HTML injection path changed; imported/custom content remains rendered as React text |
| Icon-only aria labels | passed | English labels added/preserved for word audio and row detail controls |
| Source/license visible | passed | Browser and tests preserve word-book source/license display |
| English/chrome i18n | passed | Targeted checks found no accidental Chinese chrome in export dialog, stats, empty search, add/import dialogs, detail actions, or book badges |
| Learner-content Chinese classification | passed with boundary | Chinese definitions, example translations, and bilingual hints remain intentional learner content, not UI chrome |
| TTS Settings boundary | documented | Vocabulary still calls `speakEnglishText`; this phase changed labels/accessibility only and did not integrate Settings TTS controls. EN-05 keeps the cross-setting verification item. |
| Data boundary | passed | Changes stayed in local Vocabulary/import/export UI. No Supabase, provider, billing, schema, deployment, secret, or dependency changes. |

## Blockers

- None for EN-01.

## Handoff

- Next action: execute EN-02 Speaking using `docs/english-web-optimization-harness/phase-EN-02.md`.
- Dependent phase unlock: EN-02 is unlocked after EN-F001 passes and critic approval is recorded.
- Residual risk: local/demo browser evidence does not prove production Supabase sync; Vocabulary TTS still needs cross-setting verification in EN-05 if Settings controls are claimed globally.
