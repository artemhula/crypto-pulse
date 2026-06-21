import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  RabbitExchange,
  RabbitQueue,
  RabbitRoutingKey,
} from '@crypto-pulse/rabbitmq-common';

@Injectable()
export class AppService {
  @RabbitSubscribe({
    exchange: RabbitExchange.Crypto,
    routingKey: RabbitRoutingKey.Crypto.Updated,
    queue: RabbitQueue.CryptoUpdates,
    queueOptions: {
      durable: true,
    },
  })
  public async handleCryptoUpdate() {
    console.log('Crypto updated');
  }
}
