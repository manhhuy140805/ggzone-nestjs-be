import { Injectable } from '@nestjs/common';
import { toJson } from '../../common/api/query.util';
import { userSummarySelect } from '../../common/api/prisma-selects';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FriendshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async friends(userId: string) {
    return toJson(
      await this.prisma.friendship.findMany({
        include: { friend: { select: userSummarySelect }, user: { select: userSummarySelect } },
        where: {
          OR: [{ userId }, { friendId: userId }],
          status: 'accepted',
        },
      }),
    );
  }

  async requests(userId: string) {
    return toJson(
      await this.prisma.friendship.findMany({
        include: { user: { select: userSummarySelect } },
        where: { friendId: userId, status: 'pending' },
      }),
    );
  }

  async sent(userId: string) {
    return toJson(
      await this.prisma.friendship.findMany({
        include: { friend: { select: userSummarySelect } },
        where: { status: 'pending', userId },
      }),
    );
  }

  async send(currentUserId: string, body: any) {
    return toJson(
      await this.prisma.friendship.create({
        data: {
          friendId: body.friendId,
          status: 'pending',
          userId: body.userId ?? currentUserId,
        },
      }),
    );
  }

  async accept(id: string) {
    return toJson(
      await this.prisma.friendship.update({
        data: { status: 'accepted' },
        where: { id },
      }),
    );
  }

  async decline(id: string) {
    await this.prisma.friendship.delete({ where: { id } });
    return { declined: true };
  }

  async remove(id: string) {
    await this.prisma.friendship.delete({ where: { id } });
    return { deleted: true };
  }

  async suggestions(userId: string) {
    return toJson(
      await this.prisma.friendSuggestion.findMany({
        include: { suggestedUser: { select: userSummarySelect } },
        orderBy: { score: 'desc' },
        take: 10,
        where: { isShown: false, userId },
      }),
    );
  }

  async dismissSuggestion(id: string) {
    return toJson(
      await this.prisma.friendSuggestion.update({
        data: { isShown: true },
        where: { id },
      }),
    );
  }
}
