import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoginButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      render={<a href={process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL!} />}
    >
      <KeyRound />
      Log in with Google
    </Button>
  );
}
