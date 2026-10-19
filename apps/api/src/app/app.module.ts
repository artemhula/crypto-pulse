import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CoinModule } from '@crypto-pulse/coin';
import { RedisModule } from '@crypto-pulse/redis';
import { PrismaModule } from '@crypto-pulse/db';
import { RabbitExchange } from '@crypto-pulse/rabbitmq-common';
import { buildJwtModuleOptions } from '@crypto-pulse/nest-common';
import {
  AuthController,
  CoinsController,
  HealthController,
  PushController,
  TelegramController,
} from './controllers';
import {
  CoinsService,
  PushSubscriptionService,
  TelegramLinkService,
  UserService,
} from './services';
import { JwtAuthGuard } from './guards';
import { AlertModule } from './alerts/alert.module';
import { validateEnv } from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildJwtModuleOptions(configService),
    }),
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
        uri: configService.get('RABBITMQ_URI') || 'amqp://localhost:5672',
        connectionInitOptions: { wait: false },
      }),
    }),
    CoinModule,
    RedisModule,
    PrismaModule,
    AlertModule,
  ],
  controllers: [
    AuthController,
    CoinsController,
    HealthController,
    PushController,
    TelegramController,
  ],
  providers: [
    CoinsService,
    JwtAuthGuard,
    PushSubscriptionService,
    TelegramLinkService,
    UserService,
  ],
})
export class AppModule {}
