import { getAlerts } from '@/lib/alerts/get-alerts';
import { InfoCards } from './components/info-cards.component';
import { AlertTable } from '@/components/alerts/alert-table';

export default async function AlertsPage() {
  const alertsResult = await getAlerts();
  const { items, counts } = alertsResult;

  return (
    <>
      <InfoCards counts={counts} />
      <AlertTable alerts={items} />
    </>
  );
}
