import { createEnvValidator, optional } from '@crypto-pulse/nest-common';

export const ENV_RULES = {
  RABBITMQ_URI: optional('RABBITMQ_URI', 'amqp://localhost:5672'),
  WEB_PUSH_PUBLIC_KEY: optional('WEB_PUSH_PUBLIC_KEY', ''),
  WEB_PUSH_PRIVATE_KEY: optional('WEB_PUSH_PRIVATE_KEY', ''),
  WEB_PUSH_SUBJECT: optional('WEB_PUSH_SUBJECT', 'mailto:admin@example.com'),
};

export const validateEnv = createEnvValidator(ENV_RULES);
