import { describe, expect, it } from 'vitest';

import {
  isPracticeAnswerCorrect,
  splitExpectedAnswers,
  splitUserAnswers,
} from '@/features/grammar/answerGrading';

const separator = '\u241f';

describe('GrammarPage multi-blank grading', () => {
  const twoBlankItem = {
    id: 1,
    sentence: '___ you ___ (hear) the news yet?',
    answer: 'Have … heard',
    explanation: '',
    explanationZh: '',
  };

  it('maps every sentence blank to its own expected answer', () => {
    expect(splitExpectedAnswers(twoBlankItem)).toEqual(['Have', 'heard']);
    expect(splitUserAnswers(twoBlankItem, `Have${separator}heard`)).toEqual(['Have', 'heard']);
  });

  it('grades all blanks instead of accepting only the first one', () => {
    expect(isPracticeAnswerCorrect(twoBlankItem, `have${separator}heard`)).toBe(true);
    expect(isPracticeAnswerCorrect(twoBlankItem, `have${separator}`)).toBe(false);
    expect(isPracticeAnswerCorrect(twoBlankItem, `heard${separator}have`)).toBe(false);
  });

  it('supports three-blank conditional questions', () => {
    const threeBlankItem = {
      ...twoBlankItem,
      sentence: 'What ___ you ___ (do) if you ___ (win) the lottery?',
      answer: 'would … do … won',
    };

    expect(splitExpectedAnswers(threeBlankItem)).toEqual(['would', 'do', 'won']);
    expect(isPracticeAnswerCorrect(threeBlankItem, `would${separator}do${separator}won`)).toBe(true);
  });
});
