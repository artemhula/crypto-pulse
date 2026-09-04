import { Injectable } from '@nestjs/common';
import { PrismaService } from '@crypto-pulse/db';
import { CreateAlertDto, UpdateAlertDto } from './dtos';

@Injectable()
export class AlertRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUserId(userId: string) {
    return this.prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdAndUserId(id: string, userId: string) {
    return this.prisma.alert.findFirst({
      where: { id, userId },
    });
  }

  create(userId: string, dto: CreateAlertDto) {
    return this.prisma.alert.create({
      data: {
        userId,
        ticker: dto.ticker.toLowerCase(),
        targetPrice: dto.targetPrice,
        condition: dto.condition,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  update(id: string, userId: string, dto: UpdateAlertDto) {
    return this.prisma.alert.updateMany({
      where: { id, userId },
      data: {
        ...(dto.ticker === undefined ? {} : { ticker: dto.ticker.toLowerCase() }),
        ...(dto.targetPrice === undefined ? {} : { targetPrice: dto.targetPrice }),
        ...(dto.condition === undefined ? {} : { condition: dto.condition }),
        ...(dto.expiresAt === undefined
          ? {}
          : { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null }),
        isTriggered: false,
      },
    });
  }

  delete(id: string, userId: string) {
    return this.prisma.alert.deleteMany({
      where: { id, userId },
    });
  }
}
