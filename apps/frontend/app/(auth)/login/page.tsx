import Image from 'next/image';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginButton } from './components';

export default function Login() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-20 font-">
      <div className="flex flex-col items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={128} height={128} />
        <h1 className="text-3xl font-bold">pulsee.</h1>
      </div>
      <Card size="default" className="mx-auto w-full max-w-xs">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Please log in to access your account and start using the
            application.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex-col gap-2">
          <LoginButton />
        </CardFooter>
      </Card>
    </div>
  );
}
