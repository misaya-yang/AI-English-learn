import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const OUT_DIR = process.env.UI_REGRESSION_OUT_DIR || 'product-ui-audit-2026-06-14/regression-wave5';
const USER_ID = '00000000-0000-4000-8000-111111111111';

const viewports = [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'mobile', width: 390, height: 844 },
];

const routes = [
  { name: 'home', path: '/', auth: false, authState: 'guest' },
  { name: 'word-of-day', path: '/word-of-the-day', auth: false, authState: 'user' },
  { name: 'demo', path: '/demo', auth: false, authState: 'guest' },
  { name: 'pricing', path: '/pricing', auth: false, authState: 'guest' },
  { name: 'terms', path: '/terms', auth: false, authState: 'guest' },
  { name: 'privacy', path: '/privacy', auth: false, authState: 'guest' },
  { name: 'login', path: '/login', auth: false, authState: 'guest' },
  { name: 'register', path: '/register', auth: false, authState: 'guest' },
  { name: 'magic-link', path: '/magic-link', auth: false, authState: 'guest' },
  { name: 'onboarding', path: '/onboarding', auth: false, authState: 'user' },
  { name: 'today', path: '/dashboard/today', auth: true, authState: 'user' },
  { name: 'review', path: '/dashboard/review', auth: true, authState: 'user' },
  { name: 'practice', path: '/dashboard/practice', auth: true, authState: 'user' },
  { name: 'reading', path: '/dashboard/reading', auth: true, authState: 'user' },
  { name: 'listening', path: '/dashboard/listening', auth: true, authState: 'user' },
  { name: 'grammar', path: '/dashboard/grammar', auth: true, authState: 'user' },
  { name: 'pronunciation', path: '/dashboard/pronunciation', auth: true, authState: 'user' },
  { name: 'writing', path: '/dashboard/writing', auth: true, authState: 'user' },
  { name: 'learning-path', path: '/dashboard/learning-path', auth: true, authState: 'user' },
  { name: 'leaderboard', path: '/dashboard/leaderboard', auth: true, authState: 'user' },
  { name: 'chat', path: '/dashboard/chat', auth: true, authState: 'user' },
  { name: 'analytics', path: '/dashboard/analytics', auth: true, authState: 'user' },
  { name: 'memory', path: '/dashboard/memory', auth: true, authState: 'user' },
  { name: 'vocabulary', path: '/dashboard/vocabulary', auth: true, authState: 'user' },
  { name: 'exam', path: '/dashboard/exam', auth: true, authState: 'user' },
  { name: 'settings', path: '/dashboard/settings', auth: true, authState: 'user' },
  { name: 'profile', path: '/dashboard/profile', auth: true, authState: 'user' },
];

const localUser = {
  id: USER_ID,
  email: 'ui-regression@example.com',
  displayName: 'UI Regression Learner',
  createdAt: '2026-06-14T00:00:00.000Z',
};

const localProfile = {
  userId: USER_ID,
  cefrLevel: 'B1',
  dailyGoal: 10,
  preferredTopics: ['daily', 'business'],
  learningStyle: 'visual',
  nativeLanguage: 'zh-CN',
};

async function findCachedHeadlessShell() {
  const cacheRoot = path.join(process.env.HOME || '', 'Library', 'Caches', 'ms-playwright');
  if (!process.env.HOME) return null;

  let entries = [];
  try {
    entries = await fs.readdir(cacheRoot, { withFileTypes: true });
  } catch {
    return null;
  }

  const shellSubpaths = [
    path.join('chrome-headless-shell-mac-arm64', 'chrome-headless-shell'),
    path.join('chrome-headless-shell-mac-x64', 'chrome-headless-shell'),
    path.join('chrome-headless-shell-linux64', 'chrome-headless-shell'),
    path.join('chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
  ];

  const versions = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('chromium_headless_shell-'))
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const version of versions) {
    for (const shellSubpath of shellSubpaths) {
      const executablePath = path.join(cacheRoot, version, shellSubpath);
      try {
        await fs.access(executablePath);
        return executablePath;
      } catch {
        // Try the next cached browser candidate.
      }
    }
  }

  return null;
}

async function launchBrowser() {
  const launchOptions = { headless: true, timeout: 45000 };
  if (process.env.PLAYWRIGHT_CHANNEL) {
    return chromium.launch({ ...launchOptions, channel: process.env.PLAYWRIGHT_CHANNEL });
  }

  try {
    return await chromium.launch(launchOptions);
  } catch (error) {
    const executablePath = await findCachedHeadlessShell();
    if (executablePath) {
      return chromium.launch({ ...launchOptions, executablePath });
    }
    throw error;
  }
}

async function gotoPage(page, url) {
  try {
    return await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (error) {
    await page.waitForTimeout(800);
    return page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
}

async function seedContext(context, authState) {
  await context.addInitScript(({ user, profile, state }) => {
    localStorage.setItem('language', 'zh');
    localStorage.setItem('vocabdaily-theme', 'light');
    if (state !== 'user') {
      localStorage.removeItem('vocabdaily-local-auth-user');
      localStorage.removeItem(`vocabdaily-profile-${user.id}`);
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
  }, { user: localUser, profile: localProfile, state: authState });
}

async function inspectPage(page, route, viewport) {
  const url = `${BASE_URL}${route.path}`;
  const response = await gotoPage(page, url);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(900);

  const screenshotPath = path.join(OUT_DIR, 'screenshots', `${viewport.name}-${route.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const bodyText = document.body.innerText || '';
    const h1 = document.querySelector('h1')?.textContent?.trim() || '';
    const horizontalOverflowPx = Math.max(0, doc.scrollWidth - doc.clientWidth);
    const visibleTextLength = bodyText.replace(/\s+/g, '').length;
    const errorBoundary = /Something went wrong|出现错误|Unexpected error|错误边界/i.test(bodyText);

    return {
      h1,
      bodySample: bodyText.replace(/\s+/g, ' ').trim().slice(0, 220),
      horizontalOverflowPx,
      visibleTextLength,
      errorBoundary,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  });

  const redirectedToLogin = route.auth && /\/login(?:\?|$)/.test(new URL(page.url()).pathname + new URL(page.url()).search);

  return {
    route: route.path,
    name: route.name,
    viewport: viewport.name,
    finalUrl: page.url(),
    httpStatus: response?.status() ?? null,
    screenshotPath,
    ...result,
    redirectedToLogin,
    passed:
      !redirectedToLogin &&
      !result.errorBoundary &&
      result.visibleTextLength >= 40 &&
      result.horizontalOverflowPx <= 2,
  };
}

async function captureRouteFailure(page, route, viewport, error) {
  const screenshotPath = path.join(OUT_DIR, 'screenshots', `${viewport.name}-${route.name}-failed.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});

  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const bodyText = document.body.innerText || '';
    return {
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      bodySample: bodyText.replace(/\s+/g, ' ').trim().slice(0, 220),
      horizontalOverflowPx: Math.max(0, doc.scrollWidth - doc.clientWidth),
      visibleTextLength: bodyText.replace(/\s+/g, '').length,
      errorBoundary: /Something went wrong|出现错误|Unexpected error|错误边界/i.test(bodyText),
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  }).catch(() => ({
    h1: '',
    bodySample: '',
    horizontalOverflowPx: 0,
    visibleTextLength: 0,
    errorBoundary: false,
    scrollWidth: 0,
    clientWidth: 0,
  }));

  return {
    route: route.path,
    name: route.name,
    viewport: viewport.name,
    finalUrl: page.url(),
    httpStatus: null,
    screenshotPath,
    ...result,
    redirectedToLogin: false,
    error: error instanceof Error ? error.message : String(error),
    passed: false,
  };
}

async function newSeededPage(browser, viewport, authState = 'user') {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  await seedContext(context, authState);
  const page = await context.newPage();
  return { context, page };
}

async function captureScenario(page, viewport, name, expectedPattern) {
  await page.waitForTimeout(4200);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelectorAll('*').forEach((element) => {
      if (element.scrollTop > 0) {
        element.scrollTop = 0;
      }
    });
  });
  await page.waitForTimeout(300);
  const screenshotPath = path.join(OUT_DIR, 'screenshots', `${viewport.name}-scenario-${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const result = await page.evaluate((source) => {
    const pattern = new RegExp(source);
    const doc = document.documentElement;
    const bodyText = document.body.innerText || '';
    return {
      bodySample: bodyText.replace(/\s+/g, ' ').trim().slice(0, 260),
      horizontalOverflowPx: Math.max(0, doc.scrollWidth - doc.clientWidth),
      visibleTextLength: bodyText.replace(/\s+/g, '').length,
      errorBoundary: /Something went wrong|出现错误|Unexpected error|错误边界/i.test(bodyText),
      expectedVisible: pattern.test(bodyText),
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  }, expectedPattern.source);

  return {
    name,
    viewport: viewport.name,
    finalUrl: page.url(),
    screenshotPath,
    ...result,
    passed:
      result.expectedVisible &&
      !result.errorBoundary &&
      result.visibleTextLength >= 40 &&
      result.horizontalOverflowPx <= 2,
  };
}

async function captureScenarioFailure(page, viewport, name, error) {
  const screenshotPath = path.join(OUT_DIR, 'screenshots', `${viewport.name}-scenario-${name}-failed.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});

  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const bodyText = document.body.innerText || '';
    return {
      bodySample: bodyText.replace(/\s+/g, ' ').trim().slice(0, 260),
      horizontalOverflowPx: Math.max(0, doc.scrollWidth - doc.clientWidth),
      visibleTextLength: bodyText.replace(/\s+/g, '').length,
      errorBoundary: /Something went wrong|出现错误|Unexpected error|错误边界/i.test(bodyText),
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  }).catch(() => ({
    bodySample: '',
    horizontalOverflowPx: 0,
    visibleTextLength: 0,
    errorBoundary: false,
    scrollWidth: 0,
    clientWidth: 0,
  }));

  return {
    name,
    viewport: viewport.name,
    finalUrl: page.url(),
    screenshotPath,
    ...result,
    error: error instanceof Error ? error.message : String(error),
    expectedVisible: false,
    passed: false,
  };
}

async function answerVisibleQuestionCards(page, textAnswer = 'practice answer') {
  const interactiveCards = page.locator('div.rounded-xl.border.p-4').filter({ has: page.locator('button, input') });
  const questionCards = (await interactiveCards.count())
    ? interactiveCards
    : page.locator('div.rounded-xl').filter({ hasText: /Q\d+\./ });
  const cardCount = await questionCards.count();

  for (let index = 0; index < cardCount; index += 1) {
    const card = questionCards.nth(index);
    const input = card.locator('input').first();
    if (await input.count()) {
      await input.fill(textAnswer);
      continue;
    }

    await card.locator('button').first().click();
  }
}

const scenarioDefinitions = [
  {
    name: 'reading-completion',
    run: async (page, viewport) => {
      await gotoPage(page, `${BASE_URL}/dashboard/reading`);
      await page.getByRole('button', { name: /开始推荐文章|Start recommended passage/ }).click();
      await answerVisibleQuestionCards(page, 'hippocampus');
      await page.getByRole('button', { name: /提交答案/ }).click();
      await page.getByText('阅读复盘').waitFor({ timeout: 10000 });
      return captureScenario(page, viewport, 'reading-completion', /阅读复盘|Reading recap/);
    },
  },
  {
    name: 'listening-completion',
    run: async (page, viewport) => {
      await gotoPage(page, `${BASE_URL}/dashboard/listening`);
      await page.getByRole('button', { name: /开始推荐听力|Start recommended audio/ }).click();
      await page.getByRole('button', { name: /开始答题|Start Questions/ }).click();
      await answerVisibleQuestionCards(page, '15');
      await page.getByRole('button', { name: /提交答案/ }).click();
      await page.getByText('听力复盘').waitFor({ timeout: 10000 });
      return captureScenario(page, viewport, 'listening-completion', /听力复盘|Listening recap/);
    },
  },
  {
    name: 'grammar-completion',
    run: async (page, viewport) => {
      await gotoPage(page, `${BASE_URL}/dashboard/grammar`);
      await page.getByRole('button', { name: /开始推荐规则练习/ }).click();
      const answers = ['a', 'The', 'the', 'an'];
      for (let index = 0; index < answers.length; index += 1) {
        await page.locator('input').nth(index).fill(answers[index]);
      }
      await page.getByRole('button', { name: /检查答案/ }).click();
      await page.getByText('语法复盘').waitFor({ timeout: 10000 });
      return captureScenario(page, viewport, 'grammar-completion', /语法复盘|Grammar recap/);
    },
  },
  {
    name: 'writing-completion',
    run: async (page, viewport) => {
      await gotoPage(page, `${BASE_URL}/dashboard/writing`);
      await page.getByPlaceholder('在这里开始写作...').fill(
        'Today I practiced English writing because I want to express ideas clearly and build a reliable daily learning habit.',
      );
      await page.getByRole('button', { name: /提交评分/ }).click();
      await page.getByText('写作复盘').waitFor({ timeout: 15000 });
      return captureScenario(page, viewport, 'writing-completion', /写作复盘|Writing recap/);
    },
  },
  {
    name: 'pronunciation-completion',
    run: async (page, viewport) => {
      await page.addInitScript(() => {
        class FakeSpeechRecognition {
          lang = 'en-US';
          continuous = false;
          interimResults = false;
          maxAlternatives = 1;
          onresult = null;
          onerror = null;
          onend = null;

          start() {
            window.setTimeout(() => {
              this.onresult?.({
                results: {
                  0: {
                    0: {
                      transcript: 'pronunciation',
                      confidence: 0.92,
                    },
                  },
                },
              });
              this.onend?.();
            }, 250);
          }

          stop() {
            this.onend?.();
          }
        }

        window.SpeechRecognition = FakeSpeechRecognition;
        window.webkitSpeechRecognition = FakeSpeechRecognition;
      });

      await gotoPage(page, `${BASE_URL}/dashboard/pronunciation`);
      await page.getByRole('button', { name: /开始录音|Start recording/ }).click();
      await page.getByText('发音复盘').waitFor({ timeout: 15000 });
      return captureScenario(page, viewport, 'pronunciation-completion', /发音复盘|Pronunciation recap/);
    },
  },
];

async function main() {
  await fs.mkdir(path.join(OUT_DIR, 'screenshots'), { recursive: true });

  const browser = await launchBrowser();
  const report = {
    baseUrl: BASE_URL,
    outDir: OUT_DIR,
    timestamp: new Date().toISOString(),
    checks: [],
    scenarios: [],
  };

  try {
    for (const viewport of viewports) {
      for (const route of routes) {
        const { context, page } = await newSeededPage(browser, viewport, route.authState || (route.auth ? 'user' : 'guest'));
        try {
          report.checks.push(await inspectPage(page, route, viewport));
        } catch (error) {
          report.checks.push(await captureRouteFailure(page, route, viewport, error));
        }
        await context.close();
      }

      for (const scenario of scenarioDefinitions) {
        const { context, page } = await newSeededPage(browser, viewport, 'user');
        try {
          report.scenarios.push(await scenario.run(page, viewport));
        } catch (error) {
          report.scenarios.push(await captureScenarioFailure(page, viewport, scenario.name, error));
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  const summaryPath = path.join(OUT_DIR, 'summary.json');
  await fs.writeFile(summaryPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));

  if (
    report.checks.some((check) => !check.passed) ||
    report.scenarios.some((scenario) => !scenario.passed)
  ) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
