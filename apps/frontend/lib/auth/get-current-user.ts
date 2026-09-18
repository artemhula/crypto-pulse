import { cache } from 'react';
import { cookies } from 'next/headers';
import type { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return null;

  try {
    const res = await fetch(API_URL + '/auth/me', {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { user: User };
    return data.user;
  } catch {
    return null;
  }
});
