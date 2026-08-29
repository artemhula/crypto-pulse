import Redis from 'ioredis';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@crypto-pulse/db';
import { CreateCoinDto, UpdateCoinDto } from './dtos';

@Injectable()
export class CoinRepository {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}
  private readonly logger = new Logger(CoinRepository.name);

  async findOne(id: string) {
    const cacheKey = `coin:${id}`;

    try {
      const cachedCoin = await this.redis.get(cacheKey);
      if (cachedCoin) {
        return JSON.parse(cachedCoin);
      }
    } catch (error) {
      this.logger.error(
        `[REDIS] Error occurred while fetching coin with id: ${id}`,
        error,
      );
    }
    return this.prisma.coin.findFirst({
      where: { id },
    });
  }

  async findOneBySymbol(symbol: string) {
    const cacheKey = `coin:symbol:${symbol}`;

    try {
      const cachedCoin = await this.redis.get(cacheKey);
      if (cachedCoin) {
        return JSON.parse(cachedCoin);
      }
    } catch (error) {
      this.logger.error(
        `[REDIS] Error occurred while fetching coin with symbol: ${symbol}`,
        error,
      );
    }

    return this.prisma.coin.findFirst({
      where: { symbol },
    });
  }

  async findAll() {
    const cacheKey = 'coin:all';

    try {
      const cachedCoins = await this.redis.get(cacheKey);
      if (cachedCoins) {
        return JSON.parse(cachedCoins);
      }
    } catch (error) {
      this.logger.error(
        `[REDIS] Error occurred while fetching all coins`,
        error,
      );
    }
    const coins = await this.prisma.coin.findMany();

    await this.redis.set(cacheKey, JSON.stringify(coins));
    return coins;
  }

  async create(dto: CreateCoinDto) {
    const coin = await this.prisma.coin.create({
      data: dto,
    });

    await this.redis.set(`coin:${coin.id}`, JSON.stringify(coin));
    return coin;
  }

  async update(id: string, dto: UpdateCoinDto) {
    const coin = await this.prisma.coin.update({
      where: {
        id,
      },
      data: dto,
    });

    await this.redis.set(`coin:${coin.id}`, JSON.stringify(coin));
    await this.redis.set(`coin:symbol:${coin.symbol}`, JSON.stringify(coin));

    return coin;
  }

  async updateMany(data: { id: string; dto: UpdateCoinDto }[]) {
    const operations = data.map(({ id, dto }) =>
      this.prisma.coin.update({
        where: { id },
        data: dto,
      }),
    );
    const result = await this.prisma.$transaction(operations);

    try {
      const pipeline = this.redis.pipeline();

      result.forEach((coin) => {
        pipeline.set(`coin:${coin.id}`, JSON.stringify(coin));
      });

      await pipeline.del(`coin:all`);

      await pipeline.exec();
    } catch (error) {
      this.logger.error(
        `[REDIS] Error occurred while updating multiple coins`,
        error,
      );
    }

    return result;
  }

  async createOrUpdate(dto: CreateCoinDto) {
    const coin = await this.prisma.coin.upsert({
      where: {
        id: dto.id,
      },
      create: dto,
      update: dto,
    });

    await this.redis.set(`coin:${coin.id}`, JSON.stringify(coin));
    await this.redis.set(`coin:symbol:${coin.symbol}`, JSON.stringify(coin));

    return coin;
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

    const result = await this.prisma.$transaction(operations);

    try {
      const pipeline = this.redis.pipeline();

      data.forEach((dto) => {
        pipeline.set(`coin:${dto.id}`, JSON.stringify(dto));
        pipeline.set(`coin:symbol:${dto.symbol}`, JSON.stringify(dto));
      });

      await pipeline.del(`coin:all`);

      await pipeline.exec();
    } catch (error) {
      this.logger.error(
        `[REDIS] Error occurred while upserting multiple coins`,
        error,
      );
    }

    return result;
  }
}
