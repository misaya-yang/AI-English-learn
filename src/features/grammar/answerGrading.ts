export interface GrammarPracticeItemLike {
  sentence: string;
  answer: string;
}

export const GRAMMAR_ANSWER_SEPARATOR = '\u241f';

const normalizeGrammarAnswer = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

export const splitExpectedAnswers = (item: GrammarPracticeItemLike): string[] => {
  const blankCount = Math.max(1, item.sentence.split('___').length - 1);
  if (blankCount === 1) return [item.answer];
  const answers = item.answer.split(/\s*…\s*/);
  return answers.length === blankCount ? answers : [item.answer];
};

export const splitUserAnswers = (item: GrammarPracticeItemLike, value: string): string[] => {
  const blankCount = Math.max(1, item.sentence.split('___').length - 1);
  if (blankCount === 1) return [value];
  return Array.from(
    { length: blankCount },
    (_, index) => value.split(GRAMMAR_ANSWER_SEPARATOR)[index] ?? '',
  );
};

export const isPracticeAnswerCorrect = (
  item: GrammarPracticeItemLike,
  value: string,
): boolean => {
  const expected = splitExpectedAnswers(item);
  const actual = splitUserAnswers(item, value);
  return expected.length === actual.length &&
    expected.every(
      (answer, index) => normalizeGrammarAnswer(answer) === normalizeGrammarAnswer(actual[index]),
    );
};
