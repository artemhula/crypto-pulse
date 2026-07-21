import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import {
  RabbitExchange,
  RabbitRoutingKey,
} from '@crypto-pulse/rabbitmq-common';
import { TelegramLinkService, UserService } from '../services';
import { JwtAuthGuard, type AuthenticatedRequest } from '../guards';

@Controller('telegram')
@ApiTags('telegram')
export class TelegramController {
  constructor(
    private readonly telegramLinkService: TelegramLinkService,
    private readonly userService: UserService,
  ) {}

  @Get('link/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create url and code for telegram linking' })
  async getTelegramLink(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new Error('Cannot generate telegram link for unauthenticated user');
    }
    return this.telegramLinkService.generateTelegramLink(req.user.sub);
  }

  @RabbitRPC({
    exchange: RabbitExchange.Telegram,
    routingKey: RabbitRoutingKey.Telegram.Link,
    queue: 'telegram-link',
  })
  async handleTelegramLink(payload: { userId: string; telegramId: number }) {
    const { userId, telegramId } = payload;
    const user = await this.userService.findUserById(userId);

    if (!user) {
      return { success: false, reason: 'USER_NOT_FOUND' };
    }

    if (user.telegramChatId) {
      return { success: false, reason: 'ALREADY_LINKED' };
    }

    return this.userService.updateTelegramChatId(userId, telegramId);
  }
}
