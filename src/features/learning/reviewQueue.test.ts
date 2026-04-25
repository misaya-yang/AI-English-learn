import { describe, expect, it } from 'vitest';

import type { UserProgress } from '@/data/localStorage';
import type { WordData } from '@/data/words';

import { buildReviewSession } from './reviewQueue';

const word = (id: string, overrides: Partial<WordData> = {}): WordData => ({
  id,
  word: id,
  phonetic: '/test/',
  partOfSpeech: 'noun',
  definition: 'test definition',
  definitionZh: '测试定义',
  level: 'B1',
  examples: [],
  collocations: [],
  synonyms: [],
  topic: 'general',
  ...overrides,
} as WordData);

const due = (wordId: string, overrides: Partial<UserProgress> = {}): UserProgress => ({
  userId: 'u1',
  wordId,
  status: 'review',
  reviewCount: 2,
  correctCount: 1,
  incorrectCount: 1,
  easeFactor: 2.5,
  interval: 1,
  nextReview: new Date().toISOString(),
  lastReviewed: new Date(Date.now() - 86_400_000).toISOString(),
  firstSeenAt: new Date(Date.now() - 7 * 86_400_000).toISOString(),
  masteredAt: null,
  ...overrides,
} as UserProgress);

describe('buildReviewSession', () => {
  it('returns an empty list when there are no due words', () => {
    expect(buildReviewSession({ dueWords: [], wordCatalog: [word('w1')] })).toEqual([]);
  });

  it('refuses to fall back to wordCatalog when due is empty (LEARN-04)', () => {
    const session = buildReviewSession({
      dueWords: [],
      wordCatalog: [word('a'), word('b'), word('c')],
    });
    expect(session.length).toBe(0);
  });

  it('attaches WordData from the catalog to each due id', () => {
    const session = buildReviewSession({
      dueWords: [due('a'), due('b')],
      wordCatalog: [word('a'), word('b'), word('c')],
    });
    expect(session.map((item) => item.wordId)).toEqual(['a', 'b']);
    expect(session[0].word.id).toBe('a');
  });

  it('drops due entries whose word is not in the catalog', () => {
    const session = buildReviewSession({
      dueWords: [due('a'), due('missing'), due('b')],
      wordCatalog: [word('a'), word('b')],
    });
    expect(session.map((item) => item.wordId)).toEqual(['a', 'b']);
  });

  it('preserves the dueWords order (FSRS scheduler decides the order)', () => {
    const session = buildReviewSession({
      dueWords: [due('c'), due('a'), due('b')],
      wordCatalog: [word('a'), word('b'), word('c')],
    });
    expect(session.map((item) => item.wordId)).toEqual(['c', 'a', 'b']);
  });

  it('exposes the FSRS state via ensureFSRS for every entry', () => {
    const session = buildReviewSession({
      dueWords: [due('a', { reviewCount: 5 })],
      wordCatalog: [word('a')],
    });
    expect(session[0].reviewCount).toBe(5);
    expect(session[0].fsrs).toBeDefined();
    expect(typeof session[0].fsrs.stability).toBe('number');
  });

  it('skips malformed due entries instead of throwing', () => {
    const session = buildReviewSession({
      // @ts-expect-error simulate corrupted UserProgress entries
      dueWords: [null, undefined, { wordId: 42 }, due('a')],
      wordCatalog: [word('a')],
    });
    expect(session.map((item) => item.wordId)).toEqual(['a']);
  });

  it('deduplicates the catalog by id (last write loses)', () => {
    const session = buildReviewSession({
      dueWords: [due('a')],
      wordCatalog: [word('a', { word: 'first' }), word('a', { word: 'second' })],
    });
    expect(session[0].word.word).toBe('first');
  });
});
