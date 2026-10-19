import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PrismaModule } from '@crypto-pulse/db';
import { AppService } from './app.service';
import { RabbitExchange } from '@crypto-pulse/rabbitmq-common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: RabbitExchange.Crypto,
            type: 'topic',
          },
          {
            name: RabbitExchange.Telegram,
            type: 'topic',
          },
          {
            name: RabbitExchange.Email,
            type: 'topic',
          },
          {
            name: RabbitExchange.Push,
            type: 'topic',
          },
        ],
        uri: configService.get('RABBITMQ_URI'),
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
