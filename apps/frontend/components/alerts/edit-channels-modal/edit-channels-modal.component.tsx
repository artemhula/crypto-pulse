'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { ChannelsField } from '@/components/alerts/create-alert-modal/channels-field.component';
import { alertKeys } from '@/components/alerts/alert-query-keys';
import { updateAlert } from '@/lib/alerts';
import type { Alert, AlertChannel } from '@/types';

interface EditChannelsModalProps {
  alert: Alert;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditChannelsFormProps {
  alert: Alert;
  onClose: () => void;
}

const toChannelTypes = (channels: Alert['channels']): AlertChannel[] =>
  channels.map(({ type }) => type);

const EditChannelsForm = ({ alert, onClose }: EditChannelsFormProps) => {
  const queryClient = useQueryClient();
  const [channels, setChannels] = useState<AlertChannel[]>(() =>
    toChannelTypes(alert.channels),
  );

  const mutation = useMutation({
    mutationFn: () => updateAlert(alert.id, { channels }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: alertKeys.all });
      onClose();
    },
  });

  return (
    <>
      <FieldGroup>
        <ChannelsField channels={channels} onChange={setChannels} />
      </FieldGroup>
      {mutation.isError && (
        <p className="text-sm text-destructive">
          Failed to update channels. Please try again.
        </p>
      )}
      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="animate-spin" /> : null}
          Save
        </Button>
      </DialogFooter>
    </>
  );
};

export const EditChannelsModal = ({
  alert,
  open,
  onOpenChange,
}: EditChannelsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notification channels</DialogTitle>
          <DialogDescription>
            Choose how you want to be notified about the{' '}
            {alert.ticker.toUpperCase()} alert.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <EditChannelsForm
            key={alert.id}
            alert={alert}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
