import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class AlertTickerParamDto {
  @ApiProperty({ example: 'btc', description: 'Coin symbol (ticker)' })
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'ticker must contain only alphanumeric characters',
  })
  ticker!: string;
}
