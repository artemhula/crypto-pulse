import { NestFactory } from '@nestjs/core';
import { CronParserModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(CronParserModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  await app.init();
}

bootstrap();
