import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PrismaService } from '../../database/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const userProfileSelect = {
  avatarUrl: true,
  bio: true,
  coverImageUrl: true,
  createdAt: true,
  email: true,
  fullName: true,
  id: true,
  isVerified: true,
  location: true,
  role: true,
  stats: true,
  status: true,
  updatedAt: true,
  username: true,
} satisfies Prisma.UserSelect;

type UserProfile = Prisma.UserGetPayload<{ select: typeof userProfileSelect }>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    query: ListUsersQueryDto,
  ): Promise<PaginatedResult<UserProfile>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const where: Prisma.UserWhereInput = {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: userProfileSelect,
        skip,
        take: pageSize,
        where,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async search(
    query: SearchUsersQueryDto,
  ): Promise<PaginatedResult<UserProfile>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const where: Prisma.UserWhereInput = {
      OR: [
        {
          username: {
            contains: query.q,
            mode: 'insensitive',
          },
        },
        {
          fullName: {
            contains: query.q,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: query.q,
            mode: 'insensitive',
          },
        },
      ],
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: userProfileSelect,
        skip,
        take: pageSize,
        where,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findById(id: string): Promise<UserProfile> {
    const user = await this.prisma.user.findFirst({
      select: userProfileSelect,
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string): Promise<UserProfile> {
    const user = await this.prisma.user.findFirst({
      select: userProfileSelect,
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserProfile> {
    await this.ensureUserExists(id);

    return this.prisma.user.update({
      data: {
        avatarUrl: dto.avatarUrl,
        bio: dto.bio,
        coverImageUrl: dto.coverImageUrl,
        fullName: dto.fullName,
        location: dto.location,
      },
      select: userProfileSelect,
      where: {
        id,
      },
    });
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findFirst({
      select: {
        id: true,
        passwordHash: true,
      },
      where: {
        id,
      },
    });

    if (!user?.passwordHash) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.newPassword.length > 72) {
      throw new BadRequestException(
        'New password must be at most 72 characters',
      );
    }

    await this.prisma.user.update({
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, 12),
      },
      where: {
        id,
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<UserProfile> {
    await this.ensureUserExists(id);

    return this.prisma.user.update({
      data: {
        status,
      },
      select: userProfileSelect,
      where: {
        id,
      },
    });
  }

  async deleteMe(id: string): Promise<void> {
    await this.ensureUserExists(id);

    await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  private async ensureUserExists(id: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      select: {
        id: true,
      },
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}
