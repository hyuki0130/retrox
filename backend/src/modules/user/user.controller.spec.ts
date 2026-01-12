import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: {
    create: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    getCoins: jest.Mock;
  };

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUserService = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      getCoins: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('create', () => {
    describe('when valid input is provided', () => {
      it('should create and return the user', async () => {
        mockUserService.create.mockResolvedValue(mockUser);

        const result = await controller.create({
          email: 'test@example.com',
          displayName: 'Test User',
        });

        expect(result).toEqual(mockUser);
        expect(mockUserService.create).toHaveBeenCalledWith({
          email: 'test@example.com',
          displayName: 'Test User',
        });
      });

      it('should handle empty dto', async () => {
        const anonymousUser = { ...mockUser, email: undefined, displayName: undefined };
        mockUserService.create.mockResolvedValue(anonymousUser);

        const result = await controller.create({});

        expect(result).toBeDefined();
        expect(mockUserService.create).toHaveBeenCalledWith({});
      });

      it('should handle only email', async () => {
        mockUserService.create.mockResolvedValue({ ...mockUser, email: 'only@email.com', displayName: undefined });

        const result = await controller.create({ email: 'only@email.com' });

        expect(result.email).toBe('only@email.com');
      });

      it('should handle only displayName', async () => {
        mockUserService.create.mockResolvedValue({ ...mockUser, email: undefined });

        const result = await controller.create({ displayName: 'Only Name' });

        expect(result).toBeDefined();
      });
    });
  });

  describe('findById', () => {
    describe('when user exists', () => {
      it('should return the user', async () => {
        mockUserService.findById.mockResolvedValue(mockUser);

        const result = await controller.findById(mockUser.id);

        expect(result).toEqual(mockUser);
        expect(mockUserService.findById).toHaveBeenCalledWith(mockUser.id);
      });
    });

    describe('when user does not exist', () => {
      it('should propagate NotFoundException from service', async () => {
        mockUserService.findById.mockRejectedValue(
          new NotFoundException('User not found'),
        );

        await expect(controller.findById('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('update', () => {
    describe('when user exists', () => {
      it('should update and return the user', async () => {
        const updatedUser = { ...mockUser, displayName: 'Updated Name' };
        mockUserService.update.mockResolvedValue(updatedUser);

        const result = await controller.update(mockUser.id, {
          displayName: 'Updated Name',
        });

        expect(result.displayName).toBe('Updated Name');
        expect(mockUserService.update).toHaveBeenCalledWith(mockUser.id, {
          displayName: 'Updated Name',
        });
      });

      it('should handle empty update dto', async () => {
        mockUserService.update.mockResolvedValue(mockUser);

        const result = await controller.update(mockUser.id, {});

        expect(result).toEqual(mockUser);
        expect(mockUserService.update).toHaveBeenCalledWith(mockUser.id, {});
      });
    });

    describe('when user does not exist', () => {
      it('should propagate NotFoundException from service', async () => {
        mockUserService.update.mockRejectedValue(
          new NotFoundException('User not found'),
        );

        await expect(
          controller.update('non-existent', { displayName: 'New Name' }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('getCoins', () => {
    describe('when user exists', () => {
      it('should return coins wrapped in object', async () => {
        mockUserService.getCoins.mockResolvedValue(15000);

        const result = await controller.getCoins(mockUser.id);

        expect(result).toEqual({ coins: 15000 });
        expect(mockUserService.getCoins).toHaveBeenCalledWith(mockUser.id);
      });

      it('should return zero coins', async () => {
        mockUserService.getCoins.mockResolvedValue(0);

        const result = await controller.getCoins(mockUser.id);

        expect(result).toEqual({ coins: 0 });
      });

      it('should handle negative balance', async () => {
        mockUserService.getCoins.mockResolvedValue(-500);

        const result = await controller.getCoins(mockUser.id);

        expect(result).toEqual({ coins: -500 });
      });
    });

    describe('when user does not exist', () => {
      it('should propagate NotFoundException from service', async () => {
        mockUserService.getCoins.mockRejectedValue(
          new NotFoundException('User not found'),
        );

        await expect(controller.getCoins('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
