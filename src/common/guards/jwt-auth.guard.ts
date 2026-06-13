import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from '../types/authenticated-request.type';
import { JwtUser } from '../types/jwt-user.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      request.user = await this.jwtService.verifyAsync<JwtUser>(token, {
        audience: this.configService.getOrThrow<string>('jwt.audience'),
        issuer: this.configService.getOrThrow<string>('jwt.issuer'),
        secret: this.configService.getOrThrow<string>('jwt.secret'),
      });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid bearer token');
    }
  }

  private extractToken(request: AuthenticatedRequest): string | undefined {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.split(' ');
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }
}
