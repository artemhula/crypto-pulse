import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetCoinParamsDto {
  @ApiProperty({ example: 'bitcoin', description: 'Coin identifier' })
  @IsString()
  @IsNotEmpty()
  id!: string;
}
