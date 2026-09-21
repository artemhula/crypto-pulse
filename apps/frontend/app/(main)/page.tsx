import { getCoins } from '@/lib/coins/get-coins';
import { CoinTable } from './components/coin-table.component';

export default async function Dashboard() {
  const coins = await getCoins();
  return <CoinTable initialCoins={coins} />;
}
