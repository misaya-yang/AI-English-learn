import { describe, expect, it } from 'vitest';

import { buildDbSetupGuide } from './dbSetupGuide';

describe('buildDbSetupGuide', () => {
  it('does not embed the production Supabase project ref in client-bundled text', () => {
    const zh = buildDbSetupGuide('zh');
    const en = buildDbSetupGuide('en');

    expect(zh).not.toContain('zjkbktdmwencnouwfrij');
    expect(en).not.toContain('zjkbktdmwencnouwfrij');
    expect(en).toContain('<your-project-ref>');
  });
});
