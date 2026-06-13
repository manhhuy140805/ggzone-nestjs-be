import { Injectable } from '@nestjs/common';
import { getPagination, toJson } from '../../common/api/query.util';
import { userSummarySelect } from '../../common/api/prisma-selects';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async conversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      include: {
        receiver: { select: userSummarySelect },
        sender: { select: userSummarySelect },
      },
      orderBy: { createdAt: 'desc' },
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    const conversations = new Map<string, any>();
    for (const message of messages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const existing = conversations.get(otherUserId);
      const unreadIncrement = message.receiverId === userId && !message.isRead ? 1 : 0;

      if (!existing) {
        conversations.set(otherUserId, {
          lastMessage: message,
          otherUser: message.senderId === userId ? message.receiver : message.sender,
          unreadCount: unreadIncrement,
        });
      } else {
        existing.unreadCount += unreadIncrement;
      }
    }

    return toJson([...conversations.values()]);
  }

  async withUser(userId: string, otherUserId: string, query: { page?: string; pageSize?: string }) {
    const pagination = getPagination(query.page, query.pageSize, 50);
    await this.prisma.message.updateMany({
      data: { isRead: true },
      where: { receiverId: userId, senderId: otherUserId, isRead: false },
    });

    return toJson(
      await this.prisma.message.findMany({
        include: {
          receiver: { select: userSummarySelect },
          sender: { select: userSummarySelect },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        where: {
          OR: [
            { receiverId: otherUserId, senderId: userId },
            { receiverId: userId, senderId: otherUserId },
          ],
        },
      }),
    );
  }

  async create(user: JwtUser, body: any) {
    const message = await this.prisma.$transaction(async (tx) => {
      const senderId = body.senderId ?? user.id;
      const created = await tx.message.create({
        data: {
          content: body.content,
          receiverId: body.receiverId,
          senderId,
        },
      });

      await tx.notification.create({
        data: {
          content: body.content,
          relatedId: created.id,
          relatedType: 'message',
          title: `New message from ${user.username}`,
          type: 'message',
          userId: body.receiverId,
        },
      });

      return created;
    });

    return toJson(message);
  }

  async read(id: string) {
    return toJson(await this.prisma.message.update({ data: { isRead: true }, where: { id } }));
  }

  async unreadCount(userId: string) {
    return { count: await this.prisma.message.count({ where: { isRead: false, receiverId: userId } }) };
  }

  async delete(id: string) {
    await this.prisma.message.delete({ where: { id } });
    return { deleted: true };
  }
}
