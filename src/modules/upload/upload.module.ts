import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  controllers: [UploadController],
  imports: [AuthModule],
  providers: [UploadService],
})
export class UploadModule {}
