import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorizationHeader = request.headers.authorization;
    const cookieHeader = request.headers.cookie;

    const secret =
      this.configService.get('JWT_ACCESS_SECRET') || 'dev-jwt-secret';
    const token =
      this.getBearerToken(authorizationHeader) ||
      this.getCookieToken(cookieHeader, 'access_token');

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private getBearerToken(authorizationHeader?: string) {
    if (!authorizationHeader?.startsWith('Bearer ')) {
      return null;
    }

    return authorizationHeader.slice(7);
  }

  private getCookieToken(cookieHeader: string | undefined, cookieName: string) {
    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';').map((pair) => pair.trim());
    const cookie = cookies.find((pair) => pair.startsWith(`${cookieName}=`));

    if (!cookie) {
      return null;
    }

    return decodeURIComponent(cookie.slice(cookieName.length + 1));
  }
}
