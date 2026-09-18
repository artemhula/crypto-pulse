import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Redirect,
  NotFoundException,
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
  @ApiOkResponse({ description: 'Full user record from the database' })
  async getMe(@Req() request: AuthenticatedRequest) {
    const user = await this.userService.findUserById(request.user!.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user };
  }

  @Get('logout')
  @ApiOperation({
    summary: 'Log out: clear access token and redirect to auth service',
  })
  logout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.get('NODE_ENV') === 'production',
      path: '/',
    });

    res.redirect(302, `${this.getAuthServiceUrl()}/api/auth/logout`);
  }

  private getAuthServiceUrl() {
    return (
      this.configService.get('AUTH_SERVICE_URL') || 'http://localhost:3001'
    );
  }
}
