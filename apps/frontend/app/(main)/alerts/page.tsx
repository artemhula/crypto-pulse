import { getAlerts } from '@/lib/alerts/get-alerts';
import { InfoCards } from './components/info-cards.component';
import { AlertsTable } from './components/alerts-table.component';

export default async function AlertsPage() {
  const alertsResult = await getAlerts();
  const { counts } = alertsResult;

  return (
    <>
      <InfoCards counts={counts} />
      <AlertsTable initialData={alertsResult} />
    </>
  );
}
