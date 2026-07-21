import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CoinModule } from '@crypto-pulse/coin';
import { RedisModule } from '@crypto-pulse/redis';
import { PrismaModule } from '@crypto-pulse/db';
import { RabbitExchange } from '@crypto-pulse/rabbitmq-common';
import {
  AuthController,
  CoinsController,
  HealthController,
  TelegramController,
} from './controllers';
import { CoinsService, TelegramLinkService, UserService } from './services';
import { JwtAuthGuard } from './guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET') || 'dev-jwt-secret',
      }),
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
  ],
  controllers: [
    AuthController,
    CoinsController,
    HealthController,
    TelegramController,
  ],
  providers: [CoinsService, JwtAuthGuard, TelegramLinkService, UserService],
})
export class AppModule {}
