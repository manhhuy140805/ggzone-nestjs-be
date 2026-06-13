import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { getPagination, toJson } from '../../common/api/query.util';
import { postInclude, withPostFlags } from '../../common/api/prisma-selects';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async feed(
    currentUserId: string,
    query: { groupId?: string; page?: string; pageSize?: string; sortBy?: string },
  ) {
    const pagination = getPagination(query.page, query.pageSize, 10);
    const where = query.groupId ? { groupId: query.groupId } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        include: postInclude,
        orderBy: this.postOrder(query.sortBy ?? 'latest'),
        skip: pagination.skip,
        take: pagination.take,
        where,
      }),
      this.prisma.post.count({ where }),
    ]);

    return toJson({
      data: withPostFlags(items, currentUserId),
      meta: this.meta(pagination, total),
    });
  }

  async filter(query: {
    groupId?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    userId?: string;
  }) {
    const pagination = getPagination(query.page, query.pageSize, 10);
    const where = {
      ...(query.groupId ? { groupId: query.groupId } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        include: postInclude,
        orderBy: this.postOrder(query.sortBy ?? 'latest'),
        skip: pagination.skip,
        take: pagination.take,
        where,
      }),
      this.prisma.post.count({ where }),
    ]);

    return toJson({
      data: withPostFlags(items),
      meta: this.meta(pagination, total),
    });
  }

  async search(q: string, query: { page?: string; pageSize?: string }) {
    const pagination = getPagination(query.page, query.pageSize, 10);
    const where = { content: { contains: q, mode: 'insensitive' as const } };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        include: postInclude,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        where,
      }),
      this.prisma.post.count({ where }),
    ]);

    return toJson({
      data: withPostFlags(items),
      meta: this.meta(pagination, total),
    });
  }

  async findById(id: string) {
    const post = await this.prisma.post.findUnique({
      include: {
        ...postInclude,
        comments: {
          include: {
            user: {
              select: {
                avatarUrl: true,
                fullName: true,
                id: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return toJson(withPostFlags([post])[0]);
  }

  async create(userId: string, body: any) {
    const mediaUrls = Array.isArray(body.mediaUrls) ? body.mediaUrls : [];
    const post = await this.prisma.post.create({
      data: {
        content: body.content,
        groupId: body.groupId,
        postType: body.postType ?? (mediaUrls.length ? 'media' : 'text'),
        userId,
        videoUrl: body.videoUrl,
        ...(mediaUrls.length
          ? {
              media: {
                create: mediaUrls.map((media: any, index: number) => ({
                  mediaType: media.type ?? media.mediaType ?? 'image',
                  mediaUrl: media.url ?? media.mediaUrl,
                  orderIndex: index,
                })),
              },
            }
          : {}),
      },
      include: postInclude,
    });

    return toJson(withPostFlags([post], userId)[0]);
  }

  async update(id: string, user: JwtUser, body: any) {
    await this.ensurePostOwner(id, user);
    const post = await this.prisma.post.update({
      data: {
        content: body.content,
        updatedAt: new Date(),
      },
      include: postInclude,
      where: { id },
    });

    return toJson(withPostFlags([post], user.id)[0]);
  }

  async delete(id: string, user: JwtUser) {
    await this.ensurePostOwner(id, user);
    await this.prisma.post.delete({ where: { id } });
  }

  async like(postId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.postLike.upsert({
        create: { postId, userId },
        update: {},
        where: { postId_userId: { postId, userId } },
      });
      const count = await tx.postLike.count({ where: { postId } });
      await tx.post.update({ data: { likesCount: count }, where: { id: postId } });
      return count;
    });
  }

  async unlike(postId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.postLike.deleteMany({ where: { postId, userId } });
      const count = await tx.postLike.count({ where: { postId } });
      await tx.post.update({ data: { likesCount: count }, where: { id: postId } });
      return count;
    });
  }

  private postOrder(sortBy: string) {
    if (sortBy === 'popular') {
      return [{ likesCount: 'desc' as const }, { commentsCount: 'desc' as const }];
    }

    return { createdAt: 'desc' as const };
  }

  private meta(pagination: { page: number; pageSize: number }, total: number) {
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  private async ensurePostOwner(id: string, user: JwtUser) {
    const post = await this.prisma.post.findUnique({
      select: { userId: true },
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== user.id && user.role?.toLowerCase() !== 'admin') {
      throw new ForbiddenException('Only the post owner can perform this action');
    }
  }
}
