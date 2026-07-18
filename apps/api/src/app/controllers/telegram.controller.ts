import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TelegramLinkService } from '../services';
import { JwtAuthGuard, type AuthenticatedRequest } from '../guards';

@Controller('telegram')
@ApiTags('telegram')
export class TelegramController {
  constructor(private readonly telegramLinkService: TelegramLinkService) {}

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
}
