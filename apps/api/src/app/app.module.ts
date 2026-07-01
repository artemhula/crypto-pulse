import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CoinModule } from '@crypto-pulse/coin';
import { CoinsController } from './app.controller';
import { CoinsService } from './app.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { HealthController } from './health.controller';

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
  ],
  controllers: [AuthController, CoinsController, HealthController],
  providers: [CoinsService, JwtAuthGuard],
})
export class AppModule {}
