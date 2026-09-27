import { cn } from 'cn';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AlertCondition, AlertStatus } from '@/types';

export const STATUS_COLORS: Record<AlertStatus, string> = {
  ACTIVE: 'text-yellow-600 border-yellow-600/40',
  TRIGGERED: 'text-green-600 border-green-600/40',
  EXPIRED: 'text-red-600 border-red-600/40',
  CANCELLED: 'text-gray-500 border-foreground/15',
};

export const AlertStatusBadge = ({ status }: { status: AlertStatus }) => (
  <Badge variant="outline" className={cn('border', STATUS_COLORS[status])}>
    {status}
  </Badge>
);

export const AlertConditionLabel = ({
  condition,
}: {
  condition: AlertCondition;
}) => (
  <div className="flex items-center gap-1.5 font-medium">
    {condition === 'ABOVE' ? (
      <ArrowUp className="size-3 text-green-500" />
    ) : (
      <ArrowDown className="size-3 text-red-500" />
    )}
    {condition}
  </div>
);

export const formatTargetPrice = (targetPrice: string | number) =>
  `$${targetPrice}`;

export const formatAlertDate = (date: string | Date) =>
  new Date(date).toLocaleDateString();

export const formatAlertDateTime = (date: string | Date) =>
  new Date(date).toLocaleString();
