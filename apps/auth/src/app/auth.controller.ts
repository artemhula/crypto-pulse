import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { AuthService, type AuthResponse } from './auth.service';
import type { RequestWithGoogleUser } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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

    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:4200';

    res.cookie('access_token', authResponse.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.get('NODE_ENV') === 'production',
      path: '/',
      maxAge: 1000 * 60 * 60,
    });

    res.redirect(frontendUrl);
  }
}
