export type AlertCondition = 'ABOVE' | 'BELOW';

export type AlertStatus = 'ACTIVE' | 'CANCELLED' | 'TRIGGERED' | 'EXPIRED';

export type AlertChannel = 'TELEGRAM' | 'DISCORD' | 'EMAIL' | 'PUSH';

export type NotificationChannel = {
  type: AlertChannel;
};

export type Alert = {
  id: string;
  userId: string;
  ticker: string;
  targetPrice: string;
  condition: AlertCondition;
  status: AlertStatus;
  channels: NotificationChannel[];
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
