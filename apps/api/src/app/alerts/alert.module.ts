import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@crypto-pulse/db';
import { buildJwtModuleOptions } from '@crypto-pulse/nest-common';
import { AlertController } from './alert.controller';
import { AlertRepository } from './alert.repository';
import { AlertService } from './alert.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildJwtModuleOptions(configService),
    }),
  ],
  controllers: [AlertController],
  providers: [AlertRepository, AlertService],
})
export class AlertModule {}
