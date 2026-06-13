import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get('my-groups/:userId')
  myGroups(@Param('userId') userId: string) {
    return this.groupsService.myGroups(userId);
  }

  @Post('fix-member-counts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  fixMemberCounts() {
    return this.groupsService.fixMemberCounts();
  }

  @Get(':id/posts')
  posts(@Param('id') id: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.groupsService.posts(id, { page, pageSize });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.groupsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtUser, @Body() body: any) {
    return this.groupsService.create(user.id, body);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  join(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.groupsService.join(id, user.id);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  leave(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.groupsService.leave(id, user.id);
  }
}
