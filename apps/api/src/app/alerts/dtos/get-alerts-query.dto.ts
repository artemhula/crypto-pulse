import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AlertStatus } from '@crypto-pulse/db';
import { PaginationQueryDto } from './pagination-query.dto';

export class GetAlertsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: AlertStatus,
    description: 'Filter alerts by status',
  })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;
}
