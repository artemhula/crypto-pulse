import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PrismaModule } from '@crypto-pulse/db';
import { RabbitExchange } from '@crypto-pulse/rabbitmq-common';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
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
