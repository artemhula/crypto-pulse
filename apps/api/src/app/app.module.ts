import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CoinModule } from '@crypto-pulse/coin';
import { RedisModule } from '@crypto-pulse/redis';
import {
  AuthController,
  CoinsController,
  HealthController,
  TelegramController,
} from './controllers';
import { CoinsService, TelegramLinkService } from './services';
import { JwtAuthGuard } from './guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET') || 'dev-jwt-secret',
      }),
    }),
    CoinModule,
    RedisModule,
  ],
  controllers: [
    AuthController,
    CoinsController,
    HealthController,
    TelegramController,
  ],
  providers: [CoinsService, JwtAuthGuard, TelegramLinkService],
})
export class AppModule {}
