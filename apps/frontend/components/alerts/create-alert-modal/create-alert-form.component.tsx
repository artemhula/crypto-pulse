'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { CoinSelector } from './coin-selector.component';
import { ConditionField } from './condition-field.component';
import { TargetPriceField } from './target-price-field.component';
import { AlertDetailsCard } from './alert-details-card.component';
import { useCreateAlertModal } from './create-alert-modal.provider';
import { ExpirationField } from './expiration-field.component';
import { createAlert, CreateAlertInput } from '@/lib/alerts';
import { getCoins } from '@/lib/coins/get-coins';
import { type AlertCondition } from '@/types/alert.type';
import { type Coin } from '@/types/coin.type';

interface CreateAlertFormProps {
  coin?: Coin;
}

export const CreateAlertForm = ({ coin }: CreateAlertFormProps) => {
  const router = useRouter();
  const { closeModal } = useCreateAlertModal();
  const [chosenCoin, setChosenCoin] = useState<Coin | undefined>(coin);
  const [targetPrice, setTargetPrice] = useState<number | undefined>(undefined);
  const [condition, setCondition] = useState<AlertCondition>('ABOVE');
  const [isExpirationEnabled, setIsExpirationEnabled] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const { data: coins } = useQuery({
    queryKey: ['coins'],
    queryFn: getCoins,
  });
  const mutation = useMutation({
    mutationFn: (input: CreateAlertInput) => createAlert(input),
    onSuccess: () => {
      closeModal();
      router.refresh();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!chosenCoin || !targetPrice || targetPrice <= 0) return;
    mutation.mutate({
      ticker: chosenCoin.symbol,
      targetPrice,
      condition,
      expiresAt: isExpirationEnabled ? date?.toISOString() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <CoinSelector
          coins={coins}
          selectedCoin={chosenCoin}
          onSelect={setChosenCoin}
        />
        <div className="grid max-w-sm grid-cols-1 md:grid-cols-2 gap-6">
          <ConditionField condition={condition} onChange={setCondition} />
          <TargetPriceField value={targetPrice} onChange={setTargetPrice} />
        </div>
        {chosenCoin && (
          <AlertDetailsCard
            coin={chosenCoin}
            condition={condition}
            targetPrice={targetPrice}
          />
        )}
        <ExpirationField
          enabled={isExpirationEnabled}
          onEnabledChange={setIsExpirationEnabled}
          date={date}
          onDateChange={setDate}
        />
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">Create alert</Button>
      </DialogFooter>
    </form>
  );
};
