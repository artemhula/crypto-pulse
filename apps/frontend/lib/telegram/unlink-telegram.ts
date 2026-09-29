import { apiFetch } from '@/lib/api';

export const unlinkTelegram = async (): Promise<void> => {
  return apiFetch<void>('/telegram/link', { method: 'DELETE' });
};
