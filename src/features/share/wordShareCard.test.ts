import { describe, expect, it } from 'vitest';

import type { WordData } from '@/data/words';
import {
  buildWordShareCardSvg,
  buildWordShareFileName,
  buildWordShareText,
} from './wordShareCard';

const word: WordData = {
  id: 'w1',
  word: 'afraid',
  phonetic: '/əˈfreɪd/',
  partOfSpeech: 'adj.',
  definition: 'feeling fear',
  definitionZh: '害怕的',
  examples: [{ en: 'Do not be afraid.', zh: '不要害怕。' }],
  synonyms: ['scared'],
  antonyms: ['brave'],
  collocations: ['afraid of'],
  level: 'A1',
  topic: 'daily',
};

describe('wordShareCard', () => {
  it('builds a visual SVG share card without private progress data', () => {
    const svg = buildWordShareCardSvg(word, {
      language: 'zh',
      dateLabel: '2026年6月13日',
      origin: 'https://example.com/word-of-the-day',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('afraid');
    expect(svg).toContain('害怕的');
    expect(svg).toContain('公开分享卡');
    expect(svg).not.toContain('streak');
    expect(svg).not.toContain('xp');
    expect(svg).not.toContain('reviewCount');
  });

  it('builds share text with the public word and source only', () => {
    const text = buildWordShareText(word, {
      language: 'en',
      dateLabel: 'June 13, 2026',
      origin: 'https://example.com/word-of-the-day',
    });

    expect(text).toContain('Word of the Day: afraid');
    expect(text).toContain('feeling fear');
    expect(text).toContain('https://example.com/word-of-the-day');
  });

  it('builds a safe SVG filename', () => {
    expect(buildWordShareFileName({ ...word, word: 'be afraid!' })).toBe('vocabdaily-be-afraid.svg');
  });
});
