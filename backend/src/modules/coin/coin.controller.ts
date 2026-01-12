import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';

import { CoinService } from './coin.service';
import { AddCoinsDto, SpendCoinsDto } from './dto';

@Controller('coins')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Post('add')
  async addCoins(@Body() dto: AddCoinsDto) {
    return this.coinService.addCoins(dto);
  }

  @Post('spend')
  async spendCoins(@Body() dto: SpendCoinsDto) {
    return this.coinService.spendCoins(dto);
  }

  @Get('balance/:userId')
  async getBalance(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.coinService.getBalance(userId);
  }

  @Get('ledger/:userId')
  async getLedger(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.coinService.getLedger(userId, limit, offset);
  }
}
