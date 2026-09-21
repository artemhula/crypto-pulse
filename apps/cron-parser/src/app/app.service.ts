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
  private readonly coingeckoApiUrl;
  constructor(
    private configService: ConfigService,
    private coinRepository: CoinRepository,
    private readonly amqpConnection: AmqpConnection,
  ) {
    this.coingeckoApiUrl =
      this.configService.get<string>('COINGECKO_API_URL') ?? '';
  }
  private readonly logger = new Logger(CronParserService.name);

  @Cron(CronExpression.EVERY_MINUTE)
  async updateCryptoPrices() {
    const url = this.coingeckoApiUrl + '&symbols=' + TOKENS_QUERY;
    try {
      const response = await axios.get<ICoinGeckoCoin[]>(url);
      this.logger.log('Fetching crypto prices...');

      const priceUpdates = await this.updateCoins(response.data);
      this.logger.log('Crypto prices updated successfully.');

      await this.amqpConnection.publish(
        RabbitExchange.Crypto,
        RabbitRoutingKey.Crypto.Updated,
        { prices: priceUpdates },
      );
    } catch (e) {
      this.logger.error('Error fetching crypto prices:', e);
    }
  }

  private async updateCoins(coinData: ICoinGeckoCoin[]) {
    const previousCoins = await this.coinRepository.findAllByIds(
      coinData.map((coin) => coin.id),
    );
    const previousPrices = new Map(
      previousCoins.map((coin) => [coin.id, coin.currentPrice]),
    );
    const coins = coinData.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      priceChangePercentage1h: coin.price_change_percentage_1h_in_currency,
      priceChangePercentage24h: coin.price_change_percentage_24h_in_currency,
      image: coin.image,
    }));
    await this.coinRepository.createOrUpdateMany(coins);

    return coins.map((coin) => ({
      ticker: coin.symbol.toLowerCase(),
      previousPrice: previousPrices.get(coin.id) ?? null,
      currentPrice: coin.currentPrice,
    }));
  }
}
