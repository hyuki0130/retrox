import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { CoinController } from './coin.controller';
import { CoinService } from './coin.service';

@Module({
  imports: [PrismaModule],
  controllers: [CoinController],
  providers: [CoinService],
  exports: [CoinService],
})
export class CoinModule {}
