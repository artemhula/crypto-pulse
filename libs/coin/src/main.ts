import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { CoinModule } from './coin.module';

async function bootstrap() {
  const app = await NestFactory.create(CoinModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
}
bootstrap();
