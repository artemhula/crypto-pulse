import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  await app.listen(process.env.TELEGRAM_BOT_PORT || 3009);
}

bootstrap();
