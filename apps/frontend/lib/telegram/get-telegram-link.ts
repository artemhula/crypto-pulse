import { apiFetch } from '@/lib/api';
import type { TelegramLink } from '@/types';

export const getTelegramLink = async (): Promise<TelegramLink> => {
  return apiFetch<TelegramLink>('/telegram/link/start');
};
