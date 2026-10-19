'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { BellPlus, ListClock, MoreHorizontalIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAlertHistoryModal, useCreateAlertModal } from '@/components/alerts';
import type { Coin } from '@/types/coin.type';

interface ActionButtonsProps {
  coin: Coin;
}

export const ActionButtons = ({ coin }: ActionButtonsProps) => {
  const { openModal: openCreateAlertModal } = useCreateAlertModal();
  const { openModal: openHistoryModal } = useAlertHistoryModal();

  const handleCreateAlert = () => {
    openCreateAlertModal(coin);
  };

  const handleShowAlertHistory = () => {
    openHistoryModal(coin);
  };

  const actions = [
    {
      label: 'Create new alert',
      icon: <BellPlus />,
      onClick: handleCreateAlert,
    },
    {
      label: 'Show alert history',
      icon: <ListClock />,
      onClick: handleShowAlertHistory,
    },
  ];

  return (
    <div className="flex gap-2 pt-1">
      <div className="hidden gap-2 md:flex">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="icon"
            className="gap-1.5"
            aria-label={action.label}
            onClick={action.onClick}
          >
            {action.icon}
          </Button>
        ))}
      </div>
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontalIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-40">
            {actions.map((action, index) => (
              <React.Fragment key={action.label}>
                <DropdownMenuItem onClick={action.onClick}>
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>

                {index < actions.length - 1 && <DropdownMenuSeparator />}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
