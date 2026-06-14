import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ChatErrorBanner } from './ChatErrorBanner';

describe('ChatErrorBanner', () => {
  it('offers a local practice fallback when AI is unavailable', () => {
    const retry = vi.fn();

    render(
      <MemoryRouter>
        <ChatErrorBanner
          error={{ status: 0, code: 'network', message: '网络连接异常，暂时无法调用 AI。' }}
          language="zh-CN"
          contentWidthClass="max-w-xl"
          isRetrying={false}
          onRetry={retry}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('在线答疑暂时不可用')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '本地练习' })).toHaveAttribute('href', '/dashboard/practice');

    fireEvent.click(screen.getByRole('button', { name: /重试/ }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
