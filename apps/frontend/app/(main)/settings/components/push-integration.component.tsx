'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Check, Loader2 } from 'lucide-react';
import {
  getPushSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function PushIntegration() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getPushSubscription()
      .then((subscription) => {
        if (!cancelled) {
          setIsSubscribed(Boolean(subscription));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsSubscribed(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = async () => {
    setIsPending(true);
    setError(null);

    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
      } else {
        await subscribeToPush();
        setIsSubscribed(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  if (!isPushSupported()) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Bell className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">Browser notifications</p>
        <p className="text-sm text-muted-foreground">
          {error ?? 'Receive price alerts as browser notifications'}
        </p>
      </div>
      {isChecking ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : isSubscribed ? (
        <>
          <Badge variant="secondary">
            <Check />
            Enabled
          </Badge>
          <Button
            variant="outline"
            onClick={handleToggle}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <BellOff />
            )}
            Disable
          </Button>
        </>
      ) : (
        <Button onClick={handleToggle} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Bell />}
          Enable
        </Button>
      )}
    </div>
  );
}
