import { apiFetch } from '@/lib/api';
import type { Coin } from '@/types';

export const getCoins = async (): Promise<Coin[]> => {
  try {
    return await apiFetch<Coin[]>('/coins');
  } catch {
    return [];
  }
};
