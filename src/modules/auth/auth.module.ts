import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.getOrThrow<string>(
          'jwt.expiresIn',
        ) as SignOptions['expiresIn'];

        return {
          secret: configService.getOrThrow<string>('jwt.secret'),
          signOptions: {
            audience: configService.getOrThrow<string>('jwt.audience'),
            expiresIn,
            issuer: configService.getOrThrow<string>('jwt.issuer'),
          },
        };
      },
    }),
  ],
  providers: [AuthService],
})
export class AuthModule {}
