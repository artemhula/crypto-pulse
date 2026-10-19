export enum RabbitExchange {
  Auth = 'auth.exchange',
  Crypto = 'crypto.exchange',
  Telegram = 'telegram.exchange',
  Email = 'email.exchange',
  Push = 'push.exchange',
}

export const RabbitRoutingKey = {
  Crypto: {
    Updated: 'crypto.updated',
  },
  Telegram: {
    Link: 'telegram.link',
    Linked: 'telegram.linked',
    SendAlert: 'send_telegram_alert',
  },
  Email: {
    SendAlert: 'send_email_alert',
  },
  Push: {
    SendAlert: 'send_push_alert',
  },
} as const;

export enum RabbitQueue {
  CryptoUpdates = 'crypto-updates-queue',
  AlertProcessing = 'alert-processing-queue',
  TelegramLinks = 'telegram-links-queue',
  TelegramLinked = 'telegram-linked-queue',
  TelegramAlerts = 'telegram-alerts-queue',
  EmailAlerts = 'email-alerts-queue',
  PushAlerts = 'push-alerts-queue',
}
