import { UserProvider } from '@/context';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { Header, Navbar } from './components';
import { CreateAlertModalProvider } from '@/components/alerts/create-alert-modal';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <UserProvider initialUser={user}>
      <CreateAlertModalProvider>
        <div className="flex h-screen flex-col overflow-hidden">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-4 pb-20 lg:pb-6">
              {children}
            </main>
          </div>
        </div>
      </CreateAlertModalProvider>
    </UserProvider>
  );
}
