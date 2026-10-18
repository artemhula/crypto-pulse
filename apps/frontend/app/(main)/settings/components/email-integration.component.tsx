'use client';

import { Check } from 'lucide-react';
import { useUser } from '@/context/user.context';
import { Badge } from '@/components/ui/badge';
import { GmailIcon } from '@/components/icons/gmail-icon.component';

export function EmailIntegration() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#EA4335]/10">
        <GmailIcon className="size-5 text-[#EA4335]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">Email</p>
        <p className="truncate text-sm text-muted-foreground">
          {user.email}
        </p>
      </div>
      <Badge variant="secondary">
        <Check />
        Connected
      </Badge>
    </div>
  );
}
