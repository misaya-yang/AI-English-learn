import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'Home.tsx'), 'utf8');

describe('Home trust copy', () => {
  it('does not ship unverified social-proof metrics', () => {
    expect(source).not.toContain('5,000+ 学习者使用');
    expect(source).not.toContain('4.8 / 5 用户评分');
  });
});
