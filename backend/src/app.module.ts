import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { ScoreModule } from './modules/score/score.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [HealthModule, PrismaModule, ScoreModule],
})
export class AppModule {}
