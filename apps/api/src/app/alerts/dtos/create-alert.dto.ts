import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { AlertCondition } from '@crypto-pulse/db';

export class CreateAlertDto {
  @ApiProperty({ example: 'bitcoin' })
  @IsString()
  @MaxLength(50)
  ticker!: string;

  @ApiProperty({ example: 100000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 8 })
  @IsPositive()
  targetPrice!: number;

  @ApiProperty({ enum: AlertCondition, example: AlertCondition.ABOVE })
  @IsEnum(AlertCondition)
  condition!: AlertCondition;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
