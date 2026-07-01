import { CoinRepository } from '@crypto-pulse/coin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CoinsService {
  constructor(private readonly coinRepository: CoinRepository) {}

  getCoins() {
    return this.coinRepository.findAll();
  }

  getCoin(id: string) {
    return this.coinRepository.findOne(id);
  }
}
