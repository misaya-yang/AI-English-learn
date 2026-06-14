import { describe, expect, it } from 'vitest';
import type { WordData } from '@/data/words';
import { buildLexicalSummary, toLexicalEntry } from './lexicalEntry';

const baseWord: WordData = {
  id: 'w-test',
  word: 'approach',
  phonetic: '/əˈprəʊtʃ/',
  partOfSpeech: 'n./v.',
  definition: 'a way of dealing with something',
  definitionZh: '方法；处理方式',
  examples: [{ en: 'We need a new approach to learning.', zh: '我们需要一种新的学习方法。' }],
  synonyms: ['method', 'strategy'],
  antonyms: ['avoidance'],
  collocations: ['practical approach', 'new approach'],
  level: 'B2',
  topic: 'academic',
  etymology: 'From Old French aprochier.',
  memoryTip: 'A path you approach with.',
};

describe('lexicalEntry adapter', () => {
  it('turns WordData into a single-sense dictionary entry', () => {
    const entry = toLexicalEntry(baseWord);

    expect(entry.id).toBe('w-test');
    expect(entry.headword).toBe('approach');
    expect(entry.cefrLevel).toBe('B2');
    expect(entry.ieltsRelevance).toBe('core');
    expect(entry.senses[0]).toMatchObject({
      partOfSpeech: 'n./v.',
      definition: 'a way of dealing with something',
      definitionZh: '方法；处理方式',
    });
    expect(entry.senses[0].collocations).toEqual(['practical approach', 'new approach']);
    expect(entry.commonMistakes).toEqual([
      'Avoid learning "approach" alone; attach it to "practical approach".',
      'Do not treat "approach" and "method" as always interchangeable.',
    ]);
    expect(entry.trainingTemplates.map((item) => item.type)).toEqual(['recall', 'collocation', 'usage']);
  });

  it('keeps missing optional fields safe for imported words', () => {
    const entry = toLexicalEntry({
      ...baseWord,
      examples: [],
      synonyms: [],
      antonyms: [],
      collocations: [],
      topic: '',
      memoryTip: undefined,
      etymology: undefined,
    });

    expect(entry.topic).toBe('general');
    expect(entry.senses[0].examples).toEqual([]);
    expect(entry.commonMistakes).toEqual([]);
    expect(entry.trainingTemplates.map((item) => item.type)).toEqual(['recall', 'usage']);
  });

  it('builds localized lexicon summaries', () => {
    const entry = toLexicalEntry(baseWord);

    expect(buildLexicalSummary(entry, 'zh')).toContain('B2');
    expect(buildLexicalSummary(entry, 'zh')).toContain('方法');
    expect(buildLexicalSummary(entry, 'en')).toContain('a way of dealing');
  });
});
