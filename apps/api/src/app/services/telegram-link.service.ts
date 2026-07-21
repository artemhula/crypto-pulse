import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import * as crypto from 'crypto';
import { type TelegramLink } from '../interfaces';

@Injectable()
export class TelegramLinkService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async generateTelegramLink(userId: string): Promise<TelegramLink> {
    const code = await this.createTelegramCode(userId);
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    return {
      link: `https://t.me/${botUsername}?start=${code}`,
      code,
    };
  }

  private async createTelegramCode(userId: string): Promise<string> {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    const isSaved = await this.redis.set(
      `telegram_code:${code}`,
      userId,
      'EX',
      300,
      'NX',
    );

    if (isSaved !== 'OK') {
      throw new Error('Сould not save the code. Please try again.');
    }

    return code;
  }
}
