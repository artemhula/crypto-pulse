'use client';

import Image from 'next/image';
import { cn } from 'cn';
import { Triangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ActionButtons } from './action-buttons.component';
import { useQuery } from '@tanstack/react-query';
import { getCoins } from '@/lib/coins/get-coins';
import type { Coin } from '@/types/coin.type';
import { SearchSortBar, useSearchSort } from './search-sort-bar';

interface CoinTableProps {
  initialCoins: Coin[];
}

export const CoinTable = ({ initialCoins }: CoinTableProps) => {
  const { data, error } = useQuery({
    queryKey: ['coins'],
    queryFn: getCoins,
    initialData: initialCoins,
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const {
    data: coins,
    handleSearch,
    handleSort,
  } = useSearchSort({
    initialData: data,
    initialOrderOption: { field: 'marketCap', order: 'desc' },
  });

  if (error && coins.length === 0) {
    return <p>Error loading coins.</p>;
  }

  return (
    <>
      <SearchSortBar<Coin> onSearch={handleSearch} onSort={handleSort} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Coin</TableHead>
            <TableHead className="font-bold text-right">Price (USD)</TableHead>
            <TableHead className="font-bold text-right w-60">
              Price change (1h)
            </TableHead>
            <TableHead className="font-bold text-right w-60">
              Price change (24h)
            </TableHead>
            <TableHead className="font-bold text-right w-60">
              Market Cap (USD)
            </TableHead>
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
              <TableCell>
                <div
                  className={cn(
                    'flex items-center justify-end gap-0.5 font-medium',
                    {
                      'text-green-500': coin.priceChangePercentage1h > 0,
                      'text-red-500': coin.priceChangePercentage1h < 0,
                    },
                  )}
                >
                  <Triangle
                    size={10}
                    strokeWidth={0.5}
                    fill="currentColor"
                    className={cn({
                      'rotate-180': coin.priceChangePercentage1h < 0,
                    })}
                  />
                  {Math.abs(coin.priceChangePercentage1h).toFixed(2)}%
                </div>
              </TableCell>
              <TableCell>
                <div
                  className={cn(
                    'flex items-center justify-end gap-0.5 font-medium',
                    {
                      'text-green-500': coin.priceChangePercentage24h > 0,
                      'text-red-500': coin.priceChangePercentage24h < 0,
                    },
                  )}
                >
                  <Triangle
                    size={10}
                    strokeWidth={0.5}
                    fill="currentColor"
                    className={cn({
                      'rotate-180': coin.priceChangePercentage24h < 0,
                    })}
                  />
                  {Math.abs(coin.priceChangePercentage24h).toFixed(2)}%
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {coin.marketCap.toString().replace(/(.)(?=(\d{3})+$)/g, '$1 ')}
              </TableCell>
              <TableCell className="flex justify-end">
                <ActionButtons />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
