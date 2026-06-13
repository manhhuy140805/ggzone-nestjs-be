import { Controller, Get, Param, Query } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get('trending')
  trending(@Query('limit') limit?: string) {
    return this.gamesService.trending(limit);
  }

  @Get('search')
  search(@Query('q') q = '', @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.gamesService.search(q, { page, pageSize });
  }

  @Get('filter')
  filter(
    @Query('genre') genre?: string,
    @Query('platform') platform?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.gamesService.filter({ genre, page, pageSize, platform });
  }

  @Get('genres')
  genres() {
    return this.gamesService.genres();
  }

  @Get('platforms')
  platforms() {
    return this.gamesService.platforms();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.gamesService.findBySlug(slug);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.gamesService.findById(id);
  }
}
