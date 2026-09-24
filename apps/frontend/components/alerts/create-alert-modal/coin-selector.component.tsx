'use client';

import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Field } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Coin } from '@/types/coin.type';

interface CoinSelectorProps {
  coins?: Coin[];
  selectedCoin?: Coin;
  onSelect: (coin?: Coin) => void;
}

export const CoinSelector = ({
  coins,
  selectedCoin,
  onSelect,
}: CoinSelectorProps) => {
  return (
    <Field className="min-w-40">
      <Label>Coin</Label>
      <Select
        value={selectedCoin?.id}
        onValueChange={(value) => {
          const selected = coins?.find((c) => c.id === value);
          onSelect(selected);
        }}
      >
        <SelectTrigger className="w-40">
          <div className="flex items-center gap-1">
            {selectedCoin?.image && (
              <Image
                src={selectedCoin.image}
                alt={selectedCoin.name}
                width={20}
                height={20}
              />
            )}
            <p className="font-medium">{selectedCoin?.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedCoin?.symbol.toUpperCase()}
            </p>
          </div>
        </SelectTrigger>
        <SelectContent className="w-60 md:w-80">
          <SelectGroup>
            {coins?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.image && (
                  <Image src={c.image} alt={c.name} width={20} height={20} />
                )}
                <span className="ml-2 mr-1">{c.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {c.symbol.toUpperCase()}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
};
