import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MemoryItemView } from '@/types/memory';

const listMemoryItemsMock = vi.fn();
const deleteMemoryItemsMock = vi.fn();
const clearExpiredMemoryItemsMock = vi.fn();
const pinMemoryItemMock = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'memory-center-user' } }),
}));

vi.mock('@/lib/localAuthIdentity', () => ({
  isLocalAuthUserId: () => false,
}));

vi.mock('@/services/memoryCenter', () => ({
  listMemoryItems: (...args: unknown[]) => listMemoryItemsMock(...args),
  deleteMemoryItems: (...args: unknown[]) => deleteMemoryItemsMock(...args),
  clearExpiredMemoryItems: (...args: unknown[]) => clearExpiredMemoryItemsMock(...args),
  pinMemoryItem: (...args: unknown[]) => pinMemoryItemMock(...args),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string) => ({
      'dashboard.memory.title': 'Memory center',
      'dashboard.memory.subtitle': 'Saved learning context',
      'dashboard.memory.privacyHint': 'Private',
      'common.loading': 'Loading',
    })[key] || key,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import MemoryCenterPage from './MemoryCenterPage';

const makeItem = (id: string, content: string): MemoryItemView => ({
  id,
  userId: 'memory-center-user',
  kind: 'goal',
  content,
  tags: ['test'],
  confidence: 0.9,
  salience: 0.8,
  isPinned: false,
  visibility: 'private',
  recallCount: 1,
  dedupeKey: `dedupe-${id}`,
  updatedAt: '2026-07-16T08:00:00.000Z',
});

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
};

const renderPage = () => render(
  <MemoryRouter>
    <MemoryCenterPage />
  </MemoryRouter>,
);

describe('MemoryCenterPage request safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listMemoryItemsMock.mockResolvedValue([]);
    deleteMemoryItemsMock.mockResolvedValue({ deletedCount: 1 });
    clearExpiredMemoryItemsMock.mockResolvedValue({ deletedCount: 1 });
    pinMemoryItemMock.mockImplementation(async (itemId: string) => makeItem(itemId, 'Pinned memory'));
    Element.prototype.hasPointerCapture ??= vi.fn(() => false);
    Element.prototype.setPointerCapture ??= vi.fn();
    Element.prototype.releasePointerCapture ??= vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces search, hides mismatched results, and ignores stale responses', async () => {
    vi.useFakeTimers();
    const oldItem = makeItem('old', 'Old memory');
    const alphaRequest = deferred<MemoryItemView[]>();
    const betaRequest = deferred<MemoryItemView[]>();
    listMemoryItemsMock
      .mockResolvedValueOnce([oldItem])
      .mockImplementationOnce(() => alphaRequest.promise)
      .mockImplementationOnce(() => betaRequest.promise);

    renderPage();
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('Old memory')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search memory' }), {
      target: { value: 'alpha' },
    });
    expect(screen.queryByText('Old memory')).not.toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(listMemoryItemsMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    expect(listMemoryItemsMock).toHaveBeenLastCalledWith({
      kind: 'all',
      query: 'alpha',
      limit: 120,
    });

    fireEvent.change(screen.getByRole('textbox', { name: 'Search memory' }), {
      target: { value: 'beta' },
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await act(async () => {
      betaRequest.resolve([makeItem('beta', 'Beta memory')]);
      await Promise.resolve();
    });
    expect(screen.getByText('Beta memory')).toBeInTheDocument();

    await act(async () => {
      alphaRequest.resolve([makeItem('alpha', 'Alpha memory')]);
      await Promise.resolve();
    });
    expect(screen.getByText('Beta memory')).toBeInTheDocument();
    expect(screen.queryByText('Alpha memory')).not.toBeInTheDocument();
  });

  it('requires confirmation before deleting a memory', async () => {
    listMemoryItemsMock.mockResolvedValueOnce([makeItem('delete-me', 'Remember this')]);
    renderPage();

    expect(await screen.findByText('Remember this')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete memory' }));
    expect(deleteMemoryItemsMock).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole('button', { name: 'Confirm delete' }));
    await waitFor(() => {
      expect(deleteMemoryItemsMock).toHaveBeenCalledWith({ ids: ['delete-me'] });
    });
    expect(screen.queryByText('Remember this')).not.toBeInTheDocument();
  });

  it('requires confirmation before clearing expired memories', async () => {
    renderPage();
    await screen.findByText('No saved learning records yet');

    fireEvent.click(screen.getByRole('button', { name: 'Clear expired' }));
    expect(clearExpiredMemoryItemsMock).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole('button', { name: 'Confirm clear' }));
    await waitFor(() => {
      expect(clearExpiredMemoryItemsMock).toHaveBeenCalledTimes(1);
    });
  });
});
