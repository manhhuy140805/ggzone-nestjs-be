import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { PhotosService } from './photos.service';

@Controller('Photo')
@UseGuards(JwtAuthGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get('detail/:id')
  detail(@Param('id') id: string) {
    return this.photosService.detail(id);
  }

  @Get(':userId')
  byUser(@Param('userId') userId: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.photosService.byUser(userId, { page, pageSize });
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() body: any) {
    return this.photosService.create(user.id, body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.photosService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.photosService.delete(id);
  }
}
