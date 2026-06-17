# VD-04 IELTS Anki Card Foundation Plan

**Date:** 2026-06-17

**Phase:** VD-04 IELTS Anki Card Foundation

**Feature:** VD-F005

**Status:** Executing

## Goal

Ship a first useful IELTS-oriented Anki-style card foundation that makes VocabDaily more practical without importing copyrighted decks, adding a new dependency, or changing database schema.

## Scope

- Define an auditable TypeScript card schema for IELTS cards.
- Seed a small original deck for IELTS writing and speaking transfer.
- Map the deck into existing `WordData` and built-in word book flows.
- Add a vocabulary-bank entry point that explains the deck and previews cards.
- Make `wordId` links from vocabulary usable in Practice and Review.
- Keep existing Practice retry/reveal and FSRS rating semantics unchanged.
- Add focused tests for data shape, deck availability, entry points, and URL-launched practice/review.

## Non-Goals

- No external Anki package import as the seed source.
- No copyrighted wordlist or branded exam prep deck.
- No database migration.
- No new UI library or dependency.
- No claims that this is a complete IELTS curriculum.

## Implementation Slices

| Slice | Work | Acceptance |
| --- | --- | --- |
| Schema and seed deck | Add `src/data/ieltsAnkiCards.ts` with card/deck types and 10+ original cards. | Cards include word, meaning, POS, collocations, phrase patterns, example, Chinese hint, IELTS tag, difficulty, review tags, and skill focus. |
| Word book integration | Map cards to `WordData` and add built-in word book ID/template. | `getBuiltInWordBooks(wordsDatabase)` exposes the IELTS Anki deck with matching card IDs. |
| Vocabulary UI entry | Add a compact IELTS Anki section to the vocabulary page. | User can set the deck active, see sample cards, open Today, and start Practice from the first card. |
| Practice URL focus | Let Practice read `wordId`/`q` and pass a focus word into the existing runtime. | URL-launched Practice starts with the requested card and still records FSRS via existing `reviewWord`. |
| Review URL focus | Let Review read `wordId`/`q` as a manual one-card review. | Default due-only behavior stays intact; explicit URL cards can be rated with existing `reviewWord`. |
| Tests and evidence | Add focused tests and run full gates plus browser regression. | Required validation passes and report records evidence. |

## Risk Controls

- Content is original, short, and inspectable in source.
- Built-in deck uses existing `WordData` and `WordBook` contracts.
- Practice runtime receives only an optional `focusWordId`; default ranking remains unchanged.
- Review preserves LEARN-04 due-only behavior unless the URL explicitly asks for one word.
- If browser evidence shows layout clipping or unreadable cards, adjust only the vocabulary section and shared spacing used by that section.

## Validation Plan

- `npm test -- --run src/data/ieltsAnkiCards.test.ts src/features/practice/runtime.test.ts src/pages/dashboard/VocabularyBankPage.test.tsx src/pages/dashboard/PracticePage.test.tsx src/pages/dashboard/ReviewPage.test.tsx`
- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- `npm test -- --run`
- `LEARNING_FLOW_OUT_DIR=product-audit-2026-06-17/vd-04-learning-flow npm run test:learning-flow-regression`
- Harness validator: `python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-upgrade-harness --strict --quality-score`

## Completion Evidence

The report will include:

- Card schema notes.
- Seed deck sample.
- Changed code paths.
- Focused and full validation output.
- Browser regression summary.
- Oracle and continuity updates.
