import { createEnvValidator, optional } from '@crypto-pulse/nest-common';

export const ENV_RULES = {
  RABBITMQ_URI: optional('RABBITMQ_URI', 'amqp://localhost:5672'),
  RESEND_API_KEY: optional('RESEND_API_KEY', ''),
  EMAIL_DOMAIN: optional('EMAIL_DOMAIN', 'example.com'),
  APP_URL: optional('APP_URL', 'http://localhost:4200'),
};

export const validateEnv = createEnvValidator(ENV_RULES);
