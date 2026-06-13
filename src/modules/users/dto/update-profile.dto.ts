import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alice Nguyen', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ example: 'Pro Valorant player' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Ha Noi, Vietnam', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({
    example: 'https://i.pravatar.cc/150?img=1',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string;
}
