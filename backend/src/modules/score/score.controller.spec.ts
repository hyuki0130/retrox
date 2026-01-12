import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';

describe('ScoreController', () => {
  let controller: ScoreController;
  let mockScoreService: {
    create: jest.Mock;
    getUserScores: jest.Mock;
    getGameRanking: jest.Mock;
    getUserRank: jest.Mock;
  };

  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockGameId = 'galaga';

  const mockScore = {
    id: '770e8400-e29b-41d4-a716-446655440001',
    userId: mockUserId,
    gameId: mockGameId,
    score: 50000,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockScoreService = {
      create: jest.fn(),
      getUserScores: jest.fn(),
      getGameRanking: jest.fn(),
      getUserRank: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoreController],
      providers: [{ provide: ScoreService, useValue: mockScoreService }],
    }).compile();

    controller = module.get<ScoreController>(ScoreController);
  });

  describe('create', () => {
    describe('when valid input is provided', () => {
      it('should create and return the score', async () => {
        mockScoreService.create.mockResolvedValue(mockScore);

        const dto = { userId: mockUserId, gameId: mockGameId, score: 50000 };
        const result = await controller.create(dto);

        expect(result).toEqual(mockScore);
        expect(mockScoreService.create).toHaveBeenCalledWith(dto);
      });

      it('should handle zero score', async () => {
        const zeroScore = { ...mockScore, score: 0 };
        mockScoreService.create.mockResolvedValue(zeroScore);

        const result = await controller.create({
          userId: mockUserId,
          gameId: mockGameId,
          score: 0,
        });

        expect(result.score).toBe(0);
      });

      it('should handle very high scores', async () => {
        const highScore = { ...mockScore, score: 999999999 };
        mockScoreService.create.mockResolvedValue(highScore);

        const result = await controller.create({
          userId: mockUserId,
          gameId: mockGameId,
          score: 999999999,
        });

        expect(result.score).toBe(999999999);
      });

      it('should handle different game IDs', async () => {
        const games = ['galaga', 'tetris', 'pacman', 'space_invaders'];

        for (const gameId of games) {
          mockScoreService.create.mockResolvedValue({ ...mockScore, gameId });

          const result = await controller.create({
            userId: mockUserId,
            gameId,
            score: 50000,
          });

          expect(result.gameId).toBe(gameId);
        }
      });
    });

    describe('when user does not exist', () => {
      it('should propagate NotFoundException from service', async () => {
        mockScoreService.create.mockRejectedValue(
          new NotFoundException('User not found'),
        );

        await expect(
          controller.create({
            userId: 'non-existent',
            gameId: mockGameId,
            score: 50000,
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('getUserScores', () => {
    describe('when user exists', () => {
      it('should return user scores', async () => {
        const scores = [mockScore];
        mockScoreService.getUserScores.mockResolvedValue(scores);

        const result = await controller.getUserScores(mockUserId, undefined, 20);

        expect(result).toEqual(scores);
        expect(mockScoreService.getUserScores).toHaveBeenCalledWith(
          mockUserId,
          undefined,
          20,
        );
      });

      it('should filter by gameId', async () => {
        mockScoreService.getUserScores.mockResolvedValue([mockScore]);

        const result = await controller.getUserScores(mockUserId, mockGameId, 20);

        expect(mockScoreService.getUserScores).toHaveBeenCalledWith(
          mockUserId,
          mockGameId,
          20,
        );
      });

      it('should respect limit parameter', async () => {
        mockScoreService.getUserScores.mockResolvedValue([]);

        await controller.getUserScores(mockUserId, undefined, 5);

        expect(mockScoreService.getUserScores).toHaveBeenCalledWith(
          mockUserId,
          undefined,
          5,
        );
      });

      it('should return empty array when no scores exist', async () => {
        mockScoreService.getUserScores.mockResolvedValue([]);

        const result = await controller.getUserScores(mockUserId, undefined, 20);

        expect(result).toEqual([]);
      });

      it('should return multiple scores', async () => {
        const scores = [
          { ...mockScore, score: 50000 },
          { ...mockScore, id: '2', score: 40000 },
          { ...mockScore, id: '3', score: 30000 },
        ];
        mockScoreService.getUserScores.mockResolvedValue(scores);

        const result = await controller.getUserScores(mockUserId, undefined, 20);

        expect(result).toHaveLength(3);
      });
    });

    describe('when user does not exist', () => {
      it('should propagate NotFoundException from service', async () => {
        mockScoreService.getUserScores.mockRejectedValue(
          new NotFoundException('User not found'),
        );

        await expect(
          controller.getUserScores('non-existent', undefined, 20),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('getGameRanking', () => {
    describe('when game has scores', () => {
      it('should return ranking list', async () => {
        const ranking = [
          { userId: 'user1', score: 100000, rank: 1 },
          { userId: 'user2', score: 80000, rank: 2 },
          { userId: 'user3', score: 60000, rank: 3 },
        ];
        mockScoreService.getGameRanking.mockResolvedValue(ranking);

        const result = await controller.getGameRanking(mockGameId, 100);

        expect(result).toEqual(ranking);
        expect(mockScoreService.getGameRanking).toHaveBeenCalledWith(mockGameId, 100);
      });

      it('should respect limit parameter', async () => {
        mockScoreService.getGameRanking.mockResolvedValue([]);

        await controller.getGameRanking(mockGameId, 10);

        expect(mockScoreService.getGameRanking).toHaveBeenCalledWith(mockGameId, 10);
      });

      it('should return empty array when no scores exist', async () => {
        mockScoreService.getGameRanking.mockResolvedValue([]);

        const result = await controller.getGameRanking(mockGameId, 100);

        expect(result).toEqual([]);
      });

      it('should handle different game IDs', async () => {
        const games = ['galaga', 'tetris', 'pacman'];

        for (const gameId of games) {
          mockScoreService.getGameRanking.mockResolvedValue([]);

          await controller.getGameRanking(gameId, 100);

          expect(mockScoreService.getGameRanking).toHaveBeenCalledWith(gameId, 100);
        }
      });
    });
  });

  describe('getUserRank', () => {
    describe('when user has scores for the game', () => {
      it('should return rank and score', async () => {
        const rankResult = { rank: 5, score: 50000 };
        mockScoreService.getUserRank.mockResolvedValue(rankResult);

        const result = await controller.getUserRank(mockUserId, mockGameId);

        expect(result).toEqual(rankResult);
        expect(mockScoreService.getUserRank).toHaveBeenCalledWith(
          mockUserId,
          mockGameId,
        );
      });

      it('should return rank 1 for top player', async () => {
        mockScoreService.getUserRank.mockResolvedValue({ rank: 1, score: 1000000 });

        const result = await controller.getUserRank(mockUserId, mockGameId);

        expect(result.rank).toBe(1);
      });

      it('should handle high rank numbers', async () => {
        mockScoreService.getUserRank.mockResolvedValue({ rank: 9999, score: 100 });

        const result = await controller.getUserRank(mockUserId, mockGameId);

        expect(result.rank).toBe(9999);
      });
    });

    describe('when user has no scores for the game', () => {
      it('should return null values with message', async () => {
        mockScoreService.getUserRank.mockResolvedValue(null);

        const result = await controller.getUserRank(mockUserId, mockGameId);

        expect(result).toEqual({
          rank: null,
          score: null,
          message: 'No scores found',
        });
      });
    });

    describe('when user does not exist', () => {
      it('should propagate NotFoundException from service', async () => {
        mockScoreService.getUserRank.mockRejectedValue(
          new NotFoundException('User not found'),
        );

        await expect(
          controller.getUserRank('non-existent', mockGameId),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
});
