import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { CoinModule } from './modules/coin/coin.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [HealthModule, PrismaModule, CoinModule],
})
export class AppModule {}
