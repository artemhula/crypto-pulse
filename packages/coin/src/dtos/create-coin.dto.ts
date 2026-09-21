import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateCoinDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  symbol!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  currentPrice!: number;

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
