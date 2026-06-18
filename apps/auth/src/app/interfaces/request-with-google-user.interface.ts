import type { Request } from 'express';

export interface RequestWithGoogleUser extends Request {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    accessToken: string;
    id: string;
  };
}
