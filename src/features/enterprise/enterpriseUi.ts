export type EnterpriseUiEnv = {
  VITE_ENTERPRISE_UI_ENABLED?: string | boolean | undefined;
};

const DISABLED = new Set(['false', '0', 'off', 'no']);

export function readEnterpriseUiEnv(): EnterpriseUiEnv {
  const metaEnv = (import.meta as unknown as { env?: EnterpriseUiEnv }).env || {};
  const processEnv =
    typeof globalThis !== 'undefined' &&
    'process' in globalThis &&
    typeof (globalThis as { process?: { env?: EnterpriseUiEnv } }).process === 'object'
      ? (globalThis as { process?: { env?: EnterpriseUiEnv } }).process?.env || {}
      : {};
  return {
    VITE_ENTERPRISE_UI_ENABLED:
      processEnv.VITE_ENTERPRISE_UI_ENABLED ?? metaEnv.VITE_ENTERPRISE_UI_ENABLED,
  };
}

export function isEnterpriseUiEnabled(env: EnterpriseUiEnv = readEnterpriseUiEnv()): boolean {
  const raw = env.VITE_ENTERPRISE_UI_ENABLED;
  if (raw === undefined || raw === null) return true;
  if (typeof raw === 'boolean') return raw;
  return !DISABLED.has(String(raw).trim().toLowerCase());
}
