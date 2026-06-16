# VLE-01 Lexicon And Wordbook Ecosystem Plan

## Objective

Make `/dashboard/vocabulary` a usable lexicon center instead of a flat word list. The page must explain the active wordbook, show useful word detail, preserve source/license metadata, expose mastery states without relying only on color, and keep import/add/practice/review actions reachable.

## Execution Steps

1. Audit the existing Vocabulary implementation, wordbook model, custom word persistence, lexical entry helper, and import dialog contracts.
2. Upgrade `VocabularyBankPage` first viewport:
   - active wordbook
   - total words
   - needs-review count
   - representative word preview
   - next practice/review actions
3. Upgrade wordbook cards:
   - source
   - license
   - version
   - level range
   - topic tags
   - active state
   - safe delete behavior
4. Upgrade mastery lanes:
   - total
   - new
   - mastered
   - needs review
   - learning
5. Upgrade word detail and accessibility:
   - lexical fields
   - learning status
   - source wordbook
   - practice/review links
   - pronunciation buttons with aria-labels
   - accessible detail trigger
6. Keep import/add/export entry points visible in low-data states, including built-in book activation when available.
7. Add page-level Vitest coverage for active book context, metadata, detail rendering, safe delete affordance, and empty state actions.
8. Run required validation and browser evidence:
   - lint
   - i18n
   - focused tests
   - build
   - vocabulary interaction smoke
   - desktop/mobile/light/dark/system learning-flow screenshots

## Edit Boundaries

In scope:

- `src/pages/dashboard/VocabularyBankPage.tsx`
- `src/pages/dashboard/VocabularyBankPage.test.tsx`
- `src/components/AddWordDialog.tsx`
- `product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon/**`

Out of scope:

- Billing
- Vercel config
- Supabase schema
- APKG parser redesign
- AI coach prompts

## Acceptance Criteria

- Vocabulary first viewport shows active wordbook context, word count, review pressure, representative word preview, and next actions.
- Word detail shows lexical fields, learning status, source wordbook, pronunciation, practice, review, and custom delete when applicable.
- Wordbook list shows source, license, word count, version, level range, topic tags, active state, and built-in delete protection.
- Mastery lanes include new, learning, mastered, and needs-review counts.
- Empty/low-data state exposes add word, CSV/TSV import, Anki APKG import, and built-in book activation where available.
- Browser checks pass without blank pages, long skeletons, horizontal overflow, or console errors.

## Rollback Plan

Revert the changed UI/test/audit files. No database migration or production data mutation is part of this phase.
