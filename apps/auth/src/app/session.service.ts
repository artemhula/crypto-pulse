import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@crypto-pulse/db';
import {
  ACCESS_TOKEN_TYPE,
  DEFAULT_ACCESS_EXPIRES_IN,
  DEFAULT_REFRESH_EXPIRES_IN,
  REFRESH_TOKEN_TYPE,
} from './auth.constants';
import {
  formatDuration,
  hashRefreshToken,
  isRefreshTokenClaims,
  parseDurationToMs,
} from './auth.tokens';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenMaxAgeMs: number;
  refreshTokenMaxAgeMs: number;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issueSession(user: {
    id: string;
    email: string;
  }): Promise<SessionTokens> {
    return this.createSession(user);
  }

  async rotateSession(refreshToken: string): Promise<SessionTokens | null> {
    let payload: unknown;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      return null;
    }

    if (!isRefreshTokenClaims(payload)) {
      return null;
    }

    const hashedToken = hashRefreshToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: hashedToken },
    });

    if (!session || session.userId !== payload.sub) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.prisma.session.delete({ where: { id: session.id } });
      return null;
    }
    const { count } = await this.prisma.session.deleteMany({
      where: { id: session.id, refreshToken: hashedToken },
    });

    if (count === 0) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true },
    });

    return user ? this.createSession(user) : null;
  }

  async revokeSession(refreshToken: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { refreshToken: hashRefreshToken(refreshToken) },
    });
  }

  private get accessSecret(): string {
    return (
      this.configService.get<string>('JWT_ACCESS_SECRET') || 'dev-jwt-secret'
    );
  }

  private get refreshSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') || this.accessSecret
    );
  }

  private get accessTokenMaxAgeMs(): number {
    return parseDurationToMs(
      this.configService.get('JWT_ACCESS_EXPIRES_IN') ||
        DEFAULT_ACCESS_EXPIRES_IN,
    );
  }

  private get refreshTokenMaxAgeMs(): number {
    return parseDurationToMs(
      this.configService.get('JWT_REFRESH_EXPIRES_IN') ||
        DEFAULT_REFRESH_EXPIRES_IN,
    );
  }

  private async createSession(user: {
    id: string;
    email: string;
  }): Promise<SessionTokens> {
    const accessTokenMaxAgeMs = this.accessTokenMaxAgeMs;
    const refreshTokenMaxAgeMs = this.refreshTokenMaxAgeMs;

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, typ: ACCESS_TOKEN_TYPE },
      {
        secret: this.accessSecret,
        expiresIn: formatDuration(accessTokenMaxAgeMs),
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, typ: REFRESH_TOKEN_TYPE },
      {
        secret: this.refreshSecret,
        expiresIn: formatDuration(refreshTokenMaxAgeMs),
      },
    );

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTokenMaxAgeMs),
      },
    });

    return {
      accessToken,
      refreshToken,
      accessTokenMaxAgeMs,
      refreshTokenMaxAgeMs,
    };
  }
}
