import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const OUT_DIR = 'product-audit-2026-06-14/vocabdaily-learning-ecosystem/ai-coach';
const USER_ID = '00000000-0000-4000-8000-444444444444';

const viewports = [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'mobile', width: 390, height: 844 },
];

const user = {
  id: USER_ID,
  email: 'ai-coach-smoke@example.com',
  displayName: 'Coach Smoke Learner',
  createdAt: '2026-06-16T00:00:00.000Z',
};

const profile = {
  userId: USER_ID,
  cefrLevel: 'B1',
  dailyGoal: 5,
  preferredTopics: ['IELTS', 'daily'],
  learningStyle: 'visual',
  nativeLanguage: 'zh-CN',
};

const sampleWords = [
  {
    id: 'w1',
    word: 'abandon',
    phonetic: '/əˈbændən/',
    partOfSpeech: 'verb',
    definition: 'to leave somebody or something behind',
    definitionZh: '放弃；离开',
    examples: [{ en: 'Do not abandon your study plan after one hard day.', zh: '不要因为一天困难就放弃学习计划。' }],
    synonyms: [],
    antonyms: [],
    collocations: [],
    level: 'B1',
    topic: 'daily',
  },
];

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

async function seedContext(context) {
  const today = new Date().toISOString().split('T')[0];
  await context.addInitScript(({ seededUser, seededProfile, words, day }) => {
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
        dailyGoalOverride: 1,
      },
    }));
    localStorage.setItem('vocabdaily_daily_words', JSON.stringify({
      [seededUser.id]: {
        date: day,
        activeBookId: 'builtin_a1_foundation',
        wordIds: words.map((word) => word.id),
      },
    }));
    localStorage.setItem('vocabdaily_custom_words', JSON.stringify({ [seededUser.id]: words }));
    localStorage.setItem('vocabdaily_progress', JSON.stringify({ [seededUser.id]: [] }));

  }, {
    seededUser: user,
    seededProfile: profile,
    words: sampleWords,
    day: today,
  });
}

async function addSpeechRecognitionMock(context, transcript) {
  await context.addInitScript((mockTranscript) => {
    class FakeSpeechRecognition {
      constructor() {
        this.lang = 'en-US';
        this.continuous = false;
        this.interimResults = false;
        this.maxAlternatives = 1;
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
      }

      start() {
        window.setTimeout(() => {
          this.onresult?.({
            results: {
              0: {
                0: {
                  transcript: mockTranscript,
                  confidence: 0.76,
                },
              },
            },
          });
          this.onend?.();
        }, 80);
      }

      stop() {
        this.onend?.();
      }
    }

    window.SpeechRecognition = FakeSpeechRecognition;
    window.webkitSpeechRecognition = FakeSpeechRecognition;
  }, transcript);
}

async function addPronunciationAiMock(context) {
  await context.addInitScript(() => {
    window.__VOCABDAILY_PRONUNCIATION_ASSESS_MOCK__ = () => ({
      accuracy: 91,
      fluency: 84,
      intonation: 86,
      phonemeIssues: [
        {
          phoneme: 'ʌ',
          word: 'pronunciation',
          severity: 'minor',
          tip: 'Keep the stressed vowel short and centered.',
          tipZh: '重读元音保持短促、居中。',
        },
      ],
    });
  });
}

async function newSeededPage(browser, viewport, options = {}) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  await seedContext(context);
  if (options.speechTranscript) {
    await addSpeechRecognitionMock(context, options.speechTranscript);
  }
  if (options.pronunciationAiMock) {
    await addPronunciationAiMock(context);
  }
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  return { context, page, consoleErrors };
}

function assertNoConsoleErrors(consoleErrors) {
  if (consoleErrors.length > 0) {
    throw new Error(`Console errors: ${consoleErrors.join(' | ')}`);
  }
}

async function runChatHandoff(browser, viewport) {
  const { context, page, consoleErrors } = await newSeededPage(browser, viewport);
  try {
    const prompt = 'Help me recover the word abandon with one hint, one sentence drill, and one review action.';
    const url = `${BASE_URL}/dashboard/chat?dailyPlan=coach-smoke&focus=Due%20review%3A%20abandon&reason=5%20due%20reviews&prompt=${encodeURIComponent(prompt)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    await page.getByText(/Daily plan loaded/i).waitFor({ state: 'visible', timeout: 8000 });
    await page.getByText(/Due review: abandon/i).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: /Use plan/i }).click();
    await page.locator('#chat-input').waitFor({ state: 'visible', timeout: 5000 });
    const inputValue = await page.locator('#chat-input').inputValue();
    if (!inputValue.includes('recover the word abandon')) {
      throw new Error(`Daily plan did not populate composer: ${inputValue}`);
    }
    await page
      .locator('section')
      .filter({ hasText: /Current mode/i })
      .getByText(/^Due$/)
      .waitFor({ state: 'visible', timeout: 5000 });

    await page.screenshot({
      path: path.join(OUT_DIR, 'screenshots', `${viewport.name}-light-chat-handoff.png`),
      fullPage: false,
    });

    assertNoConsoleErrors(consoleErrors);
    return { promptLength: inputValue.length };
  } finally {
    await context.close();
  }
}

async function runWritingFallback(browser, viewport) {
  const { context, page, consoleErrors } = await newSeededPage(browser, viewport);
  try {
    await page.goto(`${BASE_URL}/dashboard/writing`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.getByRole('tab', { name: /IELTS Task 2/i }).click();
    await page.getByPlaceholder(/Start writing here/i).fill(
      'English English English helps work because English is useful. I want to learn it for meetings and study.',
    );
    await page.getByRole('button', { name: /Submit for Grading/i }).click();
    await page.getByText(/Score Breakdown/i).waitFor({ state: 'visible', timeout: 8000 });
    await page.getByText(/Suggestions/i).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByText(/Online feedback unavailable/i).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByText(/Add one clear example/i).waitFor({ state: 'visible', timeout: 5000 });

    await page.screenshot({
      path: path.join(OUT_DIR, 'screenshots', `${viewport.name}-light-writing-local-fallback.png`),
      fullPage: false,
    });

    assertNoConsoleErrors(consoleErrors);
    return { fallback: 'local', suggestionsVisible: true };
  } finally {
    await context.close();
  }
}

async function runPronunciationLocalFallback(browser, viewport) {
  const { context, page, consoleErrors } = await newSeededPage(browser, viewport, {
    speechTranscript: 'pronunciation',
  });
  try {
    await page.goto(`${BASE_URL}/dashboard/pronunciation`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.getByRole('button', { name: /Start Recording|开始录音/i }).click();
    await page.getByText(/Results|结果/i).waitFor({ state: 'visible', timeout: 8000 });
    await page.getByText(/You said|你说的是/i).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByText(/Local analysis only|本地分析/i).waitFor({ state: 'visible', timeout: 5000 });

    await page.screenshot({
      path: path.join(OUT_DIR, 'screenshots', `${viewport.name}-light-pronunciation-local-fallback.png`),
      fullPage: false,
    });

    assertNoConsoleErrors(consoleErrors);
    return { feedback: 'local' };
  } finally {
    await context.close();
  }
}

async function runPronunciationAiFeedback(browser, viewport) {
  const { context, page, consoleErrors } = await newSeededPage(browser, viewport, {
    speechTranscript: 'pronunciation',
    pronunciationAiMock: true,
  });

  try {
    await page.goto(`${BASE_URL}/dashboard/pronunciation`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.getByRole('button', { name: /Start Recording|开始录音/i }).click();
    await page.getByText(/Results|结果/i).waitFor({ state: 'visible', timeout: 8000 });
    await page.getByText(/Phoneme Feedback|音素反馈/i).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByText(/Keep the stressed vowel/i).waitFor({ state: 'visible', timeout: 5000 });
    if (await page.getByText(/Local analysis only|本地分析/i).count()) {
      throw new Error('AI feedback state still showed local-only label');
    }

    await page.screenshot({
      path: path.join(OUT_DIR, 'screenshots', `${viewport.name}-light-pronunciation-ai-feedback.png`),
      fullPage: false,
    });

    assertNoConsoleErrors(consoleErrors);
    return { feedback: 'ai' };
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.mkdir(path.join(OUT_DIR, 'screenshots'), { recursive: true });
  const browser = await chromium.launch({ headless: true, timeout: 45000 });
  const results = [];

  for (const viewport of viewports) {
    await runStep(results, `${viewport.name} chat daily plan handoff`, async () => runChatHandoff(browser, viewport));
    await runStep(results, `${viewport.name} writing local fallback`, async () => runWritingFallback(browser, viewport));
    await runStep(results, `${viewport.name} pronunciation local fallback`, async () => runPronunciationLocalFallback(browser, viewport));
    await runStep(results, `${viewport.name} pronunciation AI feedback`, async () => runPronunciationAiFeedback(browser, viewport));
  }

  await browser.close();

  const summary = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    total: results.length,
    failed: results.filter((result) => !result.passed).length,
    results,
  };

  await fs.writeFile(path.join(OUT_DIR, 'ai-coach-surface-smoke.json'), JSON.stringify(summary, null, 2));

  if (summary.failed > 0) {
    console.error(JSON.stringify(summary, null, 2));
    process.exit(1);
  }

  console.log(`[ai-coach-surface-smoke] ${summary.total} checks passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
