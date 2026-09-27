'use client';

import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAlertHistoryModal } from './alert-history-modal.provider';
import { getAlertsByTicker } from '@/lib/alerts';
import { alertKeys } from '@/components/alerts/alert-query-keys';
import {
  AlertTable,
  alertHistoryColumns,
} from '@/components/alerts/alert-table';

const HISTORY_PAGE_SIZE = 10;

export const AlertHistoryModal = () => {
  const { isOpen, closeModal, coin } = useAlertHistoryModal();
  const [page, setPage] = useState(1);

  const { data, isPending, isError } = useQuery({
    queryKey: alertKeys.byTicker(coin?.symbol ?? ''),
    queryFn: () =>
      getAlertsByTicker(coin!.symbol, { page, limit: HISTORY_PAGE_SIZE }),
    enabled: isOpen && !!coin,
    placeholderData: keepPreviousData,
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setPage(1);
          closeModal();
        }
      }}
    >
      <DialogContent className="flex max-h-[80vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle>
            Alert History - {coin?.name} ({coin?.symbol.toUpperCase()})
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex-1 overflow-auto">
          <AlertTable
            alerts={data?.items ?? []}
            columns={alertHistoryColumns}
            showCoinFilter={false}
            isLoading={isPending}
            error={isError}
            emptyMessage="No alerts found for this coin."
            pagination={{
              page: data?.page ?? page,
              limit: data?.limit ?? HISTORY_PAGE_SIZE,
              total: data?.total ?? 0,
              totalPages: data?.totalPages ?? 1,
            }}
            onPageChange={setPage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
