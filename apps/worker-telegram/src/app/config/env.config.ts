import { createEnvValidator, optional } from '@crypto-pulse/nest-common';

export const ENV_RULES = {
  RABBITMQ_URI: optional('RABBITMQ_URI', 'amqp://localhost:5672'),
  REDIS_HOST: optional('REDIS_HOST', 'localhost'),
  REDIS_PORT: optional('REDIS_PORT', '6379'),
  TELEGRAM_BOT_TOKEN: optional('TELEGRAM_BOT_TOKEN', ''),
};

export const validateEnv = createEnvValidator(ENV_RULES);
