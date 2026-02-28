import fs from 'fs';
import os from 'os';
import path from 'path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

async function createUser() {
  const email = `e2e_book_${Date.now()}@example.com`;
  const password = 'Aa123456!';

  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, data: { display_name: 'E2E Book Tester' } }),
  });

  return { email, password, signupOk: response.ok };
}

function buildImportCsv() {
  return [
    'word,definition,definitionZh,level,topic,examples,synonyms',
    'zenith,the highest point,顶点,B2,academic,The project reached its zenith.::项目达到顶点,peak|summit',
    'brisk,quick and active,轻快的,A2,daily,She took a brisk walk.::她快步走路,quick|rapid',
    'invalid_only_word,,无效行,B1,daily,,',
    'brisk,duplicate row should be skipped,重复词,A2,daily,,',
  ].join('\n');
}

function createTempCsv() {
  const filePath = path.join(os.tmpdir(), `wordbook-e2e-${Date.now()}.csv`);
  fs.writeFileSync(filePath, buildImportCsv(), 'utf8');
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
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const logs = [];
  page.on('pageerror', (error) => logs.push(`[pageerror] ${error.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') logs.push(`[console.error] ${msg.text()}`);
  });

  const checks = {
    signupOk: user.signupOk,
    vocabularyPageLoaded: false,
    hasBookManagement: false,
    switchedBook: false,
    importSuccessToast: false,
    importErrorDownload: false,
    importedBookVisible: false,
    importedBookActive: false,
    todayBookBadgeCorrect: false,
    todayHasWords: false,
    todayWordFromImportedBook: false,
    markLearnedWorked: false,
    deleteImportedBookWorked: false,
  };

  let importedBookName = `E2E词书-${Date.now()}`;

  try {
    await login(page, user);

    await page.goto(`${BASE_URL}/dashboard/vocabulary`, { waitUntil: 'domcontentloaded' });
    checks.vocabularyPageLoaded = true;
    await page.waitForTimeout(1200);

    checks.hasBookManagement =
      (await page.locator('text=词书管理').count()) > 0 ||
      (await page.locator('text=Word Book Management').count()) > 0 ||
      (await page.getByRole('button', { name: /导入词书|Import Book/ }).count()) > 0;

    const firstSetCurrentBtn = page.getByRole('button', { name: /设为当前|Set Current/ }).first();
    if ((await firstSetCurrentBtn.count()) > 0) {
      await firstSetCurrentBtn.click();
      await page.waitForTimeout(500);
      checks.switchedBook = true;
    }

    const tempCsv = createTempCsv();

    await page.getByRole('button', { name: '导入词书' }).click();
    await page.locator('#book-name').fill(importedBookName);

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
    await page.locator('#book-file').setInputFiles(tempCsv);
    await page.getByRole('button', { name: '开始导入' }).click();

    await page.waitForTimeout(1500);

    checks.importSuccessToast =
      (await page.locator('text=词书导入成功并已设为当前词书').count()) > 0 ||
      (await page.locator('text=Imported').count()) > 0;

    const maybeDownload = await downloadPromise;
    if (maybeDownload) {
      checks.importErrorDownload = maybeDownload.suggestedFilename().endsWith('.json');
    }

    const importedRow = page.locator('div.border.rounded-lg').filter({ hasText: importedBookName }).first();
    checks.importedBookVisible = (await importedRow.count()) > 0;
    if (checks.importedBookVisible) {
      checks.importedBookActive = (await importedRow.locator('text=当前词书').count()) > 0;
    }

    await page.goto(`${BASE_URL}/dashboard/today`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    checks.todayBookBadgeCorrect = (await page.locator(`text=当前词书：${importedBookName}`).count()) > 0;
    checks.todayHasWords = (await page.locator('h2.text-5xl').count()) > 0;
    if (checks.todayHasWords) {
      const todayWord = (await page.locator('h2.text-5xl').first().innerText()).trim().toLowerCase();
      checks.todayWordFromImportedBook = todayWord === 'zenith' || todayWord === 'brisk';
    }

    if (checks.todayHasWords) {
      const wordCard = page.locator('.perspective-1000').first();
      await wordCard.click();
      await page.waitForTimeout(300);

      const learnBtn = page.getByRole('button', { name: /^学会$/ }).first();
      if ((await learnBtn.count()) > 0) {
        await learnBtn.click();
        await page.waitForTimeout(1000);
        checks.markLearnedWorked = (await page.locator('text=已学会').count()) > 0;
      }
    }

    await page.goto(`${BASE_URL}/dashboard/vocabulary`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const importedDeleteRow = page.locator('div.border.rounded-lg').filter({ hasText: importedBookName }).first();
    if ((await importedDeleteRow.count()) > 0) {
      await importedDeleteRow.getByRole('button', { name: /删除|Delete/ }).first().click();
      await page.waitForTimeout(1200);
      checks.deleteImportedBookWorked = await page.evaluate((bookName) => {
        const raw = localStorage.getItem('vocabdaily_word_books');
        if (!raw) return true;

        const byUser = JSON.parse(raw);
        const allBooks = Object.values(byUser).flat();
        return !allBooks.some((book) => book.name === bookName);
      }, importedBookName);
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const report = {
    baseUrl: BASE_URL,
    user,
    checks,
    logs,
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
