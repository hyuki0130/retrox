import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { CoinController } from './coin.controller';
import { CoinService } from './coin.service';

describe('CoinController', () => {
  let controller: CoinController;
  let mockCoinService: {
    addCoins: jest.Mock;
    spendCoins: jest.Mock;
    getBalance: jest.Mock;
    getLedger: jest.Mock;
  };

  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';

  const mockLedgerEntry = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    amount: 500,
    reason: 'ad_reward',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockCoinService = {
      addCoins: jest.fn(),
      spendCoins: jest.fn(),
      getBalance: jest.fn(),
      getLedger: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoinController],
      providers: [{ provide: CoinService, useValue: mockCoinService }],
    }).compile();

    controller = module.get<CoinController>(CoinController);
  });

  describe('addCoins', () => {
    describe('when valid input is provided', () => {
      it('should add coins and return ledger entry', async () => {
        mockCoinService.addCoins.mockResolvedValue(mockLedgerEntry);

        const dto = { userId: mockUserId, amount: 500, reason: 'ad_reward' };
        const result = await controller.addCoins(dto);

        expect(result).toEqual(mockLedgerEntry);
        expect(mockCoinService.addCoins).toHaveBeenCalledWith(dto);
      });

      it('should handle large amounts', async () => {
        const largeEntry = { ...mockLedgerEntry, amount: 1000000 };
        mockCoinService.addCoins.mockResolvedValue(largeEntry);

        const dto = { userId: mockUserId, amount: 1000000, reason: 'bulk_purchase' };
        const result = await controller.addCoins(dto);

        expect(result.amount).toBe(1000000);
      });

      it('should handle different reasons', async () => {
        const reasons = ['ad_reward', 'daily_bonus', 'purchase', 'referral'];

        for (const reason of reasons) {
          mockCoinService.addCoins.mockResolvedValue({ ...mockLedgerEntry, reason });

          const result = await controller.addCoins({
            userId: mockUserId,
            amount: 500,
            reason,
          });

          expect(result.reason).toBe(reason);
        }
      });
    });

    describe('when user does not exist', () => {
      it('should propagate NotFoundException from service', async () => {
        mockCoinService.addCoins.mockRejectedValue(
          new NotFoundException('User not found'),
        );

        await expect(
          controller.addCoins({
            userId: 'non-existent',
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
        const spendEntry = { ...mockLedgerEntry, amount: -500, reason: 'game_play' };
        mockCoinService.spendCoins.mockResolvedValue(spendEntry);

        const dto = { userId: mockUserId, amount: 500, reason: 'game_play' };
        const result = await controller.spendCoins(dto);

        expect(result.amount).toBe(-500);
        expect(mockCoinService.spendCoins).toHaveBeenCalledWith(dto);
      });

      it('should handle small amounts', async () => {
        mockCoinService.spendCoins.mockResolvedValue({ ...mockLedgerEntry, amount: -1 });

        const result = await controller.spendCoins({
          userId: mockUserId,
          amount: 1,
          reason: 'micro_spend',
        });

        expect(result.amount).toBe(-1);
      });
    });

    describe('when user has insufficient balance', () => {
      it('should propagate BadRequestException from service', async () => {
        mockCoinService.spendCoins.mockRejectedValue(
          new BadRequestException('Insufficient coins'),
        );

        await expect(
          controller.spendCoins({
            userId: mockUserId,
            amount: 100000,
            reason: 'test',
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('when user does not exist', () => {
      it('should propagate NotFoundException from service', async () => {
        mockCoinService.spendCoins.mockRejectedValue(
          new NotFoundException('User not found'),
        );

        await expect(
          controller.spendCoins({
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
      it('should return balance object', async () => {
        const balanceResponse = { userId: mockUserId, balance: 5000 };
        mockCoinService.getBalance.mockResolvedValue(balanceResponse);

        const result = await controller.getBalance(mockUserId);

        expect(result).toEqual(balanceResponse);
        expect(mockCoinService.getBalance).toHaveBeenCalledWith(mockUserId);
      });

      it('should return zero balance', async () => {
        mockCoinService.getBalance.mockResolvedValue({ userId: mockUserId, balance: 0 });

        const result = await controller.getBalance(mockUserId);

        expect(result.balance).toBe(0);
      });

      it('should handle negative balance', async () => {
        mockCoinService.getBalance.mockResolvedValue({ userId: mockUserId, balance: -100 });

        const result = await controller.getBalance(mockUserId);

        expect(result.balance).toBe(-100);
      });
    });

    describe('when user does not exist', () => {
      it('should propagate NotFoundException from service', async () => {
        mockCoinService.getBalance.mockRejectedValue(
          new NotFoundException('User not found'),
        );

        await expect(controller.getBalance('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('getLedger', () => {
    describe('when user exists', () => {
      it('should return paginated ledger entries', async () => {
        const ledgerResponse = {
          entries: [mockLedgerEntry],
          total: 1,
        };
        mockCoinService.getLedger.mockResolvedValue(ledgerResponse);

        const result = await controller.getLedger(mockUserId, 50, 0);

        expect(result).toEqual(ledgerResponse);
        expect(mockCoinService.getLedger).toHaveBeenCalledWith(mockUserId, 50, 0);
      });

      it('should respect limit parameter', async () => {
        mockCoinService.getLedger.mockResolvedValue({ entries: [], total: 100 });

        await controller.getLedger(mockUserId, 10, 0);

        expect(mockCoinService.getLedger).toHaveBeenCalledWith(mockUserId, 10, 0);
      });

      it('should respect offset parameter', async () => {
        mockCoinService.getLedger.mockResolvedValue({ entries: [], total: 100 });

        await controller.getLedger(mockUserId, 50, 25);

        expect(mockCoinService.getLedger).toHaveBeenCalledWith(mockUserId, 50, 25);
      });

      it('should return empty entries array when no transactions', async () => {
        mockCoinService.getLedger.mockResolvedValue({ entries: [], total: 0 });

        const result = await controller.getLedger(mockUserId, 50, 0);

        expect(result.entries).toEqual([]);
        expect(result.total).toBe(0);
      });

      it('should return multiple entries', async () => {
        const entries = [
          { id: '1', amount: 500, reason: 'ad', createdAt: new Date() },
          { id: '2', amount: -200, reason: 'game', createdAt: new Date() },
          { id: '3', amount: 1000, reason: 'bonus', createdAt: new Date() },
        ];
        mockCoinService.getLedger.mockResolvedValue({ entries, total: 3 });

        const result = await controller.getLedger(mockUserId, 50, 0);

        expect(result.entries).toHaveLength(3);
        expect(result.total).toBe(3);
      });
    });

    describe('when user does not exist', () => {
      it('should propagate NotFoundException from service', async () => {
        mockCoinService.getLedger.mockRejectedValue(
          new NotFoundException('User not found'),
        );

        await expect(controller.getLedger('non-existent', 50, 0)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
