import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsService } from './friendships.service';

@Module({
  controllers: [FriendshipsController],
  imports: [AuthModule],
  providers: [FriendshipsService],
})
export class FriendshipsModule {}
