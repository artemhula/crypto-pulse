'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coin } from '@/types/coin.type';
import { AlertCondition } from '@/types/alert.type';
import { Info } from 'lucide-react';

interface AlertDetailsCardProps {
  coin: Coin;
  condition: AlertCondition;
  targetPrice?: number;
}

export const AlertDetailsCard = ({
  coin,
  condition,
  targetPrice,
}: AlertDetailsCardProps) => {
  const description =
    condition === 'ABOVE' && targetPrice && targetPrice < coin.currentPrice
      ? 'Price is already above this target. The alert will fire only after the price drops below and crosses back up.'
      : condition === 'BELOW' && targetPrice && targetPrice > coin.currentPrice
        ? 'Price is already below this target. The alert will fire only after the price rises above and crosses back down.'
        : `Triggers when the price crosses this target from ${condition.toLocaleLowerCase()}.`;

  return (
    <Card className="w-full border-blue-200 bg-blue-50 gap-1 px-4 py-2">
      <CardHeader className="px-0">
        <CardTitle className="flex flex-row gap-2 items-center text-gray-700 text-md">
          <Info size={16} />
          Alert Details
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <p className="text-sm text-muted-foreground">
          Current price:{' '}
          <span className="font-semibold">${coin.currentPrice}</span>
          <br />
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
