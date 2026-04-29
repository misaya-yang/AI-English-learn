import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(__dirname, '../../../..');
const readSource = (path: string) => readFileSync(resolve(repoRoot, path), 'utf8');

describe('chat visual shell contract', () => {
  it('keeps quiz run chrome on semantic tokens instead of emerald-only accents', () => {
    const canvas = readSource('src/features/chat/components/QuizCanvasPanel.tsx');
    const footer = readSource('src/features/chat/components/QuizRunFooter.tsx');

    expect(`${canvas}\n${footer}`).not.toContain('emerald');
    expect(canvas).toContain('border-primary/15');
    expect(footer).toContain('bg-primary/5');
  });

  it('keeps ChatPage wired to extracted quiz/db shell components', () => {
    const source = readSource('src/pages/dashboard/ChatPage.tsx');

    expect(source).toContain('<DatabaseStatusBanner');
    expect(source).toContain('<QuizCanvasPanel');
    expect(source).toContain('<QuizRunFooter');
    expect(source).not.toContain('QuizArtifactCard');
    expect(source).not.toContain('showDbSetup');
  });
});
