import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

@Module({
  controllers: [StoreController],
  imports: [AuthModule],
  providers: [StoreService],
})
export class StoreModule {}
