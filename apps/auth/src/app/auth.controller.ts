import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { AuthService, type AuthResponse } from './auth.service';
import type { RequestWithGoogleUser } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @Req() req: RequestWithGoogleUser,
  ): Promise<AuthResponse> {
    return this.authService.loginOrRegisterOAuth({
      email: req.user.email,
      name: req.user.name,
      avatarUrl: req.user.avatarUrl,
      provider: 'google',
      providerAccountId: req.user.id,
    });
  }
}
