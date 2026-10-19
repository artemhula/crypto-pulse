import { Inject, Injectable, Logger } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  AlertCondition,
  AlertStatus,
  ChannelType,
  PrismaService,
} from '@crypto-pulse/db';
import {
  RabbitExchange,
  RabbitQueue,
  RabbitRoutingKey,
} from '@crypto-pulse/rabbitmq-common';
import { Cron, CronExpression } from '@nestjs/schedule';

interface PriceUpdate {
  ticker: string;
  previousPrice: number | null;
  currentPrice: number;
}

interface CryptoUpdatedEvent {
  prices: PriceUpdate[];
}

interface AlertForDispatch {
  id: string;
  userId: string;
  ticker: string;
  targetPrice: unknown;
  condition: string;
  user: { email: string; telegramChatId: string | null };
  channels: { type: ChannelType }[];
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AmqpConnection) private readonly amqpConnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    exchange: RabbitExchange.Crypto,
    routingKey: RabbitRoutingKey.Crypto.Updated,
    queue: RabbitQueue.AlertProcessing,
    queueOptions: {
      durable: true,
    },
  })
  public async handleCryptoUpdate(event: CryptoUpdatedEvent) {
    for (const price of event.prices) {
      if (price.previousPrice === null) {
        continue;
      }

      const alerts = await this.prisma.alert.findMany({
        where: {
          ticker: price.ticker,
          status: AlertStatus.ACTIVE,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: {
          user: {
            select: { email: true, telegramChatId: true },
          },
          channels: {
            select: { type: true },
          },
        },
      });

      for (const alert of alerts) {
        if (
          !this.hasCrossedLevel(price.previousPrice, price.currentPrice, alert)
        ) {
          continue;
        }

        const claimed = await this.prisma.alert.updateMany({
          where: { id: alert.id, status: AlertStatus.ACTIVE },
          data: { status: AlertStatus.TRIGGERED },
        });

        if (claimed.count !== 1) {
          continue;
        }

        await this.dispatch(alert, price.currentPrice);
      }
    }

    this.logger.log('Alert processing completed');
  }

  private async dispatch(alert: AlertForDispatch, currentPrice: number) {
    const enabledChannels = this.resolveChannels(alert);

    if (enabledChannels.size === 0) {
      this.logger.warn(
        `Alert ${alert.id} has no supported notification channels, skipping dispatch`,
      );
      return;
    }

    const payloads: {
      exchange: RabbitExchange;
      routingKey: string;
      payload: Record<string, unknown>;
    }[] = [];

    if (enabledChannels.has(ChannelType.TELEGRAM)) {
      if (alert.user.telegramChatId) {
        payloads.push({
          exchange: RabbitExchange.Telegram,
          routingKey: RabbitRoutingKey.Telegram.SendAlert,
          payload: {
            alertId: alert.id,
            telegramChatId: alert.user.telegramChatId,
            ticker: alert.ticker,
            targetPrice: Number(alert.targetPrice),
            currentPrice,
            condition: alert.condition,
          },
        });
      } else {
        this.logger.warn(
          `Alert ${alert.id} targets Telegram but the user is not linked, skipping`,
        );
      }
    }

    if (enabledChannels.has(ChannelType.EMAIL)) {
      payloads.push({
        exchange: RabbitExchange.Email,
        routingKey: RabbitRoutingKey.Email.SendAlert,
        payload: {
          alertId: alert.id,
          email: alert.user.email,
          ticker: alert.ticker,
          targetPrice: Number(alert.targetPrice),
          currentPrice,
          condition: alert.condition,
        },
      });
    }

    if (enabledChannels.has(ChannelType.PUSH)) {
      payloads.push({
        exchange: RabbitExchange.Push,
        routingKey: RabbitRoutingKey.Push.SendAlert,
        payload: {
          alertId: alert.id,
          userId: alert.userId,
          ticker: alert.ticker,
          targetPrice: Number(alert.targetPrice),
          currentPrice,
          condition: alert.condition,
        },
      });
    }

    const unsupported = [...enabledChannels].filter(
      (type) =>
        type !== ChannelType.TELEGRAM &&
        type !== ChannelType.EMAIL &&
        type !== ChannelType.PUSH,
    );

    if (unsupported.length > 0) {
      this.logger.warn(
        `Alert ${alert.id} has unsupported channels: ${unsupported.join(', ')}`,
      );
    }

    const results = await Promise.allSettled(
      payloads.map(({ exchange, routingKey, payload }) =>
        this.amqpConnection.publish(exchange, routingKey, payload),
      ),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to publish ${payloads[index].routingKey} for alert ${alert.id}`,
          result.reason instanceof Error ? result.reason.stack : undefined,
        );
      }
    });
  }

  private resolveChannels(alert: AlertForDispatch) {
    if (alert.channels.length === 0) {
      this.logger.warn(
        `Alert ${alert.id} has no stored channels, skipping dispatch`,
      );
    }

    return new Set(alert.channels.map(({ type }) => type));
  }

  private hasCrossedLevel(
    previousPrice: number,
    currentPrice: number,
    alert: { targetPrice: unknown; condition: string },
  ) {
    const targetPrice = Number(alert.targetPrice);

    if (alert.condition === AlertCondition.ABOVE) {
      return previousPrice < targetPrice && currentPrice >= targetPrice;
    }

    return previousPrice > targetPrice && currentPrice <= targetPrice;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async expireAlerts() {
    const result = await this.prisma.alert.updateMany({
      where: {
        status: AlertStatus.ACTIVE,
        expiresAt: { lt: new Date() },
      },
      data: { status: AlertStatus.EXPIRED },
    });

    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} alerts as EXPIRED`);
    }
  }
}
