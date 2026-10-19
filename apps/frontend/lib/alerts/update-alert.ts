import { apiFetch } from '@/lib/api';
import type { Alert, AlertChannel } from '@/types';

export type UpdateAlertInput = {
  channels: AlertChannel[];
};

export const updateAlert = async (
  id: string,
  input: UpdateAlertInput,
): Promise<Alert> => {
  return apiFetch<Alert>(`/alerts/${id}`, {
    method: 'PATCH',
    body: input,
  });
};
