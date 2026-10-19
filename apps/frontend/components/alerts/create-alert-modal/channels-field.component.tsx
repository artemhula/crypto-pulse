'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { getPushSubscription, isPushSupported } from '@/lib';
import { GmailIcon, TelegramIcon } from '@/components/icons';
import { useUser } from '@/context/user.context';
import { type AlertChannel } from '@/types/alert.type';

interface ChannelsFieldProps {
  channels: AlertChannel[];
  onChange: (channels: AlertChannel[]) => void;
}

const isAlertChannel = (value: string): value is AlertChannel =>
  value === 'TELEGRAM' ||
  value === 'DISCORD' ||
  value === 'EMAIL' ||
  value === 'PUSH';

export const ChannelsField = ({ channels, onChange }: ChannelsFieldProps) => {
  const { user } = useUser();
  const isTelegramLinked = Boolean(user?.telegramChatId);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getPushSubscription()
      .then((subscription) => {
        if (!cancelled) {
          setIsPushEnabled(Boolean(subscription));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (value: string[]) => {
    const selected = value.filter(isAlertChannel);

    if (selected.length === 0) {
      return;
    }

    onChange(selected);
  };

  const showPushHint = !isPushEnabled && isPushSupported();

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
          <GmailIcon className="size-3 shrink-0" />
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
        <ToggleGroupItem
          value="PUSH"
          disabled={!isPushEnabled}
          className="gap-2"
        >
          <Bell className="size-2.5 shrink-0" />
          Push
        </ToggleGroupItem>
      </ToggleGroup>
      {!isTelegramLinked && (
        <FieldDescription>
          Link your Telegram account in Settings to receive alerts there.
        </FieldDescription>
      )}
      {showPushHint && (
        <FieldDescription>
          Enable browser notifications in Settings to receive push alerts.
        </FieldDescription>
      )}
    </Field>
  );
};
