import { describe, expect, it } from 'vitest';

import type { UserProgress } from '@/data/localStorage';
import type { WordData } from '@/data/words';
import { exportToAnkiTSV, exportToCSV } from './wordBookExport';

const word: WordData = {
  id: 'w-mitigate',
  word: 'mitigate',
  phonetic: '/ˈmɪtɪɡeɪt/',
  partOfSpeech: 'v.',
  definition: 'to make something less severe, harmful, or painful',
  definitionZh: '减轻，缓和',
  examples: [{ en: 'Policies can mitigate risk.', zh: '政策可以降低风险。' }],
  synonyms: ['reduce', 'ease'],
  antonyms: ['worsen'],
  collocations: ['mitigate risk'],
  level: 'B2',
  topic: 'academic',
  memoryTip: 'Use it when the problem is reduced, not removed.',
};

describe('wordBookExport', () => {
  it('exports CSV with optional progress fields and Excel-compatible BOM', () => {
    const progress: UserProgress = {
      userId: 'export-user',
      wordId: word.id,
      status: 'review',
      reviewCount: 5,
      lastReviewed: '2026-06-15T00:00:00.000Z',
      nextReview: '2026-06-20T00:00:00.000Z',
      easeFactor: 2.3,
      correctCount: 3,
      incorrectCount: 1,
    };

    const csv = exportToCSV([word], new Map([[word.id, progress]]), { includeProgress: true });

    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('status,reviewCount,correctCount,incorrectCount,easeFactor,nextReview,lastReviewed');
    expect(csv).toContain('review,5,3,1,2.3,2026-06-20T00:00:00.000Z,2026-06-15T00:00:00.000Z');
    expect(csv).toContain('Policies can mitigate risk.::政策可以降低风险。');
  });

  it('exports Anki-compatible tab-separated front, back, and tags', () => {
    const tsv = exportToAnkiTSV([word]);
    const [front, back, tags] = tsv.split('\t');

    expect(front).toBe('mitigate [/ˈmɪtɪɡeɪt/]');
    expect(back).toContain('<i>v.</i>');
    expect(back).toContain('<b>减轻，缓和</b>');
    expect(back).toContain('Policies can mitigate risk.');
    expect(tags).toBe('B2 academic');
  });
});
