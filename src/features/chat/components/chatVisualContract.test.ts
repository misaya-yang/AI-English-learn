import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(__dirname, '../../../..');
const readSource = (path: string) => readFileSync(resolve(repoRoot, path), 'utf8');
const legacyAccent = ['emer', 'ald'].join('');

const CORE_CHAT_COMPONENTS = [
  'src/features/chat/components/ChatArtifactRenderer.tsx',
  'src/features/chat/components/ChatComposer.tsx',
  'src/features/chat/components/ChatHistorySidebar.tsx',
  'src/features/chat/components/ChatMessageBubble.tsx',
  'src/features/chat/components/ChatWelcome.tsx',
  'src/features/chat/components/CoachActionPanel.tsx',
  'src/features/chat/components/DatabaseStatusBanner.tsx',
  'src/features/chat/components/MissionRecommendationCards.tsx',
  'src/features/chat/components/QuizArtifactCard.tsx',
  'src/features/chat/components/QuizCanvasPanel.tsx',
  'src/features/chat/components/QuizRunFooter.tsx',
  'src/features/chat/components/ThinkingStatusCard.tsx',
];

describe('chat visual shell contract', () => {
  it('keeps core chat chrome on semantic tokens instead of legacy accent classes', () => {
    for (const path of CORE_CHAT_COMPONENTS) {
      expect(readSource(path), path).not.toContain(legacyAccent);
    }
  });

  it('keeps ChatPage wired to extracted quiz/db shell components', () => {
    const source = readSource('src/pages/dashboard/ChatPage.tsx');

    expect(source).toContain('<DatabaseStatusBanner');
    expect(source).toContain('<QuizCanvasPanel');
    expect(source).toContain('<QuizRunFooter');
    expect(source).not.toContain('QuizArtifactCard');
    expect(source).not.toContain('showDbSetup');
  });

  it('keeps coach, quiz, and composer controls on shared primary/success tokens', () => {
    const composer = readSource('src/features/chat/components/ChatComposer.tsx');
    const coach = readSource('src/features/chat/components/CoachActionPanel.tsx');
    const quiz = readSource('src/features/chat/components/QuizArtifactCard.tsx');

    expect(composer).toContain('focus-within:border-primary/50');
    expect(composer).toContain('bg-primary p-0 text-primary-foreground');
    expect(coach).toContain('border border-primary/60 bg-primary');
    expect(coach).toContain('hsl(var(--success)');
    expect(quiz).toContain('border-primary/50 bg-primary/10');
    expect(quiz).toContain('hsl(var(--success)');
  });
});
