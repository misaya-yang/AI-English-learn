#!/usr/bin/env node
// prod-smoke.mjs — fast, no-browser production smoke for VocabDaily.
//
// Checks the contracts the OPS-03 backlog item asks for:
//   1. Frontend /login responds 200.
//   2. Frontend / (app shell) responds 200.
//   3. Supabase Auth health endpoint responds 200.
//   4. AI chat edge function is reachable. If $JWT is set, expect 200;
//      otherwise expect 401 — that is the fail-closed contract, not a
//      failure.
//   5. Billing checkout edge function is reachable. Without provider
//      secrets we expect 503; with secrets we expect 200/302. Either is
//      acceptable as long as the response is NOT a fake-success URL.
//
// Usage:
//   node scripts/prod-smoke.mjs
//   BASE_URL=https://staging.example.com node scripts/prod-smoke.mjs
//   JWT=<sb-session-jwt> node scripts/prod-smoke.mjs
//
// Exit code 0 = all checks passed; non-zero = at least one failed.
// No real user credentials are required unless $JWT is supplied.

const BASE_URL = (process.env.BASE_URL || 'https://www.uuedu.online').replace(/\/$/, '');
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://zjkbktdmwencnouwfrij.supabase.co').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_0_pU0AO93wz-7Bmt6xROJg_stLwrT0h';
const JWT = process.env.JWT || '';
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 15000);

const ANSI = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red:   (text) => `\x1b[31m${text}\x1b[0m`,
  amber: (text) => `\x1b[33m${text}\x1b[0m`,
  dim:   (text) => `\x1b[2m${text}\x1b[0m`,
};

const fetchWithTimeout = async (url, opts = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const checks = [];

const recordCheck = (name, status, evidence = '') => {
  checks.push({ name, status, evidence });
};

const runCheck = async (name, fn) => {
  try {
    const result = await fn();
    if (result === true || (result && result.ok)) {
      recordCheck(name, 'pass', result.evidence || '');
    } else if (result && result.warn) {
      recordCheck(name, 'warn', result.evidence || '');
    } else {
      recordCheck(name, 'fail', (result && result.evidence) || '');
    }
  } catch (error) {
    recordCheck(name, 'fail', error instanceof Error ? error.message : String(error));
  }
};

await runCheck('Frontend /login responds 200', async () => {
  const res = await fetchWithTimeout(`${BASE_URL}/login`, { method: 'GET' });
  return {
    ok: res.status === 200,
    evidence: `GET ${BASE_URL}/login → ${res.status}`,
  };
});

await runCheck('Frontend / (app shell) responds 200', async () => {
  const res = await fetchWithTimeout(`${BASE_URL}/`, { method: 'GET' });
  return {
    ok: res.status === 200,
    evidence: `GET ${BASE_URL}/ → ${res.status}`,
  };
});

await runCheck('Supabase Auth health endpoint responds 200', async () => {
  const res = await fetchWithTimeout(`${SUPABASE_URL}/auth/v1/health`, {
    headers: { apikey: SUPABASE_ANON_KEY },
  });
  return {
    ok: res.status === 200,
    evidence: `GET ${SUPABASE_URL}/auth/v1/health → ${res.status}`,
  };
});

await runCheck('AI chat edge function reachable / fail-closed', async () => {
  const headers = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  };
  if (JWT) headers.Authorization = `Bearer ${JWT}`;
  const res = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/ai-chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'healthcheck' }],
    }),
  });
  if (JWT) {
    const body = await res.text();
    const ok = res.status === 200 && body.length > 0 && !body.includes('"error":"unauthorized"');
    return {
      ok,
      evidence: `POST ai-chat (with JWT) → ${res.status}, body bytes=${body.length}`,
    };
  }
  // No JWT — fail-closed contract is 401.
  return {
    ok: res.status === 401,
    evidence: `POST ai-chat (no JWT) → ${res.status} (expected 401)`,
  };
});

await runCheck('Frontend /pricing responds 200', async () => {
  const res = await fetchWithTimeout(`${BASE_URL}/pricing`, { method: 'GET' });
  if (res.status !== 200) {
    return { ok: false, evidence: `GET ${BASE_URL}/pricing → ${res.status}` };
  }
  // Best-effort body sniff for the fail-closed copy. The page is a
  // client-rendered SPA, so the strings may not be present in the
  // initial HTML; treat absence as a warn rather than a hard fail.
  const body = await res.text().catch(() => '');
  const failClosedHints = [
    'not yet open',
    'fail-closed',
    '503',
    'checkout pending',
    '暂未开放',
    '尚未开放',
    'not available',
  ];
  const hit = failClosedHints.find((needle) => body.toLowerCase().includes(needle.toLowerCase()));
  if (hit) {
    return { ok: true, evidence: `GET ${BASE_URL}/pricing → 200 (fail-closed copy hint: "${hit}")` };
  }
  return {
    warn: true,
    ok: true,
    evidence: `GET ${BASE_URL}/pricing → 200 (no fail-closed copy in initial HTML; SPA render likely)`,
  };
});

await runCheck('Frontend /word-of-the-day responds 200', async () => {
  const res = await fetchWithTimeout(`${BASE_URL}/word-of-the-day`, { method: 'GET' });
  return {
    ok: res.status === 200,
    evidence: `GET ${BASE_URL}/word-of-the-day → ${res.status}`,
  };
});

await runCheck('Billing checkout fail-closed without provider secrets', async () => {
  const headers = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  };
  if (JWT) headers.Authorization = `Bearer ${JWT}`;
  const res = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/billing-create-checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ plan: 'pro_monthly', provider: 'stripe' }),
  });
  if (!JWT) {
    return {
      ok: res.status === 401,
      evidence: `POST billing-create-checkout (no JWT) → ${res.status} (expected 401)`,
    };
  }
  // With JWT and no provider secrets, expect 503; with provider secrets,
  // expect 200/302. Anything 2xx without a real provider URL is suspect —
  // print a warn so the operator can inspect.
  const text = await res.text();
  if (res.status === 503) {
    return {
      ok: true,
      evidence: `POST billing-create-checkout → 503 (fail-closed as expected)`,
    };
  }
  if (res.status >= 200 && res.status < 400) {
    const looksReal = /https?:\/\/(checkout\.stripe\.com|openapi\.alipay\.com|api\.alipay\.com)/.test(text);
    return {
      warn: !looksReal,
      ok: looksReal,
      evidence: `POST billing-create-checkout → ${res.status}; ${looksReal ? 'real provider URL detected' : 'WARN: 2xx without recognised provider URL'}`,
    };
  }
  return {
    ok: false,
    evidence: `POST billing-create-checkout → ${res.status} (unexpected)`,
  };
});

// ── Report ─────────────────────────────────────────────────────────────────

const passed = checks.filter((check) => check.status === 'pass').length;
const warned = checks.filter((check) => check.status === 'warn').length;
const failed = checks.filter((check) => check.status === 'fail').length;

console.log('\nProduction smoke report');
console.log(ANSI.dim(`  base:     ${BASE_URL}`));
console.log(ANSI.dim(`  supabase: ${SUPABASE_URL}`));
console.log(ANSI.dim(`  jwt:      ${JWT ? 'provided' : 'absent (fail-closed assertions used)'}`));
console.log('');

for (const check of checks) {
  const tag = check.status === 'pass'
    ? ANSI.green('PASS')
    : check.status === 'warn'
      ? ANSI.amber('WARN')
      : ANSI.red('FAIL');
  console.log(`  ${tag} ${check.name}`);
  if (check.evidence) console.log(`        ${ANSI.dim(check.evidence)}`);
}

console.log('');
const summary = `${passed} passed · ${warned} warned · ${failed} failed`;
if (failed === 0 && warned === 0) {
  console.log(ANSI.green(summary));
  process.exit(0);
}
if (failed === 0) {
  console.log(ANSI.amber(summary));
  process.exit(0);
}
console.log(ANSI.red(summary));
process.exit(1);
