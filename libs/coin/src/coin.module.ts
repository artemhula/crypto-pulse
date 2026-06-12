import { Module } from '@nestjs/common';
import { PrismaModule } from '@crypto-pulse/db';
import { CoinRepository } from './coin.repository';

@Module({
  imports: [PrismaModule],
  providers: [CoinRepository],
  exports: [CoinRepository],
})
export class CoinModule {}
