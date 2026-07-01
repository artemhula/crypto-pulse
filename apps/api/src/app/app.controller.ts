import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CoinsService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { GetCoinParamsDto } from './dtos/get-coin-params.dto';

@Controller('coins')
@UseGuards(JwtAuthGuard)
@ApiTags('coins')
@ApiBearerAuth('access-token')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all coins' })
  @ApiOkResponse({ description: 'List of coins' })
  getCoins() {
    return this.coinsService.getCoins();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a coin by id' })
  @ApiOkResponse({ description: 'Coin details' })
  getCoin(@Param() params: GetCoinParamsDto) {
    return this.coinsService.getCoin(params.id);
  }
}
