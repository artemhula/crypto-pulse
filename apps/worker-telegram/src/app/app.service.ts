import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Update, On, Ctx } from 'nestjs-telegraf';
import { Redis } from 'ioredis';
import { Context } from 'telegraf';
import {
  RabbitExchange,
  RabbitRoutingKey,
} from '@crypto-pulse/rabbitmq-common';

@Update()
@Injectable()
export class AppService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly amqpConnection: AmqpConnection,
  ) {}

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
