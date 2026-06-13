import { Injectable, NotFoundException } from '@nestjs/common';
import { getPagination, toJson } from '../../common/api/query.util';
import { userSummarySelect } from '../../common/api/prisma-selects';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PhotosService {
  constructor(private readonly prisma: PrismaService) {}

  async detail(id: string) {
    const photo = await this.prisma.photo.findUnique({
      include: { game: true, user: { select: userSummarySelect } },
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    return toJson(photo);
  }

  async byUser(userId: string, query: { page?: string; pageSize?: string }) {
    const pagination = getPagination(query.page, query.pageSize, 20);
    return toJson(
      await this.prisma.photo.findMany({
        include: { game: true },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        where: { userId },
      }),
    );
  }

  async create(currentUserId: string, body: any) {
    return toJson(
      await this.prisma.photo.create({
        data: {
          caption: body.caption,
          gameId: body.gameId,
          imageUrl: body.imageUrl,
          userId: body.userId ?? currentUserId,
        },
      }),
    );
  }

  async update(id: string, body: any) {
    return toJson(
      await this.prisma.photo.update({
        data: { caption: body.caption },
        where: { id },
      }),
    );
  }

  async delete(id: string) {
    await this.prisma.photo.delete({ where: { id } });
    return { deleted: true };
  }
}
