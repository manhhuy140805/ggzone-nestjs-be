import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'alice_gamer', maxLength: 50, minLength: 3 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'alice@ggzone.com', maxLength: 100 })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({ example: 'password123', maxLength: 72, minLength: 1 })
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password: string;

  @ApiPropertyOptional({ example: 'Alice Nguyen', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ example: 'user', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  role?: string;
}
