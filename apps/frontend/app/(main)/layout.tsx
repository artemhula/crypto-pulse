import { redirect } from 'next/navigation';
import { UserProvider } from '@/context';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { AlertHistoryModalProvider } from '@/components/alerts/alert-history-modal';
import { CreateAlertModalProvider } from '@/components/alerts/create-alert-modal';
import { Header, Navbar } from './components';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <UserProvider initialUser={user}>
      <CreateAlertModalProvider>
        <AlertHistoryModalProvider>
          <div className="flex h-screen flex-col overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <Navbar />
              <main className="flex-1 overflow-y-auto p-4 pb-20 lg:pb-6">
                {children}
              </main>
            </div>
          </div>
        </AlertHistoryModalProvider>
      </CreateAlertModalProvider>
    </UserProvider>
  );
}
