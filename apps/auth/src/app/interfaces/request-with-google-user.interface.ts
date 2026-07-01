import type { Request } from 'express';

export interface RequestWithGoogleUser extends Request {
  user: {
    email: string;
    name: string;
    avatarUrl: string;
    id: string;
  };
}
