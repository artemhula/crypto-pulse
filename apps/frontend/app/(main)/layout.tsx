import { UserProvider } from '@/context';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { Header } from './components';

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
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
