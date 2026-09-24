import { apiFetch } from '@/lib/api';
import type { Alert, AlertCondition } from '@/types';

export type CreateAlertInput = {
  ticker: string;
  targetPrice: number;
  condition: AlertCondition;
  expiresAt?: string;
};

export const createAlert = async (input: CreateAlertInput): Promise<Alert> => {
  return apiFetch<Alert>('/alerts', {
    method: 'POST',
    body: input,
  });
};