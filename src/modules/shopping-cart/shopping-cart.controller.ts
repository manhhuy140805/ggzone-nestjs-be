import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { ShoppingCartService } from './shopping-cart.service';

@Controller('ShoppingCart')
@UseGuards(JwtAuthGuard)
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  @Get(':userId')
  byUser(@Param('userId') userId: string) {
    return this.shoppingCartService.byUser(userId);
  }

  @Post()
  add(@CurrentUser() user: JwtUser, @Body() body: any) {
    return this.shoppingCartService.add(user.id, body);
  }

  @Put(':id')
  updateQuantity(@Param('id') id: string, @Body() body: any) {
    return this.shoppingCartService.updateQuantity(id, body);
  }

  @Delete('user/:userId')
  clear(@Param('userId') userId: string) {
    return this.shoppingCartService.clear(userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.shoppingCartService.delete(id);
  }
}
