import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ok } from '../../common/helpers/api-response.helper';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('debug-user')
  @UseGuards(JwtAuthGuard)
  debugUser(@CurrentUser() user: JwtUser) {
    return ok(user);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async feed(
    @CurrentUser() user: JwtUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy = 'latest',
    @Query('groupId') groupId?: string,
  ) {
    return ok(await this.postsService.feed(user.id, { groupId, page, pageSize, sortBy }));
  }

  @Get('filter')
  async filter(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('groupId') groupId?: string,
    @Query('userId') userId?: string,
    @Query('sortBy') sortBy = 'latest',
  ) {
    return ok(await this.postsService.filter({ groupId, page, pageSize, sortBy, userId }));
  }

  @Get('search')
  async search(@Query('q') q = '', @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return ok(await this.postsService.search(q, { page, pageSize }));
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return ok(await this.postsService.findById(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: JwtUser, @Body() body: any) {
    return ok(await this.postsService.create(user.id, body), 'Post created successfully');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.postsService.update(id, user, body), 'Post updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    await this.postsService.delete(id, user);
    return ok({ deleted: true }, 'Post deleted successfully');
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async like(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return ok({ likeCount: await this.postsService.like(id, user.id) });
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  async unlike(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return ok({ likeCount: await this.postsService.unlike(id, user.id) });
  }
}
