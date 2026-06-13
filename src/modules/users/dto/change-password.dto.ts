import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword123', maxLength: 72, minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  newPassword: string;
}
