# VLE-02 Anki Import Export Experience Report

## Phase Summary

- PHASE_ID: VLE-02
- Phase file: `docs/vocabdaily-learning-ecosystem-prd/phase-02-anki-import-export-experience.md`
- Executor: Codex
- Date: 2026-06-16
- Status: passed

## Scope Executed

- Planned work: Productize CSV/APKG import and export with preview, field mapping, progress mapping, error reports, parser safety, and browser evidence.
- Actual work: Added CSV preview, APKG deck preview, explicit APKG field mapping, coarse/no progress mode, sanitized parser path, import completion next actions, focused parser/export tests, and browser import/export smoke.
- Scope expansions: Fixed APKG optional-field fallback pollution so uncertain deck fields no longer fill optional fields with the first non-empty value.
- Scope not executed: No public deck marketplace, no AnkiWeb sync, no remote persistence migration, no billing or deployment config changes.

## Evidence Inventory

| Evidence | Path or command | Result |
| --- | --- | --- |
| Plan | `docs/vocabdaily-learning-ecosystem-prd/reports/vle-02-anki-import-export-experience-plan.md` | Created |
| Focused tests | `npm test -- --run src/services/ankiApkgImport.test.ts src/services/bookImport.test.ts src/services/wordBookExport.test.ts src/pages/dashboard/VocabularyBankPage.test.tsx` | 4 files, 12 tests passed |
| Lint | `npm run lint` | Passed |
| i18n | `npm run check:i18n` | Passed |
| Build | `npm run build` | Passed |
| Browser screenshots | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/summary.json` | 114 checks passed, 0 failed |
| Interaction smoke | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/interaction-smoke.json` | 5 checks passed, 0 console errors |
| CSV preview screenshot | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/screenshots/desktop-light-csv-preview.png` | Captured |
| APKG preview screenshot | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/screenshots/desktop-light-apkg-preview.png` | Captured |
| Export downloads | `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/downloads/` | CSV, Anki TXT, and error report captured |

## Validation Results

| Gate | Command or check | Result | Notes |
| --- | --- | --- | --- |
| Parser/export tests | `npm test -- --run src/services/ankiApkgImport.test.ts src/services/bookImport.test.ts src/services/wordBookExport.test.ts src/pages/dashboard/VocabularyBankPage.test.tsx` | Passed | 12 focused tests |
| Lint | `npm run lint` | Passed | No ESLint errors |
| i18n | `npm run check:i18n` | Passed | Key parity check passed |
| Build | `npm run build` | Passed | Production bundle completed |
| Browser | `BASE_URL=http://127.0.0.1:4173 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export npm run test:learning-flow-regression` | Passed | 114 checks, 0 failed |
| Browser interaction | `BASE_URL=http://127.0.0.1:4173 node product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/import-export-interaction-smoke.mjs` | Passed | CSV preview/import, error report, export, APKG preview, field mapping controls, progress mapping, post-import actions |

## Acceptance Gate Results

| Acceptance gate | Result | Evidence |
| --- | --- | --- |
| Import preview shows deck/file summary, rows, duplicates, skipped rows, and destination before commit | Passed | `ImportWordBookDialog.tsx`; `ImportAnkiApkgDialog.tsx`; `desktop-light-csv-preview.png`; `desktop-light-apkg-preview.png` |
| Field mapping lets learners confirm word, definition, Chinese definition, phonetic, part of speech, examples, topic, and tags | Passed | `ImportAnkiApkgDialog.tsx`; `AnkiImportOptions.fieldMapping`; `ankiApkgImport.test.ts` |
| Progress mapping explains none versus coarse mode and previews mapped review count | Passed | `ImportAnkiApkgDialog.tsx`; `ankiApkgImport.test.ts`; `interaction-smoke.json` |
| Post-import success shows next actions for Today, Review, and backup export | Passed | `VocabularyBankPage.tsx`; `interaction-smoke.json` |
| Export includes CSV, progress-bearing CSV, and Anki-compatible TXT | Passed | `wordBookExport.test.ts`; `interaction-smoke.json`; `downloads/` |
| Synthetic APKG supports deck selection and different review-count mapping | Passed | `ankiApkgImport.test.ts` multi-deck case |

## Compliance Gate Results

| Compliance gate | Result | Evidence |
| --- | --- | --- |
| Imported content treated as untrusted | Passed | `toPlainText` strips HTML before row mapping; tests reject unsafe raw preservation |
| APKG maximum size limit remains enforced | Passed | `APKG_LIMIT_TEXT` test asserts `50MB` |
| Imported HTML does not execute scripts or event handlers | Passed | Parser test imports `<img onerror>` content and verifies sanitized output |
| Source/license metadata survives the flow | Passed | Imported books use `User Upload` / `Anki APKG Import` and `User provided` metadata |
| No copyrighted deck committed | Passed | Browser smoke and tests generate synthetic CSV/APKG files at runtime |
| Progress isolation | Passed | APKG import maps progress only for imported selected-deck rows |

## Rollback and Recovery

- Rollback path: Revert `ImportAnkiApkgDialog.tsx`, `ImportWordBookDialog.tsx`, `VocabularyBankPage.tsx`, `ankiApkgImport.ts`, `wordBooks.ts`, focused tests, and VLE-02 evidence files.
- Feature flags or toggles: None.
- Data cleanup: Imported local wordbooks can be deleted through existing custom-book deletion; no remote data was written.
- Remaining release risk: Medium-low. APKG field diversity is broad, but explicit mapping and parser tests now cover ambiguous fields.

## User Waivers

- Waived gate: None.
- Waived by: N/A.
- Reason: N/A.
- Remaining risk: N/A.
- Dependent phases may proceed: yes

## Next Phase Handoff

- Dependency unlocked: VLE-03 Daily Loop and Practice Semantics.
- Important files changed: `src/components/ImportAnkiApkgDialog.tsx`, `src/components/ImportWordBookDialog.tsx`, `src/pages/dashboard/VocabularyBankPage.tsx`, `src/services/ankiApkgImport.ts`, `src/data/wordBooks.ts`.
- Known blockers: None.
- Recommended next phase: Verify that Today, Review, Practice, dictation, mistake collector, FSRS evidence, and session recap all share the retry/reveal semantics already implemented in the practice slice.
