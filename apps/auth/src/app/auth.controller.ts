import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { AuthService } from './auth.service';
import type { RequestWithGoogleUser } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Req() req: RequestWithGoogleUser) {
    return this.authService.loginOrRegisterOAuth({
      email: req.user.email,
      name: `${req.user.firstName} ${req.user.lastName}`.trim(),
      avatarUrl: req.user.picture,
      provider: 'google',
      providerAccountId: req.user.id,
    });
  }
}
