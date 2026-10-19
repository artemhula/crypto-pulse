import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ResendService } from 'nestjs-resend';
import {
  RabbitExchange,
  RabbitQueue,
  RabbitRoutingKey,
} from '@crypto-pulse/rabbitmq-common';
import {
  DEFAULT_MAX_SEND_ATTEMPTS,
  exponentialBackoffDelay,
  sleep,
} from '@crypto-pulse/nest-common';
import { ConfigService } from '@nestjs/config';
import { renderAlertEmail } from './templates/alert-email.template';

interface EmailAlertEvent {
  alertId: string;
  email: string;
  ticker: string;
  targetPrice: number;
  currentPrice: number;
  condition: 'ABOVE' | 'BELOW';
}

@Injectable()
export class AppService {
  private static readonly maxSendAttempts = DEFAULT_MAX_SEND_ATTEMPTS;
  private static readonly permanentErrorNames = new Set([
    'invalid_api_key',
    'invalid_access',
    'invalid_from_address',
    'invalid_idempotency_key',
    'invalid_idempotent_request',
    'invalid_parameter',
    'invalid_region',
    'method_not_allowed',
    'missing_api_key',
    'missing_required_field',
    'not_found',
    'validation_error',
  ]);
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly resendService: ResendService,
    private readonly configService: ConfigService,
  ) {}

  @RabbitSubscribe({
    exchange: RabbitExchange.Email,
    routingKey: RabbitRoutingKey.Email.SendAlert,
    queue: RabbitQueue.EmailAlerts,
    queueOptions: { durable: true },
  })
  async handleAlert(event: EmailAlertEvent) {
    const { subject, html, text } = renderAlertEmail(
      {
        ticker: event.ticker,
        condition: event.condition,
        targetPrice: event.targetPrice,
        currentPrice: event.currentPrice,
        triggeredAt: new Date(),
      },
      this.configService.get<string>('APP_URL'),
    );

    await this.sendAlertWithRetry(event, subject, html, text);
  }

  private async sendAlertWithRetry(
    event: EmailAlertEvent,
    subject: string,
    html: string,
    text: string,
  ) {
    const from = `noreply@${this.configService.get<string>('EMAIL_DOMAIN')}`;

    for (let attempt = 1; attempt <= AppService.maxSendAttempts; attempt += 1) {
      const { error } = await this.resendService.send({
        from,
        to: event.email,
        subject,
        html,
        text,
      });

      if (!error) {
        this.logger.log(`Email alert sent for ${event.alertId}`);
        return;
      }

      if (AppService.permanentErrorNames.has(error.name)) {
        this.logger.error(
          `Dropping email alert ${event.alertId}: ${error.name} - ${error.message}`,
        );
        return;
      }

      if (attempt === AppService.maxSendAttempts) {
        this.logger.error(
          `Failed to send email alert ${event.alertId} after ${attempt} attempts: ${error.name} - ${error.message}`,
        );
        throw new Error(
          `Failed to send email alert ${event.alertId}: ${error.name} - ${error.message}`,
        );
      }

      const delayMs = exponentialBackoffDelay(attempt);
      this.logger.warn(
        `Retrying email alert ${event.alertId} in ${delayMs}ms (${error.name})`,
      );
      await sleep(delayMs);
    }
  }
}
