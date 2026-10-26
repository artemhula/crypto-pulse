import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const host = configService.get<string>('REDIS_HOST') || 'localhost';

        const client = new Redis({
          host,
          port: Number(configService.get('REDIS_PORT')) || 6379,
          password: configService.get('REDIS_PASSWORD'),
          tls: configService.get('REDIS_TLS') === 'true' ? {} : undefined,
          connectTimeout: 10000,
          keepAlive: 10000,
          maxRetriesPerRequest: null,
          retryStrategy(times) {
            return Math.min(times * 100, 3000);
          },
        });

        client.on('error', (err) => {
          logger.warn(`Redis connection event: ${err.message}`);
        });

        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
