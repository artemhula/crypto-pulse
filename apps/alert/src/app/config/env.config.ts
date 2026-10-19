import { createEnvValidator, optional } from '@crypto-pulse/nest-common';

export const ENV_RULES = {
  RABBITMQ_URI: optional('RABBITMQ_URI', 'amqp://localhost:5672'),
};

export const validateEnv = createEnvValidator(ENV_RULES);
