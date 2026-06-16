import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const OUT_DIR = process.env.LEARNING_FLOW_OUT_DIR || 'product-audit-2026-06-14/learning-flow-regression';
const USER_ID = '00000000-0000-4000-8000-222222222222';

const viewports = [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'mobile', width: 390, height: 844 },
];

const themes = ['light', 'dark', 'system'];

const routes = [
  { name: 'home', path: '/', authState: 'guest' },
  { name: 'login', path: '/login', authState: 'guest' },
  { name: 'register', path: '/register', authState: 'guest' },
  { name: 'pricing', path: '/pricing', authState: 'guest' },
  { name: 'word-of-the-day', path: '/word-of-the-day', authState: 'user' },
  { name: 'today', path: '/dashboard/today', authState: 'user' },
  { name: 'review', path: '/dashboard/review', authState: 'user' },
  { name: 'practice', path: '/dashboard/practice', authState: 'user' },
  { name: 'chat', path: '/dashboard/chat', authState: 'user' },
  { name: 'analytics', path: '/dashboard/analytics', authState: 'user' },
  { name: 'reading', path: '/dashboard/reading', authState: 'user' },
  { name: 'listening', path: '/dashboard/listening', authState: 'user' },
  { name: 'grammar', path: '/dashboard/grammar', authState: 'user' },
  { name: 'pronunciation', path: '/dashboard/pronunciation', authState: 'user' },
  { name: 'writing', path: '/dashboard/writing', authState: 'user' },
  { name: 'vocabulary', path: '/dashboard/vocabulary', authState: 'user' },
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
  dailyGoal: 8,
  preferredTopics: ['daily', 'business'],
  learningStyle: 'visual',
  nativeLanguage: 'zh-CN',
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
  await context.addInitScript(({ user, profile, state, selectedTheme }) => {
    localStorage.setItem('language', 'zh');
    localStorage.setItem('vocabdaily-theme', selectedTheme);
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
  }, { user: localUser, profile: localProfile, state: authState, selectedTheme: theme });
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
    const visibleTextLength = bodyText.replace(/\s+/g, '').length;
    const horizontalOverflowPx = Math.max(0, doc.scrollWidth - doc.clientWidth);
    const hasErrorBoundary = /Something went wrong|Unexpected error|出现错误|错误边界/i.test(bodyText);
    const hasLongSkeleton = /Opening learning task|正在打开学习任务|Loading learning content|正在加载学习内容/i.test(bodyText);
    const isBlank = visibleTextLength < 35 || rect.height < 120;

    return {
      htmlClass: doc.className,
      background,
      visibleTextLength,
      horizontalOverflowPx,
      hasErrorBoundary,
      hasLongSkeleton,
      isBlank,
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
      !result.isBlank &&
      result.horizontalOverflowPx <= 2,
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
    return {
      visibleTextLength: bodyText.replace(/\s+/g, '').length,
      horizontalOverflowPx: Math.max(0, doc.scrollWidth - doc.clientWidth),
      hasLongSkeleton: /Opening learning task|正在打开学习任务|Loading learning content|正在加载学习内容/i.test(bodyText),
      hasErrorBoundary: /Something went wrong|Unexpected error|出现错误|错误边界/i.test(bodyText),
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
      !result.hasErrorBoundary,
  };
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
