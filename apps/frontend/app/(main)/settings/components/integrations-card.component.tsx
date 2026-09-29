'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TelegramIntegration } from './telegram-integration.component';
import { DiscordIcon } from './icons/discord-icon.component';
import { GmailIcon } from './icons/gmail-icon.component';

const comingSoon = [
  {
    icon: DiscordIcon,
    name: 'Discord',
    description: 'Receive price alerts in Discord',
  },
  {
    icon: GmailIcon,
    name: 'Email',
    description: 'Receive price alerts via email',
  },
];

export function IntegrationsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>
          Choose where your price alerts are delivered.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <TelegramIntegration />

        {comingSoon.map((item) => (
          <div key={item.name} className="flex flex-col gap-3">
            <Separator />
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <item.icon className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Badge variant="outline">Coming soon</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
