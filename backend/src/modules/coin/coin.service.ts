import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CoinLedger } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { AddCoinsDto, SpendCoinsDto, CoinBalance } from './coin.dto';

@Injectable()
export class CoinService {
  constructor(private readonly prisma: PrismaService) {}

  async addCoins(userId: string, dto: AddCoinsDto): Promise<CoinLedger> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    await this.validateUserExists(userId);

    return this.prisma.coinLedger.create({
      data: {
        userId,
        amount: dto.amount,
        reason: dto.reason,
      },
    });
  }

  async spendCoins(userId: string, dto: SpendCoinsDto): Promise<CoinLedger> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    await this.validateUserExists(userId);

    const currentBalance = await this.getBalance(userId);
    if (currentBalance < dto.amount) {
      throw new BadRequestException('Insufficient coins');
    }

    return this.prisma.coinLedger.create({
      data: {
        userId,
        amount: -dto.amount,
        reason: dto.reason,
      },
    });
  }

  async getBalance(userId: string): Promise<number> {
    const result = await this.prisma.coinLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    return result._sum.amount ?? 0;
  }

  async getLedger(userId: string, limit = 50): Promise<CoinBalance> {
    await this.validateUserExists(userId);

    const [balance, ledger] = await Promise.all([
      this.getBalance(userId),
      this.prisma.coinLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          amount: true,
          reason: true,
          createdAt: true,
        },
      }),
    ]);

    return { balance, ledger };
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
