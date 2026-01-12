import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '서버 상태 확인', description: '서버가 정상 작동 중인지 확인합니다.' })
  @ApiResponse({ status: 200, description: '서버 정상', schema: { example: { status: 'ok' } } })
  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
