import { createEnvValidator, optional } from '@crypto-pulse/nest-common';

export const ENV_RULES = {
  RABBITMQ_URI: optional('RABBITMQ_URI', 'amqp://localhost:5672'),
  REDIS_HOST: optional('REDIS_HOST', 'localhost'),
  REDIS_PORT: optional('REDIS_PORT', '6379'),
  COINGECKO_API_URL: optional('COINGECKO_API_URL', ''),
  COINGECKO_API_KEY: optional('COINGECKO_API_KEY', ''),
  COINGECKO_API_KEY_HEADER: optional(
    'COINGECKO_API_KEY_HEADER',
    'x-cg-demo-api-key',
  ),
};

export const validateEnv = createEnvValidator(ENV_RULES);
