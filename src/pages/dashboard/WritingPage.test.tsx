import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const writingMocks = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastInfo: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en-US' } }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => writingMocks.toastError(...args),
    info: (...args: unknown[]) => writingMocks.toastInfo(...args),
  },
}));

vi.mock('@/services/writingAnalytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/writingAnalytics')>();
  return {
    ...actual,
    gradeWithAi: vi.fn(async (text: string, type: Parameters<typeof actual.gradeLocally>[1]) => (
      actual.gradeLocally(text, type)
    )),
  };
});

import WritingPage from './WritingPage';

const STORAGE_KEY = 'vocabdaily-writing-drafts-v1';

const makeWords = (count: number) => (
  Array.from({ length: count }, (_, index) => `word${index + 1}`).join(' ')
);

const selectTab = (name: string) => {
  fireEvent.keyDown(screen.getByRole('tab', { name }), { key: 'Enter' });
};

describe('WritingPage draft workflow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('keeps an independent draft for every writing type', () => {
    render(<WritingPage />);

    fireEvent.change(screen.getByLabelText('Free Writing draft'), {
      target: { value: 'A free writing draft.' },
    });
    selectTab('IELTS Task 2');
    fireEvent.change(screen.getByLabelText('IELTS Task 2 draft'), {
      target: { value: 'An IELTS draft.' },
    });

    selectTab('Free Writing');
    expect(screen.getByLabelText('Free Writing draft')).toHaveValue('A free writing draft.');

    selectTab('IELTS Task 2');
    expect(screen.getByLabelText('IELTS Task 2 draft')).toHaveValue('An IELTS draft.');
  });

  it('autosaves the complete draft map after edits settle', async () => {
    vi.useFakeTimers();
    render(<WritingPage />);

    fireEvent.change(screen.getByLabelText('Free Writing draft'), {
      target: { value: 'Saved in this browser.' },
    });
    expect(screen.getByRole('status')).toHaveTextContent('Autosaving');

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')).toEqual({
      free: 'Saved in this browser.',
      ielts: '',
      business: '',
      journal: '',
    });
    expect(screen.getByRole('status')).toHaveTextContent('Draft saved');
  });

  it('confirms reset and only clears the active task draft', async () => {
    render(<WritingPage />);

    fireEvent.change(screen.getByLabelText('Free Writing draft'), {
      target: { value: 'Keep this free draft.' },
    });
    selectTab('Business Email');
    fireEvent.change(screen.getByLabelText('Business Email draft'), {
      target: { value: 'Clear this business draft.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Keep draft' }));
    expect(screen.getByLabelText('Business Email draft')).toHaveValue('Clear this business draft.');

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear current draft' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Business Email draft')).toHaveValue('');
    });

    selectTab('Free Writing');
    expect(screen.getByLabelText('Free Writing draft')).toHaveValue('Keep this free draft.');
  });

  it.each([
    { tab: 'Free Writing', label: 'Free Writing draft', target: 80 },
    { tab: 'Business Email', label: 'Business Email draft', target: 120 },
    { tab: 'IELTS Task 2', label: 'IELTS Task 2 draft', target: 250 },
  ])('scores task completion against the $target-word target for $tab', async ({ tab, label, target }) => {
    render(<WritingPage />);
    if (tab !== 'Free Writing') {
      selectTab(tab);
    }

    fireEvent.change(screen.getByLabelText(label), {
      target: { value: makeWords(target) },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit for Grading' }));

    await screen.findByText(/Writing score \d+\/100/);
    const taskAchievementRow = screen.getByText('Task Achievement').parentElement;
    expect(taskAchievementRow).not.toBeNull();
    expect(within(taskAchievementRow as HTMLElement).getByText('100')).toBeInTheDocument();
  });
});
