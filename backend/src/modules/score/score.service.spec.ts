import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { ScoreService } from './score.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ScoreService', () => {
  let service: ScoreService;
  let mockUserFindUnique: jest.Mock;
  let mockScoreCreate: jest.Mock;
  let mockScoreFindMany: jest.Mock;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockScore = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    userId: mockUser.id,
    gameId: 'shooter',
    score: 1500,
    createdAt: new Date(),
    user: { id: mockUser.id, displayName: 'Test User' },
  };

  beforeEach(async () => {
    mockUserFindUnique = jest.fn();
    mockScoreCreate = jest.fn();
    mockScoreFindMany = jest.fn();

    const mockPrismaService = {
      user: {
        findUnique: mockUserFindUnique,
      },
      score: {
        create: mockScoreCreate,
        findMany: mockScoreFindMany,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoreService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ScoreService>(ScoreService);
  });

  describe('create', () => {
    describe('when valid input is provided', () => {
      it('should create and return score entry', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockScoreCreate.mockResolvedValue(mockScore);

        const result = await service.create({
          userId: mockUser.id,
          gameId: 'shooter',
          score: 1500,
        });

        expect(result).toEqual({
          id: mockScore.id,
          gameId: 'shooter',
          score: 1500,
          createdAt: mockScore.createdAt,
        });
      });

      it('should handle high scores', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockScoreCreate.mockResolvedValue({
          ...mockScore,
          score: 999999999,
        });

        const result = await service.create({
          userId: mockUser.id,
          gameId: 'shooter',
          score: 999999999,
        });

        expect(result.score).toBe(999999999);
      });

      it('should handle minimum score of 1', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockScoreCreate.mockResolvedValue({
          ...mockScore,
          score: 1,
        });

        const result = await service.create({
          userId: mockUser.id,
          gameId: 'puzzle',
          score: 1,
        });

        expect(result.score).toBe(1);
      });
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundException', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        await expect(
          service.create({
            userId: 'non-existent',
            gameId: 'shooter',
            score: 100,
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('getUserScores', () => {
    describe('when user exists', () => {
      it('should return user scores sorted by score desc', async () => {
        const scores = [
          { id: '1', gameId: 'shooter', score: 2000, createdAt: new Date() },
          { id: '2', gameId: 'shooter', score: 1500, createdAt: new Date() },
        ];
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockScoreFindMany.mockResolvedValue(scores);

        const result = await service.getUserScores(mockUser.id);

        expect(result).toHaveLength(2);
        expect(result[0].score).toBe(2000);
      });

      it('should filter by gameId when provided', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockScoreFindMany.mockResolvedValue([]);

        await service.getUserScores(mockUser.id, 'shooter');

        expect(mockScoreFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ gameId: 'shooter' }),
          }),
        );
      });

      it('should return empty array when no scores exist', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockScoreFindMany.mockResolvedValue([]);

        const result = await service.getUserScores(mockUser.id);

        expect(result).toEqual([]);
      });

      it('should respect limit parameter', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockScoreFindMany.mockResolvedValue([]);

        await service.getUserScores(mockUser.id, undefined, 5);

        expect(mockScoreFindMany).toHaveBeenCalledWith(
          expect.objectContaining({ take: 5 }),
        );
      });
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundException', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        await expect(service.getUserScores('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('getGameRanking', () => {
    describe('when scores exist', () => {
      it('should return ranking with unique users and best scores', async () => {
        const scores = [
          { ...mockScore, userId: 'user1', score: 2000, user: { id: 'user1', displayName: 'User 1' } },
          { ...mockScore, userId: 'user1', score: 1500, user: { id: 'user1', displayName: 'User 1' } },
          { ...mockScore, userId: 'user2', score: 1800, user: { id: 'user2', displayName: 'User 2' } },
        ];
        mockScoreFindMany.mockResolvedValue(scores);

        const result = await service.getGameRanking('shooter');

        expect(result).toHaveLength(2);
        expect(result[0].rank).toBe(1);
        expect(result[0].score).toBe(2000);
        expect(result[1].rank).toBe(2);
        expect(result[1].score).toBe(1800);
      });

      it('should handle single user', async () => {
        mockScoreFindMany.mockResolvedValue([mockScore]);

        const result = await service.getGameRanking('shooter');

        expect(result).toHaveLength(1);
        expect(result[0].rank).toBe(1);
      });

      it('should handle users with same score', async () => {
        const scores = [
          { ...mockScore, userId: 'user1', score: 1000, user: { id: 'user1', displayName: 'User 1' } },
          { ...mockScore, userId: 'user2', score: 1000, user: { id: 'user2', displayName: 'User 2' } },
        ];
        mockScoreFindMany.mockResolvedValue(scores);

        const result = await service.getGameRanking('shooter');

        expect(result).toHaveLength(2);
        expect(result[0].rank).toBe(1);
        expect(result[1].rank).toBe(2);
      });

      it('should include displayName in ranking', async () => {
        mockScoreFindMany.mockResolvedValue([mockScore]);

        const result = await service.getGameRanking('shooter');

        expect(result[0].displayName).toBe('Test User');
      });

      it('should handle null displayName', async () => {
        mockScoreFindMany.mockResolvedValue([
          { ...mockScore, user: { id: mockUser.id, displayName: null } },
        ]);

        const result = await service.getGameRanking('shooter');

        expect(result[0].displayName).toBeNull();
      });

      it('should respect limit parameter', async () => {
        const scores = Array.from({ length: 10 }, (_, i) => ({
          ...mockScore,
          userId: `user${i}`,
          score: 1000 - i * 10,
          user: { id: `user${i}`, displayName: `User ${i}` },
        }));
        mockScoreFindMany.mockResolvedValue(scores);

        const result = await service.getGameRanking('shooter', 5);

        expect(result).toHaveLength(5);
      });
    });

    describe('when no scores exist', () => {
      it('should return empty array', async () => {
        mockScoreFindMany.mockResolvedValue([]);

        const result = await service.getGameRanking('shooter');

        expect(result).toEqual([]);
      });
    });
  });

  describe('getUserRank', () => {
    describe('when user has scores', () => {
      it('should return user rank and score', async () => {
        const scores = [
          { ...mockScore, userId: 'user1', score: 2000, user: { id: 'user1', displayName: 'User 1' } },
          { ...mockScore, userId: mockUser.id, score: 1500, user: { id: mockUser.id, displayName: 'Test User' } },
        ];
        mockScoreFindMany.mockResolvedValue(scores);

        const result = await service.getUserRank(mockUser.id, 'shooter');

        expect(result).toEqual({
          rank: 2,
          score: 1500,
        });
      });

      it('should return rank 1 for top scorer', async () => {
        mockScoreFindMany.mockResolvedValue([mockScore]);

        const result = await service.getUserRank(mockUser.id, 'shooter');

        expect(result?.rank).toBe(1);
      });
    });

    describe('when user has no scores', () => {
      it('should return null', async () => {
        mockScoreFindMany.mockResolvedValue([]);

        const result = await service.getUserRank(mockUser.id, 'shooter');

        expect(result).toBeNull();
      });
    });

    describe('when user is not in ranking', () => {
      it('should return null', async () => {
        const otherUserScore = {
          ...mockScore,
          userId: 'other-user',
          user: { id: 'other-user', displayName: 'Other' },
        };
        mockScoreFindMany.mockResolvedValue([otherUserScore]);

        const result = await service.getUserRank(mockUser.id, 'shooter');

        expect(result).toBeNull();
      });
    });
  });
});
