import { beforeEach, describe, expect, it } from 'vitest';

import { getActiveBook, getDailyWords } from './localStorage';
import {
  BUILT_IN_WORD_BOOK_IDS,
  DEFAULT_ACTIVE_BOOK_ID,
  getBuiltInWordBooks,
} from './wordBooks';
import { wordsDatabase } from './words';

const USER = 'default-ielts-user';

describe('built-in word book defaults', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses the IELTS academic book as the default online dictionary', () => {
    const activeBook = getActiveBook(USER);

    expect(DEFAULT_ACTIVE_BOOK_ID).toBe(BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE);
    expect(activeBook?.id).toBe(BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE);
    expect(activeBook?.name).toContain('IELTS');
  });

  it('ships a substantial IELTS academic core instead of the A1 placeholder list', () => {
    const ieltsBook = getBuiltInWordBooks(wordsDatabase).find(
      (book) => book.id === BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE,
    );
    const ieltsWords = ieltsBook?.wordIds
      .map((id) => wordsDatabase.find((word) => word.id === id))
      .filter(Boolean);

    expect(ieltsBook).toBeDefined();
    expect(ieltsBook?.wordIds.length).toBeGreaterThanOrEqual(80);
    expect(ieltsWords?.some((word) => word?.word === 'air')).toBe(false);
    expect(ieltsWords?.every((word) => word && ['B1', 'B2', 'C1'].includes(word.level))).toBe(true);
  });

  it('generates first-day words from the IELTS book for a fresh user', () => {
    const dailyWords = getDailyWords(USER, wordsDatabase);
    const activeBook = getActiveBook(USER);

    expect(activeBook?.id).toBe(BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE);
    expect(dailyWords.length).toBeGreaterThan(0);
    expect(dailyWords.every((word) => activeBook?.wordIds.includes(word.id))).toBe(true);
    expect(dailyWords.map((word) => word.word)).not.toContain('air');
  });
});
