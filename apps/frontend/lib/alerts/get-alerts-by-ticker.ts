import { apiFetch } from '@/lib/api';
import type { Alert } from '@/types';

export type GetAlertsByTickerParams = {
  page?: number;
  limit?: number;
};

export type GetAlertsByTickerResponse = {
  items: Alert[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const getAlertsByTicker = async (
  ticker: string,
  params: GetAlertsByTickerParams = {},
): Promise<GetAlertsByTickerResponse> => {
  return apiFetch<GetAlertsByTickerResponse>(
    `/alerts/coin/${encodeURIComponent(ticker)}`,
    { query: params },
  );
};
