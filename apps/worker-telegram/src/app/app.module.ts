import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RedisModule } from '@crypto-pulse/redis';
import { RabbitExchange } from '@crypto-pulse/rabbitmq-common';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN') || '',
      }),
    }),
    RedisModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: RabbitExchange.Telegram,
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
