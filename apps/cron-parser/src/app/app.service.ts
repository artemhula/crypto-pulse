import axios from 'axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
export class CronParserService implements OnModuleInit {
  private readonly logger = new Logger(CronParserService.name);
  private readonly coingeckoApiUrl: string;
  private readonly coingeckoApiKey: string;
  private readonly coingeckoApiKeyHeader: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly coinRepository: CoinRepository,
    private readonly amqpConnection: AmqpConnection,
  ) {
    this.coingeckoApiUrl =
      this.configService.get<string>('COINGECKO_API_URL') ?? '';
    this.coingeckoApiKey =
      this.configService.get<string>('COINGECKO_API_KEY') ?? '';
    this.coingeckoApiKeyHeader =
      this.configService.get<string>('COINGECKO_API_KEY_HEADER') ??
      'x-cg-demo-api-key';
  }
  async onModuleInit(): Promise<void> {
    await this.updateCryptoPrices();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateCryptoPrices() {
    try {
      const url = new URL(this.coingeckoApiUrl);
      url.searchParams.set('symbols', TOKENS_QUERY);
      url.searchParams.set('price_change_percentage', '1h,24h');
      const response = await axios.get<ICoinGeckoCoin[]>(url.toString(), {
        headers: this.coingeckoApiKey
          ? { [this.coingeckoApiKeyHeader]: this.coingeckoApiKey }
          : undefined,
      });
      this.logger.log('Fetching crypto prices...');

      const priceUpdates = await this.updateCoins(response.data);
      this.logger.log('Crypto prices updated successfully.');

      await this.amqpConnection.publish(
        RabbitExchange.Crypto,
        RabbitRoutingKey.Crypto.Updated,
        { prices: priceUpdates },
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `CoinGecko request failed (${error.response?.status ?? 'network error'}): ${
            typeof error.response?.data === 'string'
              ? error.response.data
              : JSON.stringify(error.response?.data ?? error.message)
          }`,
        );
        return;
      }

      this.logger.error(
        `Error updating crypto prices: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
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

    const invalidCoin = coins.find(
      (coin) =>
        !Number.isFinite(coin.priceChangePercentage1h) ||
        !Number.isFinite(coin.priceChangePercentage24h),
    );
    if (invalidCoin) {
      throw new Error(
        `CoinGecko returned incomplete price changes for ${invalidCoin.id}`,
      );
    }

    await this.coinRepository.createOrUpdateMany(coins);

    return coins.map((coin) => ({
      ticker: coin.symbol.toLowerCase(),
      previousPrice: previousPrices.get(coin.id) ?? null,
      currentPrice: coin.currentPrice,
    }));
  }
}
