'use client';

import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AlertTable } from '@/components/alerts/alert-table';
import { alertKeys } from '@/components/alerts/alert-query-keys';
import { getAlerts } from '@/lib/alerts';
import type { GetAlertsResponse } from '@/types';

const PAGE_SIZE = 10;

interface AlertsTableProps {
  initialData: GetAlertsResponse;
}

export const AlertsTable = ({ initialData }: AlertsTableProps) => {
  const [page, setPage] = useState(initialData.page);

  const { data, isPending, isError } = useQuery({
    queryKey: [...alertKeys.list(), page],
    queryFn: () => getAlerts({ page, limit: PAGE_SIZE }),
    initialData: page === initialData.page ? initialData : undefined,
    placeholderData: keepPreviousData,
  });

  return (
    <AlertTable
      alerts={data?.items ?? []}
      isLoading={isPending}
      error={isError}
      pagination={{
        page: data?.page ?? page,
        limit: data?.limit ?? PAGE_SIZE,
        total: data?.total ?? 0,
        totalPages: data?.totalPages ?? 1,
      }}
      onPageChange={setPage}
    />
  );
};
