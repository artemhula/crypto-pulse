import { UserProvider } from '@/context';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { Header, Navbar } from './components';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="ru">
      <body>
        <UserProvider initialUser={user}>
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
              {children}
            </main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}