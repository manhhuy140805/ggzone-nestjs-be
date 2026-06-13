import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ enum: ['online', 'offline', 'in-game'], example: 'online' })
  @IsIn(['online', 'offline', 'in-game'])
  status: 'online' | 'offline' | 'in-game';
}
