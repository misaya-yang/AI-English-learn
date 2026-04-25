import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { addMistake, getMistakes } from './mistakeCollector';
import {
  buildPracticeMistakeRecord,
  type PracticeAttemptInput,
} from './practiceMistakes';

const baseInput = (overrides: Partial<PracticeAttemptInput> = {}): PracticeAttemptInput => ({
  word: { id: 'w1', word: 'aberration' },
  isCorrect: false,
  userAnswer: 'aborration',
  correctAnswer: 'aberration',
  mode: 'quiz',
  ...overrides,
});

describe('buildPracticeMistakeRecord', () => {
  it('returns null for correct answers', () => {
    expect(buildPracticeMistakeRecord(baseInput({ isCorrect: true }))).toBeNull();
  });

  it('returns null when the word identity is missing', () => {
    expect(buildPracticeMistakeRecord(baseInput({ word: { id: '', word: '' } }))).toBeNull();
  });

  it('maps quiz mode to practice source + Vocabulary category', () => {
    const record = buildPracticeMistakeRecord(baseInput({ mode: 'quiz' }))!;
    expect(record.source).toBe('practice');
    expect(record.category).toBe('Vocabulary');
    expect(record.word).toBe('aberration');
    expect(record.userAnswer).toBe('aborration');
    expect(record.correctAnswer).toBe('aberration');
  });

  it('maps listening mode to practice source + Listening Dictation category', () => {
    const record = buildPracticeMistakeRecord(baseInput({ mode: 'listening' }))!;
    expect(record.source).toBe('practice');
    expect(record.category).toBe('Listening Dictation');
  });

  it('maps pronunciation mode to pronunciation source', () => {
    const record = buildPracticeMistakeRecord(baseInput({ mode: 'pronunciation' }))!;
    expect(record.source).toBe('pronunciation');
    expect(record.category).toBe('Pronunciation Drill');
  });

  it('maps roleplay mode to roleplay source + Pragmatic Use category', () => {
    const record = buildPracticeMistakeRecord(baseInput({ mode: 'roleplay' }))!;
    expect(record.source).toBe('roleplay');
    expect(record.category).toBe('Pragmatic Use');
  });

  it('falls back to practice/Practice for unknown modes', () => {
    const record = buildPracticeMistakeRecord(baseInput({ mode: 'rare-mode-xyz' }))!;
    expect(record.source).toBe('practice');
    expect(record.category).toBe('Practice');
  });

  it('classifies severity from answer similarity', () => {
    expect(
      buildPracticeMistakeRecord(baseInput({ userAnswer: 'aberratoin', correctAnswer: 'aberration' }))?.severity,
    ).toBe('low');
    expect(
      buildPracticeMistakeRecord(baseInput({ userAnswer: 'aborra', correctAnswer: 'aberration' }))?.severity,
    ).toBe('medium');
    expect(
      buildPracticeMistakeRecord(baseInput({ userAnswer: '', correctAnswer: 'aberration' }))?.severity,
    ).toBe('high');
    expect(
      buildPracticeMistakeRecord(baseInput({ userAnswer: 'completely wrong', correctAnswer: 'aberration' }))?.severity,
    ).toBe('high');
  });

  it('falls back the correctAnswer field to the word when blank', () => {
    const record = buildPracticeMistakeRecord(
      baseInput({ correctAnswer: '   ', word: { id: 'w', word: 'aberration' } }),
    )!;
    expect(record.correctAnswer).toBe('aberration');
  });

  it('round-trips through addMistake/getMistakes', () => {
    localStorage.removeItem('vocabdaily_mistakes');
    const record = buildPracticeMistakeRecord(baseInput({ mode: 'quiz' }))!;
    const created = addMistake(record);
    const all = getMistakes();
    expect(all.length).toBe(1);
    expect(all[0]).toMatchObject({
      id: created.id,
      source: 'practice',
      word: 'aberration',
      category: 'Vocabulary',
      severity: 'low',
    });
  });
});

describe('mistakeCollector + practice integration', () => {
  beforeEach(() => localStorage.removeItem('vocabdaily_mistakes'));
  afterEach(() => localStorage.removeItem('vocabdaily_mistakes'));

  it('does not write anything for correct attempts', () => {
    const record = buildPracticeMistakeRecord(baseInput({ isCorrect: true, userAnswer: 'aberration' }));
    if (record) addMistake(record);
    expect(getMistakes().length).toBe(0);
  });

  it('persists multiple wrong attempts and respects the source filter', () => {
    const a = buildPracticeMistakeRecord(baseInput({ mode: 'quiz' }))!;
    const b = buildPracticeMistakeRecord(
      baseInput({ mode: 'pronunciation', word: { id: 'w2', word: 'ubiquitous' }, userAnswer: 'wrang', correctAnswer: 'ubiquitous' }),
    )!;
    addMistake(a);
    addMistake(b);
    const all = getMistakes();
    expect(all.length).toBe(2);
    expect(getMistakes({ source: 'pronunciation' }).map((entry) => entry.word)).toEqual(['ubiquitous']);
    expect(getMistakes({ source: 'practice' }).map((entry) => entry.word)).toEqual(['aberration']);
  });
});
