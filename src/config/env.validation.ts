const allowedNodeEnvs = ['development', 'test', 'production'] as const;

type NodeEnv = (typeof allowedNodeEnvs)[number];

function getString(
  config: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = config[key];
  return typeof value === 'string' ? value.trim() : undefined;
}

function parsePort(value: string | undefined): number {
  if (!value) {
    return 8080;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
}

function parseNodeEnv(value: string | undefined): NodeEnv {
  const nodeEnv = value ?? 'development';
  if (!allowedNodeEnvs.includes(nodeEnv as NodeEnv)) {
    throw new Error(`NODE_ENV must be one of: ${allowedNodeEnvs.join(', ')}`);
  }

  return nodeEnv as NodeEnv;
}

function parseDatabaseUrl(value: string | undefined): string {
  if (!value) {
    throw new Error('DATABASE_URL is required');
  }

  try {
    const url = new URL(value);
    if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL');
  }

  return value;
}

function parseJwtSecret(value: string | undefined, nodeEnv: NodeEnv): string {
  if (value) {
    return value;
  }

  if (nodeEnv === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }

  return 'dev-only-change-me';
}

export function validateEnv(config: Record<string, unknown>) {
  const nodeEnv = parseNodeEnv(getString(config, 'NODE_ENV'));

  return {
    ...config,
    API_PREFIX: getString(config, 'API_PREFIX') ?? 'api',
    CORS_ORIGIN: getString(config, 'CORS_ORIGIN'),
    CORS_ORIGINS:
      getString(config, 'CORS_ORIGINS') ?? getString(config, 'CORS_ORIGIN'),
    DATABASE_URL: parseDatabaseUrl(getString(config, 'DATABASE_URL')),
    JWT_AUDIENCE: getString(config, 'JWT_AUDIENCE') ?? 'GGZoneUsers',
    JWT_EXPIRES_IN: getString(config, 'JWT_EXPIRES_IN') ?? '7d',
    JWT_ISSUER: getString(config, 'JWT_ISSUER') ?? 'GGZone',
    JWT_SECRET: parseJwtSecret(getString(config, 'JWT_SECRET'), nodeEnv),
    NODE_ENV: nodeEnv,
    PORT: parsePort(getString(config, 'PORT')),
  };
}
