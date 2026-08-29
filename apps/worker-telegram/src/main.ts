import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  await app.init();
  await app.listen(configService.get('TELEGRAM_BOT_PORT') || 3009);
}

bootstrap();
