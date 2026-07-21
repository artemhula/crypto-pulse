import { Injectable } from '@nestjs/common';
import { PrismaService } from '@crypto-pulse/db';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateTelegramChatId(userId: string, telegramId: number) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { telegramChatId: String(telegramId) },
      });
      return { success: true };
    } catch {
      return { success: false, reason: 'CONFLICT' };
    }
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
