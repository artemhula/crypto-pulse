export type Coin = {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  marketCap: number;
  priceChangePercentage1h: number;
  priceChangePercentage24h: number;
  image?: string;
  updatedAt: Date;
};
