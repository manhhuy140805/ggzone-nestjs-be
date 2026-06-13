import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  getStatus() {
    return {
      environment: this.configService.get<string>('app.env'),
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async getDatabaseStatus() {
    const startedAt = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        latencyMs: Date.now() - startedAt,
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Database is unavailable';

      return {
        latencyMs: Date.now() - startedAt,
        message,
        status: 'down',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
