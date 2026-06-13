import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiOperation({ summary: 'Check API health' })
  @Get()
  getStatus() {
    return this.healthService.getStatus();
  }

  @ApiOperation({ summary: 'Check database connectivity' })
  @Get('db')
  getDatabaseStatus() {
    return this.healthService.getDatabaseStatus();
  }
}
