import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { Score } from '@prisma/client';

import { ScoreService } from './score.service';
import { CreateScoreDto, ScoreEntry, GameRanking } from './score.dto';

@Controller()
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post('users/:userId/scores')
  async create(
    @Param('userId') userId: string,
    @Body() dto: CreateScoreDto,
  ): Promise<Score> {
    return this.scoreService.create(userId, dto);
  }

  @Get('users/:userId/scores')
  async getUserScores(
    @Param('userId') userId: string,
    @Query('gameId') gameId?: string,
  ): Promise<ScoreEntry[]> {
    return this.scoreService.getUserScores(userId, gameId);
  }

  @Get('games/:gameId/ranking')
  async getGameRanking(
    @Param('gameId') gameId: string,
    @Query('limit') limit?: string,
  ): Promise<GameRanking> {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.scoreService.getGameRanking(gameId, parsedLimit);
  }

  @Get('users/:userId/scores/:gameId/best')
  async getUserBestScore(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ): Promise<{ bestScore: number }> {
    const bestScore = await this.scoreService.getUserBestScore(userId, gameId);
    return { bestScore };
  }
}
