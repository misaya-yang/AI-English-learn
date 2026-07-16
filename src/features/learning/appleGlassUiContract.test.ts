import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(__dirname, '..', '..', '..');

const read = (path: string) => readFileSync(resolve(repoRoot, path), 'utf8');

describe('Apple-style workbook UI contract', () => {
  it('keeps light and dark tokens in the workbook palette', () => {
    const css = read('src/index.css');

    expect(css).toContain('--background: 211 38% 92%');
    expect(css).toContain('--paper: 210 28% 94%');
    expect(css).toContain('--background: 220 12% 13%');
    expect(css).toContain('--paper: 220 9% 16%');
    expect(css).toContain('--paper-line: 220 7% 50%');
    expect(css).toContain('@media (prefers-reduced-transparency: reduce)');
  });

  it('keeps glass buttons moderate instead of pill-shaped by default', () => {
    const button = read('src/components/ui/button.tsx');

    expect(button).toContain('glass:');
    expect(button).toContain('rounded-lg border-transparent');
    expect(button).not.toContain('glass:\n          "liquid-glass-control liquid-glass-interactive rounded-full');
  });

  it('uses routeRegistry as the dashboard shell source of truth', () => {
    const layout = read('src/layouts/DashboardLayout.tsx');

    expect(layout).toContain('getDashboardRouteByPath');
    expect(layout).toContain('getRoutesByGroup');
    expect(layout).not.toContain('shellTitleMap');
  });

  it('keeps core learning copy short and avoids old AI-dashboard wording', () => {
    const source = [
      'src/pages/Home.tsx',
      'src/layouts/DashboardLayout.tsx',
      'src/pages/dashboard/TodayPage.tsx',
      'src/pages/dashboard/PracticePage.tsx',
      'src/pages/dashboard/ReviewPage.tsx',
      'src/features/learning/routeRegistry.ts',
    ].map(read).join('\n');

    for (const blocked of ['工作台', 'cockpit', 'AI 教练', '真正记得住', '智能规划', '学习工作流', '典型学习日', '视觉线索', '演示学习者']) {
      expect(source).not.toContain(blocked);
    }
  });
});
