import { Injectable, NotFoundException } from '@nestjs/common';
import { getPagination, toJson } from '../../common/api/query.util';
import { postInclude, userSummarySelect, withPostFlags } from '../../common/api/prisma-selects';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return toJson(
      await this.prisma.group.findMany({
        include: { createdByUser: { select: userSummarySelect } },
        orderBy: { membersCount: 'desc' },
      }),
    );
  }

  async myGroups(userId: string) {
    const memberships = await this.prisma.groupMember.findMany({
      include: { group: true },
      orderBy: { joinedAt: 'desc' },
      where: { userId },
    });

    return toJson(
      memberships.map((membership) => ({
        ...membership.group,
        role: membership.role,
      })),
    );
  }

  async fixMemberCounts() {
    const groups = await this.prisma.group.findMany({ select: { id: true } });

    for (const group of groups) {
      await this.syncMemberCount(group.id);
    }

    return { updated: groups.length };
  }

  async posts(groupId: string, query: { page?: string; pageSize?: string }) {
    const pagination = getPagination(query.page, query.pageSize, 20);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        include: postInclude,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: pagination.skip,
        take: pagination.take,
        where: { groupId },
      }),
      this.prisma.post.count({ where: { groupId } }),
    ]);

    return toJson({ data: withPostFlags(data), meta: { ...pagination, total } });
  }

  async findById(id: string) {
    const group = await this.prisma.group.findUnique({
      include: {
        createdByUser: { select: userSummarySelect },
        members: {
          include: {
            user: { select: userSummarySelect },
          },
        },
      },
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return toJson(group);
  }

  async create(userId: string, body: any) {
    const group = await this.prisma.$transaction(async (tx) => {
      const created = await tx.group.create({
        data: {
          coverImageUrl: body.coverImageUrl,
          createdBy: userId,
          description: body.description,
          iconUrl: body.iconUrl,
          membersCount: 1,
          name: body.name,
          visibility: body.visibility ?? 'public',
        },
      });

      await tx.groupMember.create({
        data: {
          groupId: created.id,
          role: 'admin',
          userId,
        },
      });

      return created;
    });

    return toJson(group);
  }

  async join(groupId: string, userId: string) {
    await this.prisma.groupMember.upsert({
      create: { groupId, userId },
      update: {},
      where: { groupId_userId: { groupId, userId } },
    });
    const membersCount = await this.syncMemberCount(groupId);

    return { joined: true, membersCount };
  }

  async leave(groupId: string, userId: string) {
    await this.prisma.groupMember.deleteMany({ where: { groupId, userId } });
    const membersCount = await this.syncMemberCount(groupId);

    return { left: true, membersCount };
  }

  private async syncMemberCount(groupId: string) {
    const count = await this.prisma.groupMember.count({ where: { groupId } });
    await this.prisma.group.update({ data: { membersCount: count }, where: { id: groupId } });
    return count;
  }
}
