import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  roles: string[];
  isTestUser: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
