import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

import { CoinService } from './coin.service';
import { AddCoinsDto, SpendCoinsDto } from './dto';

@ApiTags('coins')
@Controller('coins')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Post('add')
  @ApiOperation({ summary: '코인 지급', description: '사용자에게 코인을 지급합니다. (광고 보상, 이벤트 등)' })
  @ApiResponse({ status: 201, description: '코인 지급 성공, 업데이트된 잔액 반환' })
  @ApiResponse({ status: 400, description: '잘못된 요청 (음수 금액 등)' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async addCoins(@Body() dto: AddCoinsDto) {
    return this.coinService.addCoins(dto);
  }

  @Post('spend')
  @ApiOperation({ summary: '코인 소비', description: '사용자의 코인을 차감합니다. (게임 플레이 등)' })
  @ApiResponse({ status: 201, description: '코인 소비 성공, 업데이트된 잔액 반환' })
  @ApiResponse({ status: 400, description: '잔액 부족 또는 잘못된 요청' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async spendCoins(@Body() dto: SpendCoinsDto) {
    return this.coinService.spendCoins(dto);
  }

  @Get('balance/:userId')
  @ApiOperation({ summary: '코인 잔액 조회', description: '사용자의 현재 코인 잔액을 조회합니다.' })
  @ApiParam({ name: 'userId', description: '사용자 UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: '현재 잔액', schema: { example: { balance: 10000 } } })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getBalance(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.coinService.getBalance(userId);
  }

  @Get('ledger/:userId')
  @ApiOperation({ summary: '코인 거래 내역 조회', description: '사용자의 코인 입출금 내역을 조회합니다.' })
  @ApiParam({ name: 'userId', description: '사용자 UUID' })
  @ApiQuery({ name: 'limit', required: false, description: '조회 개수 (기본값: 50)', example: 50 })
  @ApiQuery({ name: 'offset', required: false, description: '시작 위치 (기본값: 0)', example: 0 })
  @ApiResponse({ status: 200, description: '거래 내역 목록' })
  async getLedger(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.coinService.getLedger(userId, limit, offset);
  }
}
