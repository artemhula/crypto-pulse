import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq/lib/amqp/connection';
import { CoinRepository } from '@crypto-pulse/coin';
import {
  RabbitExchange,
  RabbitRoutingKey,
} from '@crypto-pulse/rabbitmq-common';
import { ICoinGeckoCoin } from './interfaces';
import { TOKENS_QUERY } from './constants/tokens.contstant';

@Injectable()
export class CronParserService {
  constructor(
    private configService: ConfigService,
    private coinRepository: CoinRepository,
    private readonly amqpConnection: AmqpConnection,
  ) {}
  private readonly coingeckoApiUrl =
    this.configService.get('COINGECKO_API_URL') ?? '';
  private readonly logger = new Logger(CronParserService.name);

  @Cron(CronExpression.EVERY_MINUTE)
  async updateCryptoPrices() {
    const url = this.coingeckoApiUrl + '&symbols=' + TOKENS_QUERY;
    try {
      const response = await axios.get<ICoinGeckoCoin[]>(url);
      this.logger.log('Fetching crypto prices...');

      await this.updateCoins(response.data);
      this.logger.log('Crypto prices updated successfully.');

      this.amqpConnection.publish(
        RabbitExchange.Crypto,
        RabbitRoutingKey.Crypto.Updated,
        {},
      );
    } catch (e) {
      this.logger.error('Error fetching crypto prices:', e);
    }
  }

  private async updateCoins(coinData: ICoinGeckoCoin[]) {
    const coins = coinData.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      currentPrice: coin.current_price,
      image: coin.image,
    }));
    await this.coinRepository.createOrUpdateMany(coins);
  }
}
