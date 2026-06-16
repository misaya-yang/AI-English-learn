# VLE-02 Anki Import Export Experience Plan

## Objective

Make CSV/APKG import and Anki-compatible export trustworthy enough for a learner to use VocabDaily as a portable wordbook system. The learner must see what will be imported, adjust uncertain APKG mappings, understand coarse progress mapping, receive invalid-row reports, and have clear next actions after import.

## Execution Steps

1. Audit the existing CSV import dialog, APKG dialog, APKG parser, local wordbook persistence, and export utilities.
2. Add CSV import preview before commit:
   - total rows
   - importable rows
   - duplicate count
   - error count
   - detected delimiter
   - sample rows
3. Upgrade APKG inspection:
   - deck note/card counts
   - field names
   - sample rows
   - mapping confidence
   - coarse progress preview
4. Add APKG mapping controls:
   - word
   - definition
   - Chinese definition
   - phonetic
   - part of speech
   - examples
   - topic
   - tags
5. Keep parser safety tight:
   - strip imported HTML before display/persistence
   - preserve the 50MB APKG limit
   - avoid optional-field fallback pollution when auto-detection fails
6. Add progress mapping mode:
   - coarse progress import
   - no-progress import
   - clear copy explaining coarse mapping limits
7. Add post-import next actions in Vocabulary:
   - study this book today
   - review due words
   - export backup
8. Add focused tests for CSV parsing, APKG preview/import, multi-deck progress, explicit field mapping, sanitized raw content, and export formats.
9. Run required validation and browser evidence:
   - focused tests
   - lint
   - i18n
   - build
   - import/export browser smoke
   - desktop/mobile/light/dark/system learning-flow regression

## Edit Boundaries

In scope:

- `src/components/ImportAnkiApkgDialog.tsx`
- `src/components/ImportWordBookDialog.tsx`
- `src/pages/dashboard/VocabularyBankPage.tsx`
- `src/services/ankiApkgImport.ts`
- `src/services/bookImport.test.ts`
- `src/services/ankiApkgImport.test.ts`
- `src/services/wordBookExport.test.ts`
- `src/data/wordBooks.ts`
- `product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export/**`

Out of scope:

- Public deck marketplace
- AnkiWeb download or sync
- Production database migration
- Billing and deployment configuration
- Adding copyrighted decks to the repository

## Acceptance Criteria

- CSV import preview shows importable rows, duplicates, invalid rows, delimiter, and samples before commit.
- APKG import preview shows deck name, note count, card count, field names, sample rows, mapping confidence, and progress preview before commit.
- APKG import lets the learner confirm or override key field mappings when auto-detection is uncertain.
- APKG coarse progress mapping is visible before import and does not overwrite unrelated learner progress.
- Invalid CSV/APKG rows produce downloadable error reports.
- Export supports CSV, CSV with progress, and Anki-compatible TXT.
- Post-import UI gives immediate next actions for Today, Review, and backup export.
- Browser checks pass without blank pages, long skeletons, horizontal overflow, unreadable text, or console errors.

## Rollback Plan

Revert the touched import/export UI, parser, tests, and audit files. No production migration or remote data change is part of this phase.
