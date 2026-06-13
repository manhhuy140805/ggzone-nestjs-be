import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  audience: process.env.JWT_AUDIENCE ?? 'GGZoneUsers',
  expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  issuer: process.env.JWT_ISSUER ?? 'GGZone',
  secret: process.env.JWT_SECRET,
}));
