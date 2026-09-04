import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PrismaModule } from '@crypto-pulse/db';
import { AppService } from './app.service';
import { RabbitExchange } from '@crypto-pulse/rabbitmq-common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
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
        ],
        uri: configService.get('RABBITMQ_URI') || 'amqp://localhost:5672',
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
