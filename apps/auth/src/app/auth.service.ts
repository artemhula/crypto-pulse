import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@crypto-pulse/db';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

interface OAuthUserPayload {
  email: string;
  name: string;
  avatarUrl: string;
  provider: string;
  providerAccountId: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
  accessToken: string;
  tokenType: 'Bearer';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,
    private readonly jwtService: JwtService,
  ) {}

  async loginOrRegisterOAuth(payload: OAuthUserPayload): Promise<AuthResponse> {
    const userByAccount = await this.findUserByAccount(
      payload.provider,
      payload.providerAccountId,
    );
    if (userByAccount) {
      this.amqpConnection.publish('auth.exchange', 'auth.user.login', {
        userId: userByAccount.id,
        provider: payload.provider,
      });
      return this.createAuthResponse(userByAccount);
    }

    return this.handleUserLinkOrCreate(payload);
  }

  private async findUserByAccount(provider: string, providerAccountId: string) {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
      include: { user: true },
    });

    return account?.user ?? null;
  }

  private async handleUserLinkOrCreate(
    payload: OAuthUserPayload,
  ): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      await this.linkAccountToUser(
        existingUser.id,
        payload.provider,
        payload.providerAccountId,
      );
      return this.createAuthResponse(existingUser);
    }

    return this.createNewUserWithAccount(payload);
  }

  private async linkAccountToUser(
    userId: string,
    provider: string,
    providerAccountId: string,
  ) {
    try {
      await this.prisma.account.create({
        data: { userId, provider, providerAccountId },
      });
    } catch {
      throw new InternalServerErrorException(
        'Error linking account to user. Please try again later.',
      );
    }
  }

  private async createNewUserWithAccount(
    payload: OAuthUserPayload,
  ): Promise<AuthResponse> {
    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        avatarUrl: payload.avatarUrl,
        accounts: {
          create: {
            provider: payload.provider,
            providerAccountId: payload.providerAccountId,
          },
        },
      },
    });

    this.amqpConnection.publish('auth.exchange', 'auth.user.created', {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return this.createAuthResponse(user);
  }

  private async createAuthResponse(user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  }): Promise<AuthResponse> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      user,
      accessToken,
      tokenType: 'Bearer',
    };
  }
}
