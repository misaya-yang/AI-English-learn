import type { ReactNode } from 'react';
import { UserDataProvider } from '@/contexts/UserDataContext';

export default function UserDataRouteProvider({ children }: { children: ReactNode }) {
  return <UserDataProvider>{children}</UserDataProvider>;
}
