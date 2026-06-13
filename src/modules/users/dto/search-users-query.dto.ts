import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ListUsersQueryDto } from './list-users-query.dto';

export class SearchUsersQueryDto extends ListUsersQueryDto {
  @ApiProperty({ example: 'alice', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  q: string;
}
