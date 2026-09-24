'use client';

import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { Coin } from '@/types';
import { CreateAlertModal } from './create-alert-modal.component';

type CreateAlertModalContextValue = {
  isOpen: boolean;
  openModal: (coin?: Coin) => void;
  closeModal: () => void;
  coin?: Coin;
};

export const CreateAlertModalContext = createContext<
  CreateAlertModalContextValue | undefined
>(undefined);

export const useCreateAlertModal = () => {
  const context = useContext(CreateAlertModalContext);

  if (!context) {
    throw new Error(
      'useCreateAlertModal must be used within a CreateAlertModalProvider',
    );
  }

  return context;
};

export const CreateAlertModalProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coin, setCoin] = useState<Coin>();

  const openModal = (coin?: Coin) => {
    setCoin(coin);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCoin(undefined);
  };

  return (
    <CreateAlertModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        coin,
      }}
    >
      {children}
      <CreateAlertModal />
    </CreateAlertModalContext.Provider>
  );
};
