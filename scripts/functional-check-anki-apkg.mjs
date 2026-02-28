import fs from 'fs';
import os from 'os';
import path from 'path';
import { chromium } from '@playwright/test';
import initSqlJs from 'sql.js';
import { zipSync, strToU8 } from 'fflate';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

async function createUser() {
  const email = `e2e_anki_${Date.now()}@example.com`;
  const password = 'Aa123456!';

  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, data: { display_name: 'E2E Anki' } }),
  });

  return { email, password, signupOk: response.ok };
}

async function createSampleApkg() {
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
    '1': { name: 'Default' },
    '2001': { name: 'Anki E2E::Deck One' },
    '2002': { name: 'Anki E2E::Deck Two' },
  };

  const models = {
    '100': {
      name: 'Basic',
      flds: [{ name: 'Front' }, { name: 'Back' }, { name: 'DefinitionZh' }, { name: 'Topic' }],
    },
  };

  db.run(
    `INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      0,
      0,
      0,
      11,
      0,
      0,
      0,
      '{}',
      JSON.stringify(models),
      JSON.stringify(decks),
      '{}',
      '{}',
    ],
  );

  const note1Fields = ['zenith', 'the highest point', '顶点', 'academic'].join('\u001f');
  const note2Fields = ['brisk', 'quick and active', '轻快的', 'daily'].join('\u001f');

  db.run(
    `INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [10001, 'guid_note_1', 100, 0, 0, ' e2e ', note1Fields, 'zenith', 0, 0, ''],
  );
  db.run(
    `INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [10002, 'guid_note_2', 100, 0, 0, ' e2e ', note2Fields, 'brisk', 0, 0, ''],
  );

  db.run(
    `INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [20001, 10001, 2001, 0, 0, 0, 2, 2, 0, 6, 2300, 9, 0, 0, 0, 0, 0, ''],
  );
  db.run(
    `INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [20002, 10002, 2002, 0, 0, 0, 2, 2, 0, 2, 2100, 3, 0, 0, 0, 0, 0, ''],
  );

  const dbBytes = db.export();
  db.close();

  const zipBytes = zipSync({
    'collection.anki21': dbBytes,
    media: strToU8('{}'),
  });

  const filePath = path.join(os.tmpdir(), `anki-e2e-${Date.now()}.apkg`);
  fs.writeFileSync(filePath, Buffer.from(zipBytes));

  return filePath;
}

async function login(page, user) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.getByRole('button', { name: /^登录$/ }).click();
  await page.waitForURL('**/dashboard/**', { timeout: 30000 });
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }

  const user = await createUser();
  const apkgPath = await createSampleApkg();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const logs = [];
  page.on('pageerror', (error) => logs.push(`[pageerror] ${error.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      logs.push(`[console.error] ${msg.text()}`);
    }
  });

  const checks = {
    signupOk: user.signupOk,
    parsedDecks: 0,
    importedBookCreated: false,
    todayBookMatched: false,
    importedWordVisible: false,
    progressMapped: false,
  };

  try {
    await login(page, user);

    await page.goto(`${BASE_URL}/dashboard/vocabulary`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const bookName = `Anki导入-${Date.now()}`;

    await page.getByRole('button', { name: /导入 Anki/ }).click();
    await page.locator('#anki-file').setInputFiles(apkgPath);
    await page.locator('#anki-book-name').fill(bookName);
    await page.getByRole('button', { name: /1\. 解析卡组/ }).click();
    await page.waitForFunction(
      () => {
        const trigger = document.querySelector('#anki-deck-select');
        return !!trigger && !trigger.hasAttribute('disabled');
      },
      { timeout: 20000 },
    );

    await page.locator('#anki-deck-select').click();
    checks.parsedDecks = await page.locator('[role="option"]').count();
    await page.getByRole('option', { name: /Anki E2E::Deck One/ }).click();

    await page.getByRole('button', { name: /2\. 导入所选 deck/ }).click();
    await page.waitForTimeout(1600);

    checks.importedBookCreated = (await page.locator('div.border.rounded-lg').filter({ hasText: bookName }).count()) > 0;

    await page.goto(`${BASE_URL}/dashboard/today`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    checks.todayBookMatched = (await page.locator(`text=当前词书：${bookName}`).count()) > 0;
    checks.importedWordVisible = (await page.locator('h2.text-5xl').filter({ hasText: /zenith/i }).count()) > 0;

    const progressRaw = await page.evaluate(() => localStorage.getItem('vocabdaily_progress'));
    if (progressRaw) {
      const progress = JSON.parse(progressRaw);
      const userProgress = Object.values(progress)[0];
      if (Array.isArray(userProgress)) {
        checks.progressMapped = userProgress.some((item) => item.status === 'review' && item.reviewCount >= 9);
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  console.log(
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        user,
        apkgPath,
        checks,
        logs,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
