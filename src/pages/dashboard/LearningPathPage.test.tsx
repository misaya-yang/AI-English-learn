import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const translationState = vi.hoisted(() => ({ language: 'zh-CN' }));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'learning-path-user' } }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: translationState.language } }),
}));

import LearningPathPage from './LearningPathPage';

const renderPage = () => render(
  <MemoryRouter>
    <LearningPathPage />
  </MemoryRouter>,
);

describe('LearningPathPage interaction contract', () => {
  beforeEach(() => {
    localStorage.clear();
    translationState.language = 'zh-CN';
  });

  it('treats zh-CN as Chinese and uses real path buttons without decorative chevrons', () => {
    const { container } = renderPage();

    expect(screen.getByText('选择一条学习路径')).toBeInTheDocument();
    const dailyPath = screen.getByRole('button', { name: '选择学习路径：日常英语' });
    expect(dailyPath).toHaveClass('min-h-11');
    expect(container.querySelector('.lucide-chevron-right')).not.toBeInTheDocument();
  });

  it('keeps completion read-only, exposes 44px lesson targets, and removes duplicate progress', () => {
    const { container } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: '选择学习路径：日常英语' }));

    expect(screen.queryByRole('button', { name: /记录完成/ })).not.toBeInTheDocument();
    expect(screen.getByTestId('lesson-status-de-l1')).toHaveClass('h-11', 'w-11');
    expect(screen.getByRole('button', { name: '打开课程入口：基本问候' })).toHaveClass('min-h-11');
    expect(screen.getByText(/本页不再允许手动标记完成/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '打开下一课入口' })).toBeInTheDocument();

    expect(screen.getAllByText('0/16')).toHaveLength(1);
    expect(container.querySelectorAll('[role="progressbar"]')).toHaveLength(0);
    expect(screen.getByTestId('learning-session-shell')).toHaveClass(
      '[&_[data-session-action]]:whitespace-normal',
    );
  });
});
