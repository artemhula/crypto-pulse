import { createEnvValidator, optional } from '@crypto-pulse/nest-common';

export const ENV_RULES = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  RABBITMQ_URI: optional('RABBITMQ_URI', 'amqp://localhost:5672'),
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:4200'),
  PORT: optional('PORT', '3001'),
};

export const validateEnv = createEnvValidator(ENV_RULES);
