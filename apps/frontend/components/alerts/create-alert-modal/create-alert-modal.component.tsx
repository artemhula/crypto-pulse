'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useCreateAlertModal } from './create-alert-modal.provider';
import { CreateAlertForm } from './create-alert-form.component';

export const CreateAlertModal = () => {
  const { isOpen, closeModal, coin } = useCreateAlertModal();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogTitle>Create new alert</DialogTitle>
        <CreateAlertForm coin={coin} />
      </DialogContent>
    </Dialog>
  );
};
