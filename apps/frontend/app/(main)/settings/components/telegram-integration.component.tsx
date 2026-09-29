'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, Loader2, Send, Unlink } from 'lucide-react';
import { useUser } from '@/context/user.context';
import { getCurrentUser, getTelegramLink, unlinkTelegram } from '@/lib';
import type { TelegramLink } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { TelegramIcon } from './icons';

const userKeys = {
  me: ['auth', 'me'] as const,
};

const POLL_INTERVAL_MS = 3_000;
const LINK_TTL_MS = 300_000;

export function TelegramIntegration() {
  const { user, setUser } = useUser();
  const [link, setLink] = useState<TelegramLink | null>(null);
  const [deadline, setDeadline] = useState(0);
  const [isConfirmUnlink, setIsConfirmUnlink] = useState(false);

  const linkMutation = useMutation({
    mutationFn: getTelegramLink,
    onSuccess: (data) => {
      setLink(data);
      setDeadline(Date.now() + LINK_TTL_MS);
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: unlinkTelegram,
    onSuccess: () => {
      setUser((prev) => (prev ? { ...prev, telegramChatId: null } : prev));
      setIsConfirmUnlink(false);
    },
  });

  useQuery({
    queryKey: userKeys.me,
    queryFn: async () => {
      const fresh = await getCurrentUser();
      const telegramChatId = fresh?.telegramChatId;

      if (fresh?.telegramChatId) {
        setUser((prev) => (prev ? { ...prev, telegramChatId } : prev));
        setLink(null);
      }

      return fresh;
    },
    enabled: link !== null,
    refetchInterval: (query) =>
      query.state.data?.telegramChatId ? false : POLL_INTERVAL_MS,
  });

  useEffect(() => {
    if (!link) return;
    const timer = setTimeout(
      () => setLink(null),
      Math.max(0, deadline - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [link, deadline]);

  if (!user) return null;

  const isLinked = Boolean(user.telegramChatId);
  const error = linkMutation.error ?? unlinkMutation.error;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#229ED9]/10">
          <TelegramIcon className="size-5 text-[#229ED9]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Telegram</p>
          <p className="text-sm text-muted-foreground">
            {isLinked
              ? `Connected to chat ${user.telegramChatId}`
              : 'Receive price alerts in Telegram'}
          </p>
        </div>
        {isLinked ? (
          <>
            <Badge variant="secondary">
              <Check />
              Connected
            </Badge>
            <Button
              variant="outline"
              onClick={() => setIsConfirmUnlink(true)}
              disabled={unlinkMutation.isPending}
            >
              <Unlink />
              Unlink
            </Button>
          </>
        ) : (
          <Button
            onClick={() => linkMutation.mutate()}
            disabled={linkMutation.isPending || link !== null}
          >
            {linkMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
            Link Telegram
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      {link && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Send this code to the bot, or just open the link.
            </p>
            <div className="flex items-center gap-2">
              <code className="rounded-md bg-muted px-3 py-1.5 font-mono text-sm">
                {link.code}
              </code>
              <Button
                variant="outline"
                render={<a href={link.link} target="_blank" rel="noreferrer" />}
              >
                <Send />
                Open Telegram
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Waiting for confirmation...
            </p>
          </div>
        </>
      )}

      <Dialog open={isConfirmUnlink} onOpenChange={setIsConfirmUnlink}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlink Telegram?</DialogTitle>
            <DialogDescription>
              You will stop receiving alerts in Telegram until you link it
              again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsConfirmUnlink(false)}
              disabled={unlinkMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => unlinkMutation.mutate()}
              disabled={unlinkMutation.isPending}
            >
              {unlinkMutation.isPending ? 'Unlinking...' : 'Unlink'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
