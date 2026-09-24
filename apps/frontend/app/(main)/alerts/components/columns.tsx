'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createColumnHelper } from '@tanstack/react-table';
import { cn } from 'cn';
import { ArrowDown, ArrowUp, MoreHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cancelAlert } from '@/lib/alerts';
import type { Alert, AlertStatus } from '@/types';
import { DataTableColumnHeader } from './data-table-column-header';
import { type AlertsTableFeatures } from './data-table-features';

const columnHelper = createColumnHelper<AlertsTableFeatures, Alert>();

const STATUS_COLORS: Record<AlertStatus, string> = {
  ACTIVE: 'text-yellow-600 border-yellow-600/40',
  TRIGGERED: 'text-green-600 border-green-600/40',
  EXPIRED: 'text-red-600 border-red-600/40',
  CANCELLED: 'text-gray-500 border-foreground/15',
};

const isAfter = (a: string, b: string) => a.localeCompare(b) > 0;

function AlertRowActions({ alert }: { alert: Alert }) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      await cancelAlert(alert.id);
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

export const alertsColumns = columnHelper.columns([
  columnHelper.accessor('ticker', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Coin" />
    ),
    cell: ({ getValue }) => (
      <span className="font-medium uppercase">{getValue()}</span>
    ),
    filterFn: 'includesString',
  }),
  columnHelper.accessor('condition', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Condition" />
    ),
    cell: ({ getValue }) => {
      const condition = getValue();
      return (
        <div className="flex items-center gap-1.5 font-medium">
          {condition === 'ABOVE' ? (
            <ArrowUp className="size-3 text-green-500" />
          ) : (
            <ArrowDown className="size-3 text-red-500" />
          )}
          {condition}
        </div>
      );
    },
    filterFn: 'equalsString',
  }),
  columnHelper.accessor('targetPrice', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Target price" />
    ),
    cell: ({ getValue }) => {
      const price = getValue();
      return <div className=" font-medium">${price}</div>;
    },
    sortFn: (a, b) =>
      isAfter(
        String(a.getValue('targetPrice')),
        String(b.getValue('targetPrice')),
      )
        ? 1
        : -1,
  }),
  columnHelper.accessor('status', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => {
      const status = getValue();
      return (
        <Badge
          variant="outline"
          className={cn('border', STATUS_COLORS[status])}
        >
          {status}
        </Badge>
      );
    },
    filterFn: 'equalsString',
  }),
  columnHelper.accessor('expiresAt', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expires" />
    ),
    cell: ({ getValue }) => (
      <div className="text-muted-foreground">
        {new Date(getValue() as string | Date).toLocaleDateString()}
      </div>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ getValue }) => (
      <div className="text-muted-foreground">
        {new Date(getValue() as string | Date).toLocaleDateString()}
      </div>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <AlertRowActions alert={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }),
]);
