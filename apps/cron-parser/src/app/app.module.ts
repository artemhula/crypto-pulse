import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RedisModule } from '@crypto-pulse/redis';
import { RabbitExchange } from '@crypto-pulse/rabbitmq-common';
import { CoinModule } from '@crypto-pulse/coin';
import { CronParserService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    CoinModule,
    RedisModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: RabbitExchange.Crypto,
            type: 'topic',
          },
        ],
        uri: configService.get('RABBITMQ_URI') || 'amqp://localhost:5672',
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  providers: [CronParserService],
})
export class CronParserModule {}
