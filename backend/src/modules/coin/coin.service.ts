import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { AddCoinsDto, SpendCoinsDto } from './dto';

interface BalanceResponse {
  userId: string;
  balance: number;
}

interface LedgerEntry {
  id: string;
  amount: number;
  reason: string;
  createdAt: Date;
}

@Injectable()
export class CoinService {
  constructor(private readonly prisma: PrismaService) {}

  async addCoins(dto: AddCoinsDto): Promise<LedgerEntry> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    const entry = await this.prisma.coinLedger.create({
      data: {
        userId: dto.userId,
        amount: dto.amount,
        reason: dto.reason,
      },
    });

    return {
      id: entry.id,
      amount: entry.amount,
      reason: entry.reason,
      createdAt: entry.createdAt,
    };
  }

  async spendCoins(dto: SpendCoinsDto): Promise<LedgerEntry> {
    const balance = await this.getBalance(dto.userId);

    if (balance.balance < dto.amount) {
      throw new BadRequestException(
        `Insufficient coins. Balance: ${balance.balance}, Required: ${dto.amount}`,
      );
    }

    const entry = await this.prisma.coinLedger.create({
      data: {
        userId: dto.userId,
        amount: -dto.amount,
        reason: dto.reason,
      },
    });

    return {
      id: entry.id,
      amount: entry.amount,
      reason: entry.reason,
      createdAt: entry.createdAt,
    };
  }

  async getBalance(userId: string): Promise<BalanceResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const result = await this.prisma.coinLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    return {
      userId,
      balance: result._sum.amount ?? 0,
    };
  }

  async getLedger(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<{ entries: LedgerEntry[]; total: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const [entries, total] = await Promise.all([
      this.prisma.coinLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          amount: true,
          reason: true,
          createdAt: true,
        },
      }),
      this.prisma.coinLedger.count({ where: { userId } }),
    ]);

    return { entries, total };
  }
}
