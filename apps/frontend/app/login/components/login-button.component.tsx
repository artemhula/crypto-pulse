'use client';

import { redirect } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoginButton() {
  const handleLogin = () => {
    redirect(process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL!);
  };

  return (
    <Button variant="outline" onClick={handleLogin} className="w-full">
      <KeyRound />
      Log in with Google
    </Button>
  );
}
