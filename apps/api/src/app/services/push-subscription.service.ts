import { Injectable } from '@nestjs/common';
import { PrismaService } from '@crypto-pulse/db';

interface PushKeys {
  p256dh: string;
  auth: string;
}

interface SubscribePushDto {
  endpoint: string;
  keys: PushKeys;
  userAgent?: string;
}

@Injectable()
export class PushSubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(userId: string, dto: SubscribePushDto) {
    const data = {
      userId,
      endpoint: dto.endpoint,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
      userAgent: dto.userAgent,
    };

    await this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: data,
      update: { userId, p256dh: dto.keys.p256dh, auth: dto.keys.auth, userAgent: dto.userAgent },
    });

    return { success: true };
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });

    return { success: true };
  }
}
