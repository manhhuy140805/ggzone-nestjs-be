import { Injectable } from '@nestjs/common';
import { getPagination, toJson } from '../../common/api/query.util';
import { userSummarySelect } from '../../common/api/prisma-selects';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VideosService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: { category?: string; gameId?: string; page?: string; pageSize?: string }) {
    const pagination = getPagination(query.page, query.pageSize, 20);
    const where = {
      ...(query.category ? { category: query.category } : {}),
      ...(query.gameId ? { gameId: query.gameId } : {}),
      isPublic: true,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.video.findMany({
        include: { game: true, user: { select: userSummarySelect } },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        where,
      }),
      this.prisma.video.count({ where }),
    ]);
    return toJson({ data, meta: { ...pagination, total } });
  }

  async comments(videoId: string) {
    return toJson(
      await this.prisma.videoComment.findMany({
        include: { user: { select: userSummarySelect } },
        orderBy: { createdAt: 'desc' },
        where: { videoId },
      }),
    );
  }

  async detail(id: string) {
    return toJson(
      await this.prisma.video.update({
        data: { viewsCount: { increment: 1 } },
        include: { game: true, user: { select: userSummarySelect } },
        where: { id },
      }),
    );
  }

  async create(currentUserId: string, body: any) {
    return toJson(
      await this.prisma.video.create({
        data: {
          category: body.category,
          description: body.description,
          duration: body.duration,
          gameId: body.gameId,
          isPublic: body.isPublic ?? true,
          thumbnailUrl: body.thumbnailUrl,
          title: body.title,
          userId: body.userId ?? currentUserId,
          videoUrl: body.videoUrl,
        },
      }),
    );
  }

  async addComment(videoId: string, currentUserId: string, body: any) {
    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.videoComment.create({
        data: {
          content: body.content,
          userId: body.userId ?? currentUserId,
          videoId,
        },
      });
      await tx.video.update({
        data: { commentsCount: { increment: 1 } },
        where: { id: videoId },
      });
      return created;
    });
    return toJson(comment);
  }

  async like(videoId: string, userId: string) {
    const likesCount = await this.prisma.$transaction(async (tx) => {
      await tx.videoLike.upsert({
        create: { userId, videoId },
        update: {},
        where: { videoId_userId: { userId, videoId } },
      });
      const count = await tx.videoLike.count({ where: { videoId } });
      await tx.video.update({ data: { likesCount: count }, where: { id: videoId } });
      return count;
    });
    return { likesCount };
  }

  async unlike(videoId: string, userId: string) {
    const likesCount = await this.prisma.$transaction(async (tx) => {
      await tx.videoLike.deleteMany({ where: { userId, videoId } });
      const count = await tx.videoLike.count({ where: { videoId } });
      await tx.video.update({ data: { likesCount: count }, where: { id: videoId } });
      return count;
    });
    return { likesCount };
  }
}
