import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const OUT_DIR = process.env.LEARNING_FLOW_OUT_DIR || 'product-audit-2026-06-14/learning-flow-regression';
const USER_ID = '00000000-0000-4000-8000-222222222222';
const THEME_VERSION = '2026-06-workbook-contrast-v6';

const viewports = [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'mobile', width: 390, height: 844 },
];

const themes = ['light', 'dark', 'system'];

const routes = [
  { name: 'home', path: '/', authState: 'guest' },
  { name: 'login', path: '/login', authState: 'guest' },
  { name: 'register', path: '/register', authState: 'guest' },
  { name: 'magic-link', path: '/magic-link', authState: 'guest' },
  { name: 'auth-callback', path: '/auth/callback', authState: 'guest' },
  { name: 'onboarding', path: '/onboarding', authState: 'user' },
  { name: 'pricing', path: '/pricing', authState: 'guest' },
  { name: 'word-of-the-day', path: '/word-of-the-day', authState: 'user' },
  { name: 'today', path: '/dashboard/today', authState: 'user' },
  { name: 'review', path: '/dashboard/review', authState: 'user' },
  { name: 'practice', path: '/dashboard/practice', authState: 'user' },
  { name: 'chat', path: '/dashboard/chat', authState: 'user' },
  { name: 'analytics', path: '/dashboard/analytics', authState: 'user' },
  { name: 'exam', path: '/dashboard/exam', authState: 'user' },
  { name: 'reading', path: '/dashboard/reading', authState: 'user' },
  { name: 'listening', path: '/dashboard/listening', authState: 'user' },
  { name: 'grammar', path: '/dashboard/grammar', authState: 'user' },
  { name: 'pronunciation', path: '/dashboard/pronunciation', authState: 'user' },
  { name: 'writing', path: '/dashboard/writing', authState: 'user' },
  { name: 'vocabulary', path: '/dashboard/vocabulary', authState: 'user' },
  { name: 'learning-path', path: '/dashboard/learning-path', authState: 'user' },
  { name: 'memory', path: '/dashboard/memory', authState: 'user' },
  { name: 'leaderboard', path: '/dashboard/leaderboard', authState: 'user' },
  { name: 'profile', path: '/dashboard/profile', authState: 'user' },
  { name: 'settings', path: '/dashboard/settings', authState: 'user' },
];

const localUser = {
  id: USER_ID,
  email: 'learning-flow@example.com',
  displayName: 'Learning Flow Learner',
  createdAt: '2026-06-14T00:00:00.000Z',
};

const localProfile = {
  userId: USER_ID,
  cefrLevel: 'B1',
  dailyGoal: 4,
  preferredTopics: ['daily', 'business'],
  learningStyle: 'visual',
  nativeLanguage: 'zh-CN',
};

const scenarioWords = [
  {
    id: 'e2e-ielts-alleviate',
    word: 'alleviate',
    phonetic: '/əˈliːvieɪt/',
    partOfSpeech: 'v.',
    definition: 'to make a problem, pressure, or bad situation less severe',
    definitionZh: '缓解；减轻',
    examples: [{ en: 'Investment in public transport can alleviate traffic congestion.', zh: '投资公共交通可以缓解交通拥堵。' }],
    synonyms: [],
    antonyms: [],
    collocations: ['alleviate pressure', 'alleviate poverty', 'alleviate congestion'],
    level: 'B2',
    topic: 'ielts',
  },
  {
    id: 'e2e-ielts-detrimental',
    word: 'detrimental',
    phonetic: '/ˌdetrɪˈmentl/',
    partOfSpeech: 'adj.',
    definition: 'harmful or likely to cause damage',
    definitionZh: '有害的；不利的',
    examples: [{ en: 'Excessive screen time can be detrimental to children’s social development.', zh: '过度屏幕时间可能不利于儿童的社交发展。' }],
    synonyms: [],
    antonyms: [],
    collocations: ['detrimental to health', 'detrimental effect', 'detrimental impact'],
    level: 'C1',
    topic: 'ielts',
  },
  {
    id: 'e2e-ielts-feasible',
    word: 'feasible',
    phonetic: '/ˈfiːzəbl/',
    partOfSpeech: 'adj.',
    definition: 'possible to do and practical enough to consider',
    definitionZh: '可行的；切实可做的',
    examples: [{ en: 'A gradual ban may be more feasible than an immediate ban.', zh: '逐步禁令可能比立即禁令更可行。' }],
    synonyms: [],
    antonyms: [],
    collocations: ['feasible option', 'feasible solution', 'economically feasible'],
    level: 'B2',
    topic: 'ielts',
  },
  {
    id: 'e2e-ielts-constraint',
    word: 'constraint',
    phonetic: '/kənˈstreɪnt/',
    partOfSpeech: 'n.',
    definition: 'a limit or restriction that affects what can be done',
    definitionZh: '限制；约束条件',
    examples: [{ en: 'Budget constraints often shape what schools can provide.', zh: '预算限制常常影响学校能提供什么。' }],
    synonyms: [],
    antonyms: [],
    collocations: ['budget constraint', 'time constraint', 'practical constraint'],
    level: 'B2',
    topic: 'ielts',
  },
];

const scenarioBook = {
  id: 'e2e_ielts_learning_flow_book',
  name: 'IELTS Learning Flow Regression',
  source: 'Playwright seeded IELTS words',
  license: 'Local regression fixture',
  levelRange: ['B2', 'C1'],
  topicTags: ['ielts', 'writing', 'speaking'],
  wordIds: scenarioWords.map((word) => word.id),
  createdAt: '2026-06-14T00:00:00.000Z',
  isBuiltIn: false,
  version: '1.0.0',
};

async function findCachedHeadlessShell() {
  const home = process.env.HOME;
  if (!home) return null;
  const cacheRoot = path.join(home, 'Library', 'Caches', 'ms-playwright');
  let entries = [];
  try {
    entries = await fs.readdir(cacheRoot, { withFileTypes: true });
  } catch {
    return null;
  }

  const candidates = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('chromium_headless_shell-'))
    .map((entry) => entry.name)
    .sort()
    .reverse();
  const subpaths = [
    path.join('chrome-headless-shell-mac-arm64', 'chrome-headless-shell'),
    path.join('chrome-headless-shell-mac-x64', 'chrome-headless-shell'),
    path.join('chrome-headless-shell-linux64', 'chrome-headless-shell'),
    path.join('chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
  ];

  for (const candidate of candidates) {
    for (const subpath of subpaths) {
      const executablePath = path.join(cacheRoot, candidate, subpath);
      try {
        await fs.access(executablePath);
        return executablePath;
      } catch {
        // Continue searching cached shells.
      }
    }
  }
  return null;
}

async function launchBrowser() {
  const options = { headless: true, timeout: 45000 };
  try {
    return await chromium.launch(options);
  } catch (error) {
    const executablePath = await findCachedHeadlessShell();
    if (!executablePath) throw error;
    return chromium.launch({ ...options, executablePath });
  }
}

async function seedContext(context, authState, theme) {
  await context.addInitScript(({ user, profile, state, selectedTheme, words, book, themeVersion }) => {
    localStorage.setItem('language', 'zh');
    localStorage.setItem('vocabdaily-theme', selectedTheme);
    localStorage.setItem('vocabdaily-theme-version', themeVersion);
    if (state !== 'user') {
      localStorage.removeItem('vocabdaily-local-auth-user');
      localStorage.removeItem('supabase_user');
      return;
    }
    localStorage.setItem('vocabdaily-local-auth-user', JSON.stringify(user));
    localStorage.setItem(`vocabdaily-profile-${user.id}`, JSON.stringify(profile));
    localStorage.setItem('supabase_user', JSON.stringify({
      id: user.id,
      email: user.email,
      user_metadata: { display_name: user.displayName },
      created_at: user.createdAt,
    }));
    localStorage.setItem('vocabdaily_custom_words', JSON.stringify({ [user.id]: words }));
    localStorage.setItem('vocabdaily_word_books', JSON.stringify({ [user.id]: [book] }));
    localStorage.setItem('vocabdaily_user_book_selection', JSON.stringify({
      [user.id]: { userId: user.id, activeBookId: book.id, dailyGoalOverride: words.length },
    }));
    localStorage.setItem('vocabdaily_daily_words', JSON.stringify({
      [user.id]: {
        date: new Date().toISOString().slice(0, 10),
        activeBookId: book.id,
        wordIds: words.map((word) => word.id),
      },
    }));
  }, { user: localUser, profile: localProfile, state: authState, selectedTheme: theme, words: scenarioWords, book: scenarioBook, themeVersion: THEME_VERSION });
}

async function inspectPage(page, route, viewport, theme) {
  const response = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(450);

  const screenshotPath = path.join(OUT_DIR, 'screenshots', `${viewport.name}-${theme}-${route.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const bodyText = document.body.innerText || '';
    const rect = document.body.getBoundingClientRect();
    const style = getComputedStyle(document.body);
    const background = style.backgroundColor;
    const backgroundChannels = background.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [255, 255, 255];
    const backgroundBrightness = Math.round(
      (backgroundChannels[0] * 299 + backgroundChannels[1] * 587 + backgroundChannels[2] * 114) / 1000,
    );
    const nearBlackBackground = doc.classList.contains('dark') && backgroundBrightness < 58;
    const visibleTextLength = bodyText.replace(/\s+/g, '').length;
    const horizontalOverflowPx = Math.max(0, doc.scrollWidth - doc.clientWidth);
    const hasErrorBoundary = /Something went wrong|Unexpected error|出现错误|错误边界/i.test(bodyText);
    const hasLongSkeleton = /Opening learning task|正在打开学习任务|Loading learning content|正在加载学习内容/i.test(bodyText);
    const isBlank = visibleTextLength < 35 || rect.height < 120;
    const hasIeltsAnkiEntry = /IELTS Anki 卡片|IELTS Anki cards/i.test(bodyText);
    const hasIeltsAnkiPracticeLink = /练第一张|Practice first card/i.test(bodyText);

    return {
      htmlClass: doc.className,
      background,
      backgroundBrightness,
      nearBlackBackground,
      visibleTextLength,
      horizontalOverflowPx,
      hasErrorBoundary,
      hasLongSkeleton,
      isBlank,
      hasIeltsAnkiEntry,
      hasIeltsAnkiPracticeLink,
    };
  });

  const finalUrl = page.url();
  const redirectedToLogin = route.authState === 'user' && /\/login(?:\?|$)/.test(new URL(finalUrl).pathname + new URL(finalUrl).search);

  return {
    route: route.path,
    name: route.name,
    theme,
    viewport: viewport.name,
    finalUrl,
    httpStatus: response?.status() ?? null,
    screenshotPath,
    ...result,
    redirectedToLogin,
    passed:
      !redirectedToLogin &&
      !result.hasErrorBoundary &&
      !result.hasLongSkeleton &&
      !result.nearBlackBackground &&
      !result.isBlank &&
      result.horizontalOverflowPx <= 2 &&
      (route.name !== 'vocabulary' || (result.hasIeltsAnkiEntry && result.hasIeltsAnkiPracticeLink)),
  };
}

async function inspectFastRouteSwitch(page, viewport, theme) {
  const sequence = ['/dashboard/today', '/dashboard/review', '/dashboard/practice', '/dashboard/chat', '/dashboard/analytics'];
  for (const route of sequence) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(160);
  }
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(700);
  const screenshotPath = path.join(OUT_DIR, 'screenshots', `${viewport.name}-${theme}-fast-route-switch.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const result = await page.evaluate(() => {
    const bodyText = document.body.innerText || '';
    const doc = document.documentElement;
    const background = getComputedStyle(document.body).backgroundColor;
    const backgroundChannels = background.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [255, 255, 255];
    const backgroundBrightness = Math.round(
      (backgroundChannels[0] * 299 + backgroundChannels[1] * 587 + backgroundChannels[2] * 114) / 1000,
    );
    return {
      visibleTextLength: bodyText.replace(/\s+/g, '').length,
      horizontalOverflowPx: Math.max(0, doc.scrollWidth - doc.clientWidth),
      hasLongSkeleton: /Opening learning task|正在打开学习任务|Loading learning content|正在加载学习内容/i.test(bodyText),
      hasErrorBoundary: /Something went wrong|Unexpected error|出现错误|错误边界/i.test(bodyText),
      background,
      backgroundBrightness,
      nearBlackBackground: doc.classList.contains('dark') && backgroundBrightness < 58,
    };
  });

  return {
    name: 'fast-route-switch',
    route: sequence.join(' -> '),
    theme,
    viewport: viewport.name,
    screenshotPath,
    ...result,
    passed:
      result.visibleTextLength >= 35 &&
      result.horizontalOverflowPx <= 2 &&
      !result.hasLongSkeleton &&
      !result.nearBlackBackground &&
      !result.hasErrorBoundary,
  };
}

async function openPracticeQuestion(page) {
  await page.goto(`${BASE_URL}/dashboard/practice`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.getByRole('button', { name: /开始$|^Start$|用这个开始|Start with this|选择此模式|Choose this mode/i }).first().click();
  await page.getByRole('button', { name: /开始练习|Start practice/i }).first().click();
  await page.waitForSelector('.question-title, h2');

  const questionText = await page.locator('.question-title, h2').filter({ hasText: /What does|Complete/i }).first().textContent();
  const match = questionText?.match(/"([^"]+)"/);
  const currentWord = match
    ? scenarioWords.find((word) => word.word === match[1])
    : null;
  if (!currentWord) {
    throw new Error(`Could not determine current practice word from question: ${questionText || '(empty)'}`);
  }

  const wrongDefinitions = scenarioWords
    .filter((word) => word.id !== currentWord.id)
    .map((word) => word.definition);

  return { currentWord, wrongDefinitions };
}

async function inspectPracticeRetryFlow(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
  });
  await seedContext(context, 'user', 'light');
  const page = await context.newPage();

  try {
    const { currentWord, wrongDefinitions } = await openPracticeQuestion(page);
    await page.getByLabel(wrongDefinitions[0], { exact: true }).click();
    await page.getByRole('button', { name: /检查答案|Check answer/i }).click();
    await page.waitForTimeout(250);
    const firstWrongPath = path.join(OUT_DIR, 'screenshots', 'desktop-light-practice-first-wrong.png');
    await page.screenshot({ path: firstWrongPath, fullPage: false });

    const firstWrongBody = await page.locator('body').innerText();
    const firstWrongPassed =
      /还没对|Not yet|再试一次|Try once more|Try again/i.test(firstWrongBody) &&
      !/正确答案|Correct answer|^Answer$|^答案$/im.test(firstWrongBody);

    await page.getByLabel(wrongDefinitions[1], { exact: true }).click();
    await page.getByRole('button', { name: /再试一次|Try again/i }).click();
    await page.waitForTimeout(250);
    const secondWrongPath = path.join(OUT_DIR, 'screenshots', 'desktop-light-practice-second-wrong.png');
    await page.screenshot({ path: secondWrongPath, fullPage: false });

    const secondWrongBody = await page.locator('body').innerText();
    const secondWrongPassed =
      /正确答案|Correct answer|^Answer$|^答案$/im.test(secondWrongBody) &&
      secondWrongBody.includes(currentWord.definition);

    return [
      {
        name: 'practice-first-wrong-hidden-answer',
        route: '/dashboard/practice',
        theme: 'light',
        viewport: 'desktop',
        screenshotPath: firstWrongPath,
        passed: firstWrongPassed,
        visibleTextLength: firstWrongBody.replace(/\s+/g, '').length,
        note: 'First wrong attempt keeps correct-answer label hidden.',
      },
      {
        name: 'practice-second-wrong-reveals-answer',
        route: '/dashboard/practice',
        theme: 'light',
        viewport: 'desktop',
        screenshotPath: secondWrongPath,
        passed: secondWrongPassed,
        visibleTextLength: secondWrongBody.replace(/\s+/g, '').length,
        note: 'Second wrong attempt reveals correct-answer label and definition.',
      },
    ];
  } catch (error) {
    return [{
      name: 'practice-retry-flow',
      route: '/dashboard/practice',
      theme: 'light',
      viewport: 'desktop',
      error: error instanceof Error ? error.message : String(error),
      passed: false,
    }];
  } finally {
    await context.close();
  }
}

async function inspectListeningRetryFlow(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
  });
  await seedContext(context, 'user', 'light');
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/dashboard/practice`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.getByRole('button', { name: /听写|听力测验|Listening Quiz/i }).click();
    await page.getByRole('button', { name: /开始练习|Start practice/i }).first().click();
    await page.getByPlaceholder(/输入你听到的单词|Type what you hear/i).fill('wrong');
    await page.getByRole('button', { name: /检查答案|Check answer/i }).click();
    await page.waitForTimeout(250);
    const firstWrongPath = path.join(OUT_DIR, 'screenshots', 'desktop-light-listening-first-wrong.png');
    await page.screenshot({ path: firstWrongPath, fullPage: false });

    const firstWrongBody = await page.locator('body').innerText();
    const firstWrongPassed =
      /再听一次|Listen once more|Listen again/i.test(firstWrongBody) &&
      !/答案是|Expected:|Answer:|正确答案|Correct answer|^Answer$|^答案$/im.test(firstWrongBody);

    await page.getByPlaceholder(/输入你听到的单词|Type what you hear/i).fill('still wrong');
    await page.getByRole('button', { name: /再试一次|Try again/i }).click();
    await page.waitForTimeout(250);
    const secondWrongPath = path.join(OUT_DIR, 'screenshots', 'desktop-light-listening-second-wrong.png');
    await page.screenshot({ path: secondWrongPath, fullPage: false });

    const secondWrongBody = await page.locator('body').innerText();
    const revealedSeededWord = scenarioWords.some((word) =>
      new RegExp(`(答案是|Expected|Answer)\\s*[:：]?\\s*${word.word}`, 'i').test(secondWrongBody),
    );

    return [
      {
        name: 'listening-first-wrong-hidden-expected',
        route: '/dashboard/practice',
        theme: 'light',
        viewport: 'desktop',
        screenshotPath: firstWrongPath,
        passed: firstWrongPassed,
        visibleTextLength: firstWrongBody.replace(/\s+/g, '').length,
        note: 'First listening miss keeps expected word hidden.',
      },
      {
        name: 'listening-second-wrong-reveals-expected',
        route: '/dashboard/practice',
        theme: 'light',
        viewport: 'desktop',
        screenshotPath: secondWrongPath,
        passed: revealedSeededWord,
        visibleTextLength: secondWrongBody.replace(/\s+/g, '').length,
        note: 'Second listening miss reveals the expected seeded word.',
      },
    ];
  } catch (error) {
    return [{
      name: 'listening-retry-flow',
      route: '/dashboard/practice',
      theme: 'light',
      viewport: 'desktop',
      error: error instanceof Error ? error.message : String(error),
      passed: false,
    }];
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.mkdir(path.join(OUT_DIR, 'screenshots'), { recursive: true });
  const browser = await launchBrowser();
  const results = [];

  try {
    for (const viewport of viewports) {
      for (const theme of themes) {
        for (const route of routes) {
          const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            deviceScaleFactor: 1,
          });
          await seedContext(context, route.authState, theme);
          const page = await context.newPage();
          try {
            results.push(await inspectPage(page, route, viewport, theme));
          } catch (error) {
            results.push({
              name: route.name,
              route: route.path,
              theme,
              viewport: viewport.name,
              error: error instanceof Error ? error.message : String(error),
              passed: false,
            });
          } finally {
            await context.close();
          }
        }

        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: 1,
        });
        await seedContext(context, 'user', theme);
        const page = await context.newPage();
        try {
          results.push(await inspectFastRouteSwitch(page, viewport, theme));
        } catch (error) {
          results.push({
            name: 'fast-route-switch',
            route: 'dashboard sequence',
            theme,
            viewport: viewport.name,
            error: error instanceof Error ? error.message : String(error),
            passed: false,
          });
        } finally {
          await context.close();
        }
      }
    }

    results.push(...await inspectPracticeRetryFlow(browser));
    results.push(...await inspectListeningRetryFlow(browser));
  } finally {
    await browser.close();
  }

  const summary = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    total: results.length,
    failed: results.filter((result) => !result.passed).length,
    results,
  };
  await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

  const failed = results.filter((result) => !result.passed);
  if (failed.length > 0) {
    console.error(`[learning-flow-regression] ${failed.length}/${results.length} checks failed`);
    failed.slice(0, 12).forEach((failure) => {
      console.error(`- ${failure.viewport}/${failure.theme}/${failure.name}: ${failure.error || failure.route}`);
    });
    process.exitCode = 1;
    return;
  }

  console.log(`[learning-flow-regression] ${results.length} checks passed`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
