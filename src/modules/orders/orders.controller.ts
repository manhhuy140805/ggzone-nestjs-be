import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@Controller('Order')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('detail/:orderId')
  detail(@Param('orderId') orderId: string) {
    return this.ordersService.detail(orderId);
  }

  @Get(':userId')
  byUser(@Param('userId') userId: string) {
    return this.ordersService.byUser(userId);
  }

  @Post()
  create(@Body() body: any) {
    return this.ordersService.create(body);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.updateStatus(id, body);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
