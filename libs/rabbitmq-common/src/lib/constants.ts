export enum RabbitExchange {
  Auth = 'auth.exchange',
  Crypto = 'crypto.exchange',
}

export const RabbitRoutingKey = {
  Crypto: {
    Updated: 'crypto.updated',
  },
} as const;

export enum RabbitQueue {
  CryptoUpdates = 'crypto-updates-queue',
}
