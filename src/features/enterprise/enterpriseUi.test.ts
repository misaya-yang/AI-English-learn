import { describe, expect, it } from 'vitest';

import { isEnterpriseUiEnabled } from './enterpriseUi';

describe('isEnterpriseUiEnabled', () => {
  it('defaults to enabled for local preview shells', () => {
    expect(isEnterpriseUiEnabled({})).toBe(true);
  });

  it.each(['false', '0', 'off', 'no', ' FALSE '])('disables for %s', (value) => {
    expect(isEnterpriseUiEnabled({ VITE_ENTERPRISE_UI_ENABLED: value })).toBe(false);
  });

  it('disables for boolean false', () => {
    expect(isEnterpriseUiEnabled({ VITE_ENTERPRISE_UI_ENABLED: false })).toBe(false);
  });

  it.each(['true', '1', 'yes', 'on'])('enables for %s', (value) => {
    expect(isEnterpriseUiEnabled({ VITE_ENTERPRISE_UI_ENABLED: value })).toBe(true);
  });
});
