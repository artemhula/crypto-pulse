'use client';

import * as React from 'react';
import {
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Alert } from '@/types';
import { alertsColumns } from './columns';
import { alertsTableFeatures } from './data-table-features';

export interface AlertTablePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AlertTableProps {
  alerts: Alert[];
  columns?: typeof alertsColumns;
  showCoinFilter?: boolean;
  isLoading?: boolean;
  error?: boolean;
  emptyMessage?: string;
  /** Pass to switch the table to server-side pagination. */
  pagination?: AlertTablePagination;
  onPageChange?: (page: number) => void;
}

export function AlertTable({
  alerts,
  columns = alertsColumns,
  showCoinFilter = true,
  isLoading = false,
  error = false,
  emptyMessage = 'No alerts.',
  pagination,
  onPageChange,
}: AlertTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});
  const [pageIndex, setPageIndex] = React.useState(0);

  const isServerPaginated = !!pagination;

  const table = useTable({
    features: alertsTableFeatures,
    data: alerts,
    columns,
    manualPagination: isServerPaginated,
    pageCount: isServerPaginated
      ? Math.max(pagination.totalPages, 1)
      : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const pageCount = isServerPaginated
    ? Math.max(pagination.totalPages, 1)
    : Math.max(table.getPageCount(), 1);
  const currentPage = isServerPaginated ? pagination.page : pageIndex + 1;

  const goToPage = (nextPage: number) => {
    const target = Math.min(Math.max(nextPage, 1), pageCount);
    if (target === currentPage) return;
    if (isServerPaginated) {
      onPageChange?.(target);
    } else {
      setPageIndex(target - 1);
    }
  };

  return (
    <div>
      {showCoinFilter && (
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter by coin..."
            value={
              (table.getColumn('ticker')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('ticker')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((column) => {
                  return (
                    <TableHead key={column.id}>
                      {column.isPlaceholder ? null : (
                        <table.FlexRender header={column} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading alerts...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-destructive"
                >
                  Error loading alerts.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {currentPage} of {pageCount}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= pageCount || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
