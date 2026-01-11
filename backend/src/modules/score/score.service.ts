import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Score } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateScoreDto, ScoreEntry, RankingEntry, GameRanking } from './score.dto';

@Injectable()
export class ScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateScoreDto): Promise<Score> {
    if (dto.score < 0) {
      throw new BadRequestException('Score cannot be negative');
    }

    await this.validateUserExists(userId);

    return this.prisma.score.create({
      data: {
        userId,
        gameId: dto.gameId,
        score: dto.score,
      },
    });
  }

  async getUserScores(userId: string, gameId?: string): Promise<ScoreEntry[]> {
    await this.validateUserExists(userId);

    const scores = await this.prisma.score.findMany({
      where: {
        userId,
        ...(gameId && { gameId }),
      },
      include: {
        user: {
          select: { displayName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return scores.map((s) => ({
      id: s.id,
      userId: s.userId,
      displayName: s.user.displayName,
      gameId: s.gameId,
      score: s.score,
      createdAt: s.createdAt,
    }));
  }

  async getGameRanking(gameId: string, limit = 10): Promise<GameRanking> {
    const topScores = await this.prisma.score.findMany({
      where: { gameId },
      include: {
        user: {
          select: { displayName: true },
        },
      },
      orderBy: { score: 'desc' },
      take: limit,
      distinct: ['userId'],
    });

    const rankings: RankingEntry[] = topScores.map((s, index) => ({
      rank: index + 1,
      userId: s.userId,
      displayName: s.user.displayName,
      score: s.score,
    }));

    return { gameId, rankings };
  }

  async getUserBestScore(userId: string, gameId: string): Promise<number> {
    const best = await this.prisma.score.findFirst({
      where: { userId, gameId },
      orderBy: { score: 'desc' },
    });

    return best?.score ?? 0;
  }

  private async validateUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
  }
}
