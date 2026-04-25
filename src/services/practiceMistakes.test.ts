import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { addMistake, getMistakes, clearAllMistakes } from './mistakeCollector';
import {
  buildPracticeMistakeRecord,
  type PracticeAttemptInput,
} from './practiceMistakes';
import { recordEvent, getEvents } from './learningEvents';
import { clearLearningEventsForUser } from '@/lib/localDb';

const USER = 'test-user-practice-mistakes';

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

  it('round-trips through addMistake/getMistakes', async () => {
    await clearAllMistakes(USER);
    const record = buildPracticeMistakeRecord(baseInput({ mode: 'quiz' }))!;
    const created = await addMistake(USER, record);
    const all = await getMistakes(USER);
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
  beforeEach(() => clearAllMistakes(USER));
  afterEach(() => clearAllMistakes(USER));

  it('does not write anything for correct attempts', async () => {
    const record = buildPracticeMistakeRecord(baseInput({ isCorrect: true, userAnswer: 'aberration' }));
    if (record) await addMistake(USER, record);
    expect((await getMistakes(USER)).length).toBe(0);
  });

  it('LEARN-03 — emits practice_correct + practice_wrong events for each branch', async () => {
    const eventUser = 'practice-mistakes-events-user';
    await clearLearningEventsForUser(eventUser);

    // Mirror the PracticePage call path: a correct outcome fires
    // practice_correct, a wrong outcome fires practice_wrong (alongside
    // the mistake being captured into the mistake collector).
    await recordEvent(eventUser, {
      kind: 'practice_correct',
      payload: { wordId: 'w-correct', mode: 'quiz' },
    });

    const wrongInput = baseInput({
      mode: 'quiz',
      isCorrect: false,
      word: { id: 'w-wrong', word: 'aberration' },
    });
    const mistake = buildPracticeMistakeRecord(wrongInput)!;
    await addMistake(eventUser, mistake);
    await recordEvent(eventUser, {
      kind: 'practice_wrong',
      payload: { wordId: 'w-wrong', mode: 'quiz' },
    });

    const events = await getEvents(eventUser);
    const kinds = events.map((event) => event.kind).sort();
    expect(kinds).toEqual(['practice_correct', 'practice_wrong']);

    const wrongEvent = events.find((event) => event.kind === 'practice_wrong')!;
    expect(wrongEvent.payload).toMatchObject({ wordId: 'w-wrong', mode: 'quiz' });

    await clearLearningEventsForUser(eventUser);
  });

  it('persists multiple wrong attempts and respects the source filter', async () => {
    const a = buildPracticeMistakeRecord(baseInput({ mode: 'quiz' }))!;
    const b = buildPracticeMistakeRecord(
      baseInput({ mode: 'pronunciation', word: { id: 'w2', word: 'ubiquitous' }, userAnswer: 'wrang', correctAnswer: 'ubiquitous' }),
    )!;
    await addMistake(USER, a);
    await addMistake(USER, b);
    const all = await getMistakes(USER);
    expect(all.length).toBe(2);
    expect((await getMistakes(USER, { source: 'pronunciation' })).map((entry) => entry.word)).toEqual(['ubiquitous']);
    expect((await getMistakes(USER, { source: 'practice' })).map((entry) => entry.word)).toEqual(['aberration']);
  });
});
