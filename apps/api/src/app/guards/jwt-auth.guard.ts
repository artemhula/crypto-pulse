import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

const ACCESS_TOKEN_COOKIE = 'access_token';
const ACCESS_TOKEN_TYPE = 'access';

export interface JwtPayload {
  sub: string;
  email: string;
  typ: typeof ACCESS_TOKEN_TYPE;
  exp: number;
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
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    const secret =
      this.configService.get('JWT_ACCESS_SECRET') || 'dev-jwt-secret';

    let payload: unknown;
    try {
      payload = await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (
      !payload ||
      typeof payload !== 'object' ||
      (payload as Partial<JwtPayload>).typ !== ACCESS_TOKEN_TYPE
    ) {
      throw new UnauthorizedException('Invalid access token');
    }

    const claims = payload as Partial<JwtPayload>;
    if (typeof claims.sub !== 'string' || typeof claims.exp !== 'number') {
      throw new UnauthorizedException('Invalid access token');
    }

    request.user = claims as JwtPayload;
    return true;
  }

  private extractToken(request: AuthenticatedRequest): string | null {
    const authorizationHeader = request.headers.authorization;

    if (authorizationHeader?.startsWith('Bearer ')) {
      return authorizationHeader.slice(7);
    }

    return request.cookies?.[ACCESS_TOKEN_COOKIE] ?? null;
  }
}
