import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';
import { HealthModule } from './health/health.module';
import { CoinModule } from './modules/coin/coin.module';
import { ScoreModule } from './modules/score/score.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';

describe('AppModule', () => {
  let module: TestingModule;

  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should import HealthModule', () => {
    const healthModule = module.get(HealthModule);
    expect(healthModule).toBeDefined();
  });

  it('should import PrismaModule', () => {
    const prismaModule = module.get(PrismaModule);
    expect(prismaModule).toBeDefined();
  });

  it('should import UserModule', () => {
    const userModule = module.get(UserModule);
    expect(userModule).toBeDefined();
  });

  it('should import CoinModule', () => {
    const coinModule = module.get(CoinModule);
    expect(coinModule).toBeDefined();
  });

  it('should import ScoreModule', () => {
    const scoreModule = module.get(ScoreModule);
    expect(scoreModule).toBeDefined();
  });
});
