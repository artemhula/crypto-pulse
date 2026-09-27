import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser = require('cookie-parser');
import { AuthModule } from './app/auth.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.set('trust proxy', 1);
  app.enableCors({
    origin: (configService.get('FRONTEND_URL') || 'http://localhost:4200')
      .split(',')
      .map((url: string) => url.trim()),
    credentials: true,
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
