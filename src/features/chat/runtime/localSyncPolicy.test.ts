import { describe, expect, it } from 'vitest';

import { shouldUseRemoteChatStorage } from './localSyncPolicy';

describe('chat local sync policy', () => {
  it('keeps local-auth chat sessions out of remote storage', () => {
    expect(shouldUseRemoteChatStorage('00000000-0000-4000-8000-123456789abc')).toBe(false);
  });

  it('allows remote storage for normal authenticated user ids', () => {
    expect(shouldUseRemoteChatStorage('6e5da3ad-13ba-4f96-8e07-8f1d5b819c50')).toBe(true);
  });
});
