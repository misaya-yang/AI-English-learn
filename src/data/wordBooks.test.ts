import { beforeEach, describe, expect, it } from 'vitest';

import { buildLocalAuthUserId } from '@/lib/localAuthIdentity';

import { getActiveBook, getDailyWords, setActiveBook } from './localStorage';
import { ieltsPhraseBankWords } from './ieltsPhraseBank';
import {
  IELTS_SEARCHED_VOCABULARY_SOURCE,
  ieltsSearchedVocabularyWords,
} from './ieltsSearchedVocabulary';
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

  it('ships a searched 1500+ IELTS vocabulary bank instead of the A1 placeholder list', () => {
    const ieltsBook = getBuiltInWordBooks(wordsDatabase).find(
      (book) => book.id === BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE,
    );
    const ieltsWords = ieltsBook?.wordIds
      .map((id) => wordsDatabase.find((word) => word.id === id))
      .filter(Boolean);

    expect(ieltsBook).toBeDefined();
    expect(ieltsBook?.wordIds.length).toBeGreaterThanOrEqual(1500);
    expect(ieltsBook?.source).toContain(IELTS_SEARCHED_VOCABULARY_SOURCE.name);
    expect(ieltsSearchedVocabularyWords.length).toBeGreaterThanOrEqual(1500);
    expect(ieltsSearchedVocabularyWords.every((word) => word.id.startsWith('ielts_vocab_'))).toBe(true);
    expect(ieltsWords?.some((word) => word?.word === 'air')).toBe(false);
    expect(ieltsWords?.every((word) => word && ['B1', 'B2', 'C1'].includes(word.level))).toBe(true);
  });

  it('keeps the searched IELTS vocabulary bank clean, unique, and topic-rich', () => {
    const ids = ieltsSearchedVocabularyWords.map((word) => word.id);
    const words = ieltsSearchedVocabularyWords.map((word) => word.word.toLowerCase());
    const areas = new Set(ieltsSearchedVocabularyWords.map((word) => word.memoryTip?.split(' · ')[0]));

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(words).size).toBe(words.length);
    expect(areas.size).toBeGreaterThanOrEqual(7);
    expect(words).toContain('atmosphere');
    expect(words).toContain('phenomenon');
    expect(words).toContain('jeopardise');
    expect(words).toContain('carbon dioxide');
    expect(words).not.toContain('air');
    expect(words).not.toContain('carbon dioxied');
    expect(words).not.toContain('vagetation');
    expect(ieltsSearchedVocabularyWords.every((word) => word.definition.length > 0)).toBe(true);
  });

  it('keeps the IELTS phrase bank as supplemental practice, not the primary 1500-word proof', () => {
    const ids = ieltsPhraseBankWords.map((word) => word.id);
    const phrases = ieltsPhraseBankWords.map((word) => word.word);

    expect(ieltsPhraseBankWords.length).toBeGreaterThanOrEqual(1500);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(phrases).size).toBe(phrases.length);
  });

  it('generates first-day words from the IELTS book for a fresh user', () => {
    const dailyWords = getDailyWords(USER, wordsDatabase);
    const activeBook = getActiveBook(USER);

    expect(activeBook?.id).toBe(BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE);
    expect(dailyWords.length).toBeGreaterThan(0);
    expect(dailyWords.every((word) => activeBook?.wordIds.includes(word.id))).toBe(true);
    expect(dailyWords.map((word) => word.word)).not.toContain('air');
  });

  it('migrates stale guest and demo starter-book selections back to IELTS', () => {
    const demoUser = buildLocalAuthUserId('demo@example.com');

    setActiveBook('guest', BUILT_IN_WORD_BOOK_IDS.A1_FOUNDATION);
    setActiveBook(demoUser, BUILT_IN_WORD_BOOK_IDS.A1_FOUNDATION);

    expect(getActiveBook('guest')?.id).toBe(BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE);
    expect(getActiveBook(demoUser)?.id).toBe(BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE);
  });

  it('does not override a signed-in learner who intentionally selected A1', () => {
    setActiveBook('signed-in-beginner', BUILT_IN_WORD_BOOK_IDS.A1_FOUNDATION);

    expect(getActiveBook('signed-in-beginner')?.id).toBe(BUILT_IN_WORD_BOOK_IDS.A1_FOUNDATION);
  });
});
