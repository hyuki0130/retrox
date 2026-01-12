import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let mockUserCreate: jest.Mock;
  let mockUserFindUnique: jest.Mock;
  let mockUserUpdate: jest.Mock;
  let mockCoinLedgerCreate: jest.Mock;
  let mockCoinLedgerAggregate: jest.Mock;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUserCreate = jest.fn();
    mockUserFindUnique = jest.fn();
    mockUserUpdate = jest.fn();
    mockCoinLedgerCreate = jest.fn();
    mockCoinLedgerAggregate = jest.fn();

    const mockPrismaService = {
      user: {
        create: mockUserCreate,
        findUnique: mockUserFindUnique,
        update: mockUserUpdate,
      },
      coinLedger: {
        create: mockCoinLedgerCreate,
        aggregate: mockCoinLedgerAggregate,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    describe('when valid input is provided', () => {
      it('should create user and grant initial coins', async () => {
        mockUserCreate.mockResolvedValue(mockUser);
        mockCoinLedgerCreate.mockResolvedValue({
          id: 'ledger-1',
          userId: mockUser.id,
          amount: 10000,
          reason: 'initial_bonus',
        });

        const result = await service.create({
          email: 'test@example.com',
          displayName: 'Test User',
        });

        expect(result).toEqual(mockUser);
        expect(mockUserCreate).toHaveBeenCalledWith({
          data: {
            email: 'test@example.com',
            displayName: 'Test User',
          },
        });
        expect(mockCoinLedgerCreate).toHaveBeenCalledWith({
          data: {
            userId: mockUser.id,
            amount: 10000,
            reason: 'initial_bonus',
          },
        });
      });

      it('should create user with only email', async () => {
        const userWithEmail = { ...mockUser, email: 'only@email.com', displayName: undefined };
        mockUserCreate.mockResolvedValue(userWithEmail);
        mockCoinLedgerCreate.mockResolvedValue({});

        const result = await service.create({ email: 'only@email.com' });

        expect(result.email).toBe('only@email.com');
        expect(mockUserCreate).toHaveBeenCalledWith({
          data: {
            email: 'only@email.com',
            displayName: undefined,
          },
        });
      });

      it('should create user with only displayName', async () => {
        const userWithName = { ...mockUser, email: undefined };
        mockUserCreate.mockResolvedValue(userWithName);
        mockCoinLedgerCreate.mockResolvedValue({});

        const result = await service.create({ displayName: 'Only Name' });

        expect(result).toBeDefined();
        expect(mockUserCreate).toHaveBeenCalledWith({
          data: {
            email: undefined,
            displayName: 'Only Name',
          },
        });
      });

      it('should create user with empty dto', async () => {
        const anonymousUser = { ...mockUser, email: undefined, displayName: undefined };
        mockUserCreate.mockResolvedValue(anonymousUser);
        mockCoinLedgerCreate.mockResolvedValue({});

        const result = await service.create({});

        expect(result).toBeDefined();
        expect(mockCoinLedgerCreate).toHaveBeenCalled();
      });
    });
  });

  describe('findById', () => {
    describe('when user exists', () => {
      it('should return the user', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);

        const result = await service.findById(mockUser.id);

        expect(result).toEqual(mockUser);
        expect(mockUserFindUnique).toHaveBeenCalledWith({
          where: { id: mockUser.id },
        });
      });
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundException', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        await expect(service.findById('non-existent-id')).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should include user id in error message', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        await expect(service.findById('missing-user')).rejects.toThrow(
          'User missing-user not found',
        );
      });
    });
  });

  describe('findByEmail', () => {
    describe('when user exists', () => {
      it('should return the user', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);

        const result = await service.findByEmail('test@example.com');

        expect(result).toEqual(mockUser);
        expect(mockUserFindUnique).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
        });
      });
    });

    describe('when user does not exist', () => {
      it('should return null', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        const result = await service.findByEmail('nonexistent@example.com');

        expect(result).toBeNull();
      });
    });
  });

  describe('update', () => {
    describe('when user exists', () => {
      it('should update and return the user', async () => {
        const updatedUser = { ...mockUser, displayName: 'Updated Name' };
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockUserUpdate.mockResolvedValue(updatedUser);

        const result = await service.update(mockUser.id, {
          displayName: 'Updated Name',
        });

        expect(result.displayName).toBe('Updated Name');
        expect(mockUserUpdate).toHaveBeenCalledWith({
          where: { id: mockUser.id },
          data: { displayName: 'Updated Name' },
        });
      });

      it('should handle empty update dto', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockUserUpdate.mockResolvedValue(mockUser);

        const result = await service.update(mockUser.id, {});

        expect(result).toEqual(mockUser);
        expect(mockUserUpdate).toHaveBeenCalledWith({
          where: { id: mockUser.id },
          data: {},
        });
      });
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundException', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        await expect(
          service.update('non-existent', { displayName: 'New Name' }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('getCoins', () => {
    describe('when user exists', () => {
      it('should return correct coin balance', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: 15000 },
        });

        const result = await service.getCoins(mockUser.id);

        expect(result).toBe(15000);
        expect(mockCoinLedgerAggregate).toHaveBeenCalledWith({
          where: { userId: mockUser.id },
          _sum: { amount: true },
        });
      });

      it('should return 0 when no transactions exist', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: null },
        });

        const result = await service.getCoins(mockUser.id);

        expect(result).toBe(0);
      });

      it('should return 0 when sum is exactly 0', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: 0 },
        });

        const result = await service.getCoins(mockUser.id);

        expect(result).toBe(0);
      });

      it('should handle negative balance', async () => {
        mockUserFindUnique.mockResolvedValue(mockUser);
        mockCoinLedgerAggregate.mockResolvedValue({
          _sum: { amount: -500 },
        });

        const result = await service.getCoins(mockUser.id);

        expect(result).toBe(-500);
      });
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundException', async () => {
        mockUserFindUnique.mockResolvedValue(null);

        await expect(service.getCoins('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
