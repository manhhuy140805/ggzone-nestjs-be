import { BadRequestException, Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class UploadService {
  async image(file: any, folder: string) {
    this.assertFileExtension(file, ['.jpg', '.jpeg', '.png', '.gif', '.webp']);
    const result = await this.uploadCloudinaryFile(file, 'image', folder);
    return { publicId: result.public_id, url: result.secure_url };
  }

  async video(file: any, folder: string) {
    this.assertFileExtension(file, ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv']);
    const result = await this.uploadCloudinaryFile(file, 'video', folder);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_2,w_320,h_180,c_fill,q_auto/${result.public_id}.jpg`;

    return {
      duration: result.duration,
      publicId: result.public_id,
      thumbnailUrl,
      videoUrl: result.secure_url,
    };
  }

  private assertFileExtension(file: any, allowed: string[]): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const name = String(file.originalname ?? '').toLowerCase();
    if (!allowed.some((extension) => name.endsWith(extension))) {
      throw new UnsupportedMediaTypeException('Unsupported file type');
    }
  }

  private cloudinarySignature(params: Record<string, string | number>, apiSecret: string): string {
    const payload =
      Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&') + apiSecret;

    return createHash('sha1').update(payload).digest('hex');
  }

  private async uploadCloudinaryFile(file: any, resourceType: 'image' | 'video', folder: string) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Cloudinary environment variables are not configured');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.cloudinarySignature({ folder, timestamp }, apiSecret);
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([file.buffer as BlobPart], { type: file.mimetype }),
      file.originalname,
    );
    formData.append('api_key', apiKey);
    formData.append('folder', folder);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        body: formData,
        method: 'POST',
      },
    );

    if (!response.ok) {
      throw new BadRequestException(`Cloudinary upload failed: ${await response.text()}`);
    }

    return (await response.json()) as Record<string, any>;
  }
}
