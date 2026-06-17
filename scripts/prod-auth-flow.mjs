#!/usr/bin/env node
// prod-auth-flow.mjs — browser-backed production auth flow regression.
//
// Creates synthetic accounts against the visible production UI, completes
// onboarding, logs back in from fresh browser contexts, and records whether
// Supabase profile bootstrap endpoints still return users/profiles 4xx errors.
//
// Usage:
//   npm run smoke:prod:auth-flow
//   AUTH_FLOW_ACCOUNTS=2 BASE_URL=https://www.uuedu.online npm run smoke:prod:auth-flow

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = (process.env.BASE_URL || 'https://www.uuedu.online').replace(/\/$/, '');
const ACCOUNT_COUNT = Number(process.env.AUTH_FLOW_ACCOUNTS || 3);
const VIEWPORT = { width: 1440, height: 960 };
const OUT_DIR =
  process.env.AUTH_FLOW_OUT_DIR ||
  path.join(
    process.cwd(),
    'product-audit-2026-06-17',
    `prod-auth-flow-${new Date().toISOString().replace(/[:.]/g, '-')}`,
  );

const DB_BOOTSTRAP_RE = /api\/supabase\/rest\/v1\/(users|profiles|user_learning_profiles)/;
const ROUTES = ['/dashboard/today', '/dashboard/practice', '/dashboard/review'];

fs.mkdirSync(OUT_DIR, { recursive: true });

const maskEmail = (email) => email.replace(/(.{3}).+(@.+)/, '$1***$2');

const sanitizeUrl = (url) =>
  String(url).replace(/([?&](?:apikey|access_token|refresh_token|token)=)[^&]+/gi, '$1[redacted]');

const shortText = (text, length = 240) => String(text).slice(0, length).replace(/\s+/g, ' ');

function attachCollectors(page, bucket) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') bucket.consoleErrors.push(msg.text());
    if (msg.type() === 'warning') bucket.consoleWarnings.push(msg.text());
  });

  page.on('pageerror', (error) => {
    bucket.pageErrors.push(error.message);
  });

  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.startsWith('data:') || url.includes('chrome-extension://')) return;
    bucket.failedRequests.push({
      method: request.method(),
      url: sanitizeUrl(url),
      failure: request.failure()?.errorText || 'unknown',
      dbBootstrap: DB_BOOTSTRAP_RE.test(url),
    });
  });

  page.on('response', (response) => {
    const url = response.url();
    if (response.status() >= 400 && /uuedu|supabase|auth\/v1|rest\/v1/i.test(url)) {
      bucket.badResponses.push({
        status: response.status(),
        url: sanitizeUrl(url),
        dbBootstrap: DB_BOOTSTRAP_RE.test(url),
      });
    }
  });
}

async function waitUsableDashboard(page, label) {
  await page.waitForURL(/\/dashboard\//, { timeout: 60_000 });

  let settled = false;
  try {
    await page.waitForFunction(
      () => {
        const text = document.body.innerText || '';
        return (
          /今天|今日|复习|练习|VocabDaily/.test(text) &&
          !/正在打开学习任务|正在确认登录状态/.test(text) &&
          text.length > 160
        );
      },
      { timeout: 70_000 },
    );
    settled = true;
  } catch {
    settled = false;
  }

  const body = await page.locator('body').innerText({ timeout: 10_000 }).catch(() => '');
  if (!settled) {
    throw new Error(`${label} dashboard did not settle. url=${page.url()} text=${shortText(body, 360)}`);
  }

  return {
    url: page.url(),
    text: shortText(body, 500),
  };
}

async function fillRegistration(page, account) {
  await page.locator('input[name="displayName"]').fill(account.name);
  await page.locator('input[type="email"]').fill(account.email);
  await page.locator('input[type="password"]').nth(0).fill(account.password);
  await page.locator('input[type="password"]').nth(1).fill(account.password);

  const terms = page.locator('button[role="checkbox"]').first();
  if ((await terms.getAttribute('aria-checked')) !== 'true') {
    await terms.click();
  }

  await page.locator('button[type="submit"]').filter({ hasText: /创建账号|Create account|Sign up/i }).click();
}

async function completeOnboarding(page, index) {
  await page.waitForURL(/\/onboarding/, { timeout: 60_000 });
  await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});
  await page.screenshot({ path: path.join(OUT_DIR, `account-${index}-onboarding.png`), fullPage: true });

  await page.getByRole('button', { name: /B2|Upper Intermediate|中高级/ }).click();
  await page.getByRole('button', { name: /下一步|Next/ }).click();
  await page.getByRole('button', { name: /IELTS|雅思|备考/ }).first().click();
  await page.getByRole('button', { name: /下一步|Next/ }).click();
  await page.getByRole('button', { name: /下一步|Next/ }).click();
  await page.getByRole('button', { name: /下一步|Next/ }).click();
  await page.getByRole('button', { name: /开始学习|Get started/ }).click();

  return waitUsableDashboard(page, `onboarding complete ${index}`);
}

async function registerAndOnboard(browser, account, index) {
  const context = await browser.newContext({ viewport: VIEWPORT, locale: 'zh-CN' });
  const page = await context.newPage();
  const bucket = {
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    failedRequests: [],
    badResponses: [],
  };
  attachCollectors(page, bucket);

  await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await fillRegistration(page, account);
  await page.waitForURL(/\/onboarding/, { timeout: 60_000 });
  const dashboard = await completeOnboarding(page, index);
  await page.screenshot({ path: path.join(OUT_DIR, `account-${index}-after-onboarding.png`), fullPage: true });

  await context.close();
  return { ...bucket, dashboard };
}

async function loginAndCheck(browser, account, index) {
  const context = await browser.newContext({ viewport: VIEWPORT, locale: 'zh-CN' });
  const page = await context.newPage();
  const bucket = {
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    failedRequests: [],
    badResponses: [],
    routeChecks: [],
  };
  attachCollectors(page, bucket);

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.locator('input[type="email"]').fill(account.email);
  await page.locator('input[type="password"]').fill(account.password);
  await page.locator('button[type="submit"]').filter({ hasText: /登录|Log in|Sign in/i }).click();
  const dashboard = await waitUsableDashboard(page, `fresh login ${index}`);
  await page.screenshot({ path: path.join(OUT_DIR, `account-${index}-fresh-login.png`), fullPage: true });

  for (const route of ROUTES) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});
    const body = await page.locator('body').innerText({ timeout: 10_000 }).catch(() => '');
    const host = new URL(page.url()).host;
    const mainVisible = await page.locator('main, [role="main"], h1').first().isVisible({ timeout: 5_000 }).catch(() => false);
    const blockedLoading = /正在打开学习任务|正在确认登录状态/.test(body) || body.trim().length < 120;
    bucket.routeChecks.push({
      route,
      url: page.url(),
      host,
      mainVisible,
      blockedLoading,
      text: shortText(body, 220),
    });
  }

  await context.close();
  return { ...bucket, dashboard };
}

function summarizeAccount(index, account, register, login) {
  const allBadResponses = [...register.badResponses, ...login.badResponses];
  const allFailedRequests = [...register.failedRequests, ...login.failedRequests];
  const consoleErrors = [...register.consoleErrors, ...login.consoleErrors];
  const pageErrors = [...register.pageErrors, ...login.pageErrors];
  const routeProblems = login.routeChecks.filter((check) => !check.mainVisible || check.blockedLoading);
  const dbBootstrapBadResponses = allBadResponses.filter((item) => item.dbBootstrap);
  const dbBootstrapFailedRequests = allFailedRequests.filter((item) => item.dbBootstrap && item.failure !== 'net::ERR_ABORTED');

  return {
    index,
    emailMasked: maskEmail(account.email),
    register,
    login,
    routeProblems,
    consoleErrors: consoleErrors.map((message) => shortText(message, 360)),
    pageErrors,
    dbBootstrapBadResponses,
    dbBootstrapFailedRequests,
    functionalPassed: pageErrors.length === 0 && routeProblems.length === 0,
    dbBootstrapPassed: dbBootstrapBadResponses.length === 0 && dbBootstrapFailedRequests.length === 0,
  };
}

const browser = await chromium.launch({ headless: true });
const runId = Date.now();
const results = [];

try {
  for (let index = 1; index <= ACCOUNT_COUNT; index += 1) {
    const account = {
      name: `Codex Learner ${index}`,
      email: `codex-uuedu-auth-${runId}-${index}@example.com`,
      password: `VocabDaily!${runId}${index}Aa`,
    };

    const register = await registerAndOnboard(browser, account, index);
    const login = await loginAndCheck(browser, account, index);
    const result = summarizeAccount(index, account, register, login);
    results.push(result);

    console.log(
      `account ${index}: functional=${result.functionalPassed ? 'pass' : 'fail'} ` +
        `dbBootstrap=${result.dbBootstrapPassed ? 'pass' : 'fail'} ` +
        `db4xx=${result.dbBootstrapBadResponses.length} dbFailed=${result.dbBootstrapFailedRequests.length}`,
    );
  }
} finally {
  await browser.close();
}

const summary = {
  baseUrl: BASE_URL,
  outDir: OUT_DIR,
  accountsTested: results.length,
  functionalPassed: results.every((result) => result.functionalPassed),
  dbBootstrapPassed: results.every((result) => result.dbBootstrapPassed),
  results,
};

fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

console.log(
  JSON.stringify(
    {
      outDir: OUT_DIR,
      accountsTested: summary.accountsTested,
      functionalPassed: summary.functionalPassed,
      dbBootstrapPassed: summary.dbBootstrapPassed,
    },
    null,
    2,
  ),
);

if (!summary.functionalPassed || !summary.dbBootstrapPassed) {
  process.exit(1);
}
