import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PrismaModule } from '@crypto-pulse/db';
import { RabbitExchange } from '@crypto-pulse/rabbitmq-common';
import { buildJwtModuleOptions } from '@crypto-pulse/nest-common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { GoogleStrategy } from './strategies';
import { validateEnv } from './config/env.config';

@Module({
  imports: [
    PrismaModule,
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
            name: RabbitExchange.Auth,
            type: 'topic',
          },
          {
            name: RabbitExchange.Telegram,
            type: 'topic',
          },
        ],
        uri: configService.get('RABBITMQ_URI') || 'amqp://localhost:5672',
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, SessionService],
})
export class AuthModule {}
