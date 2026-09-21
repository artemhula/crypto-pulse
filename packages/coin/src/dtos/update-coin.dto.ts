import { IsOptional, IsNumber, IsUrl, IsString } from 'class-validator';

export class UpdateCoinDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  currentPrice?: number;

  @IsNumber()
  @IsOptional()
  marketCap?: number;

  @IsNumber()
  @IsOptional()
  priceChangePercentage1h?: number;

  @IsNumber()
  @IsOptional()
  priceChangePercentage24h?: number;

  @IsUrl()
  @IsOptional()
  image?: string;
}
