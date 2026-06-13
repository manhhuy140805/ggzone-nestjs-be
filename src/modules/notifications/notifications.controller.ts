import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('Notification')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':userId/unread-count')
  unreadCount(@Param('userId') userId: string) {
    return this.notificationsService.unreadCount(userId);
  }

  @Get(':userId')
  findByUser(
    @Param('userId') userId: string,
    @Query('isRead') isRead?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.notificationsService.findByUser(userId, { isRead, page, pageSize });
  }

  @Put(':id/read')
  read(@Param('id') id: string) {
    return this.notificationsService.read(id);
  }

  @Put(':userId/read-all')
  readAll(@Param('userId') userId: string) {
    return this.notificationsService.readAll(userId);
  }

  @Post()
  create(@Body() body: any) {
    return this.notificationsService.create(body);
  }

  @Delete(':userId/clear')
  clear(@Param('userId') userId: string) {
    return this.notificationsService.clear(userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }
}
