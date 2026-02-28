import type {
  AnkiDeckSummary,
  AnkiImportOptions,
  AnkiProgressMode,
  ImportRowError,
} from '@/data/wordBooks';
import type { WordData } from '@/data/words';
import type initSqlJs from 'sql.js';
import { normalizeWordKey } from './bookImport';

const APKG_MAX_BYTES = 50 * 1024 * 1024;
const FIELD_SEPARATOR = '\u001f';

const WORD_FIELD_PRIORITY = [
  'front',
  'word',
  'expression',
  'term',
  'vocab',
  'vocabulary',
  'sfld',
];

const DEFINITION_FIELD_PRIORITY = [
  'back',
  'meaning',
  'definition',
  'translation',
  'translate',
  'gloss',
];

const DEFINITION_ZH_FIELD_PRIORITY = [
  'definitionzh',
  'meaningzh',
  'zh',
  'cn',
  'chinese',
  'translationzh',
];

const PHONETIC_FIELD_PRIORITY = ['phonetic', 'pronunciation', 'ipa'];
const POS_FIELD_PRIORITY = ['partofspeech', 'pos', 'speech'];
const LEVEL_FIELD_PRIORITY = ['level', 'cefr'];
const TOPIC_FIELD_PRIORITY = ['topic', 'category', 'tag'];
const EXAMPLES_FIELD_PRIORITY = ['examples', 'example', 'sentence'];
const SYNONYMS_FIELD_PRIORITY = ['synonyms', 'synonym'];
const ANTONYMS_FIELD_PRIORITY = ['antonyms', 'antonym'];
const COLLOCATIONS_FIELD_PRIORITY = ['collocations', 'collocation', 'phrase'];
const MEMORY_TIP_FIELD_PRIORITY = ['memorytip', 'mnemonic', 'note'];
const ETYMOLOGY_FIELD_PRIORITY = ['etymology', 'origin'];

type SqlCell = string | number | Uint8Array | null;
type SqlRow = Record<string, SqlCell>;
type SqlJsDatabase = initSqlJs.Database;
type SqlBindParams = initSqlJs.BindParams;

interface CollectionMetaRow {
  decks: string;
  models: string;
}

interface CardRow {
  id: string;
  nid: string;
  did: string;
  ivl: number;
  factor: number;
  reps: number;
}

interface NoteRow {
  id: string;
  mid: string;
  flds: string;
  sfld: string;
  tags: string;
}

interface ParsedDeckData {
  deckSummaries: AnkiDeckSummary[];
  cardsByDeck: Map<string, CardRow[]>;
  models: Record<string, unknown>;
}

export interface AnkiProgressMapping {
  status: 'learning' | 'review';
  reviewCount: number;
  easeFactor: number;
  nextReview: string;
}

export interface ParsedAnkiWordRow {
  key: string;
  word: WordData;
  noteId: string;
  cardId: string;
  progress: AnkiProgressMapping | null;
  raw: string;
}

export interface InspectApkgResult {
  decks: AnkiDeckSummary[];
}

export interface ImportApkgParsedResult {
  selectedDeck: AnkiDeckSummary;
  rows: ParsedAnkiWordRow[];
  skippedCards: number;
  unmappedRows: ImportRowError[];
}

const normalizeFieldName = (value: string): string => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
};

const toCeilInteger = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.trunc(value);
};

const toPlainText = (raw: string): string => {
  const withBreaks = raw.replace(/<br\s*\/?>/gi, '\n');

  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(withBreaks, 'text/html');
    return (doc.body.textContent || '').replace(/\u00a0/g, ' ').trim();
  }

  return withBreaks
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

const splitListField = (value: string): string[] => {
  return value
    .split(/[|;,/\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);
};

const splitExamples = (value: string): { en: string; zh: string }[] => {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [en, zh = ''] = line.split(/::|\|/);
      return { en: (en || '').trim(), zh: (zh || '').trim() };
    })
    .filter((example) => example.en.length > 0);
};

const parseLevel = (value: string): WordData['level'] => {
  const upper = value.trim().toUpperCase();
  if (upper === 'A1' || upper === 'A2' || upper === 'B1' || upper === 'B2' || upper === 'C1') {
    return upper;
  }
  return 'B1';
};

const parseTags = (tagsValue: string): string[] => {
  return tagsValue
    .trim()
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const getTodayIso = (): string => new Date().toISOString().split('T')[0];

const addDaysIso = (days: number): string => {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now.toISOString().split('T')[0];
};

const getTextByPriority = (fieldMap: Map<string, string>, priority: string[]): string => {
  for (const key of priority) {
    const found = fieldMap.get(key);
    if (found && found.length > 0) {
      return found;
    }
  }

  for (const value of fieldMap.values()) {
    if (value.length > 0) {
      return value;
    }
  }

  return '';
};

const createFieldMap = (
  model: Record<string, unknown> | undefined,
  fldsRaw: string,
  sfldRaw: string,
): Map<string, string> => {
  const values = fldsRaw.split(FIELD_SEPARATOR).map((value) => toPlainText(value));
  const fieldMap = new Map<string, string>();

  const fields = Array.isArray(model?.flds) ? model?.flds : [];
  fields.forEach((field, index) => {
    const name = typeof field === 'object' && field && 'name' in field ? String(field.name) : '';
    const normalizedName = normalizeFieldName(name);
    const value = (values[index] || '').trim();

    if (normalizedName) {
      fieldMap.set(normalizedName, value);
    }
  });

  if (!fieldMap.has('sfld')) {
    fieldMap.set('sfld', toPlainText(sfldRaw));
  }

  return fieldMap;
};

const mapCardProgress = (card: CardRow, mode: AnkiProgressMode): AnkiProgressMapping | null => {
  if (mode === 'none') {
    return null;
  }

  const reps = Math.max(0, toCeilInteger(card.reps));
  if (reps === 0) {
    return null;
  }

  const ivlRaw = toCeilInteger(card.ivl);
  const intervalDays = Math.max(1, Math.abs(ivlRaw));
  const status: 'learning' | 'review' = intervalDays <= 3 ? 'learning' : 'review';
  const easeFactor = clamp(card.factor / 1000 || 2.5, 1.3, 2.5);

  return {
    status,
    reviewCount: reps,
    easeFactor,
    nextReview: addDaysIso(intervalDays),
  };
};

const queryRows = (db: SqlJsDatabase, sql: string, params?: SqlBindParams): SqlRow[] => {
  const result = db.exec(sql, params);
  if (!result || result.length === 0) {
    return [];
  }

  const firstResult = result[0] as {
    columns?: string[];
    lc?: string[];
    values?: SqlCell[][];
  };

  const columns = Array.isArray(firstResult.columns)
    ? firstResult.columns
    : Array.isArray(firstResult.lc)
      ? firstResult.lc
      : [];
  const values = Array.isArray(firstResult.values) ? firstResult.values : [];
  if (values.length === 0) {
    return [];
  }

  if (columns.length === 0) {
    // sql.js can return object rows in some environments; normalize them to SqlRow[].
    const objectRows = values as unknown[];
    if (typeof objectRows[0] === 'object' && objectRows[0] !== null && !Array.isArray(objectRows[0])) {
      return objectRows.map((row) => row as SqlRow);
    }

    throw new Error('Unexpected SQL query result shape');
  }

  return values.map((cells) => {
    const row: SqlRow = {};
    columns.forEach((column, index) => {
      row[column] = cells[index] ?? null;
    });
    return row;
  });
};

const loadSqlJs = async () => {
  const [sqlJsModule, wasmModule] = await Promise.all([
    import('sql.js'),
    import('sql.js/dist/sql-wasm.wasm?url'),
  ]);

  const initSqlJs = (sqlJsModule.default || (sqlJsModule as unknown as typeof sqlJsModule.default)) as typeof import('sql.js')['default'];
  if (typeof initSqlJs !== 'function') {
    throw new Error('Failed to initialize sql.js');
  }

  const SQL = await initSqlJs({
    locateFile: () => wasmModule.default,
  });

  return SQL;
};

const readCollectionBytes = async (file: File): Promise<Uint8Array> => {
  if (!file.name.toLowerCase().endsWith('.apkg')) {
    throw new Error('Only .apkg files are supported in this version');
  }

  if (file.size > APKG_MAX_BYTES) {
    throw new Error('File is too large. Please use an .apkg file smaller than 50MB');
  }

  const [{ unzipSync }, arrayBuffer] = await Promise.all([
    import('fflate'),
    file.arrayBuffer(),
  ]);

  const entries = unzipSync(new Uint8Array(arrayBuffer));
  const collection = entries['collection.anki21'] || entries['collection.anki2'];

  if (!collection) {
    throw new Error('Invalid .apkg: missing collection.anki2/collection.anki21');
  }

  return collection;
};

const parseDeckData = (
  deckJsonText: string,
  cardRows: CardRow[],
): { deckSummaries: AnkiDeckSummary[]; cardsByDeck: Map<string, CardRow[]> } => {
  const parsedDecks = JSON.parse(deckJsonText) as Record<string, { name?: string }>;
  const cardsByDeck = new Map<string, CardRow[]>();

  for (const card of cardRows) {
    const cards = cardsByDeck.get(card.did) || [];
    cards.push(card);
    cardsByDeck.set(card.did, cards);
  }

  const deckSummaries = Object.entries(parsedDecks)
    .map(([deckId, info]) => {
      const cards = cardsByDeck.get(deckId) || [];
      const noteIds = new Set(cards.map((card) => card.nid));

      return {
        deckId,
        deckName: info?.name || `Deck ${deckId}`,
        cardCount: cards.length,
        noteCount: noteIds.size,
      };
    })
    .filter((deck) => deck.cardCount > 0)
    .sort((a, b) => a.deckName.localeCompare(b.deckName));

  return { deckSummaries, cardsByDeck };
};

const openCollection = async (file: File): Promise<ParsedDeckData & { db: SqlJsDatabase }> => {
  const [SQL, collectionBytes] = await Promise.all([loadSqlJs(), readCollectionBytes(file)]);
  const db = new SQL.Database(collectionBytes);

  const colRows = queryRows(db, 'SELECT decks, models FROM col LIMIT 1');
  if (colRows.length === 0) {
    db.close();
    throw new Error('Invalid Anki collection: missing col table data');
  }

  const col = colRows[0] as unknown as CollectionMetaRow;

  const cardRowsRaw = queryRows(
    db,
    'SELECT CAST(id AS TEXT) AS id, CAST(nid AS TEXT) AS nid, CAST(did AS TEXT) AS did, ivl, factor, reps FROM cards',
  );

  const cardRows: CardRow[] = cardRowsRaw.map((row) => ({
    id: String(row.id || ''),
    nid: String(row.nid || ''),
    did: String(row.did || ''),
    ivl: Number(row.ivl || 0),
    factor: Number(row.factor || 2500),
    reps: Number(row.reps || 0),
  }));

  const { deckSummaries, cardsByDeck } = parseDeckData(String(col.decks || '{}'), cardRows);
  const models = JSON.parse(String(col.models || '{}')) as Record<string, unknown>;

  return {
    db,
    deckSummaries,
    cardsByDeck,
    models,
  };
};

export const inspectApkg = async (file: File): Promise<InspectApkgResult> => {
  const collection = await openCollection(file);

  try {
    return {
      decks: collection.deckSummaries,
    };
  } finally {
    collection.db.close();
  }
};

export const importApkg = async (
  file: File,
  options: AnkiImportOptions,
): Promise<ImportApkgParsedResult> => {
  const progressMode: AnkiProgressMode = options.progressMode || 'coarse';
  const collection = await openCollection(file);

  try {
    const selectedDeck = collection.deckSummaries.find((deck) => deck.deckId === options.selectedDeckId);
    if (!selectedDeck) {
      throw new Error('Selected deck was not found in this .apkg file');
    }

    const cards = collection.cardsByDeck.get(selectedDeck.deckId) || [];
    if (cards.length === 0) {
      throw new Error('Selected deck has no cards');
    }

    const noteIdList = Array.from(
      new Set(
        cards
          .map((card) => Number.parseInt(card.nid, 10))
          .filter((noteId) => Number.isFinite(noteId) && noteId > 0),
      ),
    );

    if (noteIdList.length === 0) {
      throw new Error('No valid note ids found in selected deck');
    }

    const noteRowsRaw = queryRows(
      collection.db,
      `SELECT CAST(id AS TEXT) AS id, CAST(mid AS TEXT) AS mid, flds, CAST(sfld AS TEXT) AS sfld, tags FROM notes WHERE id IN (${noteIdList.join(',')})`,
    );

    const notesById = new Map<string, NoteRow>();
    noteRowsRaw.forEach((row) => {
      notesById.set(String(row.id), {
        id: String(row.id || ''),
        mid: String(row.mid || ''),
        flds: String(row.flds || ''),
        sfld: String(row.sfld || ''),
        tags: String(row.tags || ''),
      });
    });

    const rows: ParsedAnkiWordRow[] = [];
    const seenWordKeys = new Set<string>();
    const unmappedRows: ImportRowError[] = [];
    let skippedCards = 0;

    cards.forEach((card, index) => {
      const note = notesById.get(card.nid);
      if (!note) {
        skippedCards += 1;
        unmappedRows.push({
          row: index + 1,
          reason: 'Missing note record for card',
          raw: `cardId=${card.id}, noteId=${card.nid}`,
        });
        return;
      }

      const model = collection.models[note.mid] as Record<string, unknown> | undefined;
      const fieldMap = createFieldMap(model, note.flds, note.sfld);
      const tags = parseTags(note.tags);

      const word = getTextByPriority(fieldMap, WORD_FIELD_PRIORITY);
      const definition = getTextByPriority(fieldMap, DEFINITION_FIELD_PRIORITY);

      if (!word || !definition) {
        skippedCards += 1;
        unmappedRows.push({
          row: index + 1,
          reason: 'Missing required word/definition mapping',
          raw: `cardId=${card.id}, noteId=${card.nid}`,
        });
        return;
      }

      const key = normalizeWordKey(word);
      if (!key) {
        skippedCards += 1;
        unmappedRows.push({
          row: index + 1,
          reason: 'Invalid mapped word key',
          raw: `cardId=${card.id}, noteId=${card.nid}, word=${word}`,
        });
        return;
      }

      if (seenWordKeys.has(key)) {
        skippedCards += 1;
        return;
      }
      seenWordKeys.add(key);

      const examplesValue = getTextByPriority(fieldMap, EXAMPLES_FIELD_PRIORITY);
      const levelValue = getTextByPriority(fieldMap, LEVEL_FIELD_PRIORITY);
      const topicValue = getTextByPriority(fieldMap, TOPIC_FIELD_PRIORITY);
      const definitionZh = getTextByPriority(fieldMap, DEFINITION_ZH_FIELD_PRIORITY);

      const mappedWord: WordData = {
        id: '',
        word,
        definition,
        definitionZh,
        level: parseLevel(levelValue),
        topic: topicValue || tags[0] || 'daily',
        partOfSpeech: getTextByPriority(fieldMap, POS_FIELD_PRIORITY) || 'n.',
        phonetic: getTextByPriority(fieldMap, PHONETIC_FIELD_PRIORITY),
        examples: splitExamples(examplesValue),
        synonyms: splitListField(getTextByPriority(fieldMap, SYNONYMS_FIELD_PRIORITY)),
        antonyms: splitListField(getTextByPriority(fieldMap, ANTONYMS_FIELD_PRIORITY)),
        collocations: splitListField(getTextByPriority(fieldMap, COLLOCATIONS_FIELD_PRIORITY)),
        memoryTip: getTextByPriority(fieldMap, MEMORY_TIP_FIELD_PRIORITY) || undefined,
        etymology: getTextByPriority(fieldMap, ETYMOLOGY_FIELD_PRIORITY) || undefined,
      };

      rows.push({
        key,
        word: mappedWord,
        noteId: note.id,
        cardId: card.id,
        progress: mapCardProgress(card, progressMode),
        raw: `${note.id}|${note.flds}`,
      });
    });

    return {
      selectedDeck,
      rows,
      skippedCards,
      unmappedRows,
    };
  } finally {
    collection.db.close();
  }
};

export const APKG_LIMIT_BYTES = APKG_MAX_BYTES;
export const APKG_LIMIT_TEXT = '50MB';
export const APKG_SUPPORTED_EXTENSION = '.apkg';
export const APKG_PROGRESS_DEFAULT: AnkiProgressMode = 'coarse';
export const APKG_IMPORT_DATE = getTodayIso;
