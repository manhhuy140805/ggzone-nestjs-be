import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreService } from './store.service';

@Controller('Store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('products')
  products(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.storeService.products({ category, page, pageSize, search });
  }

  @Get('categories')
  categories() {
    return this.storeService.categories();
  }

  @Get('products/:id')
  product(@Param('id') id: string) {
    return this.storeService.product(id);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any) {
    return this.storeService.create(body);
  }

  @Put('products/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.storeService.update(id, body);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string) {
    return this.storeService.delete(id);
  }
}
