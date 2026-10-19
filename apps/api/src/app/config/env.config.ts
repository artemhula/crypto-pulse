import { createEnvValidator, optional } from '@crypto-pulse/nest-common';

export const ENV_RULES = {
  RABBITMQ_URI: optional('RABBITMQ_URI', 'amqp://localhost:5672'),
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:4200'),
  AUTH_SERVICE_URL: optional('AUTH_SERVICE_URL', 'http://localhost:3001'),
  REDIS_HOST: optional('REDIS_HOST', 'localhost'),
  REDIS_PORT: optional('REDIS_PORT', '6379'),
  PORT: optional('PORT', '3000'),
  TELEGRAM_BOT_USERNAME: optional('TELEGRAM_BOT_USERNAME', ''),
};

export const validateEnv = createEnvValidator(ENV_RULES);
