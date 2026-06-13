import { Controller, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ok } from '../../common/helpers/api-response.helper';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async image(@UploadedFile() file: any, @Query('folder') folder = 'ggzone') {
    return ok(await this.uploadService.image(file, folder));
  }

  @Post('video')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 500 * 1024 * 1024 } }))
  async video(@UploadedFile() file: any, @Query('folder') folder = 'ggzone/videos') {
    return ok(await this.uploadService.video(file, folder));
  }

  @Post('test')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async test(@UploadedFile() file: any) {
    return ok(await this.uploadService.image(file, 'ggzone-test'));
  }
}
