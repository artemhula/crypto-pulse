import {
  Controller,
  Get,
  Post,
  Req,
  Redirect,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response as ExpressResponse } from 'express';
import { JwtAuthGuard, type AuthenticatedRequest } from '../guards';
import { UserService } from '../services';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  @Get('google')
  @Redirect()
  @ApiOperation({ summary: 'Redirect to Google auth through auth service' })
  redirectToGoogleAuth() {
    return {
      url: `${this.getAuthServiceUrl()}/api/auth/google`,
      statusCode: 302,
    };
  }

  @Get('google/callback')
  @Redirect()
  @ApiOperation({ summary: 'Forward Google callback to auth service' })
  redirectGoogleCallback(@Req() request: Request) {
    const queryString = new URLSearchParams(
      request.query as Record<string, string>,
    ).toString();

    return {
      url: `${this.getAuthServiceUrl()}/api/auth/google/callback${queryString ? `?${queryString}` : ''}`,
      statusCode: 302,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiOkResponse({ description: 'Current user profile' })
  async getMe(@Req() request: AuthenticatedRequest) {
    const user = await this.userService.findUserById(request.user!.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        telegramChatId: user.telegramChatId,
      },
    };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Renew the session with the refresh cookie',
  })
  async refresh(@Req() request: Request, @Res() res: ExpressResponse) {
    const upstream = await this.postToAuthService(request, 'refresh');
    const renewed = upstream?.ok ? await upstream.json() : null;

    this.relayAuthCookies(res, upstream);

    if (!renewed) {
      res.status(401).json({ message: 'Session expired' });
      return;
    }

    res.status(200).json(renewed);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Log out: revoke the session and clear auth cookies',
  })
  async logout(@Req() request: Request, @Res() res: ExpressResponse) {
    const upstream = await this.postToAuthService(request, 'logout');

    this.relayAuthCookies(res, upstream);

    if (!upstream?.ok) {
      res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
    res.status(204).end();
  }

  private postToAuthService(request: Request, action: string) {
    return fetch(`${this.getAuthServiceUrl()}/api/auth/${action}`, {
      method: 'POST',
      headers: { Cookie: request.headers.cookie ?? '' },
    }).catch(() => null);
  }

  private relayAuthCookies(res: ExpressResponse, upstream: Response | null) {
    for (const cookie of upstream?.headers.getSetCookie() ?? []) {
      res.append('Set-Cookie', cookie);
    }
  }

  private getAuthServiceUrl() {
    return (
      this.configService.get('AUTH_SERVICE_URL') || 'http://localhost:3001'
    );
  }
}
