import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import type { WordData } from '@/data/words';
import { TodayWordNavigation } from './TodayWordNavigation';

const words = [
  { id: 'w1', word: 'anchor' },
  { id: 'w2', word: 'brisk' },
  { id: 'w3', word: 'candid' },
] as WordData[];

function renderNavigation(overrides: Partial<ComponentProps<typeof TodayWordNavigation>> = {}) {
  const props: ComponentProps<typeof TodayWordNavigation> = {
    words,
    currentWordIndex: 1,
    learnedWordIds: new Set(['w1']),
    hardWordIds: new Set(['w3']),
    isZh: false,
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onSelectWord: vi.fn(),
    ...overrides,
  };

  render(<TodayWordNavigation {...props} />);

  return props;
}

describe('TodayWordNavigation', () => {
  it('exposes descriptive English labels and current step state', () => {
    const props = renderNavigation();
    const nav = screen.getByRole('navigation', { name: "Today's word navigation" });

    expect(within(nav).getByRole('button', { name: 'View previous word: anchor' })).toBeEnabled();
    expect(within(nav).getByRole('button', { name: 'View next word: candid' })).toBeEnabled();

    const current = within(nav).getByRole('button', {
      name: 'Go to word 2 of 3: brisk, current word',
    });
    expect(current).toHaveAttribute('aria-current', 'step');

    const learned = within(nav).getByRole('button', {
      name: 'Go to word 1 of 3: anchor, learned',
    });
    fireEvent.click(learned);

    expect(props.onSelectWord).toHaveBeenCalledWith(0);
    expect(within(nav).getByRole('button', {
      name: 'Go to word 3 of 3: candid, needs review',
    })).not.toHaveAttribute('aria-current');
  });

  it('exposes Chinese labels for the same control surface', () => {
    renderNavigation({
      currentWordIndex: 0,
      isZh: true,
      learnedWordIds: new Set(),
      hardWordIds: new Set(['w2']),
    });
    const nav = screen.getByRole('navigation', { name: '今日单词导航' });

    expect(within(nav).getByRole('button', { name: '查看上一个单词' })).toBeDisabled();
    expect(within(nav).getByRole('button', { name: '查看下一个单词: brisk' })).toBeEnabled();
    expect(within(nav).getByRole('group', { name: '选择今天的单词' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', {
      name: '查看第 1/3 个单词：anchor，当前单词',
    })).toHaveAttribute('aria-current', 'step');
    expect(within(nav).getByRole('button', {
      name: '查看第 2/3 个单词：brisk，需复习',
    })).toBeInTheDocument();
  });
});
