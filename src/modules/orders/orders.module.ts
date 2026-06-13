import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  imports: [AuthModule],
  providers: [OrdersService],
})
export class OrdersModule {}
