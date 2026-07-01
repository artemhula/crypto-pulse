import { Controller, Get, Req, UseGuards, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard, type AuthenticatedRequest } from './auth/jwt-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

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
  @ApiOkResponse({ description: 'Current authenticated user' })
  getMe(@Req() request: AuthenticatedRequest) {
    return {
      user: request.user,
    };
  }

  private getAuthServiceUrl() {
    return (
      this.configService.get('AUTH_SERVICE_URL') || 'http://localhost:3001'
    );
  }
}
