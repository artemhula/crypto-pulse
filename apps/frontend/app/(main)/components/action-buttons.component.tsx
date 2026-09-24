'use client';

import React from 'react';
import { useMediaQuery } from '@uidotdev/usehooks';
import { Button } from '@/components/ui/button';
import { BellPlus, ListClock, MoreHorizontalIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCreateAlertModal } from '@/components/alerts/';
import { typenCoin } from '@/types/coin.type';

interface ActionButtonsProps {
  coin: Coin;
}

export const ActionButtons = ({ coin }: ActionButtonsProps) => {
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)');
  const { openModal } = useCreateAlertModal();

  const handleCreateAlert = () => {
    openModal(coin);
  };

  const handleShowAlertHistory = () => {
    // TODO: Implement show alert history functionality
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
      {isSmallDevice ? (
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
              <React.Fragment key={index}>
                <DropdownMenuItem onClick={action.onClick}>
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>

                {index < actions.length - 1 && <DropdownMenuSeparator />}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="icon"
              className="gap-1.5"
              aria-label={action.label}
              onClick={action.onClick}
            >
              {action.icon}
            </Button>
          ))}
        </>
      )}
    </div>
  );
};
