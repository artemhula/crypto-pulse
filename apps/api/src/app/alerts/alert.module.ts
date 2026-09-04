import { Module } from '@nestjs/common';
import { PrismaModule } from '@crypto-pulse/db';
import { AlertController } from './alert.controller';
import { AlertRepository } from './alert.repository';
import { AlertService } from './alert.service';

@Module({
  imports: [PrismaModule],
  controllers: [AlertController],
  providers: [AlertRepository, AlertService],
})
export class AlertModule {}
