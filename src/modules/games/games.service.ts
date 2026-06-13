import { Injectable, NotFoundException } from '@nestjs/common';
import { getPagination, toInt, toJson } from '../../common/api/query.util';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return toJson(
      await this.prisma.game.findMany({
        orderBy: { name: 'asc' },
        where: { isActive: true },
      }),
    );
  }

  async trending(limit?: string) {
    return toJson(
      await this.prisma.game.findMany({
        orderBy: { createdAt: 'desc' },
        take: toInt(limit, 10, 50),
        where: { isActive: true },
      }),
    );
  }

  async search(q: string, query: { page?: string; pageSize?: string }) {
    const pagination = getPagination(query.page, query.pageSize, 12);
    const where = {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
        { genre: { contains: q, mode: 'insensitive' as const } },
      ],
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.game.findMany({
        orderBy: { name: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
        where,
      }),
      this.prisma.game.count({ where }),
    ]);

    return toJson({ data, meta: { ...pagination, total } });
  }

  async filter(query: { genre?: string; page?: string; pageSize?: string; platform?: string }) {
    const pagination = getPagination(query.page, query.pageSize, 12);
    const where = {
      ...(query.genre ? { genre: query.genre } : {}),
      ...(query.platform ? { platform: query.platform } : {}),
      isActive: true,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.game.findMany({
        orderBy: { name: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
        where,
      }),
      this.prisma.game.count({ where }),
    ]);

    return toJson({ data, meta: { ...pagination, total } });
  }

  async genres() {
    const rows = await this.prisma.game.findMany({
      distinct: ['genre'],
      orderBy: { genre: 'asc' },
      select: { genre: true },
      where: { genre: { not: null }, isActive: true },
    });
    return rows.map((row) => row.genre).filter(Boolean);
  }

  async platforms() {
    const rows = await this.prisma.game.findMany({
      distinct: ['platform'],
      orderBy: { platform: 'asc' },
      select: { platform: true },
      where: { isActive: true, platform: { not: null } },
    });
    return rows.map((row) => row.platform).filter(Boolean);
  }

  async findBySlug(slug: string) {
    const game = await this.prisma.game.findUnique({ where: { slug } });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return toJson(game);
  }

  async findById(id: string) {
    const game = await this.prisma.game.findUnique({ where: { id } });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return toJson(game);
  }
}
