import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const OUT_DIR = 'product-audit-2026-06-14/vocabdaily-learning-ecosystem/daily-loop';
const USER_ID = '00000000-0000-4000-8000-333333333333';
const ACTIVE_BOOK_ID = 'builtin_a1_foundation';

const viewports = [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'mobile', width: 390, height: 844 },
];

const user = {
  id: USER_ID,
  email: 'daily-loop-smoke@example.com',
  displayName: 'Daily Loop Smoke Learner',
  createdAt: '2026-06-16T00:00:00.000Z',
};

const profile = {
  userId: USER_ID,
  cefrLevel: 'A1',
  dailyGoal: 3,
  preferredTopics: ['daily'],
  learningStyle: 'visual',
  nativeLanguage: 'en',
};

const definitions = {
  abandon: 'to leave somebody, especially somebody you are responsible for, with no intention of returning',
  age: 'the number of years somebody has lived; to become older',
  answer: 'something that you say, write or do to react to a question or situation',
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

async function seedContext(context, dailyWordIds) {
  const today = new Date().toISOString().split('T')[0];
  await context.addInitScript(({ seededUser, seededProfile, wordIds, day }) => {
    localStorage.setItem('language', 'en');
    localStorage.setItem('vocabdaily-theme', 'light');
    localStorage.setItem('vocabdaily-local-auth-user', JSON.stringify(seededUser));
    localStorage.setItem('supabase_user', JSON.stringify({
      id: seededUser.id,
      email: seededUser.email,
      user_metadata: { display_name: seededUser.displayName },
      created_at: seededUser.createdAt,
    }));
    localStorage.setItem('vocabdaily_profiles', JSON.stringify({ [seededUser.id]: seededProfile }));
    localStorage.setItem(`vocabdaily-profile-${seededUser.id}`, JSON.stringify(seededProfile));
    localStorage.setItem('vocabdaily_user_book_selection', JSON.stringify({
      [seededUser.id]: {
        userId: seededUser.id,
        activeBookId: 'builtin_a1_foundation',
        dailyGoalOverride: wordIds.length,
      },
    }));
    localStorage.setItem('vocabdaily_daily_words', JSON.stringify({
      [seededUser.id]: {
        date: day,
        activeBookId: 'builtin_a1_foundation',
        wordIds,
      },
    }));
    localStorage.setItem('vocabdaily_progress', JSON.stringify({ [seededUser.id]: [] }));
  }, { seededUser: user, seededProfile: profile, wordIds: dailyWordIds, day: today });
}

async function newSeededPage(browser, viewport, dailyWordIds) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  await seedContext(context, dailyWordIds);
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  return { context, page, consoleErrors };
}

async function startMode(page, modeName) {
  await page.goto(`${BASE_URL}/dashboard/practice`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.getByRole('button', { name: new RegExp(modeName, 'i') }).first().click();
  await page.getByRole('button', { name: /Start practice/i }).first().click();
}

async function currentQuizWord(page) {
  const question = await page.getByRole('heading', { name: /What does/i }).innerText();
  const match = question.match(/"([^"]+)"/);
  if (!match) throw new Error(`Could not parse current quiz word from: ${question}`);
  return match[1].toLowerCase();
}

async function quizOptions(page) {
  const options = await page.locator('label[for^="option-"]').allInnerTexts();
  return options.map((option) => option.trim()).filter(Boolean);
}

async function answerChoice(page, answer, buttonName) {
  await page.getByLabel(answer, { exact: true }).click();
  await page.getByRole('button', { name: buttonName }).click();
}

async function runChoiceRetryScenario(browser, viewport) {
  const { context, page, consoleErrors } = await newSeededPage(browser, viewport, ['w1', 'w32', 'w77']);
  try {
    await startMode(page, 'Multiple Choice');
    const word = await currentQuizWord(page);
    const correct = definitions[word];
    if (!correct) throw new Error(`No definition fixture for quiz word: ${word}`);
    const options = await quizOptions(page);
    const wrong = options.find((option) => option !== correct);
    if (!wrong) throw new Error('No wrong option found');

    await answerChoice(page, wrong, /Check answer/i);
    await page.getByText(/Not yet/i).waitFor({ state: 'visible', timeout: 5000 });
    if (await page.getByText(/Correct answer/i).count()) {
      throw new Error('Correct answer heading leaked after first wrong choice');
    }
    await page.screenshot({
      path: path.join(OUT_DIR, 'screenshots', `${viewport.name}-light-practice-first-wrong.png`),
      fullPage: false,
    });

    await answerChoice(page, correct, /Try again/i);
    await page.getByText(/Recovered after retry/i).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByText(/First-try accuracy 0%/i).waitFor({ state: 'visible', timeout: 5000 });
    await page.screenshot({
      path: path.join(OUT_DIR, 'screenshots', `${viewport.name}-light-practice-recovered.png`),
      fullPage: false,
    });

    if (consoleErrors.length > 0) throw new Error(`Console errors: ${consoleErrors.join(' | ')}`);
    return { word };
  } finally {
    await context.close();
  }
}

async function runChoiceRevealScenario(browser, viewport) {
  const { context, page, consoleErrors } = await newSeededPage(browser, viewport, ['w1', 'w32', 'w77']);
  try {
    await startMode(page, 'Multiple Choice');
    const word = await currentQuizWord(page);
    const correct = definitions[word];
    if (!correct) throw new Error(`No definition fixture for quiz word: ${word}`);
    const wrongOptions = (await quizOptions(page)).filter((option) => option !== correct);
    if (wrongOptions.length < 2) throw new Error('Not enough wrong options found');

    await answerChoice(page, wrongOptions[0], /Check answer/i);
    await page.getByText(/Not yet/i).waitFor({ state: 'visible', timeout: 5000 });
    await answerChoice(page, wrongOptions[1], /Try again/i);
    await page.getByText(/Correct answer/i).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByText(correct, { exact: true }).first().waitFor({ state: 'visible', timeout: 5000 });
    await page.screenshot({
      path: path.join(OUT_DIR, 'screenshots', `${viewport.name}-light-practice-revealed.png`),
      fullPage: false,
    });

    if (consoleErrors.length > 0) throw new Error(`Console errors: ${consoleErrors.join(' | ')}`);
    return { word };
  } finally {
    await context.close();
  }
}

async function runListeningScenario(browser, viewport) {
  const { context, page, consoleErrors } = await newSeededPage(browser, viewport, ['w1']);
  try {
    await startMode(page, 'Listening Quiz');
    const input = page.getByPlaceholder(/Type what you hear/i);

    await input.fill('wrong');
    await input.press('Enter');
    await page.getByText(/Listen once more/i).first().waitFor({ state: 'visible', timeout: 5000 });
    if (await page.getByText(/Expected:/i).count()) {
      throw new Error('Expected answer leaked after first wrong listening attempt');
    }
    await page.screenshot({
      path: path.join(OUT_DIR, 'screenshots', `${viewport.name}-light-listening-first-wrong.png`),
      fullPage: false,
    });

    await input.fill('still wrong');
    await input.press('Enter');
    await page.getByText(/Correct answer/i).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByText(/Expected: abandon/i).waitFor({ state: 'visible', timeout: 5000 });
    await page.screenshot({
      path: path.join(OUT_DIR, 'screenshots', `${viewport.name}-light-listening-revealed.png`),
      fullPage: false,
    });

    if (consoleErrors.length > 0) throw new Error(`Console errors: ${consoleErrors.join(' | ')}`);
    return { expected: 'abandon' };
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.mkdir(path.join(OUT_DIR, 'screenshots'), { recursive: true });
  const browser = await chromium.launch({ headless: true, timeout: 45000 });
  const results = [];

  for (const viewport of viewports) {
    await runStep(results, `${viewport.name} choice first wrong and recovered`, async () => {
      return runChoiceRetryScenario(browser, viewport);
    });
    await runStep(results, `${viewport.name} choice second wrong reveal`, async () => {
      return runChoiceRevealScenario(browser, viewport);
    });
    await runStep(results, `${viewport.name} listening retry and reveal`, async () => {
      return runListeningScenario(browser, viewport);
    });
  }

  await browser.close();

  const summary = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    activeBookId: ACTIVE_BOOK_ID,
    total: results.length,
    failed: results.filter((result) => !result.passed).length,
    results,
  };

  await fs.writeFile(path.join(OUT_DIR, 'practice-attempt-smoke.json'), JSON.stringify(summary, null, 2));

  if (summary.failed > 0) {
    console.error(JSON.stringify(summary, null, 2));
    process.exit(1);
  }

  console.log(`[practice-attempt-smoke] ${summary.total} checks passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
