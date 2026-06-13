import { Request } from 'express';
import { JwtUser } from './jwt-user.type';

export interface AuthenticatedRequest extends Request {
  user?: JwtUser;
}
