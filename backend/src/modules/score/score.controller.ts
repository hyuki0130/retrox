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

import { ScoreService } from './score.service';
import { CreateScoreDto } from './dto';

@Controller('scores')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post()
  async create(@Body() dto: CreateScoreDto) {
    return this.scoreService.create(dto);
  }

  @Get('user/:userId')
  async getUserScores(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('gameId') gameId?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.scoreService.getUserScores(userId, gameId, limit);
  }

  @Get('ranking/:gameId')
  async getGameRanking(
    @Param('gameId') gameId: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.scoreService.getGameRanking(gameId, limit);
  }

  @Get('rank/:userId/:gameId')
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
