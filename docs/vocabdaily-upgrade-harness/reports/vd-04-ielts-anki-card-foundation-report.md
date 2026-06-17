# VD-04 IELTS Anki Card Foundation Report

**Date:** 2026-06-17

**Phase:** VD-04 IELTS Anki Card Foundation

**Feature:** VD-F005

**Status:** Passing

## Outcome

VD-04 ships the first IELTS Anki-style card foundation. The app now has an original, auditable 12-card IELTS writing/speaking deck, exposed as a built-in word book, visible from the vocabulary bank, and reachable from Practice and Review through `wordId` links.

This is a foundation, not a complete IELTS curriculum. The value is that learners now have a concrete deck with recall-friendly fields, useful Chinese hints, collocations, phrase patterns, and existing FSRS-backed practice/review paths.

## Card Schema

`src/data/ieltsAnkiCards.ts` defines:

- `IeltsAnkiCard`
- `IeltsAnkiDeck`
- `IeltsAnkiDifficulty`
- `IeltsAnkiSkillFocus`

Each card includes:

- word
- phonetic
- part of speech
- English meaning
- Chinese meaning
- Chinese hint
- example sentence and Chinese translation
- collocations
- phrase patterns
- IELTS relevance tag
- difficulty
- review tags
- skill focus

The same file maps cards into repo-native `WordData`, so Practice, Review, vocabulary-bank details, and built-in word books can reuse existing contracts instead of forking scheduling logic.

## Seed Deck

Deck ID: `builtin_ielts_anki_foundation`

Deck name: `IELTS Anki 写作/口语核心`

Source: `VocabDaily original IELTS practice cards`

License: `Original educational content in this repository`

Version: `2026.06`

Seed cards:

| Word | POS | Difficulty | IELTS Use |
| --- | --- | --- | --- |
| alleviate | v. | B2 | Task 2 solutions |
| detrimental | adj. | C1 | Cause and effect |
| feasible | adj. | B2 | Policy evaluation |
| constraint | n. | B2 | Limitations |
| whereas | conj. | B2 | Contrast |
| subsequently | adv. | B2 | Sequencing |
| nuanced | adj. | C1 | Balanced argument |
| tangible | adj. | B2 | Evidence and benefit |
| proportion | n. | B2 | Task 1 data |
| urbanization | n. | B2 | Urban issues |
| cohesive | adj. | C1 | Writing quality |
| trade-off | n. | C1 | Balanced argument |

## Product Changes

- Added `src/data/ieltsAnkiCards.ts` with the schema, deck, seed cards, `WordData` mapping, and lookup helpers.
- Added IELTS Anki card data to `wordsDatabase` via `src/data/words.ts`.
- Added `IELTS_ANKI_FOUNDATION` to built-in word book IDs and templates in `src/data/wordBooks.ts`.
- Added a vocabulary-bank section for `IELTS Anki 卡片` with deck metadata, sample cards, “设为当前词书”, “今天学这套”, and “练第一张”.
- Updated Practice runtime options with `focusWordId`, so URL-launched Practice keeps the requested card first even when progress ranking would normally deprioritize it.
- Updated `PracticePage` to read `wordId` and `q` from the URL and build a focused practice queue without changing retry/reveal or FSRS rating behavior.
- Updated `ReviewPage` to read `wordId` and `q` from the URL as an explicit manual review card while preserving the default due-only queue.
- Updated `scripts/learning-flow-regression.mjs` so the vocabulary route must show the IELTS Anki section and practice entry link.

## Review and Practice Semantics

- First-try correct in Practice still uses `reviewWord(wordId, 'good')`.
- Retry-correct still uses `reviewWord(wordId, 'hard')`.
- Needs-review still uses `reviewWord(wordId, 'again')`.
- Review ratings still call the existing `reviewWord` function.
- No database schema, payment behavior, auth behavior, or Supabase policy changed in this phase.

## Evidence

- Local visual regression summary: `product-audit-2026-06-17/vd-04-learning-flow/summary.json`
- Production focused vocabulary summary: `product-audit-2026-06-17/vd-04-production-focused/summary.json`
- Screenshot directory: `product-audit-2026-06-17/vd-04-learning-flow/screenshots/`
- Production focused screenshot directory: `product-audit-2026-06-17/vd-04-production-focused/screenshots/`
- Production deployment: `dpl_Dd97VG7hdoqTEojyXs2pSFCsEvVm`, aliased to `https://www.uuedu.online`
- Representative screenshots:
  - `desktop-light-vocabulary.png`
  - `mobile-light-vocabulary.png`
  - `desktop-dark-vocabulary.png`
  - `mobile-dark-vocabulary.png`
  - `desktop-light-practice.png`
  - `desktop-light-review.png`

## Validation

All required local validation commands passed.

| Command | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run check:i18n` | pass |
| `npm run build` | pass, with existing non-fatal Browserslist data age warning |
| `npm test -- --run` | pass, 106 test files and 825 tests |
| `npm test -- --run src/data/ieltsAnkiCards.test.ts src/features/practice/runtime.test.ts src/pages/dashboard/VocabularyBankPage.test.tsx src/pages/dashboard/PracticePage.test.tsx src/pages/dashboard/ReviewPage.test.tsx` | pass, 5 files and 18 tests |
| `LEARNING_FLOW_OUT_DIR=product-audit-2026-06-17/vd-04-learning-flow npm run test:learning-flow-regression` | pass, 160/160 checks |
| `set -a; source .env; set +a; npm run smoke:prod` | pass, 8/8 checks on `https://www.uuedu.online` |
| Production focused vocabulary check | pass, 4/4 checks across desktop/mobile and light/dark; `/dashboard/vocabulary` showed IELTS Anki card section, 12-card count, `alleviate`, and first-card Practice link |

The first local browser-regression attempt failed with `ERR_CONNECTION_REFUSED` because the Vite dev server was not running. After starting `npm run dev -- --host 127.0.0.1 --port 5173`, the same regression passed 160/160.

The full production learning-flow matrix was started after deployment but was manually interrupted because it ran far longer than the local and previous production runs without producing a summary. It was replaced with a narrower production vocabulary check targeted to the VD-04 risk area, plus production smoke.

## Changed Files

- `scripts/learning-flow-regression.mjs`
- `src/data/ieltsAnkiCards.ts`
- `src/data/ieltsAnkiCards.test.ts`
- `src/data/wordBooks.ts`
- `src/data/words.ts`
- `src/features/practice/runtime.ts`
- `src/features/practice/runtime.test.ts`
- `src/pages/dashboard/PracticePage.tsx`
- `src/pages/dashboard/PracticePage.test.tsx`
- `src/pages/dashboard/ReviewPage.tsx`
- `src/pages/dashboard/ReviewPage.test.tsx`
- `src/pages/dashboard/VocabularyBankPage.tsx`
- `src/pages/dashboard/VocabularyBankPage.test.tsx`
- `docs/vocabdaily-upgrade-harness/reports/vd-04-ielts-anki-card-foundation-plan.md`
- `docs/vocabdaily-upgrade-harness/reports/vd-04-ielts-anki-card-foundation-report.md`

## Remaining Product Notes

- The seed deck is intentionally small. A later phase can add deck management, larger editorial review, import/export to real `.apkg`, or per-deck learning plans.
- The current vocabulary section previews three cards. That is enough for entry-point validation, but a dedicated deck-detail page would be cleaner if the deck grows.
- A larger future content release should add an editorial review checklist, because the current seed deck is original but small.

## Decision

VD-F005 is passing. The local implementation, tests, browser evidence, production deployment, production smoke, and focused production vocabulary check are complete.
