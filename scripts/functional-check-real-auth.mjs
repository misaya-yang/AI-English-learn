import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zjkbktdmwencnouwfrij.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0_pU0AO93wz-7Bmt6xROJg_stLwrT0h';

async function createUser() {
  const email = `e2e_real_${Date.now()}@example.com`;
  const password = 'Aa123456!';

  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, data: { display_name: 'E2E Real' } }),
  });

  return { email, password, signupOk: response.ok };
}

async function main() {
  const user = await createUser();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allErrors = [];
  page.on('pageerror', (error) => {
    allErrors.push(`[pageerror] ${error.message}`);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      allErrors.push(`[console.error] ${msg.text()}`);
    }
  });

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.getByRole('button', { name: /^登录$/ }).click();
  await page.waitForURL('**/dashboard/**', { timeout: 15000 });

  const urlAfterLogin = page.url();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const urlAfterReload = page.url();

  const routes = [
    '/dashboard/today',
    '/dashboard/review',
    '/dashboard/practice',
    '/dashboard/vocabulary',
    '/dashboard/analytics',
    '/dashboard/chat',
    '/dashboard/settings',
    '/dashboard/profile',
  ];

  const routeChecks = [];
  for (const route of routes) {
    const before = allErrors.length;
    const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    routeChecks.push({
      route,
      finalUrl: page.url(),
      httpStatus: response?.status() ?? null,
      errorCount: allErrors.length - before,
      errors: allErrors.slice(before),
    });
  }

  // Chat interaction smoke test
  await page.goto(`${BASE_URL}/dashboard/chat`, { waitUntil: 'domcontentloaded' });
  await page.fill('textarea', 'Please explain resilient in simple English.');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6000);
  const userMessageVisible = (await page.locator('text=Please explain resilient in simple English.').count()) > 0;
  const fallbackVisible = (await page.locator('text=Sorry, I encountered an error').count()) > 0;

  await browser.close();

  console.log(JSON.stringify({
    baseUrl: BASE_URL,
    user,
    urlAfterLogin,
    urlAfterReload,
    routeChecks,
    chatSmoke: {
      userMessageVisible,
      fallbackVisible,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
