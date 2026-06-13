import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request.type';
import { JwtUser } from '../types/jwt-user.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtUser | undefined => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
