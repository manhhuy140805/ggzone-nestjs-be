import { Injectable } from '@nestjs/common';
import { getPagination, toBool, toJson } from '../../common/api/query.util';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async unreadCount(userId: string) {
    return { count: await this.prisma.notification.count({ where: { isRead: false, userId } }) };
  }

  async findByUser(userId: string, query: { isRead?: string; page?: string; pageSize?: string }) {
    const pagination = getPagination(query.page, query.pageSize, 20);
    const isRead = toBool(query.isRead);
    const where = { userId, ...(isRead === undefined ? {} : { isRead }) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        where,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return toJson({ data, meta: { ...pagination, total } });
  }

  async read(id: string) {
    return toJson(await this.prisma.notification.update({ data: { isRead: true }, where: { id } }));
  }

  async readAll(userId: string) {
    const result = await this.prisma.notification.updateMany({
      data: { isRead: true },
      where: { userId },
    });
    return { count: result.count };
  }

  async create(body: any) {
    return toJson(await this.prisma.notification.create({ data: body }));
  }

  async clear(userId: string) {
    const result = await this.prisma.notification.deleteMany({ where: { userId } });
    return { count: result.count };
  }

  async delete(id: string) {
    await this.prisma.notification.delete({ where: { id } });
    return { deleted: true };
  }
}
