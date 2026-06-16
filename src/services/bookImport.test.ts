import { describe, expect, it } from 'vitest';

import { parseWordBookText } from './bookImport';

describe('bookImport', () => {
  it('parses CSV rows with examples, duplicates, invalid rows, and detected delimiter', () => {
    const csv = [
      'word,definition,definitionZh,level,topic,examples,synonyms',
      '"mitigate","to make less severe","减轻",B2,academic,"This can mitigate risk.::这能降低风险",reduce|ease',
      'brisk,quick and active,轻快的,A2,daily,She took a brisk walk.::她快步走路,quick',
      'brisk,duplicate should be skipped,重复,A2,daily,,',
      'empty-definition,,缺释义,B1,daily,,',
    ].join('\n');

    const result = parseWordBookText(csv);

    expect(result.delimiter).toBe(',');
    expect(result.totalRows).toBe(4);
    expect(result.successRows).toHaveLength(2);
    expect(result.duplicateCount).toBe(1);
    expect(result.errorRows).toEqual([
      expect.objectContaining({
        row: 5,
        reason: expect.stringContaining('Missing required field'),
      }),
    ]);
    expect(result.successRows[0].word).toEqual(expect.objectContaining({
      word: 'mitigate',
      definitionZh: '减轻',
      level: 'B2',
      topic: 'academic',
      examples: [{ en: 'This can mitigate risk.', zh: '这能降低风险' }],
      synonyms: ['reduce', 'ease'],
    }));
  });

  it('reports missing required headers without importing rows', () => {
    const result = parseWordBookText('term,meaning\nage,years lived');

    expect(result.successRows).toHaveLength(0);
    expect(result.errorRows[0]).toEqual(expect.objectContaining({
      row: 1,
      reason: 'Missing required columns: word, definition',
    }));
  });
});
