import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ok } from '../../common/helpers/api-response.helper';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('User')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMe(@CurrentUser() user: JwtUser) {
    return ok(await this.usersService.findById(user.id));
  }

  @ApiOperation({ summary: 'Search users by username, full name, or email' })
  @Get('search')
  async search(@Query() query: SearchUsersQueryDto) {
    return ok(await this.usersService.search(query));
  }

  @ApiOperation({ summary: 'Get user profile by username' })
  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    return ok(await this.usersService.findByUsername(username));
  }

  @ApiOperation({ summary: 'List users' })
  @Get()
  async findMany(@Query() query: ListUsersQueryDto) {
    return ok(await this.usersService.findMany(query));
  }

  @ApiOperation({ summary: 'Get user profile by id' })
  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return ok(await this.usersService.findById(id));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return ok(await this.usersService.updateProfile(user.id, dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @Put('password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: JwtUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.id, dto);
    return ok({ changed: true }, 'Password changed successfully');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user online status' })
  @Put('status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateStatusDto,
  ) {
    return ok(await this.usersService.updateStatus(user.id, dto.status));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user account' })
  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteMe(@CurrentUser() user: JwtUser) {
    await this.usersService.deleteMe(user.id);
    return ok({ deleted: true }, 'User deleted successfully');
  }
}
