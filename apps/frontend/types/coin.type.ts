export type Coin = {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  image?: string;
  updatedAt: Date;
};