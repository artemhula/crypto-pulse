import { IntegrationsCard, ProfileCard } from './components';

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <ProfileCard />
      <IntegrationsCard />
    </div>
  );
}
