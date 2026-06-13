import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';

@Module({
  controllers: [PhotosController],
  imports: [AuthModule],
  providers: [PhotosService],
})
export class PhotosModule {}
