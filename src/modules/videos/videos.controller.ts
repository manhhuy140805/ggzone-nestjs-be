import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { VideosService } from './videos.service';

@Controller('Video')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
    @Query('gameId') gameId?: string,
  ) {
    return this.videosService.list({ category, gameId, page, pageSize });
  }

  @Get(':id/comments')
  comments(@Param('id') id: string) {
    return this.videosService.comments(id);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.videosService.detail(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtUser, @Body() body: any) {
    return this.videosService.create(user.id, body);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  addComment(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() body: any) {
    return this.videosService.addComment(id, user.id, body);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  like(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() body: any) {
    return this.videosService.like(id, body.userId ?? user.id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  unlike(@CurrentUser() user: JwtUser, @Param('id') id: string, @Query('userId') queryUserId?: string) {
    return this.videosService.unlike(id, queryUserId ?? user.id);
  }
}
