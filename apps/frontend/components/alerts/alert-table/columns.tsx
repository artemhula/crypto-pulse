'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cancelAlert } from '@/lib/alerts';
import { alertKeys } from '@/components/alerts/alert-query-keys';
import type { Alert } from '@/types';
import { DataTableColumnHeader } from './data-table-column-header';
import { type AlertsTableFeatures } from './data-table-features';
import {
  AlertConditionLabel,
  AlertStatusBadge,
  formatAlertDate,
  formatTargetPrice,
} from './alert-status';

const columnHelper = createColumnHelper<AlertsTableFeatures, Alert>();

interface AlertsColumnsOptions {
  showTicker?: boolean;
  showActions?: boolean;
  enableSorting?: boolean;
}

function AlertRowActions({ alert }: { alert: Alert }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      await cancelAlert(alert.id);
      await queryClient.invalidateQueries({ queryKey: alertKeys.all });
      router.refresh();
    } catch {
      setIsCancelling(false);
    }
  };

  if (alert.status !== 'ACTIVE') {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="size-5" aria-label="Open menu" />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          variant="destructive"
          disabled={isCancelling}
          onClick={handleCancel}
        >
          <X />
          {isCancelling ? 'Cancelling...' : 'Cancel'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createAlertsColumns = ({
  showTicker = true,
  showActions = true,
  enableSorting = true,
}: AlertsColumnsOptions = {}) => {
  const tickerColumn = columnHelper.accessor('ticker', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Coin" />
    ),
    cell: ({ getValue }) => (
      <span className="font-medium uppercase">{getValue()}</span>
    ),
    filterFn: 'includesString',
    enableSorting,
  });

  const conditionColumn = columnHelper.accessor('condition', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Condition" />
    ),
    cell: ({ getValue }) => <AlertConditionLabel condition={getValue()} />,
    enableSorting,
  });

  const targetPriceColumn = columnHelper.accessor('targetPrice', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Target price" />
    ),
    cell: ({ getValue }) => (
      <div className="font-medium">{formatTargetPrice(getValue())}</div>
    ),
    sortFn: (a, b, columnId) =>
      Number(a.getValue(columnId)) - Number(b.getValue(columnId)),
    enableSorting,
  });

  const statusColumn = columnHelper.accessor('status', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => <AlertStatusBadge status={getValue()} />,
    enableSorting,
  });

  const expiresAtColumn = columnHelper.accessor('expiresAt', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expires" />
    ),
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <div className="text-muted-foreground">
          {value ? formatAlertDate(value as string | Date) : 'Never'}
        </div>
      );
    },
    enableSorting,
  });

  const createdAtColumn = columnHelper.accessor('createdAt', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ getValue }) => (
      <div className="text-muted-foreground">
        {formatAlertDate(getValue() as string | Date)}
      </div>
    ),
    enableSorting,
  });

  const actionsColumn = columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <AlertRowActions alert={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  });

  return columnHelper.columns([
    ...(showTicker ? [tickerColumn] : []),
    conditionColumn,
    targetPriceColumn,
    statusColumn,
    expiresAtColumn,
    createdAtColumn,
    ...(showActions ? [actionsColumn] : []),
  ]);
};

export const alertsColumns = createAlertsColumns();

export const alertHistoryColumns = createAlertsColumns({
  showTicker: false,
  enableSorting: false,
});
