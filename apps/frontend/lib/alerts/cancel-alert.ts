import { apiFetch } from '@/lib/api';
import type { Alert } from '@/types';

export const cancelAlert = async (id: string): Promise<Alert> => {
  return apiFetch<Alert>(`/alerts/${id}/cancel`, { method: 'PATCH' });
};