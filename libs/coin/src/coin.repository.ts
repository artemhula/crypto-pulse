import { Injectable } from '@nestjs/common';
import { PrismaService } from '@crypto-pulse/db';
import { CreateCoinDto, UpdateCoinDto } from './dtos';

@Injectable()
export class CoinRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.coin.findFirst({
      where: {
        id,
      },
    });
  }

  async findOneBySymbol(symbol: string) {
    return this.prisma.coin.findFirst({
      where: {
        symbol,
      },
    });
  }

  async findAll() {
    return this.prisma.coin.findMany();
  }

  async create(dto: CreateCoinDto) {
    return this.prisma.coin.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateCoinDto) {
    return this.prisma.coin.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async updateMany(data: { id: string; dto: UpdateCoinDto }[]) {
    const operations = data.map(({ id, dto }) =>
      this.prisma.coin.update({
        where: {
          id,
        },
        data: dto,
      }),
    );
    return this.prisma.$transaction(operations);
  }

  async createOrUpdate(dto: CreateCoinDto) {
    return this.prisma.coin.upsert({
      where: {
        id: dto.id,
      },
      create: dto,
      update: dto,
    });
  }

  async createOrUpdateMany(data: CreateCoinDto[]) {
    const operations = data.map((dto) =>
      this.prisma.coin.upsert({
        where: {
          id: dto.id,
        },
        create: dto,
        update: dto,
      }),
    );
    return this.prisma.$transaction(operations);
  }
}
