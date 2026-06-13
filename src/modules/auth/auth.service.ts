import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtUser } from '../../common/types/jwt-user.type';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const publicUserSelect = {
  email: true,
  id: true,
  username: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password.length > 72) {
      throw new BadRequestException('Password must be at most 72 characters');
    }

    const [emailExists, usernameExists] = await Promise.all([
      this.prisma.user.findUnique({
        select: { id: true },
        where: { email: dto.email },
      }),
      this.prisma.user.findUnique({
        select: { id: true },
        where: { username: dto.username },
      }),
    ]);

    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    if (usernameExists) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: dto.role ?? 'user',
        stats: {
          create: {},
        },
        username: dto.username,
      },
      select: publicUserSelect,
    });
  }

  async login(dto: LoginDto): Promise<{ token: string }> {
    const user = await this.prisma.user.findFirst({
      select: {
        email: true,
        id: true,
        passwordHash: true,
        role: true,
        username: true,
      },
      where: {
        email: dto.email,
      },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng!');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng!');
    }

    const payload: JwtUser = {
      email: user.email,
      id: user.id,
      role: user.role ?? 'user',
      username: user.username,
    };

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
