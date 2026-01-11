import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateScoreDto } from './dto';

interface ScoreEntry {
  id: string;
  gameId: string;
  score: number;
  createdAt: Date;
}

interface RankingEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  score: number;
  createdAt: Date;
}

@Injectable()
export class ScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScoreDto): Promise<ScoreEntry> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    const entry = await this.prisma.score.create({
      data: {
        userId: dto.userId,
        gameId: dto.gameId,
        score: dto.score,
      },
    });

    return {
      id: entry.id,
      gameId: entry.gameId,
      score: entry.score,
      createdAt: entry.createdAt,
    };
  }

  async getUserScores(
    userId: string,
    gameId?: string,
    limit = 20,
  ): Promise<ScoreEntry[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const scores = await this.prisma.score.findMany({
      where: {
        userId,
        ...(gameId && { gameId }),
      },
      orderBy: { score: 'desc' },
      take: limit,
      select: {
        id: true,
        gameId: true,
        score: true,
        createdAt: true,
      },
    });

    return scores;
  }

  async getGameRanking(
    gameId: string,
    limit = 100,
  ): Promise<RankingEntry[]> {
    const allScoresForGame = await this.prisma.score.findMany({
      where: { gameId },
      orderBy: { score: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    const userBestScores = this.extractBestScorePerUser(allScoresForGame);
    const sortedScores = this.sortByScoreDescending(userBestScores);
    
    return this.mapToRankingEntries(sortedScores.slice(0, limit));
  }

  private extractBestScorePerUser<T extends { userId: string; score: number }>(
    scores: T[],
  ): T[] {
    const bestByUser = new Map<string, T>();
    
    for (const score of scores) {
      const existing = bestByUser.get(score.userId);
      if (!existing || score.score > existing.score) {
        bestByUser.set(score.userId, score);
      }
    }
    
    return Array.from(bestByUser.values());
  }

  private sortByScoreDescending<T extends { score: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => b.score - a.score);
  }

  private mapToRankingEntries(
    scores: Array<{
      userId: string;
      score: number;
      createdAt: Date;
      user: { id: string; displayName: string | null };
    }>,
  ): RankingEntry[] {
    return scores.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      displayName: entry.user.displayName,
      score: entry.score,
      createdAt: entry.createdAt,
    }));
  }

  async getUserRank(userId: string, gameId: string): Promise<{ rank: number; score: number } | null> {
    const ranking = await this.getGameRanking(gameId, 1000);
    const userEntry = ranking.find((r) => r.userId === userId);

    if (!userEntry) {
      return null;
    }

    return {
      rank: userEntry.rank,
      score: userEntry.score,
    };
  }
}
