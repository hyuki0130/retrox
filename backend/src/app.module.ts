import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { CoinModule } from './modules/coin/coin.module';
import { ScoreModule } from './modules/score/score.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [HealthModule, PrismaModule, CoinModule, ScoreModule],
})
export class AppModule {}
