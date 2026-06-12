import { Module } from '@nestjs/common';
import { CronParserService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CoinModule } from '@crypto-pulse/coin';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/cron-parser/.env',
    }),
    ScheduleModule.forRoot(),
    CoinModule,
  ],
  providers: [CronParserService],
})
export class CronParserModule {}
