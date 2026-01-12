import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

const INITIAL_COINS = 10000;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        displayName: dto.displayName,
      },
    });

    await this.prisma.coinLedger.create({
      data: {
        userId: user.id,
        amount: INITIAL_COINS,
        reason: 'initial_bonus',
      },
    });

    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async getCoins(userId: string): Promise<number> {
    await this.findById(userId);

    const result = await this.prisma.coinLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    return result._sum.amount ?? 0;
  }
}
