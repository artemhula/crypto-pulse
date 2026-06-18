import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@crypto-pulse/db';

interface OAuthUserPayload {
  email: string;
  name: string;
  avatarUrl: string;
  provider: string;
  providerAccountId: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async loginOrRegisterOAuth(payload: OAuthUserPayload) {
    const userByAccount = await this.findUserByAccount(
      payload.provider,
      payload.providerAccountId,
    );
    if (userByAccount) {
      return userByAccount;
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

    return account ? account.user : null;
  }

  private async handleUserLinkOrCreate(payload: OAuthUserPayload) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      await this.linkAccountToUser(
        existingUser.id,
        payload.provider,
        payload.providerAccountId,
      );
      return existingUser;
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
    } catch (error) {
      throw new InternalServerErrorException(
        'Error linking account to user. Please try again later.',
      );
    }
  }

  private async createNewUserWithAccount(payload: OAuthUserPayload) {
    return this.prisma.user.create({
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
  }
}
