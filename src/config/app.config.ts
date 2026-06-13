import { registerAs } from '@nestjs/config';

function parseCorsOrigins(value?: string): string[] | true {
  if (!value || value.trim() === '*' || value.trim().toLowerCase() === 'true') {
    return true;
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export default registerAs('app', () => ({
  apiPrefix: process.env.API_PREFIX ?? 'api',
  corsOrigins: parseCorsOrigins(
    process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN,
  ),
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8080),
}));
