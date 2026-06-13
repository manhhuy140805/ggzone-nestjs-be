import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { getPagination, toJson } from '../../common/api/query.util';
import { userSummarySelect } from '../../common/api/prisma-selects';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPost(postId: string, query: { page?: string; pageSize?: string }) {
    const pagination = getPagination(query.page, query.pageSize, 20);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        include: { user: { select: userSummarySelect } },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        where: { postId },
      }),
      this.prisma.comment.count({ where: { postId } }),
    ]);

    return toJson({
      data,
      meta: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: Math.ceil(total / pagination.pageSize),
      },
    });
  }

  async findById(id: string) {
    const comment = await this.prisma.comment.findUnique({
      include: { user: { select: userSummarySelect } },
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return toJson(comment);
  }

  async create(user: JwtUser, body: any) {
    const comment = await this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({
        select: { id: true, userId: true },
        where: { id: body.postId },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const created = await tx.comment.create({
        data: {
          content: body.content,
          parentCommentId: body.parentCommentId,
          postId: body.postId,
          userId: body.userId ?? user.id,
        },
        include: { user: { select: userSummarySelect } },
      });

      await tx.post.update({
        data: { commentsCount: { increment: 1 } },
        where: { id: body.postId },
      });

      if (post.userId !== user.id) {
        await tx.notification.create({
          data: {
            content: `${user.username} commented on your post`,
            relatedId: post.id,
            relatedType: 'post',
            title: 'New comment',
            type: 'comment',
            userId: post.userId,
          },
        });
      }

      return created;
    });

    return toJson(comment);
  }

  async update(id: string, user: JwtUser, body: any) {
    await this.ensureCommentOwner(id, user);
    return toJson(
      await this.prisma.comment.update({
        data: { content: body.content, updatedAt: new Date() },
        include: { user: { select: userSummarySelect } },
        where: { id },
      }),
    );
  }

  async delete(id: string, user: JwtUser) {
    const comment = await this.ensureCommentOwner(id, user);
    await this.prisma.$transaction([
      this.prisma.comment.delete({ where: { id } }),
      this.prisma.post.update({
        data: { commentsCount: { decrement: 1 } },
        where: { id: comment.postId },
      }),
    ]);
  }

  private async ensureCommentOwner(id: string, user: JwtUser) {
    const comment = await this.prisma.comment.findUnique({
      select: { postId: true, userId: true },
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== user.id && user.role?.toLowerCase() !== 'admin') {
      throw new ForbiddenException('Only the comment owner can perform this action');
    }

    return comment;
  }
}
