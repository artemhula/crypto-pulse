import { apiFetch } from '@/lib/api';
import type { GetAlertsParams, GetAlertsResponse } from '@/types';

export const getAlerts = async (
  params: GetAlertsParams = {},
): Promise<GetAlertsResponse> => {
  return apiFetch<GetAlertsResponse>('/alerts', { query: params });
};