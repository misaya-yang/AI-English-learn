import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

const fakeUser = {
  id: 'e2e-user-001',
  email: 'e2e@example.com',
  created_at: new Date().toISOString(),
  user_metadata: { display_name: 'E2E User' },
};

async function newPage(browser, { auth = false, interceptLoginFailure = false } = {}) {
  const context = await browser.newContext();

  if (auth) {
    await context.addInitScript((user) => {
      localStorage.setItem('supabase_access_token', 'e2e-access-token');
      localStorage.setItem('supabase_refresh_token', 'e2e-refresh-token');
      localStorage.setItem('supabase_user', JSON.stringify(user));
    }, fakeUser);
  }

  if (interceptLoginFailure) {
    await context.route('**/auth/v1/token?grant_type=password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
          msg: 'Invalid login credentials',
        }),
      });
    });
  }

  const page = await context.newPage();
  const logs = [];

  page.on('pageerror', (error) => {
    logs.push(`[pageerror] ${error.message}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      logs.push(`[console.error] ${msg.text()}`);
    }
  });

  return { context, page, logs };
}

async function checkRoute(browser, route, options = {}) {
  const { context, page, logs } = await newPage(browser, options);
  const result = {
    route,
    finalUrl: '',
    httpStatus: null,
    errorCount: 0,
    errors: [],
  };

  try {
    const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1200);

    result.httpStatus = response?.status() ?? null;
    result.finalUrl = page.url();
    result.errorCount = logs.length;
    result.errors = [...logs];
  } catch (error) {
    result.errorCount += 1;
    result.errors.push(`[exception] ${error instanceof Error ? error.message : String(error)}`);
  }

  await context.close();
  return result;
}

async function testDemoLoginFlow(browser) {
  const { context, page, logs } = await newPage(browser, { interceptLoginFailure: true });
  const result = {
    case: 'demo-login-with-forced-auth-failure',
    finalUrl: '',
    successToastVisible: false,
    errorToastVisible: false,
    errors: [],
  };

  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.getByRole('button', { name: '使用演示账号' }).click();
    await page.waitForTimeout(1500);

    result.finalUrl = page.url();
    result.successToastVisible = (await page.locator('text=欢迎使用演示账号！').count()) > 0;
    result.errorToastVisible =
      (await page.locator('text=登录失败').count()) > 0 ||
      (await page.locator('text=电子邮箱或密码错误').count()) > 0 ||
      (await page.locator('text=演示账号登录失败').count()) > 0;
    result.errors = [...logs];
  } catch (error) {
    result.errors.push(`[exception] ${error instanceof Error ? error.message : String(error)}`);
  }

  await context.close();
  return result;
}

async function testRegisterValidation(browser) {
  const { context, page, logs } = await newPage(browser);
  const result = {
    case: 'register-password-confirm-validation',
    mismatchHintVisible: false,
    blockedSubmit: false,
    errors: [],
  };

  try {
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 20000 });

    await page.fill('input[name="displayName"]', 'E2E Test');
    await page.fill('input[name="email"]', `e2e-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'Aa123456!');
    await page.fill('input[name="confirmPassword"]', 'Aa123456?');

    result.mismatchHintVisible = (await page.locator('text=密码不一致').count()) > 0;

    // Even if terms are checked, submit should remain disabled because confirm password mismatches.
    await page.locator('#terms').click();
    const submitDisabled = await page.getByRole('button', { name: '创建账号' }).isDisabled();
    result.blockedSubmit = submitDisabled;
    result.errors = [...logs];
  } catch (error) {
    result.errors.push(`[exception] ${error instanceof Error ? error.message : String(error)}`);
  }

  await context.close();
  return result;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  const publicRoutes = ['/', '/word-of-the-day', '/pricing', '/login', '/register'];
  const dashboardRoutes = [
    '/dashboard/today',
    '/dashboard/review',
    '/dashboard/practice',
    '/dashboard/vocabulary',
    '/dashboard/analytics',
    '/dashboard/chat',
    '/dashboard/settings',
    '/dashboard/profile',
  ];

  const results = [];

  for (const route of publicRoutes) {
    results.push(await checkRoute(browser, route));
  }

  results.push(await checkRoute(browser, '/dashboard/today'));

  for (const route of dashboardRoutes) {
    results.push(await checkRoute(browser, route, { auth: true }));
  }

  const demoLoginResult = await testDemoLoginFlow(browser);
  const registerValidationResult = await testRegisterValidation(browser);

  await browser.close();

  const report = {
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString(),
    routeChecks: results,
    scenarioChecks: [demoLoginResult, registerValidationResult],
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
