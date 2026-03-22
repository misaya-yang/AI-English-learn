import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPracticeWordOrder, rankDistractorCandidates } from '../src/features/practice/runtime.ts';
import type { UserProgress } from '../src/data/localStorage.ts';
import type { WordData } from '../src/data/words.ts';

const makeWord = (overrides: Partial<WordData> & Pick<WordData, 'id' | 'word'>): WordData => ({
  id: overrides.id,
  word: overrides.word,
  phonetic: overrides.phonetic || `/${overrides.word}/`,
  partOfSpeech: overrides.partOfSpeech || 'v.',
  definition: overrides.definition || `${overrides.word} definition`,
  definitionZh: overrides.definitionZh || `${overrides.word} 释义`,
  examples: overrides.examples || [{ en: `Use ${overrides.word} in a sentence.`, zh: `用 ${overrides.word} 造句。` }],
  synonyms: overrides.synonyms || [],
  antonyms: overrides.antonyms || [],
  collocations: overrides.collocations || [],
  level: overrides.level || 'B2',
  topic: overrides.topic || 'daily',
  etymology: overrides.etymology,
  memoryTip: overrides.memoryTip,
});

const makeProgress = (
  wordId: string,
  overrides: Partial<UserProgress> = {},
): UserProgress => ({
  userId: 'user_1',
  wordId,
  status: 'review',
  reviewCount: 6,
  lastReviewed: '2026-03-20T08:00:00.000Z',
  nextReview: '2026-03-21T08:00:00.000Z',
  easeFactor: 2.3,
  correctCount: 4,
  incorrectCount: 1,
  updatedAt: '2026-03-22T08:00:00.000Z',
  fsrs: {
    stability: 4.2,
    difficulty: 6.1,
    retrievability: 0.67,
    lapses: 1,
    state: 'review',
    dueAt: '2026-03-21T08:00:00.000Z',
    lastReviewAt: '2026-03-20T08:00:00.000Z',
  },
  ...overrides,
});

test('practice runtime prioritizes overdue stubborn words before stable items', () => {
  const transportWeak = makeWord({
    id: 'w_transport',
    word: 'commute',
    topic: 'transport',
    definition: 'to travel regularly between home and work',
    collocations: ['commute to work', 'long commute'],
  });
  const stableDaily = makeWord({
    id: 'w_stable',
    word: 'clarify',
    topic: 'academic',
    definition: 'to make an idea or statement easier to understand',
  });
  const freshWord = makeWord({
    id: 'w_fresh',
    word: 'harbor',
    topic: 'travel',
    definition: 'a sheltered area of water where ships can dock',
    partOfSpeech: 'n.',
  });

  const ordered = buildPracticeWordOrder(
    [stableDaily, freshWord, transportWeak],
    'practice-seed',
    {
      now: new Date('2026-03-22T12:00:00.000Z'),
      progress: [
        makeProgress(transportWeak.id, {
          incorrectCount: 4,
          correctCount: 2,
          fsrs: {
            stability: 1.4,
            difficulty: 8.4,
            retrievability: 0.22,
            lapses: 3,
            state: 'review',
            dueAt: '2026-03-20T08:00:00.000Z',
            lastReviewAt: '2026-03-18T08:00:00.000Z',
          },
          nextReview: '2026-03-20T08:00:00.000Z',
        }),
        makeProgress(stableDaily.id, {
          incorrectCount: 0,
          correctCount: 8,
          nextReview: '2026-03-29T08:00:00.000Z',
          fsrs: {
            stability: 12,
            difficulty: 4.2,
            retrievability: 0.91,
            lapses: 0,
            state: 'review',
            dueAt: '2026-03-29T08:00:00.000Z',
            lastReviewAt: '2026-03-22T08:00:00.000Z',
          },
        }),
      ],
    },
  );

  assert.equal(ordered[0]?.id, transportWeak.id);
});

test('practice runtime prefers semantically closer distractors', () => {
  const target = makeWord({
    id: 'w_target',
    word: 'abandon',
    definition: 'to leave someone with no intention of returning',
    topic: 'daily',
    synonyms: ['forsake', 'desert'],
    collocations: ['abandon hope', 'abandon the plan'],
  });
  const closeCandidate = makeWord({
    id: 'w_close',
    word: 'forsake',
    definition: 'to leave a person or plan completely behind',
    topic: 'daily',
    synonyms: ['abandon'],
    collocations: ['forsake a promise', 'forsake family'],
  });
  const mediumCandidate = makeWord({
    id: 'w_medium',
    word: 'delay',
    definition: 'to make something happen later than expected',
    topic: 'business',
    collocations: ['delay a project'],
  });
  const farCandidate = makeWord({
    id: 'w_far',
    word: 'keyboard',
    definition: 'a set of keys used to operate a computer',
    topic: 'technology',
    partOfSpeech: 'n.',
  });

  const ranked = rankDistractorCandidates(target, [farCandidate, mediumCandidate, closeCandidate], 'distractor-seed');

  assert.equal(ranked[0]?.id, closeCandidate.id);
  assert.equal(ranked[ranked.length - 1]?.id, farCandidate.id);
});
