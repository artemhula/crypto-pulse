import { cache } from 'react';
import { apiFetch } from '@/lib/api';
import type { User } from '@/types';

interface GetCurrentUserResponse {
  user: User;
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const { user } = await apiFetch<GetCurrentUserResponse>('/auth/me');
    return user;
  } catch {
    return null;
  }
});
