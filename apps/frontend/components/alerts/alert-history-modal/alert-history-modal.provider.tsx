'use client';

import { createContext, PropsWithChildren, useContext, useState } from 'react';
import type { Coin } from '@/types';
import { AlertHistoryModal } from './alert-history-modal.component';

type AlertHistoryModalContextValue = {
  isOpen: boolean;
  openModal: (coin: Coin) => void;
  closeModal: () => void;
  coin?: Coin;
};

export const AlertHistoryModalContext = createContext<
  AlertHistoryModalContextValue | undefined
>(undefined);

export const useAlertHistoryModal = () => {
  const context = useContext(AlertHistoryModalContext);

  if (!context) {
    throw new Error(
      'useAlertHistoryModal must be used within an AlertHistoryModalProvider',
    );
  }

  return context;
};

export const AlertHistoryModalProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coin, setCoin] = useState<Coin>();

  const openModal = (coin: Coin) => {
    setCoin(coin);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCoin(undefined);
  };

  return (
    <AlertHistoryModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        coin,
      }}
    >
      {children}
      <AlertHistoryModal />
    </AlertHistoryModalContext.Provider>
  );
};
