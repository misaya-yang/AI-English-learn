import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

const i18nState = vi.hoisted(() => ({
  language: 'zh',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: i18nState.language },
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    i18nState.language = 'zh';
  });

  it('localizes appearance controls for Chinese users', async () => {
    render(
      <ThemeProvider defaultTheme="system" storageKey="test-theme">
        <ThemeToggle />
      </ThemeProvider>,
    );

    const trigger = screen.getByRole('button', { name: '切换外观' });
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });

    expect(await screen.findByRole('menuitem', { name: /浅色/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /深色/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /跟随系统/ })).toBeInTheDocument();
  });
});
