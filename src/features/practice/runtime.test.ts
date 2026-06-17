import { describe, expect, it } from 'vitest';

import type { UserProgress } from '@/data/localStorage';
import type { WordData } from '@/data/words';
import { buildListeningQueue, buildPracticeQuestions, buildPracticeWordOrder } from './runtime';

const makeWord = (id: string, word: string, topic = 'ielts'): WordData => ({
  id,
  word,
  phonetic: '/test/',
  partOfSpeech: 'n.',
  definition: `${word} definition`,
  definitionZh: `${word} 中文释义`,
  examples: [{ en: `${word} can improve an IELTS answer.`, zh: `${word} 可以提升雅思答案。` }],
  synonyms: [],
  antonyms: [],
  collocations: [`${word} collocation`],
  level: 'B2',
  topic,
});

const words = [
  makeWord('w-a', 'alleviate'),
  makeWord('w-b', 'constraint'),
  makeWord('w-c', 'whereas', 'cohesion'),
  makeWord('w-d', 'tangible', 'policy'),
];

describe('practice runtime focus word support', () => {
  it('keeps a requested focus word first even when progress ranking would normally hide it', () => {
    const progress: UserProgress[] = [{
      userId: 'runtime-test-user',
      wordId: 'w-d',
      status: 'mastered',
      reviewCount: 8,
      lastReviewed: '2026-06-01T00:00:00.000Z',
      nextReview: '2026-08-01',
      easeFactor: 2.5,
      correctCount: 8,
      incorrectCount: 0,
    }];

    const ordered = buildPracticeWordOrder(words, 'runtime-focus', {
      progress,
      focusWordId: 'w-d',
      limit: 3,
    });

    expect(ordered.map((word) => word.id)[0]).toBe('w-d');
    expect(ordered).toHaveLength(3);
  });

  it('starts quiz and listening queues with the requested focus word', () => {
    const questions = buildPracticeQuestions(words, 'quiz', 'runtime-focus', {
      focusWordId: 'w-c',
    });
    const listening = buildListeningQueue(words, 'runtime-focus-listening', {
      focusWordId: 'w-c',
    });

    expect(questions[0]?.word.id).toBe('w-c');
    expect(questions[0]?.options).toContain('whereas definition');
    expect(listening[0]?.id).toBe('w-c');
  });
});
