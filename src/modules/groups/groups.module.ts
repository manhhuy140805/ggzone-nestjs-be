import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  controllers: [GroupsController],
  imports: [AuthModule],
  providers: [GroupsService],
})
export class GroupsModule {}
