export type AlertCondition = 'ABOVE' | 'BELOW';

export type AlertStatus = 'ACTIVE' | 'CANCELLED' | 'TRIGGERED' | 'EXPIRED';

export type AlertChannel = 'TELEGRAM' | 'DISCORD' | 'EMAIL';

export type Alert = {
  id: string;
  userId: string;
  ticker: string;
  targetPrice: string;
  condition: AlertCondition;
  status: AlertStatus;
  channels: AlertChannel[];
  createdAt: Date;
  expiresAt?: Date;
};

export type AlertCounts = Record<AlertStatus, number>;

export type GetAlertsParams = {
  page?: number;
  limit?: number;
  status?: AlertStatus;
};

export type GetAlertsResponse = {
  items: Alert[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  counts: AlertCounts;
};
