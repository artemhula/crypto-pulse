import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from '@crypto-pulse/db';
import {
  RabbitExchange,
  RabbitQueue,
  RabbitRoutingKey,
} from '@crypto-pulse/rabbitmq-common';
import {
  DEFAULT_MAX_SEND_ATTEMPTS,
  computeRetryDelay,
  getErrorStatusCode,
  sleep,
} from '@crypto-pulse/nest-common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';

interface PushAlertEvent {
  alertId: string;
  userId: string;
  ticker: string;
  targetPrice: number;
  currentPrice: number;
  condition: 'ABOVE' | 'BELOW';
}

@Injectable()
export class AppService implements OnModuleInit {
  private static readonly maxSendAttempts = DEFAULT_MAX_SEND_ATTEMPTS;
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const publicKey = this.configService.get<string>('WEB_PUSH_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('WEB_PUSH_PRIVATE_KEY');

    if (!publicKey || !privateKey) {
      this.logger.warn(
        'WEB_PUSH_PUBLIC_KEY / WEB_PUSH_PRIVATE_KEY are not set, push alerts will fail',
      );
      return;
    }

    webpush.setVapidDetails(
      this.configService.get<string>('WEB_PUSH_SUBJECT') || 'mailto:admin@example.com',
      publicKey,
      privateKey,
    );
  }

  @RabbitSubscribe({
    exchange: RabbitExchange.Push,
    routingKey: RabbitRoutingKey.Push.SendAlert,
    queue: RabbitQueue.PushAlerts,
    queueOptions: { durable: true },
  })
  async handleAlert(event: PushAlertEvent) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId: event.userId },
    });

    if (subscriptions.length === 0) {
      this.logger.warn(
        `No push subscriptions for user ${event.userId}, skipping alert ${event.alertId}`,
      );
      return;
    }

    const payload = JSON.stringify({
      title: `${event.ticker.toUpperCase()} price alert`,
      body:
        event.condition === 'ABOVE'
          ? `${event.ticker.toUpperCase()} is now $${event.currentPrice} (target $${event.targetPrice})`
          : `${event.ticker.toUpperCase()} dropped to $${event.currentPrice} (target $${event.targetPrice})`,
      url: '/alerts',
      alertId: event.alertId,
    });

    for (const subscription of subscriptions) {
      await this.sendPushWithRetry(event, subscription, payload);
    }
  }

  private async sendPushWithRetry(
    event: PushAlertEvent,
    subscription: {
      id: string;
      endpoint: string;
      p256dh: string;
      auth: string;
    },
    payload: string,
  ) {
    const pushSubscription: webpush.PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    for (let attempt = 1; attempt <= AppService.maxSendAttempts; attempt += 1) {
      try {
        await webpush.sendNotification(pushSubscription, payload);
        this.logger.log(
          `Push alert sent for ${event.alertId} to subscription ${subscription.id}`,
        );
        return;
      } catch (error) {
        const statusCode = getErrorStatusCode(error);

        if (statusCode === 404 || statusCode === 410) {
          await this.prisma.pushSubscription.delete({
            where: { id: subscription.id },
          });
          this.logger.warn(
            `Removed stale push subscription ${subscription.id} (status ${statusCode})`,
          );
          return;
        }

        if (attempt === AppService.maxSendAttempts) {
          this.logger.error(
            `Failed to send push alert ${event.alertId} after ${attempt} attempts`,
            error instanceof Error ? error.stack : undefined,
          );
          return;
        }

        const delayMs = computeRetryDelay(attempt, error, {
          statusCode,
          rateLimitStatus: 429,
          fallbackRateLimitDelayMs: 10_000,
        });
        this.logger.warn(
          `Retrying push alert ${event.alertId} in ${delayMs}ms (status ${statusCode})`,
        );
        await sleep(delayMs);
      }
    }
  }
}
