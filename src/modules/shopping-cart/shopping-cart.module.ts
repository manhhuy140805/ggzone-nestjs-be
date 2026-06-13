import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ShoppingCartController } from './shopping-cart.controller';
import { ShoppingCartService } from './shopping-cart.service';

@Module({
  controllers: [ShoppingCartController],
  imports: [AuthModule],
  providers: [ShoppingCartService],
})
export class ShoppingCartModule {}
