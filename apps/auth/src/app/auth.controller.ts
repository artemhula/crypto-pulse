import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import {
  ACCESS_TOKEN_COOKIE,
  AUTH_COOKIE_PATH,
  REFRESH_TOKEN_COOKIE,
} from './auth.constants';
import type { RequestWithGoogleUser } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @Req() req: RequestWithGoogleUser,
    @Res() res: Response,
  ): Promise<void> {
    const authResponse = await this.authService.loginOrRegisterOAuth({
      email: req.user.email,
      name: req.user.name,
      avatarUrl: req.user.avatarUrl,
      provider: 'google',
      providerAccountId: req.user.id,
    });

    this.setAuthCookies(res, authResponse);
    res.redirect(this.frontendUrl);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (typeof refreshToken !== 'string' || !refreshToken) {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Missing refresh token');
    }

    const tokens = await this.sessionService.rotateSession(refreshToken);

    if (!tokens) {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    this.setAuthCookies(res, tokens);
    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: Math.floor(tokens.accessTokenMaxAgeMs / 1000),
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (typeof refreshToken === 'string' && refreshToken) {
      await this.sessionService.revokeSession(refreshToken);
    }

    this.clearAuthCookies(res);
    res.status(204).end();
  }

  private get frontendUrl(): string {
    return this.configService.get('FRONTEND_URL') || 'http://localhost:4200';
  }

  private get secureCookies(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  private setAuthCookies(
    res: Response,
    tokens: {
      accessToken: string;
      refreshToken: string;
      accessTokenMaxAgeMs: number;
      refreshTokenMaxAgeMs: number;
    },
  ): void {
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.secureCookies,
      path: AUTH_COOKIE_PATH,
      maxAge: tokens.accessTokenMaxAgeMs,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.secureCookies,
      path: AUTH_COOKIE_PATH,
      maxAge: tokens.refreshTokenMaxAgeMs,
    });
  }

  private clearAuthCookies(res: Response): void {
    const options = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: this.secureCookies,
      path: AUTH_COOKIE_PATH,
    };
    res.clearCookie(ACCESS_TOKEN_COOKIE, options);
    res.clearCookie(REFRESH_TOKEN_COOKIE, options);
  }
}
