import { isLocalAuthUserId } from '@/lib/localAuthIdentity';

export function shouldUseRemoteChatStorage(userId: string): boolean {
  return !isLocalAuthUserId(userId);
}
