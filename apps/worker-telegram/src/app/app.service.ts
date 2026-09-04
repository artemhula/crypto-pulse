import { Inject, Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Update, On, Ctx } from 'nestjs-telegraf';
import { InjectBot } from 'nestjs-telegraf';
import { Redis } from 'ioredis';
import { Context } from 'telegraf';
import { Telegraf } from 'telegraf';
import {
  RabbitExchange,
  RabbitQueue,
  RabbitRoutingKey,
} from '@crypto-pulse/rabbitmq-common';

interface TelegramAlertEvent {
  alertId: string;
  telegramChatId: string;
  ticker: string;
  targetPrice: number;
  currentPrice: number;
  condition: 'ABOVE' | 'BELOW';
}

@Update()
@Injectable()
export class AppService {
  private static readonly maxSendAttempts = 3;
  private static readonly minSendIntervalMs = 40;
  private readonly logger = new Logger(AppService.name);
  private lastSendAt = 0;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly amqpConnection: AmqpConnection,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  @RabbitSubscribe({
    exchange: RabbitExchange.Telegram,
    routingKey: RabbitRoutingKey.Telegram.SendAlert,
    queue: RabbitQueue.TelegramAlerts,
    queueOptions: { durable: true },
  })
  async handleAlert(event: TelegramAlertEvent) {
    const direction = event.condition === 'ABOVE' ? 'above' : 'below';
    const message = [
      `Crypto Pulse: ${event.ticker.toUpperCase()}`,
      `Price crossed the level ${direction} ${event.targetPrice}.`,
      `Current price: ${event.currentPrice}`,
    ].join('\n');

    await this.sendAlertWithRetry(event, message);
  }

  private async sendAlertWithRetry(event: TelegramAlertEvent, message: string) {
    for (let attempt = 1; attempt <= AppService.maxSendAttempts; attempt += 1) {
      await this.waitForTelegramRateLimit();

      try {
        await this.bot.telegram.sendMessage(event.telegramChatId, message);
        this.logger.log(`Telegram alert sent for ${event.alertId}`);
        return;
      } catch (error) {
        const errorCode = this.getTelegramErrorCode(error);

        if (errorCode === 403) {
          this.logger.warn(
            `Telegram user blocked the bot for alert ${event.alertId}`,
          );
          return;
        }

        if (attempt === AppService.maxSendAttempts) {
          this.logger.error(
            `Failed to send Telegram alert ${event.alertId} after ${attempt} attempts`,
            error,
          );
          throw error;
        }

        const retryAfter = this.getRetryAfterSeconds(error);
        const delayMs = retryAfter
          ? retryAfter * 1000
          : 1000 * 2 ** (attempt - 1);

        this.logger.warn(
          `Retrying Telegram alert ${event.alertId} in ${delayMs}ms`,
        );
        await this.delay(delayMs);
      }
    }
  }

  private async waitForTelegramRateLimit() {
    const elapsed = Date.now() - this.lastSendAt;
    const delayMs = Math.max(0, AppService.minSendIntervalMs - elapsed);

    if (delayMs > 0) {
      await this.delay(delayMs);
    }

    this.lastSendAt = Date.now();
  }

  private getTelegramErrorCode(error: unknown) {
    return this.getTelegramErrorResponse(error)?.error_code;
  }

  private getRetryAfterSeconds(error: unknown) {
    if (this.getTelegramErrorCode(error) !== 429) {
      return undefined;
    }

    return this.getTelegramErrorResponse(error)?.parameters?.retry_after;
  }

  private getTelegramErrorResponse(error: unknown) {
    if (typeof error !== 'object' || error === null || !('response' in error)) {
      return undefined;
    }

    const response = error.response;
    if (typeof response !== 'object' || response === null) {
      return undefined;
    }

    const telegramResponse = response as {
      error_code?: unknown;
      parameters?: { retry_after?: unknown };
    };

    return {
      error_code:
        typeof telegramResponse.error_code === 'number'
          ? telegramResponse.error_code
          : undefined,
      parameters: {
        retry_after:
          typeof telegramResponse.parameters?.retry_after === 'number'
            ? telegramResponse.parameters.retry_after
            : undefined,
      },
    };
  }

  private delay(delayMs: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, delayMs));
  }

  @On('text')
  async handleText(@Ctx() ctx: Context) {
    const messageText =
      ctx.message && 'text' in ctx.message ? ctx.message.text : '';

    if (!messageText.startsWith('/start')) {
      return;
    }

    const code = this.extractStartCode(messageText);

    if (!code) {
      await ctx.reply(
        'Please use the /start command with a valid code to link your Telegram account.',
      );
      return;
    }

    const telegramId = ctx.from?.id;

    if (!telegramId) {
      await ctx.reply('Failed to determine Telegram account.');
      return;
    }

    const userId = await this.redis.get(`telegram_code:${code}`);

    if (!userId) {
      await ctx.reply('The code is invalid or has already expired.');
      return;
    }

    const response = await this.amqpConnection.request<
      | { success: true }
      | {
          success: false;
          reason: 'USER_NOT_FOUND' | 'ALREADY_LINKED' | 'CONFLICT';
        }
    >({
      exchange: RabbitExchange.Telegram,
      routingKey: RabbitRoutingKey.Telegram.Link,
      payload: {
        userId,
        telegramId,
        code,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
      },
    });

    if (!response.success) {
      if (response.reason === 'ALREADY_LINKED') {
        await ctx.reply(
          'This Telegram account is already linked to another profile.',
        );
        return;
      }

      await ctx.reply(
        'Failed to link Telegram account. Please try again later.',
      );
      return;
    }

    await this.redis.del(`telegram_code:${code}`);
    await ctx.reply('Telegram account has been successfully linked.');
  }

  private extractStartCode(messageText: string) {
    const match = messageText.match(/^\/start(?:\s+(.+))?$/);
    return match?.[1]?.trim() || null;
  }
}
