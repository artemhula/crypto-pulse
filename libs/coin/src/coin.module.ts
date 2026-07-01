import { Module } from '@nestjs/common';
import { PrismaModule } from '@crypto-pulse/db';
import { RedisModule } from '@crypto-pulse/redis';
import { CoinRepository } from './coin.repository';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [CoinRepository],
  exports: [CoinRepository],
})
export class CoinModule {}
