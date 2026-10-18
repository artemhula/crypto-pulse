'use client';

import { Mail } from 'lucide-react';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TelegramIcon } from '@/components/icons';
import { useUser } from '@/context/user.context';
import { type AlertChannel } from '@/types/alert.type';

interface ChannelsFieldProps {
  channels: AlertChannel[];
  onChange: (channels: AlertChannel[]) => void;
}

const isAlertChannel = (value: string): value is AlertChannel =>
  value === 'TELEGRAM' || value === 'DISCORD' || value === 'EMAIL';

export const ChannelsField = ({ channels, onChange }: ChannelsFieldProps) => {
  const { user } = useUser();
  const isTelegramLinked = Boolean(user?.telegramChatId);

  const handleChange = (value: string[]) => {
    const selected = value.filter(isAlertChannel);

    if (selected.length === 0) {
      return;
    }

    onChange(selected);
  };

  return (
    <Field>
      <FieldLabel>Notify me via</FieldLabel>
      <ToggleGroup
        multiple
        value={channels}
        onValueChange={handleChange}
        className="max-w-sm"
      >
        <ToggleGroupItem value="EMAIL" className="gap-2">
          <Mail
            strokeWidth={0.5}
            className="size-2.5 shrink-0"
            fill="currentColor"
          />
          Email
        </ToggleGroupItem>
        <ToggleGroupItem
          value="TELEGRAM"
          disabled={!isTelegramLinked}
          className="gap-2"
        >
          <TelegramIcon className="size-2.5 shrink-0 text-[#229ED9]" />
          Telegram
        </ToggleGroupItem>
      </ToggleGroup>
      {!isTelegramLinked && (
        <FieldDescription>
          Link your Telegram account in Settings to receive alerts there.
        </FieldDescription>
      )}
    </Field>
  );
};
