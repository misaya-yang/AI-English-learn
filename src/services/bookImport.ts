import type { ImportRowError } from '@/data/wordBooks';
import type { WordData } from '@/data/words';

export interface ParsedImportWord {
  key: string;
  row: number;
  word: WordData;
  raw: string;
}

export interface ParseWordBookResult {
  totalRows: number;
  successRows: ParsedImportWord[];
  duplicateCount: number;
  errorRows: ImportRowError[];
  delimiter: ',' | '\t';
}

export interface ParseWordBookOptions {
  delimiter?: ',' | '\t';
}

const LEVELS: WordData['level'][] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export const normalizeWordKey = (value: string): string => value.trim().toLowerCase();

const normalizeHeader = (value: string): string => value.trim().toLowerCase().replace(/[\s_-]+/g, '');

const splitMultiValue = (value: string): string[] =>
  value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

const splitExamples = (value: string): { en: string; zh: string }[] => {
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [en, zh = ''] = item.split('::');
      return {
        en: (en || '').trim(),
        zh: (zh || '').trim(),
      };
    })
    .filter((example) => Boolean(example.en));
};

const detectDelimiter = (text: string): ',' | '\t' => {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  return tabCount > commaCount ? '\t' : ',';
};

const parseDelimitedText = (text: string, delimiter: ',' | '\t'): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  const pushCell = () => {
    currentRow.push(currentCell);
    currentCell = '';
  };

  const pushRow = () => {
    pushCell();
    const isEmptyRow = currentRow.every((cell) => cell.trim() === '');
    if (!isEmptyRow) {
      rows.push(currentRow);
    }
    currentRow = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        currentCell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      pushCell();
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      pushRow();
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    pushRow();
  }

  return rows;
};

const getCellValue = (row: string[], index: number): string => {
  if (index < 0 || index >= row.length) {
    return '';
  }
  return (row[index] || '').trim();
};

const parseLevel = (value: string): WordData['level'] => {
  const upper = value.trim().toUpperCase();
  if (LEVELS.includes(upper as WordData['level'])) {
    return upper as WordData['level'];
  }
  return 'B1';
};

export const parseWordBookText = (
  fileText: string,
  options: ParseWordBookOptions = {},
): ParseWordBookResult => {
  const normalizedText = fileText.replace(/^\uFEFF/, '').trim();
  const delimiter = options.delimiter || detectDelimiter(normalizedText);

  if (!normalizedText) {
    return {
      totalRows: 0,
      successRows: [],
      duplicateCount: 0,
      errorRows: [],
      delimiter,
    };
  }

  const rows = parseDelimitedText(normalizedText, delimiter);
  if (rows.length === 0) {
    return {
      totalRows: 0,
      successRows: [],
      duplicateCount: 0,
      errorRows: [],
      delimiter,
    };
  }

  const header = rows[0].map(normalizeHeader);
  const getIndex = (name: string): number => header.indexOf(name);

  const wordIndex = getIndex('word');
  const definitionIndex = getIndex('definition');

  if (wordIndex < 0 || definitionIndex < 0) {
    return {
      totalRows: Math.max(0, rows.length - 1),
      successRows: [],
      duplicateCount: 0,
      errorRows: [
        {
          row: 1,
          reason: 'Missing required columns: word, definition',
          raw: rows[0].join(delimiter),
        },
      ],
      delimiter,
    };
  }

  const definitionZhIndex = getIndex('definitionzh');
  const levelIndex = getIndex('level');
  const topicIndex = getIndex('topic');
  const partOfSpeechIndex = getIndex('partofspeech');
  const phoneticIndex = getIndex('phonetic');
  const examplesIndex = getIndex('examples');
  const synonymsIndex = getIndex('synonyms');
  const antonymsIndex = getIndex('antonyms');
  const collocationsIndex = getIndex('collocations');
  const memoryTipIndex = getIndex('memorytip');
  const etymologyIndex = getIndex('etymology');

  let totalRows = 0;
  let duplicateCount = 0;
  const seenKeys = new Set<string>();
  const errorRows: ImportRowError[] = [];
  const successRows: ParsedImportWord[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 1;
    const isEmpty = row.every((cell) => cell.trim() === '');

    if (isEmpty) {
      continue;
    }

    totalRows += 1;

    const word = getCellValue(row, wordIndex);
    const definition = getCellValue(row, definitionIndex);

    if (!word || !definition) {
      errorRows.push({
        row: rowNumber,
        reason: 'Missing required field(s): word and definition are required',
        raw: row.join(delimiter),
      });
      continue;
    }

    const key = normalizeWordKey(word);
    if (!key) {
      errorRows.push({
        row: rowNumber,
        reason: 'Invalid word value',
        raw: row.join(delimiter),
      });
      continue;
    }

    if (seenKeys.has(key)) {
      duplicateCount += 1;
      continue;
    }
    seenKeys.add(key);

    const parsedWord: WordData = {
      id: '',
      word,
      definition,
      definitionZh: getCellValue(row, definitionZhIndex),
      level: parseLevel(getCellValue(row, levelIndex)),
      topic: getCellValue(row, topicIndex) || 'daily',
      partOfSpeech: getCellValue(row, partOfSpeechIndex) || 'n.',
      phonetic: getCellValue(row, phoneticIndex),
      examples: splitExamples(getCellValue(row, examplesIndex)),
      synonyms: splitMultiValue(getCellValue(row, synonymsIndex)),
      antonyms: splitMultiValue(getCellValue(row, antonymsIndex)),
      collocations: splitMultiValue(getCellValue(row, collocationsIndex)),
      memoryTip: getCellValue(row, memoryTipIndex) || undefined,
      etymology: getCellValue(row, etymologyIndex) || undefined,
    };

    successRows.push({
      key,
      row: rowNumber,
      word: parsedWord,
      raw: row.join(delimiter),
    });
  }

  return {
    totalRows,
    successRows,
    duplicateCount,
    errorRows,
    delimiter,
  };
};
