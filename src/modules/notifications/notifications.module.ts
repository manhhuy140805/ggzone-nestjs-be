import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  imports: [AuthModule],
  providers: [NotificationsService],
})
export class NotificationsModule {}
