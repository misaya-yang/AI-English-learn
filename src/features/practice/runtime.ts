import type { WordData } from '@/data/words';

export interface PracticeQuestion {
  id: string;
  word: WordData;
  question: string;
  questionZh: string;
  options: string[];
  correctAnswer: string;
  type: 'multiple_choice' | 'fill_blank';
}

const normalizeSeed = (seed: string): number => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) || 1;
};

const seededOrder = <T,>(items: T[], seed: string, pick: (item: T) => string): T[] => {
  const baseSeed = normalizeSeed(seed);
  return [...items].sort((a, b) => {
    const aScore = normalizeSeed(`${baseSeed}:${pick(a)}`);
    const bScore = normalizeSeed(`${baseSeed}:${pick(b)}`);
    return aScore - bScore;
  });
};

const stableOptionOrder = (options: string[], seed: string): string[] =>
  seededOrder(options, seed, (option) => option.toLowerCase().trim());

export const buildPracticeQuestions = (
  words: WordData[],
  mode: 'quiz' | 'fill_blank',
  seed = 'vocabdaily-practice',
): PracticeQuestion[] => {
  const orderedWords = seededOrder(words, `${seed}:${mode}`, (word) => word.id);
  const questions: PracticeQuestion[] = [];

  orderedWords.forEach((word, index) => {
    const otherWords = seededOrder(
      orderedWords.filter((candidate) => candidate.id !== word.id),
      `${seed}:${word.id}:distractors`,
      (candidate) => candidate.id,
    );

    if (mode === 'quiz') {
      const distractors = otherWords.slice(0, 3).map((candidate) => candidate.definition);
      questions.push({
        id: `mc-${word.id}-${index}`,
        word,
        question: `What does "${word.word}" mean?`,
        questionZh: `"${word.word}" 是什么意思？`,
        options: stableOptionOrder([word.definition, ...distractors], `${seed}:${word.id}:options`),
        correctAnswer: word.definition,
        type: 'multiple_choice',
      });
      return;
    }

    const example = word.examples[0];
    if (!example) return;
    const blankedSentence = example.en.replace(new RegExp(`\\b${word.word}\\b`, 'gi'), '______');
    if (blankedSentence === example.en) return;

    const distractorWords = otherWords.slice(0, 3).map((candidate) => candidate.word);
    questions.push({
      id: `fb-${word.id}-${index}`,
      word,
      question: `Complete: "${blankedSentence}"`,
      questionZh: `填空: "${example.zh}"`,
      options: stableOptionOrder([word.word, ...distractorWords], `${seed}:${word.id}:fill-options`),
      correctAnswer: word.word,
      type: 'multiple_choice',
    });
  });

  return questions.slice(0, 10);
};

export const buildListeningQueue = (words: WordData[], seed = 'vocabdaily-listening'): WordData[] =>
  seededOrder(words, seed, (word) => word.id).slice(0, 10);
