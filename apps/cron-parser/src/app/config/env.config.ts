import { createEnvValidator, optional } from '@crypto-pulse/nest-common';

export const ENV_RULES = {
  RABBITMQ_URI: optional('RABBITMQ_URI', 'amqp://localhost:5672'),
  REDIS_HOST: optional('REDIS_HOST', 'localhost'),
  REDIS_PORT: optional('REDIS_PORT', '6379'),
  COINGECKO_API_URL: optional('COINGECKO_API_URL', ''),
};

export const validateEnv = createEnvValidator(ENV_RULES);
