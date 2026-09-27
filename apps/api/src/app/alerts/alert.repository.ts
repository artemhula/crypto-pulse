import { Injectable } from '@nestjs/common';
import { AlertStatus, PrismaService } from '@crypto-pulse/db';
import { CreateAlertDto, UpdateAlertDto } from './dtos';

export interface AlertsQuery {
  page: number;
  limit: number;
  status?: AlertStatus;
}

export interface AlertsByTickerQuery {
  page: number;
  limit: number;
}

const EMPTY_COUNTS: Record<AlertStatus, number> = {
  [AlertStatus.ACTIVE]: 0,
  [AlertStatus.CANCELLED]: 0,
  [AlertStatus.TRIGGERED]: 0,
  [AlertStatus.EXPIRED]: 0,
};

@Injectable()
export class AlertRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async expireOutdatedAlerts(userId: string) {
    await this.prisma.alert.updateMany({
      where: {
        userId,
        status: AlertStatus.ACTIVE,
        expiresAt: { lt: new Date() },
      },
      data: { status: AlertStatus.EXPIRED },
    });
  }

  async findAllByUserId(userId: string, query: AlertsQuery) {
    const { page, limit, status } = query;

    await this.expireOutdatedAlerts(userId);

    const where = { userId, ...(status ? { status } : {}) };

    const [items, total, countsArr] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.alert.count({ where }),
      Promise.all(
        Object.values(AlertStatus).map((status) =>
          this.prisma.alert.count({ where: { ...where, status } }),
        ),
      ),
    ]);

    const counts = { ...EMPTY_COUNTS };
    Object.values(AlertStatus).forEach((status, index) => {
      counts[status] = countsArr[index];
    });

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      counts,
    };
  }

  async findAllByUserIdAndTicker(
    userId: string,
    ticker: string,
    query: AlertsByTickerQuery,
  ) {
    const { page, limit } = query;

    await this.expireOutdatedAlerts(userId);

    const where = { userId, ticker: ticker.toLowerCase() };

    const [items, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
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
        ticker: dto.ticker?.toLowerCase(),
        targetPrice: dto.targetPrice,
        condition: dto.condition,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        status: dto.status,
      },
    });
  }

  delete(id: string, userId: string) {
    return this.prisma.alert.deleteMany({
      where: { id, userId },
    });
  }
}
