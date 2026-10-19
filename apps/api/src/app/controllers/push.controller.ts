import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { PushSubscriptionService } from '../services';
import { JwtAuthGuard, type AuthenticatedRequest } from '../guards';

class PushKeysDto {
  @IsString()
  p256dh!: string;

  @IsString()
  auth!: string;
}

class SubscribePushBodyDto {
  @IsString()
  @Matches(/^https:\/\/.+/)
  endpoint!: string;

  @ValidateNested()
  @Type(() => PushKeysDto)
  keys!: PushKeysDto;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

class UnsubscribePushBodyDto {
  @IsString()
  endpoint!: string;
}

@Controller('push')
@ApiTags('push')
export class PushController {
  constructor(
    private readonly pushSubscriptionService: PushSubscriptionService,
  ) {}

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Save a web push subscription for the user' })
  async subscribe(
    @Req() req: AuthenticatedRequest,
    @Body() body: SubscribePushBodyDto,
  ) {
    if (!req.user) {
      throw new Error('Cannot save push subscription for unauthenticated user');
    }
    return this.pushSubscriptionService.subscribe(req.user.sub, body);
  }

  @Delete('subscribe')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove a web push subscription' })
  async unsubscribe(
    @Req() req: AuthenticatedRequest,
    @Body() body: UnsubscribePushBodyDto,
  ) {
    if (!req.user) {
      throw new Error(
        'Cannot remove push subscription for unauthenticated user',
      );
    }
    await this.pushSubscriptionService.unsubscribe(req.user.sub, body.endpoint);
  }
}
