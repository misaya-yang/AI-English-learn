import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4174';
const E2E_EMAIL = process.env.E2E_EMAIL || '';
const E2E_PASSWORD = process.env.E2E_PASSWORD || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zjkbktdmwencnouwfrij.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0_pU0AO93wz-7Bmt6xROJg_stLwrT0h';
const E2E_REPORT_PATH = process.env.E2E_REPORT_PATH || 'functional-report-smoke.json';
const HEADLESS = process.env.E2E_HEADLESS !== 'false';

const publicRoutes = ['/', '/pricing', '/login', '/register', '/word-of-the-day'];

const nowIso = () => new Date().toISOString();

const createErrorCollector = (page) => {
  const logs = [];

  page.on('pageerror', (error) => {
    logs.push(`[pageerror] ${error.message}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      logs.push(`[console.error] ${msg.text()}`);
    }
  });

  return logs;
};

const prepareCredentials = async () => {
  if (E2E_EMAIL && E2E_PASSWORD) {
    return { email: E2E_EMAIL, password: E2E_PASSWORD, source: 'env' };
  }

  const email = `e2e_smoke_${Date.now()}@example.com`;
  const password = 'Aa123456!';

  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      data: { display_name: 'E2E Smoke' },
    }),
  });

  if (!response.ok) {
    return null;
  }

  return { email, password, source: 'signup' };
};

const checkPublicRoute = async (browser, route) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const logs = createErrorCollector(page);

  let status = null;
  let finalUrl = '';

  try {
    const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(800);
    status = response?.status() ?? null;
    finalUrl = page.url();
  } finally {
    await context.close();
  }

  return {
    route,
    status,
    finalUrl,
    errorCount: logs.length,
    errors: logs,
  };
};

const loginWithCredentials = async (page, email, password) => {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await Promise.all([
    page.waitForURL('**/dashboard/**', { timeout: 30000 }),
    page.locator('button[type="submit"]').click(),
  ]);
};

const runAuthSmoke = async (browser, credentials) => {
  const authReport = {
    enabled: Boolean(credentials),
    credentialsSource: credentials?.source || 'none',
    loginOk: false,
    chat: {
      aiStatus: null,
      fallbackVisible: false,
      requestTimedOut: false,
      sessionHistoryVisible: false,
    },
    practice: {
      writingQuotaResolved: false,
    },
    pricing: {
      stripeUrl: '',
      stripeUrlMalformed: false,
      alipayUrl: '',
    },
    errors: [],
  };

  if (!authReport.enabled) {
    return authReport;
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  const logs = createErrorCollector(page);

  try {
    await loginWithCredentials(page, credentials.email, credentials.password);
    authReport.loginOk = true;

    await page.goto(`${BASE_URL}/dashboard/chat`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const prompt = `e2e smoke ${Date.now()} give me 2 collocations with bilingual examples`;
    await page.fill('textarea', prompt);

    const aiResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/functions/v1/ai-chat') &&
        response.request().method() === 'POST',
      { timeout: 60000 },
    );

    await page.keyboard.press('Enter');

    try {
      const aiResponse = await aiResponsePromise;
      authReport.chat.aiStatus = aiResponse.status();
    } catch {
      authReport.chat.requestTimedOut = true;
    }

    await page.waitForTimeout(3000);
    const bodyText = (await page.textContent('body')) || '';
    authReport.chat.fallbackVisible = /local fallback mode|AI gateway unavailable/i.test(bodyText);
    authReport.chat.sessionHistoryVisible = /条消息|messages/i.test(bodyText);

    await page.goto(`${BASE_URL}/dashboard/practice`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.getByRole('button', { name: /Writing Practice|写作练习/i }).click();

    for (let i = 0; i < 20; i += 1) {
      const text = (await page.textContent('body')) || '';
      if (/AI feedback left:\s*\d+/.test(text)) {
        authReport.practice.writingQuotaResolved = true;
        break;
      }
      await page.waitForTimeout(500);
    }

    await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.getByRole('button', { name: /Checkout with Stripe/i }).click();
    await page.waitForURL('**/pricing?**', { timeout: 30000 });
    authReport.pricing.stripeUrl = page.url();
    authReport.pricing.stripeUrlMalformed = /\?checkout=success\?checkout=success/.test(page.url());

    await page.getByRole('button', { name: /Checkout with Alipay/i }).click();
    await page.waitForURL('**provider=alipay**', { timeout: 30000 });
    authReport.pricing.alipayUrl = page.url();
  } catch (error) {
    authReport.errors.push(error instanceof Error ? error.message : String(error));
  } finally {
    authReport.errors.push(...logs);
    await context.close();
  }

  return authReport;
};

const main = async () => {
  const browser = await chromium.launch({ headless: HEADLESS });
  const credentials = await prepareCredentials();
  const report = {
    timestamp: nowIso(),
    baseUrl: BASE_URL,
    authCredentialsSource: credentials?.source || 'none',
    publicChecks: [],
    authChecks: null,
  };

  try {
    for (const route of publicRoutes) {
      report.publicChecks.push(await checkPublicRoute(browser, route));
    }
    report.authChecks = await runAuthSmoke(browser, credentials);
  } finally {
    await browser.close();
  }

  await fs.writeFile(E2E_REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));

  const publicFailed = report.publicChecks.some((check) => !check.status || check.status >= 400);
  const auth = report.authChecks;
  const authFailed = Boolean(
    auth &&
    auth.enabled &&
    (
      !auth.loginOk ||
      auth.chat.aiStatus !== 200 ||
      auth.chat.fallbackVisible ||
      auth.chat.requestTimedOut ||
      !auth.practice.writingQuotaResolved ||
      auth.pricing.stripeUrlMalformed
    ),
  );

  if (publicFailed || authFailed) {
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
