import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ description: 'Service health status' })
  getHealth() {
    return {
      status: 'ok',
      service: 'api',
    };
  }
}
