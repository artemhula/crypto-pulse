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
import type { Request, Response } from 'express';
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
      },
    };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Log out: revoke the session and clear auth cookies',
  })
  async logout(@Req() request: Request, @Res() res: Response) {
    // Sessions belong to the auth service, so this only forwards — the same
    // pass-through role the Google OAuth routes already play. Cookies travel
    // both ways: the refresh token has to reach the service to be revoked, and
    // the clearing `Set-Cookie` has to reach the browser to take effect.
    const upstream = await fetch(
      `${this.getAuthServiceUrl()}/api/auth/logout`,
      {
        method: 'POST',
        headers: { Cookie: request.headers.cookie ?? '' },
      },
    ).catch(() => null);

    if (upstream?.ok) {
      for (const cookie of upstream.headers.getSetCookie()) {
        res.append('Set-Cookie', cookie);
      }
    } else {
      // Unreachable auth service: clear locally anyway so the user still gets
      // out. The stored session then lingers until it expires on its own.
      for (const name of ['access_token', 'refresh_token']) {
        res.clearCookie(name, { httpOnly: true, sameSite: 'lax', path: '/' });
      }
    }

    res.status(204).end();
  }

  private getAuthServiceUrl() {
    return (
      this.configService.get('AUTH_SERVICE_URL') || 'http://localhost:3001'
    );
  }
}
