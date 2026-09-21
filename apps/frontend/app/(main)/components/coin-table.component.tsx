'use client';

import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ActionButtons } from './action-buttons.component';
import type { Coin } from '@/types/coin.type';
import { useQuery } from '@tanstack/react-query';
import { getCoins } from '@/lib/coins/get-coins';

interface CoinTableProps {
  initialCoins: Coin[];
}

export const CoinTable = ({ initialCoins }: CoinTableProps) => {
  const { data: coins, error } = useQuery({
    queryKey: ['coins'],
    queryFn: getCoins,
    initialData: initialCoins,
    staleTime: 15000,
    refetchInterval: 30000,
  });

  if (error && coins.length === 0) {
    return <p>Error loading coins.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">Coin</TableHead>
          <TableHead className="font-bold text-right">Price (USD)</TableHead>
          <TableHead className="font-bold text-right w-40">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coins.map((coin) => (
          <TableRow key={coin.id}>
            <TableCell>
              <div className="flex items-center space-x-4">
                {coin.image && (
                  <Image
                    src={coin.image}
                    alt={coin.name}
                    width={25}
                    height={25}
                  />
                )}
                <div>
                  <p className="font-medium">{coin.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {coin.symbol.toUpperCase()}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right font-medium">
              {coin.currentPrice}
            </TableCell>
            <TableCell className="flex justify-end">
              <ActionButtons />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
