import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { CommentsService } from './comments.service';

@Controller('Comment')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('post/:postId')
  findByPost(@Param('postId') postId: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.commentsService.findByPost(postId, { page, pageSize });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.commentsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtUser, @Body() body: any) {
    return this.commentsService.create(user, body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() body: any) {
    return this.commentsService.update(id, user, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    await this.commentsService.delete(id, user);
    return { deleted: true };
  }
}
