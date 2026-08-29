import { IsOptional, IsNumber, IsUrl, IsString } from 'class-validator';

export class UpdateCoinDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  currentPrice?: number;

  @IsUrl()
  @IsOptional()
  image?: string;
}
