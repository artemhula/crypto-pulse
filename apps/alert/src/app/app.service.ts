import { Inject, Injectable, Logger } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { AlertStatus, PrismaService } from '@crypto-pulse/db';
import {
  RabbitExchange,
  RabbitQueue,
  RabbitRoutingKey,
} from '@crypto-pulse/rabbitmq-common';

interface PriceUpdate {
  ticker: string;
  previousPrice: number | null;
  currentPrice: number;
}

interface CryptoUpdatedEvent {
  prices: PriceUpdate[];
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
            select: { telegramChatId: true },
          },
        },
      });

      for (const alert of alerts) {
        if (
          !this.hasCrossedLevel(price.previousPrice, price.currentPrice, alert)
        ) {
          continue;
        }

        if (!alert.user.telegramChatId) {
          continue;
        }

        const claimed = await this.prisma.alert.updateMany({
          where: { id: alert.id, status: AlertStatus.ACTIVE },
          data: { status: AlertStatus.TRIGGERED },
        });

        if (claimed.count !== 1) {
          continue;
        }

        await this.amqpConnection.publish(
          RabbitExchange.Telegram,
          RabbitRoutingKey.Telegram.SendAlert,
          {
            alertId: alert.id,
            telegramChatId: alert.user.telegramChatId,
            ticker: alert.ticker,
            targetPrice: Number(alert.targetPrice),
            currentPrice: price.currentPrice,
            condition: alert.condition,
          },
        );
      }
    }

    this.logger.log('Alert processing completed');
  }

  private hasCrossedLevel(
    previousPrice: number,
    currentPrice: number,
    alert: { targetPrice: unknown; condition: string },
  ) {
    const targetPrice = Number(alert.targetPrice);

    if (alert.condition === 'ABOVE') {
      return previousPrice < targetPrice && currentPrice >= targetPrice;
    }

    return previousPrice > targetPrice && currentPrice <= targetPrice;
  }
}
