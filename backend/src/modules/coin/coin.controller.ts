import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CoinLedger } from '@prisma/client';

import { CoinService } from './coin.service';
import { AddCoinsDto, SpendCoinsDto, CoinBalance } from './coin.dto';

@Controller('users/:userId/coins')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Post('add')
  async addCoins(
    @Param('userId') userId: string,
    @Body() dto: AddCoinsDto,
  ): Promise<CoinLedger> {
    return this.coinService.addCoins(userId, dto);
  }

  @Post('spend')
  async spendCoins(
    @Param('userId') userId: string,
    @Body() dto: SpendCoinsDto,
  ): Promise<CoinLedger> {
    return this.coinService.spendCoins(userId, dto);
  }

  @Get()
  async getLedger(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ): Promise<CoinBalance> {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.coinService.getLedger(userId, parsedLimit);
  }

  @Get('balance')
  async getBalance(@Param('userId') userId: string): Promise<{ balance: number }> {
    const balance = await this.coinService.getBalance(userId);
    return { balance };
  }
}
