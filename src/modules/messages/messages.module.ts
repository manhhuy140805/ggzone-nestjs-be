import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  controllers: [MessagesController],
  imports: [AuthModule],
  providers: [MessagesService],
})
export class MessagesModule {}
