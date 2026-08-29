export enum RabbitExchange {
  Auth = 'auth.exchange',
  Crypto = 'crypto.exchange',
  Telegram = 'telegram.exchange',
}

export const RabbitRoutingKey = {
  Crypto: {
    Updated: 'crypto.updated',
  },
  Telegram: {
    Link: 'telegram.link',
    Linked: 'telegram.linked',
  },
} as const;

export enum RabbitQueue {
  CryptoUpdates = 'crypto-updates-queue',
  TelegramLinks = 'telegram-links-queue',
  TelegramLinked = 'telegram-linked-queue',
}
