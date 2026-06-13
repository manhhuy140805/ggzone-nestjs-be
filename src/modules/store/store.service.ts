import { Injectable, NotFoundException } from '@nestjs/common';
import { getPagination, toJson } from '../../common/api/query.util';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async products(query: {
    category?: string;
    page?: string;
    pageSize?: string;
    search?: string;
  }) {
    const pagination = getPagination(query.page, query.pageSize, 20);
    const where = {
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { description: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.storeProduct.findMany({
        include: { game: true },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        where,
      }),
      this.prisma.storeProduct.count({ where }),
    ]);

    return toJson({ data, meta: { ...pagination, total } });
  }

  async categories() {
    const rows = await this.prisma.storeProduct.findMany({
      distinct: ['category'],
      orderBy: { category: 'asc' },
      select: { category: true },
      where: { category: { not: null } },
    });
    return rows.map((row) => row.category).filter(Boolean);
  }

  async product(id: string) {
    const product = await this.prisma.storeProduct.findUnique({
      include: { game: true },
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return toJson(product);
  }

  async create(body: any) {
    return toJson(await this.prisma.storeProduct.create({ data: body }));
  }

  async update(id: string, body: any) {
    return toJson(await this.prisma.storeProduct.update({ data: body, where: { id } }));
  }

  async delete(id: string) {
    await this.prisma.storeProduct.delete({ where: { id } });
    return { deleted: true };
  }
}
