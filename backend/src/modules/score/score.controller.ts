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

import { ScoreService } from './score.service';
import { CreateScoreDto } from './dto';

@ApiTags('scores')
@Controller('scores')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post()
  @ApiOperation({ summary: '점수 등록', description: '게임 플레이 결과 점수를 등록합니다.' })
  @ApiResponse({ status: 201, description: '점수 등록 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async create(@Body() dto: CreateScoreDto) {
    return this.scoreService.create(dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '사용자 점수 목록', description: '특정 사용자의 게임 점수 목록을 조회합니다.' })
  @ApiParam({ name: 'userId', description: '사용자 UUID' })
  @ApiQuery({ name: 'gameId', required: false, description: '특정 게임으로 필터링', example: 'galaga' })
  @ApiQuery({ name: 'limit', required: false, description: '조회 개수 (기본값: 20)', example: 20 })
  @ApiResponse({ status: 200, description: '점수 목록' })
  async getUserScores(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('gameId') gameId?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.scoreService.getUserScores(userId, gameId, limit);
  }

  @Get('ranking/:gameId')
  @ApiOperation({ summary: '게임 랭킹', description: '특정 게임의 전체 랭킹을 조회합니다.' })
  @ApiParam({ name: 'gameId', description: '게임 ID', example: 'galaga' })
  @ApiQuery({ name: 'limit', required: false, description: '조회 개수 (기본값: 100)', example: 100 })
  @ApiResponse({ status: 200, description: '랭킹 목록 (점수 내림차순)' })
  async getGameRanking(
    @Param('gameId') gameId: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.scoreService.getGameRanking(gameId, limit);
  }

  @Get('rank/:userId/:gameId')
  @ApiOperation({ summary: '사용자 랭킹 조회', description: '특정 게임에서 사용자의 순위를 조회합니다.' })
  @ApiParam({ name: 'userId', description: '사용자 UUID' })
  @ApiParam({ name: 'gameId', description: '게임 ID', example: 'galaga' })
  @ApiResponse({ status: 200, description: '사용자 순위 및 최고 점수', schema: { example: { rank: 5, score: 15000 } } })
  @ApiResponse({ status: 200, description: '기록 없음', schema: { example: { rank: null, score: null, message: 'No scores found' } } })
  async getUserRank(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('gameId') gameId: string,
  ) {
    const result = await this.scoreService.getUserRank(userId, gameId);
    if (!result) {
      return { rank: null, score: null, message: 'No scores found' };
    }
    return result;
  }
}
