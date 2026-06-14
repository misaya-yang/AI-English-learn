import type { WordData } from '@/data/words';

export type IeltsRelevance = 'core' | 'useful' | 'general';

export interface LexicalExample {
  en: string;
  zh: string;
}

export interface LexicalSense {
  id: string;
  partOfSpeech: string;
  definition: string;
  definitionZh: string;
  examples: LexicalExample[];
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
}

export interface LexicalTrainingTemplate {
  type: 'recall' | 'collocation' | 'usage';
  label: { en: string; zh: string };
  prompt: string;
  promptZh: string;
}

export interface LexicalEntry {
  id: string;
  headword: string;
  phonetic: string;
  cefrLevel: WordData['level'];
  topic: string;
  ieltsRelevance: IeltsRelevance;
  senses: LexicalSense[];
  memoryTip?: string;
  etymology?: string;
  commonMistakes: string[];
  trainingTemplates: LexicalTrainingTemplate[];
  source: 'word_data';
}

const IELTS_CORE_TOPICS = new Set(['academic', 'education', 'science', 'business']);

function inferIeltsRelevance(word: WordData): IeltsRelevance {
  if (IELTS_CORE_TOPICS.has((word.topic || '').toLowerCase())) return 'core';
  if (word.level === 'B2' || word.level === 'C1') return 'useful';
  return 'general';
}

function buildTrainingTemplates(word: WordData): LexicalTrainingTemplate[] {
  const templates: LexicalTrainingTemplate[] = [
    {
      type: 'recall',
      label: { en: 'Meaning recall', zh: '词义回想' },
      prompt: `Explain "${word.word}" in one clear English sentence.`,
      promptZh: `用一句清楚的英文解释 "${word.word}"。`,
    },
  ];

  if ((word.collocations || []).length > 0) {
    templates.push({
      type: 'collocation',
      label: { en: 'Collocation drill', zh: '搭配训练' },
      prompt: `Use one collocation with "${word.word}" in an IELTS-style sentence.`,
      promptZh: `用 "${word.word}" 的一个搭配写一句 IELTS 风格句子。`,
    });
  }

  templates.push({
    type: 'usage',
    label: { en: 'Usage check', zh: '用法检查' },
    prompt: `Write a short sentence using "${word.word}" naturally.`,
    promptZh: `自然地使用 "${word.word}" 写一个短句。`,
  });

  return templates;
}

function buildCommonMistakes(word: WordData): string[] {
  const mistakes: string[] = [];
  const firstCollocation = (word.collocations || [])[0];
  const firstSynonym = (word.synonyms || [])[0];

  if (firstCollocation) {
    mistakes.push(`Avoid learning "${word.word}" alone; attach it to "${firstCollocation}".`);
  }

  if (firstSynonym) {
    mistakes.push(`Do not treat "${word.word}" and "${firstSynonym}" as always interchangeable.`);
  }

  return mistakes;
}

export function toLexicalEntry(word: WordData): LexicalEntry {
  return {
    id: word.id,
    headword: word.word,
    phonetic: word.phonetic || '',
    cefrLevel: word.level,
    topic: word.topic?.trim() || 'general',
    ieltsRelevance: inferIeltsRelevance(word),
    senses: [
      {
        id: `${word.id}:sense:1`,
        partOfSpeech: word.partOfSpeech || '',
        definition: word.definition || '',
        definitionZh: word.definitionZh || '',
        examples: word.examples || [],
        synonyms: word.synonyms || [],
        antonyms: word.antonyms || [],
        collocations: word.collocations || [],
      },
    ],
    memoryTip: word.memoryTip,
    etymology: word.etymology,
    commonMistakes: buildCommonMistakes(word),
    trainingTemplates: buildTrainingTemplates(word),
    source: 'word_data',
  };
}

export function buildLexicalSummary(entry: LexicalEntry, language: string): string {
  const sense = entry.senses[0];
  const definition = language.startsWith('zh')
    ? sense.definitionZh || sense.definition
    : sense.definition || sense.definitionZh;
  return `${entry.headword} · ${entry.cefrLevel} · ${definition}`;
}
