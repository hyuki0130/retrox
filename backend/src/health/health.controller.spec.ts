import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('getHealth', () => {
    it('should return status ok', () => {
      const result = controller.getHealth();

      expect(result).toEqual({ status: 'ok' });
    });

    it('should return object with status property', () => {
      const result = controller.getHealth();

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('ok');
    });

    it('should return consistent response on multiple calls', () => {
      const result1 = controller.getHealth();
      const result2 = controller.getHealth();
      const result3 = controller.getHealth();

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('should return typed response', () => {
      const result: { status: 'ok' } = controller.getHealth();

      expect(typeof result.status).toBe('string');
      expect(result.status).toBe('ok');
    });
  });
});
