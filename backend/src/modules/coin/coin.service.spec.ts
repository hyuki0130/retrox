import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { CoinService } from './coin.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CoinService', () => {
  let service: CoinService;
  let mockUserFindUnique: jest.Mock;
  let mockCoinLedgerCreate: jest.Mock;
  let mockCoinLedgerAggregate: jest.Mock;
  let mockCoinLedgerFindMany: jest.Mock;
  let mockCoinLedgerCount: jest.Mock;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLedgerEntry = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    userId: mockUser.id,
    amount: 500,
    reason: 'ad_reward',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockUserFindUnique = jest.fn();
    mockCoinLedgerCreate = jest.fn();
    mockCoinLedgerAggregate = jest.fn();
    mockCoinLedgerFindMany = jest.fn();
    mockCoinLedgerCount = jest.fn();

    const mockPrismaService = {
      user: {
        findUnique: mockUserFindUnique,
      },
      coinLedger: {
        create: mockCoinLedgerCreate,
        aggregate: mockCoinLedgerAggregate,
        findMany: mockCoinLedgerFindMany,
        count: mockCoinLedgerCount,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CoinService>(CoinService);
  });

  describe('addCoins', () => {
    describe('when valid input is provided', () => {
      it('should add coins and return ledger entry', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerCreate.mockResolvedValue(mockLedgerEntry);

        const result = await service.addCoins({
          userId: mockUser.id,
          amount: 500,
          reason: 'ad_reward',
        });

        expect(result).toEqual({
          id: mockLedgerEntry.id,
          amount: 500,
          reason: 'ad_reward',
          createdAt: mockLedgerEntry.createdAt,
        });
        expect(mockCoinLedgerCreate).toHaveBeenCalledWith({
          data: {
            userId: mockUser.id,
            amount: 500,
            reason: 'ad_reward',
          },
        });
      });

      it('should handle large amounts', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerCreate.mockResolvedValue({
          ...mockLedgerEntry,
          amount: 1000000,
        });

        const result = await service.addCoins({
          userId: mockUser.id,
          amount: 1000000,
          reason: 'bulk_purchase',
        });

        expect(result.amount).toBe(1000000);
      });
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundException', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        await expect(
          service.addCoins({
            userId: 'non-existent-id',
            amount: 500,
            reason: 'test',
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('spendCoins', () => {
    describe('when user has sufficient balance', () => {
      it('should deduct coins and return ledger entry', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: 10000 },
          _count: {},
          _avg: {},
          _min: {},
          _max: {},
        });
        mockCoinLedgerCreate.mockResolvedValue({
          ...mockLedgerEntry,
          amount: -500,
          reason: 'game_play',
        });

        const result = await service.spendCoins({
          userId: mockUser.id,
          amount: 500,
          reason: 'game_play',
        });

        expect(result.amount).toBe(-500);
        expect(mockCoinLedgerCreate).toHaveBeenCalledWith({
          data: {
            userId: mockUser.id,
            amount: -500,
            reason: 'game_play',
          },
        });
      });

      it('should allow spending exact balance', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: 500 },
          _count: {},
          _avg: {},
          _min: {},
          _max: {},
        });
        mockCoinLedgerCreate.mockResolvedValue({
          ...mockLedgerEntry,
          amount: -500,
        });

        const result = await service.spendCoins({
          userId: mockUser.id,
          amount: 500,
          reason: 'exact_spend',
        });

        expect(result.amount).toBe(-500);
      });
    });

    describe('when user has insufficient balance', () => {
      it('should throw BadRequestException', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: 100 },
          _count: {},
          _avg: {},
          _min: {},
          _max: {},
        });

        await expect(
          service.spendCoins({
            userId: mockUser.id,
            amount: 500,
            reason: 'game_play',
          }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException when balance is zero', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: 0 },
          _count: {},
          _avg: {},
          _min: {},
          _max: {},
        });

        await expect(
          service.spendCoins({
            userId: mockUser.id,
            amount: 1,
            reason: 'test',
          }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException when balance is null', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: null },
          _count: {},
          _avg: {},
          _min: {},
          _max: {},
        });

        await expect(
          service.spendCoins({
            userId: mockUser.id,
            amount: 1,
            reason: 'test',
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundException', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        await expect(
          service.spendCoins({
            userId: 'non-existent',
            amount: 100,
            reason: 'test',
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('getBalance', () => {
    describe('when user exists', () => {
      it('should return correct balance', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: 5000 },
          _count: {},
          _avg: {},
          _min: {},
          _max: {},
        });

        const result = await service.getBalance(mockUser.id);

        expect(result).toEqual({
          userId: mockUser.id,
          balance: 5000,
        });
      });

      it('should return zero when no transactions exist', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: null },
          _count: {},
          _avg: {},
          _min: {},
          _max: {},
        });

        const result = await service.getBalance(mockUser.id);

        expect(result.balance).toBe(0);
      });

      it('should handle negative balance correctly', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: -100 },
          _count: {},
          _avg: {},
          _min: {},
          _max: {},
        });

        const result = await service.getBalance(mockUser.id);

        expect(result.balance).toBe(-100);
      });
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundException', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        await expect(service.getBalance('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('getLedger', () => {
    describe('when user exists', () => {
      it('should return paginated ledger entries', async () => {
        const entries = [
          { id: '1', amount: 500, reason: 'ad', createdAt: new Date() },
          { id: '2', amount: -200, reason: 'game', createdAt: new Date() },
        ];
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerFindMany.mockResolvedValue(entries);
        mockCoinLedgerCount.mockResolvedValue(2);

        const result = await service.getLedger(mockUser.id, 50, 0);

        expect(result.entries).toHaveLength(2);
        expect(result.total).toBe(2);
      });

      it('should return empty array when no transactions exist', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerFindMany.mockResolvedValue([]);
        mockCoinLedgerCount.mockResolvedValue(0);

        const result = await service.getLedger(mockUser.id);

        expect(result.entries).toEqual([]);
        expect(result.total).toBe(0);
      });

      it('should respect limit parameter', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerFindMany.mockResolvedValue([]);
        mockCoinLedgerCount.mockResolvedValue(100);

        await service.getLedger(mockUser.id, 10, 0);

        expect(mockCoinLedgerFindMany).toHaveBeenCalledWith(
          expect.objectContaining({ take: 10 }),
        );
      });

      it('should respect offset parameter', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerFindMany.mockResolvedValue([]);
        mockCoinLedgerCount.mockResolvedValue(100);

        await service.getLedger(mockUser.id, 50, 20);

        expect(mockCoinLedgerFindMany).toHaveBeenCalledWith(
          expect.objectContaining({ skip: 20 }),
        );
      });
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundException', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        await expect(service.getLedger('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
