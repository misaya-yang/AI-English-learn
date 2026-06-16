import path from 'node:path';
import initSqlJs from 'sql.js';
import { zipSync, strToU8 } from 'fflate';
import { describe, expect, it } from 'vitest';

import { APKG_LIMIT_TEXT, importApkg, inspectApkg } from './ankiApkgImport';

async function createSampleApkgFile(): Promise<File> {
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(process.cwd(), 'node_modules/sql.js/dist', file),
  });
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE col (
      id integer primary key,
      crt integer,
      mod integer,
      scm integer,
      ver integer,
      dty integer,
      usn integer,
      ls integer,
      conf text,
      models text,
      decks text,
      dconf text,
      tags text
    );
    CREATE TABLE notes (
      id integer primary key,
      guid text,
      mid integer,
      mod integer,
      usn integer,
      tags text,
      flds text,
      sfld text,
      csum integer,
      flags integer,
      data text
    );
    CREATE TABLE cards (
      id integer primary key,
      nid integer,
      did integer,
      ord integer,
      mod integer,
      usn integer,
      type integer,
      queue integer,
      due integer,
      ivl integer,
      factor integer,
      reps integer,
      lapses integer,
      left integer,
      odue integer,
      odid integer,
      flags integer,
      data text
    );
  `);

  const decks = {
    '2001': { name: 'Synthetic IELTS::Core' },
  };
  const models = {
    '100': {
      name: 'Basic',
      flds: [
        { name: 'Front' },
        { name: 'Back' },
        { name: 'DefinitionZh' },
        { name: 'Topic' },
        { name: 'Examples' },
      ],
    },
  };

  db.run(
    `INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 0, 0, 0, 11, 0, 0, 0, '{}', JSON.stringify(models), JSON.stringify(decks), '{}', '{}'],
  );

  const fields = [
    '<b>mitigate</b>',
    '<img src=x onerror=alert(1)>to make something less severe',
    '减轻，缓和',
    'academic',
    'This can mitigate risk.::这能降低风险。',
  ].join('\u001f');

  db.run(
    `INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [10001, 'guid_note_1', 100, 0, 0, ' ielts ', fields, 'mitigate', 0, 0, ''],
  );
  db.run(
    `INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [20001, 10001, 2001, 0, 0, 0, 2, 2, 0, 6, 2300, 9, 0, 0, 0, 0, 0, ''],
  );

  const zipBytes = zipSync({
    'collection.anki21': db.export(),
    media: strToU8('{}'),
  });
  db.close();

  return new File([Buffer.from(zipBytes)], 'synthetic.apkg', { type: 'application/octet-stream' });
}

async function createMultiDeckApkgFile(): Promise<File> {
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(process.cwd(), 'node_modules/sql.js/dist', file),
  });
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE col (
      id integer primary key,
      crt integer,
      mod integer,
      scm integer,
      ver integer,
      dty integer,
      usn integer,
      ls integer,
      conf text,
      models text,
      decks text,
      dconf text,
      tags text
    );
    CREATE TABLE notes (
      id integer primary key,
      guid text,
      mid integer,
      mod integer,
      usn integer,
      tags text,
      flds text,
      sfld text,
      csum integer,
      flags integer,
      data text
    );
    CREATE TABLE cards (
      id integer primary key,
      nid integer,
      did integer,
      ord integer,
      mod integer,
      usn integer,
      type integer,
      queue integer,
      due integer,
      ivl integer,
      factor integer,
      reps integer,
      lapses integer,
      left integer,
      odue integer,
      odid integer,
      flags integer,
      data text
    );
  `);

  const decks = {
    '2001': { name: 'Synthetic IELTS::Core' },
    '2002': { name: 'Synthetic IELTS::Daily' },
  };
  const models = {
    '100': {
      name: 'Basic',
      flds: [
        { name: 'Front' },
        { name: 'Back' },
        { name: 'DefinitionZh' },
        { name: 'Topic' },
        { name: 'Examples' },
      ],
    },
  };

  db.run(
    `INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 0, 0, 0, 11, 0, 0, 0, '{}', JSON.stringify(models), JSON.stringify(decks), '{}', '{}'],
  );

  const rows = [
    {
      noteId: 10001,
      cardId: 20001,
      deckId: 2001,
      guid: 'guid_multi_core',
      tags: ' ielts ',
      sfld: 'mitigate',
      reps: 9,
      ivl: 6,
      factor: 2300,
      fields: [
        'mitigate',
        'to make something less severe',
        '减轻，缓和',
        'academic',
        'This can mitigate risk.::这能降低风险。',
      ],
    },
    {
      noteId: 10002,
      cardId: 20002,
      deckId: 2002,
      guid: 'guid_multi_daily',
      tags: ' daily ',
      sfld: 'brisk',
      reps: 1,
      ivl: 2,
      factor: 1900,
      fields: [
        'brisk',
        'quick and active',
        '轻快的',
        'daily',
        'She took a brisk walk.::她快步走路。',
      ],
    },
  ];

  rows.forEach((row) => {
    db.run(
      `INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.noteId, row.guid, 100, 0, 0, row.tags, row.fields.join('\u001f'), row.sfld, 0, 0, ''],
    );
    db.run(
      `INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.cardId, row.noteId, row.deckId, 0, 0, 0, 2, 2, 0, row.ivl, row.factor, row.reps, 0, 0, 0, 0, 0, ''],
    );
  });

  const zipBytes = zipSync({
    'collection.anki21': db.export(),
    media: strToU8('{}'),
  });
  db.close();

  return new File([Buffer.from(zipBytes)], 'synthetic-multi-deck.apkg', { type: 'application/octet-stream' });
}

async function createAmbiguousFieldApkgFile(): Promise<File> {
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(process.cwd(), 'node_modules/sql.js/dist', file),
  });
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE col (
      id integer primary key,
      crt integer,
      mod integer,
      scm integer,
      ver integer,
      dty integer,
      usn integer,
      ls integer,
      conf text,
      models text,
      decks text,
      dconf text,
      tags text
    );
    CREATE TABLE notes (
      id integer primary key,
      guid text,
      mid integer,
      mod integer,
      usn integer,
      tags text,
      flds text,
      sfld text,
      csum integer,
      flags integer,
      data text
    );
    CREATE TABLE cards (
      id integer primary key,
      nid integer,
      did integer,
      ord integer,
      mod integer,
      usn integer,
      type integer,
      queue integer,
      due integer,
      ivl integer,
      factor integer,
      reps integer,
      lapses integer,
      left integer,
      odue integer,
      odid integer,
      flags integer,
      data text
    );
  `);

  const decks = { '3001': { name: 'Synthetic Ambiguous Fields' } };
  const models = {
    '300': {
      name: 'Custom',
      flds: [
        { name: 'Prompt' },
        { name: 'Answer' },
        { name: 'Chinese' },
        { name: 'Sound' },
        { name: 'Speech' },
        { name: 'Sentence' },
        { name: 'Labels' },
      ],
    },
  };

  db.run(
    `INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 0, 0, 0, 11, 0, 0, 0, '{}', JSON.stringify(models), JSON.stringify(decks), '{}', '{}'],
  );

  const fields = [
    'to make something less severe',
    'mitigate',
    '减轻，缓和',
    '/ˈmɪtɪɡeɪt/',
    'v.',
    'This can mitigate risk.::这能降低风险。',
    'academic|ielts',
  ].join('\u001f');

  db.run(
    `INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [30001, 'guid_ambiguous_note_1', 300, 0, 0, '', fields, 'mitigate', 0, 0, ''],
  );
  db.run(
    `INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [31001, 30001, 3001, 0, 0, 0, 2, 2, 0, 4, 2100, 3, 0, 0, 0, 0, 0, ''],
  );

  const zipBytes = zipSync({
    'collection.anki21': db.export(),
    media: strToU8('{}'),
  });
  db.close();

  return new File([Buffer.from(zipBytes)], 'synthetic-ambiguous.apkg', { type: 'application/octet-stream' });
}

describe('ankiApkgImport', () => {
  it('inspects a synthetic APKG with deck preview, fields, samples, and progress preview', async () => {
    const file = await createSampleApkgFile();

    const result = await inspectApkg(file);

    expect(result.decks).toHaveLength(1);
    expect(result.decks[0]).toEqual(expect.objectContaining({
      deckName: 'Synthetic IELTS::Core',
      cardCount: 1,
      noteCount: 1,
      fieldNames: ['Front', 'Back', 'DefinitionZh', 'Topic', 'Examples'],
      mappingConfidence: 'high',
      progressPreview: {
        coarseMappedCount: 1,
        reviewedCardCount: 1,
      },
    }));
    expect(result.decks[0].sampleRows?.[0]).toEqual(expect.objectContaining({
      word: 'mitigate',
      definition: 'to make something less severe',
      definitionZh: '减轻，缓和',
    }));
  });

  it('imports mapped words and coarse progress without preserving unsafe HTML', async () => {
    const file = await createSampleApkgFile();
    const [{ deckId }] = (await inspectApkg(file)).decks;

    const result = await importApkg(file, { selectedDeckId: deckId, progressMode: 'coarse' });

    expect(result.selectedDeck.deckName).toBe('Synthetic IELTS::Core');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].word).toEqual(expect.objectContaining({
      word: 'mitigate',
      definition: 'to make something less severe',
      definitionZh: '减轻，缓和',
      topic: 'academic',
      examples: [{ en: 'This can mitigate risk.', zh: '这能降低风险。' }],
    }));
    expect(result.rows[0].raw).not.toContain('onerror');
    expect(result.rows[0].progress).toEqual(expect.objectContaining({
      status: 'review',
      reviewCount: 9,
      easeFactor: 2.3,
    }));
  });

  it('previews multiple decks and imports progress only from the selected deck', async () => {
    const file = await createMultiDeckApkgFile();

    const inspected = await inspectApkg(file);

    expect(inspected.decks.map((deck) => deck.deckName)).toEqual([
      'Synthetic IELTS::Core',
      'Synthetic IELTS::Daily',
    ]);
    expect(inspected.decks).toEqual([
      expect.objectContaining({
        deckId: '2001',
        progressPreview: {
          coarseMappedCount: 1,
          reviewedCardCount: 1,
        },
      }),
      expect.objectContaining({
        deckId: '2002',
        progressPreview: {
          coarseMappedCount: 1,
          reviewedCardCount: 1,
        },
      }),
    ]);

    const result = await importApkg(file, { selectedDeckId: '2002', progressMode: 'coarse' });

    expect(result.selectedDeck.deckName).toBe('Synthetic IELTS::Daily');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].word.word).toBe('brisk');
    expect(result.rows[0].word.word).not.toBe('mitigate');
    expect(result.rows[0].progress).toEqual(expect.objectContaining({
      status: 'learning',
      reviewCount: 1,
      easeFactor: 1.9,
    }));
  });

  it('uses explicit field mapping when deck fields are ambiguous', async () => {
    const file = await createAmbiguousFieldApkgFile();
    const [{ deckId }] = (await inspectApkg(file)).decks;

    const result = await importApkg(file, {
      selectedDeckId: deckId,
      fieldMapping: {
        word: 'Answer',
        definition: 'Prompt',
        definitionZh: 'Chinese',
        phonetic: 'Sound',
        partOfSpeech: 'Speech',
        examples: 'Sentence',
        tags: 'Labels',
      },
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].word).toEqual(expect.objectContaining({
      word: 'mitigate',
      definition: 'to make something less severe',
      definitionZh: '减轻，缓和',
      phonetic: '/ˈmɪtɪɡeɪt/',
      partOfSpeech: 'v.',
      topic: 'academic',
      examples: [{ en: 'This can mitigate risk.', zh: '这能降低风险。' }],
    }));
  });

  it('rejects non-apkg files with a size-limit hint', async () => {
    const file = new File(['not an apkg'], 'words.txt', { type: 'text/plain' });

    await expect(inspectApkg(file)).rejects.toThrow('.apkg');
    expect(APKG_LIMIT_TEXT).toBe('50MB');
  });
});
