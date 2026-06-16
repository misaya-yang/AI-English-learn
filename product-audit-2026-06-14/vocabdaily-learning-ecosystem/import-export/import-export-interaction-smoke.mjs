import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import initSqlJs from 'sql.js';
import { chromium } from '@playwright/test';
import { zipSync, strToU8 } from 'fflate';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const OUT_DIR = 'product-audit-2026-06-14/vocabdaily-learning-ecosystem/import-export';
const USER_ID = '00000000-0000-4000-8000-444444444444';

const user = {
  id: USER_ID,
  email: 'import-export-smoke@example.com',
  displayName: 'Import Export Smoke Learner',
  createdAt: '2026-06-16T00:00:00.000Z',
};

function pass(name, extra = {}) {
  return { name, passed: true, ...extra };
}

function fail(name, error) {
  return { name, passed: false, error: error instanceof Error ? error.message : String(error) };
}

async function runStep(results, name, fn) {
  try {
    results.push(pass(name, await fn()));
  } catch (error) {
    results.push(fail(name, error));
  }
}

async function writeCsvFixture() {
  const csv = [
    'word,definition,definitionZh,level,topic,examples,synonyms',
    'zenith,the highest point,顶点,B2,academic,The project reached its zenith.::项目达到顶点,peak|summit',
    'brisk,quick and active,轻快的,A2,daily,She took a brisk walk.::她快步走路,quick|rapid',
    'brisk,duplicate row should be skipped,重复词,A2,daily,,',
    'invalid_only_word,,无效行,B1,daily,,',
  ].join('\n');
  const filePath = path.join(os.tmpdir(), `vle02-wordbook-${Date.now()}.csv`);
  await fs.writeFile(filePath, csv, 'utf8');
  return filePath;
}

async function writeApkgFixture() {
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

  const decks = { '3001': { name: 'VLE02 Synthetic::Core' } };
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
    'mitigate',
    'to make something less severe',
    '减轻，缓和',
    'academic',
    'This can mitigate risk.::这能降低风险。',
  ].join('\u001f');

  db.run(
    `INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [31001, 'guid_vle02_note_1', 100, 0, 0, ' ielts ', fields, 'mitigate', 0, 0, ''],
  );
  db.run(
    `INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [32001, 31001, 3001, 0, 0, 0, 2, 2, 0, 6, 2300, 9, 0, 0, 0, 0, 0, ''],
  );

  const zipBytes = zipSync({
    'collection.anki21': db.export(),
    media: strToU8('{}'),
  });
  db.close();

  const filePath = path.join(os.tmpdir(), `vle02-anki-${Date.now()}.apkg`);
  await fs.writeFile(filePath, Buffer.from(zipBytes));
  return filePath;
}

async function main() {
  await fs.mkdir(path.join(OUT_DIR, 'screenshots'), { recursive: true });
  await fs.mkdir(path.join(OUT_DIR, 'downloads'), { recursive: true });

  const csvPath = await writeCsvFixture();
  const apkgPath = await writeApkgFixture();
  const browser = await chromium.launch({ headless: true, timeout: 45000 });
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
  });

  await context.addInitScript(({ seededUser }) => {
    localStorage.setItem('language', 'zh');
    localStorage.setItem('vocabdaily-theme', 'light');
    localStorage.setItem('vocabdaily-local-auth-user', JSON.stringify(seededUser));
    localStorage.setItem('supabase_user', JSON.stringify({
      id: seededUser.id,
      email: seededUser.email,
      user_metadata: { display_name: seededUser.displayName },
      created_at: seededUser.createdAt,
    }));
    localStorage.setItem(`vocabdaily-profile-${seededUser.id}`, JSON.stringify({
      userId: seededUser.id,
      cefrLevel: 'B2',
      dailyGoal: 8,
      preferredTopics: ['academic', 'daily'],
      learningStyle: 'visual',
      nativeLanguage: 'zh-CN',
    }));
  }, { seededUser: user });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  const results = [];
  await page.goto(`${BASE_URL}/dashboard/vocabulary`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);

  const csvBookName = `CSV导入-${Date.now()}`;
  await runStep(results, 'csv preview shows rows, duplicates, errors, and samples', async () => {
    await page.getByRole('button', { name: '导入词书' }).click();
    const csvDialog = page.getByRole('dialog', { name: '导入词书' });
    await page.locator('#book-name').fill(csvBookName);
    await page.locator('#book-file').setInputFiles(csvPath);
    await csvDialog.getByText('可导入').waitFor({ state: 'visible', timeout: 5000 });
    await csvDialog.getByText('重复').waitFor({ state: 'visible', timeout: 5000 });
    await csvDialog.locator('p').filter({ hasText: /^错误$/ }).waitFor({ state: 'visible', timeout: 5000 });
    await csvDialog.getByText('zenith').waitFor({ state: 'visible', timeout: 5000 });
  });

  await page.screenshot({
    path: path.join(OUT_DIR, 'screenshots', 'desktop-light-csv-preview.png'),
    fullPage: false,
  });

  await runStep(results, 'csv import creates active book and error report download', async () => {
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.getByRole('button', { name: '开始导入' }).click();
    const download = await downloadPromise;
    await download.saveAs(path.join(OUT_DIR, 'downloads', download.suggestedFilename()));
    await page.waitForTimeout(700);
    const state = await page.evaluate((id) => {
      const books = JSON.parse(localStorage.getItem('vocabdaily_word_books') || '{}')[id] || [];
      const selection = JSON.parse(localStorage.getItem('vocabdaily_user_book_selection') || '{}')[id];
      return { books, selection };
    }, USER_ID);
    const imported = state.books.find((book) => book.name === csvBookName);
    if (!imported) throw new Error('CSV imported book missing');
    if (state.selection?.activeBookId !== imported.id) throw new Error('CSV imported book is not active');
    await page.getByText('词书已导入').waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('link', { name: '今天学这本' }).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('link', { name: '复习到期词' }).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: '导出备份' }).waitFor({ state: 'visible', timeout: 5000 });
    return { errorReport: download.suggestedFilename(), wordCount: imported.wordIds.length };
  });

  await runStep(results, 'export filtered vocabulary downloads csv and anki txt', async () => {
    await page.getByRole('button', { name: /^导出$/ }).click();
    const csvDownloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.getByRole('button', { name: 'CSV（含学习进度）' }).click();
    const csvDownload = await csvDownloadPromise;
    await csvDownload.saveAs(path.join(OUT_DIR, 'downloads', csvDownload.suggestedFilename()));

    await page.getByRole('button', { name: /^导出$/ }).click();
    const ankiDownloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.getByRole('button', { name: 'Anki 导入格式（TXT）' }).click();
    const ankiDownload = await ankiDownloadPromise;
    await ankiDownload.saveAs(path.join(OUT_DIR, 'downloads', ankiDownload.suggestedFilename()));

    return {
      csv: csvDownload.suggestedFilename(),
      anki: ankiDownload.suggestedFilename(),
    };
  });

  const apkgBookName = `APKG导入-${Date.now()}`;
  await runStep(results, 'apkg preview shows deck fields samples confidence and progress mode', async () => {
    await page.getByRole('button', { name: /导入 Anki/ }).click();
    const ankiDialog = page.getByLabel('Anki 卡组导入 (.apkg)');
    await page.locator('#anki-file').setInputFiles(apkgPath);
    await page.locator('#anki-book-name').fill(apkgBookName);
    await page.getByRole('button', { name: /1\. 解析卡组/ }).click();
    await ankiDialog.getByText('导入预览').waitFor({ state: 'visible', timeout: 20000 });
    await ankiDialog.getByText('映射信心 high').waitFor({ state: 'visible', timeout: 5000 });
    await ankiDialog.getByText('Front').waitFor({ state: 'visible', timeout: 5000 });
    await ankiDialog.getByText('mitigate').waitFor({ state: 'visible', timeout: 5000 });
    await ankiDialog.getByText('字段映射').waitFor({ state: 'visible', timeout: 5000 });
    await ankiDialog.getByRole('combobox', { name: '词面' }).waitFor({ state: 'visible', timeout: 5000 });
    await ankiDialog.getByRole('combobox', { name: '英文释义' }).waitFor({ state: 'visible', timeout: 5000 });
    await ankiDialog
      .getByRole('combobox', { name: '进度映射' })
      .locator('span')
      .filter({ hasText: /粗略导入/ })
      .waitFor({ state: 'visible', timeout: 5000 });
  });

  await page.screenshot({
    path: path.join(OUT_DIR, 'screenshots', 'desktop-light-apkg-preview.png'),
    fullPage: false,
  });

  await runStep(results, 'apkg import creates active book and mapped progress', async () => {
    await page.getByRole('button', { name: /2\. 导入所选 deck/ }).click();
    await page.waitForTimeout(1000);
    const state = await page.evaluate((id) => {
      const books = JSON.parse(localStorage.getItem('vocabdaily_word_books') || '{}')[id] || [];
      const selection = JSON.parse(localStorage.getItem('vocabdaily_user_book_selection') || '{}')[id];
      const progress = JSON.parse(localStorage.getItem('vocabdaily_progress') || '{}')[id] || [];
      return { books, selection, progress };
    }, USER_ID);
    const imported = state.books.find((book) => book.name === apkgBookName);
    if (!imported) throw new Error('APKG imported book missing');
    if (state.selection?.activeBookId !== imported.id) throw new Error('APKG imported book is not active');
    if (!state.progress.some((row) => row.status === 'review' && row.reviewCount >= 9)) {
      throw new Error('APKG mapped progress missing');
    }
    await page.getByText('Anki 已导入').waitFor({ state: 'visible', timeout: 5000 });
    return { wordCount: imported.wordIds.length };
  });

  await browser.close();

  const summary = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    csvPath,
    apkgPath,
    total: results.length,
    failed: results.filter((result) => !result.passed).length,
    consoleErrors,
    results,
  };
  await fs.writeFile(path.join(OUT_DIR, 'interaction-smoke.json'), JSON.stringify(summary, null, 2));

  if (summary.failed > 0 || consoleErrors.length > 0) {
    console.error(JSON.stringify(summary, null, 2));
    process.exit(1);
  }

  console.log(`[import-export-interaction-smoke] ${summary.total} checks passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
