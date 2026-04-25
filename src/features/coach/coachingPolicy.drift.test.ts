// QA-02 — Coach policy drift guard.
//
// Asserts that the two intentionally-duplicated coaching-policy modules
// are byte-identical. See docs/claude/QA_02_DRIFT_GUARD_SPEC.md for why
// byte-equality (not AST equivalence) is the contract here.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const clientPath = path.resolve(process.cwd(), 'src/features/coach/coachingPolicy.ts');
const edgePath = path.resolve(
  process.cwd(),
  'supabase/functions/_shared/coaching-policy.ts',
);

describe('coaching-policy drift guard', () => {
  it('client and edge copies are byte-identical', async () => {
    const [client, edge] = await Promise.all([
      readFile(clientPath),
      readFile(edgePath),
    ]);

    expect(client.length, `client copy is empty: ${clientPath}`).toBeGreaterThan(0);
    expect(edge.length, `edge copy is empty: ${edgePath}`).toBeGreaterThan(0);

    expect(
      client.equals(edge),
      `coaching-policy drift detected:\n` +
        `  ${clientPath} (${client.length} bytes)\n` +
        `  ${edgePath} (${edge.length} bytes)\n` +
        `Run a manual diff to find the offending lines.`,
    ).toBe(true);
  });
});
