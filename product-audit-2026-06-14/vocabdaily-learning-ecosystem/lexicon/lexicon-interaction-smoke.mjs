import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const OUT_DIR = 'product-audit-2026-06-14/vocabdaily-learning-ecosystem/lexicon';
const USER_ID = '00000000-0000-4000-8000-333333333333';

const user = {
  id: USER_ID,
  email: 'lexicon-smoke@example.com',
  displayName: 'Lexicon Smoke Learner',
  createdAt: '2026-06-16T00:00:00.000Z',
};

const customWord = {
  id: 'custom-smoke-mitigate',
  word: 'mitigate',
  phonetic: '/ˈmɪtɪɡeɪt/',
  partOfSpeech: 'v.',
  definition: 'to make something less severe or harmful',
  definitionZh: '减轻，缓和',
  examples: [{ en: 'The policy may mitigate climate risk.', zh: '这项政策可能会减轻气候风险。' }],
  synonyms: ['reduce', 'ease'],
  antonyms: ['worsen'],
  collocations: ['mitigate risk', 'mitigate impact'],
  level: 'B2',
  topic: 'academic',
};

const customBook = {
  id: 'custom-smoke-book',
  name: 'IELTS Smoke Book',
  source: 'VLE-01 browser smoke seed',
  license: 'Synthetic test data',
  levelRange: ['B2', 'C1'],
  topicTags: ['academic', 'ielts'],
  wordIds: [customWord.id],
  createdAt: '2026-06-16T00:00:00.000Z',
  isBuiltIn: false,
  version: '2026.06',
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

async function main() {
  await fs.mkdir(path.join(OUT_DIR, 'screenshots'), { recursive: true });
  const browser = await chromium.launch({ headless: true, timeout: 45000 });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
  });
  await context.addInitScript(({ seededUser, word, book }) => {
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
      preferredTopics: ['academic', 'ielts'],
      learningStyle: 'visual',
      nativeLanguage: 'zh-CN',
    }));
    localStorage.setItem('vocabdaily_custom_words', JSON.stringify({ [seededUser.id]: [word] }));
    localStorage.setItem('vocabdaily_word_books', JSON.stringify({ [seededUser.id]: [book] }));
    localStorage.setItem('vocabdaily_user_book_selection', JSON.stringify({
      [seededUser.id]: { userId: seededUser.id, activeBookId: book.id },
    }));
    localStorage.setItem('vocabdaily_progress', JSON.stringify({
      [seededUser.id]: [{
        userId: seededUser.id,
        wordId: word.id,
        status: 'review',
        reviewCount: 5,
        lastReviewed: '2026-06-15T00:00:00.000Z',
        nextReview: '2026-06-16T00:00:00.000Z',
        easeFactor: 2.1,
        correctCount: 1,
        incorrectCount: 3,
      }],
    }));
  }, { seededUser: user, word: customWord, book: customBook });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push(error.message);
  });

  const results = [];
  await page.goto(`${BASE_URL}/dashboard/vocabulary`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);

  await runStep(results, 'initial lexicon content visible', async () => {
    await page.getByText('mitigate').first().waitFor({ state: 'visible', timeout: 5000 });
    return { url: page.url() };
  });

  await runStep(results, 'search filters to seeded word', async () => {
    await page.getByPlaceholder(/搜索单词/).fill('mitigate');
    await page.getByText('mitigate').first().waitFor({ state: 'visible', timeout: 3000 });
  });

  await runStep(results, 'status filter keeps review word visible', async () => {
    await page.getByRole('combobox').nth(0).click();
    await page.getByRole('option', { name: /复习中/ }).click();
    await page.getByText('mitigate').first().waitFor({ state: 'visible', timeout: 3000 });
  });

  await runStep(results, 'topic filter keeps academic word visible', async () => {
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: /Academic/ }).click();
    await page.getByText('mitigate').first().waitFor({ state: 'visible', timeout: 3000 });
  });

  await runStep(results, 'pronunciation control is clickable', async () => {
    await page.getByLabel(/播放 mitigate 发音/).first().click();
  });

  await runStep(results, 'practice link carries lexicon source and word id', async () => {
    const href = await page.getByRole('link', { name: /用这个词练一次/ }).getAttribute('href');
    if (!href?.includes('/dashboard/practice?source=lexicon') || !href.includes('wordId=custom-smoke-mitigate')) {
      throw new Error(`Unexpected practice href: ${href}`);
    }
    return { href };
  });

  await runStep(results, 'active book can switch without console errors', async () => {
    await page.getByRole('button', { name: '设为当前' }).first().click();
    await page.waitForTimeout(250);
    const selection = await page.evaluate((id) => JSON.parse(localStorage.getItem('vocabdaily_user_book_selection') || '{}')[id], USER_ID);
    if (!selection?.activeBookId || selection.activeBookId === customBook.id) {
      throw new Error(`Active book did not switch: ${JSON.stringify(selection)}`);
    }
    return { activeBookId: selection.activeBookId };
  });

  await runStep(results, 'export dialog opens', async () => {
    await page.getByRole('button', { name: '导出' }).click();
    await page.getByRole('button', { name: /CSV（仅单词）/ }).waitFor({ state: 'visible', timeout: 3000 });
    await page.keyboard.press('Escape');
  });

  await runStep(results, 'custom word detail delete control is accessible', async () => {
    await page.getByRole('button', { name: /打开 mitigate 词条详情/ }).click();
    await page.getByRole('button', { name: /删除自定义词 mitigate/ }).waitFor({ state: 'visible', timeout: 3000 });
  });

  await page.screenshot({
    path: path.join(OUT_DIR, 'screenshots', 'desktop-light-vocabulary-interaction-smoke.png'),
    fullPage: false,
  });

  await browser.close();

  const summary = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
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

  console.log(`[lexicon-interaction-smoke] ${summary.total} checks passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
