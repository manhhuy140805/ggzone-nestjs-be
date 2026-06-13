import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { FriendshipsService } from './friendships.service';

@Controller('Friendship')
@UseGuards(JwtAuthGuard)
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Get(':userId/friends')
  friends(@Param('userId') userId: string) {
    return this.friendshipsService.friends(userId);
  }

  @Get(':userId/requests')
  requests(@Param('userId') userId: string) {
    return this.friendshipsService.requests(userId);
  }

  @Get(':userId/sent')
  sent(@Param('userId') userId: string) {
    return this.friendshipsService.sent(userId);
  }

  @Post('send')
  send(@CurrentUser() user: JwtUser, @Body() body: any) {
    return this.friendshipsService.send(user.id, body);
  }

  @Put(':id/accept')
  accept(@Param('id') id: string) {
    return this.friendshipsService.accept(id);
  }

  @Put(':id/decline')
  decline(@Param('id') id: string) {
    return this.friendshipsService.decline(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendshipsService.remove(id);
  }

  @Get(':userId/suggestions')
  suggestions(@Param('userId') userId: string) {
    return this.friendshipsService.suggestions(userId);
  }

  @Put('suggestion/:id/dismiss')
  dismissSuggestion(@Param('id') id: string) {
    return this.friendshipsService.dismissSuggestion(id);
  }
}
