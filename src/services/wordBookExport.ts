/**
 * wordBookExport.ts — CSV and Anki-compatible export for vocabulary
 */

import type { WordData } from '@/data/words';
import type { UserProgress } from '@/data/localStorage';

// ─── CSV Export ──────────────────────────────────────────────────────────────

const CSV_COLUMNS = [
  'word',
  'phonetic',
  'partOfSpeech',
  'definition',
  'definitionZh',
  'level',
  'topic',
  'examples',
  'synonyms',
  'antonyms',
  'collocations',
  'etymology',
  'memoryTip',
] as const;

const CSV_COLUMNS_WITH_PROGRESS = [
  ...CSV_COLUMNS,
  'status',
  'reviewCount',
  'correctCount',
  'incorrectCount',
  'easeFactor',
  'nextReview',
  'lastReviewed',
] as const;

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatExamples(examples: { en: string; zh: string }[]): string {
  return examples.map((e) => `${e.en}::${e.zh}`).join('|');
}

export interface CSVExportOptions {
  includeProgress?: boolean;
  delimiter?: ',' | '\t';
}

export function exportToCSV(
  words: WordData[],
  progressMap: Map<string, UserProgress>,
  options: CSVExportOptions = {},
): string {
  const { includeProgress = false, delimiter = ',' } = options;
  const columns = includeProgress ? CSV_COLUMNS_WITH_PROGRESS : CSV_COLUMNS;
  const header = columns.join(delimiter);

  const rows = words.map((word) => {
    const base = [
      word.word,
      word.phonetic || '',
      word.partOfSpeech || '',
      word.definition || '',
      word.definitionZh || '',
      word.level || '',
      word.topic || '',
      formatExamples(word.examples || []),
      (word.synonyms || []).join('|'),
      (word.antonyms || []).join('|'),
      (word.collocations || []).join('|'),
      word.etymology || '',
      word.memoryTip || '',
    ];

    if (includeProgress) {
      const p = progressMap.get(word.id);
      base.push(
        p?.status || 'new',
        String(p?.reviewCount ?? 0),
        String(p?.correctCount ?? 0),
        String(p?.incorrectCount ?? 0),
        String(p?.easeFactor ?? 2.5),
        p?.nextReview || '',
        p?.lastReviewed || '',
      );
    }

    return base.map(escapeCSV).join(delimiter);
  });

  // BOM for Excel compatibility with Chinese characters
  return '\uFEFF' + header + '\n' + rows.join('\n');
}

// ─── Anki TXT Export (tab-separated, importable by Anki) ─────────────────────

/**
 * Exports words in Anki-importable tab-separated format.
 * Front: word + phonetic
 * Back: definition + Chinese definition + examples
 */
export function exportToAnkiTSV(words: WordData[]): string {
  const rows = words.map((word) => {
    const front = `${word.word}${word.phonetic ? ` [${word.phonetic}]` : ''}`;

    const backParts = [
      word.partOfSpeech ? `<i>${word.partOfSpeech}</i>` : '',
      word.definition,
      word.definitionZh ? `<br><b>${word.definitionZh}</b>` : '',
    ];

    if (word.examples?.length > 0) {
      backParts.push(
        '<br><br>' +
          word.examples
            .slice(0, 3)
            .map((e) => `• ${e.en}<br>&nbsp;&nbsp;${e.zh}`)
            .join('<br>'),
      );
    }

    if (word.synonyms?.length > 0) {
      backParts.push(`<br><br><b>Synonyms:</b> ${word.synonyms.join(', ')}`);
    }

    const back = backParts.filter(Boolean).join(' ');
    // Anki import format: front\tback\ttags
    const tags = [word.level, word.topic].filter(Boolean).join(' ');
    return `${front}\t${back}\t${tags}`;
  });

  return rows.join('\n');
}

// ─── File download helper ────────────────────────────────────────────────────

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
