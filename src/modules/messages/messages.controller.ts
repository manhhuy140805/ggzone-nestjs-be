import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { MessagesService } from './messages.service';

@Controller('Message')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':userId/conversations')
  conversations(@Param('userId') userId: string) {
    return this.messagesService.conversations(userId);
  }

  @Get(':userId/with/:otherUserId')
  withUser(
    @Param('userId') userId: string,
    @Param('otherUserId') otherUserId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.messagesService.withUser(userId, otherUserId, { page, pageSize });
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() body: any) {
    return this.messagesService.create(user, body);
  }

  @Put(':id/read')
  read(@Param('id') id: string) {
    return this.messagesService.read(id);
  }

  @Get(':userId/unread-count')
  unreadCount(@Param('userId') userId: string) {
    return this.messagesService.unreadCount(userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.messagesService.delete(id);
  }
}
