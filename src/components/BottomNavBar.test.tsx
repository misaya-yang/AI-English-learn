import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { BottomNavBar } from './BottomNavBar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
  }),
}));

const renderNav = (isLearningMode: boolean, path = '/dashboard/today', moreOpen = false) => {
  const onMoreClick = vi.fn();
  render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNavBar
        isLearningMode={isLearningMode}
        moreOpen={moreOpen}
        onMoreClick={onMoreClick}
      />
    </MemoryRouter>,
  );
  return { onMoreClick };
};

describe('BottomNavBar', () => {
  it('uses the core learning loop in learning mode', () => {
    renderNav(true, '/dashboard/practice');

    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/dashboard/today',
      '/dashboard/review',
      '/dashboard/practice',
      '/dashboard/chat',
    ]);
    expect(screen.getByRole('link', { current: 'page' })).toHaveAttribute('href', '/dashboard/practice');
  });

  it('uses the standard app destinations outside the learning shell', () => {
    renderNav(false, '/dashboard/exam');

    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/dashboard/today',
      '/dashboard/chat',
      '/dashboard/exam',
      '/dashboard/review',
    ]);
    expect(screen.getByRole('link', { current: 'page' })).toHaveAttribute('href', '/dashboard/exam');
  });

  it('exposes and activates the More sheet control', () => {
    const { onMoreClick } = renderNav(true, '/dashboard/grammar', true);
    const moreButton = screen.getByRole('button', { name: /more|更多/i });

    expect(moreButton).toHaveAttribute('aria-haspopup', 'dialog');
    expect(moreButton).toHaveAttribute('aria-expanded', 'true');
    expect(moreButton).not.toHaveAttribute('aria-current');
    expect(moreButton).toHaveAttribute('data-active', 'true');

    fireEvent.click(moreButton);
    expect(onMoreClick).toHaveBeenCalledTimes(1);
  });
});
