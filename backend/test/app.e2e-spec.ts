import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    coinLedger: {
      create: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    score: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/health (GET)', () => {
    it('should return status ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect({ status: 'ok' });
    });
  });

  describe('/users', () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    describe('POST /users', () => {
      it('should create a new user', async () => {
        mockPrismaService.user.create.mockResolvedValue(mockUser);
        mockPrismaService.coinLedger.create.mockResolvedValue({});

        const response = await request(app.getHttpServer())
          .post('/users')
          .send({ email: 'test@example.com', displayName: 'Test User' })
          .expect(201);

        expect(response.body.email).toBe('test@example.com');
        expect(mockPrismaService.coinLedger.create).toHaveBeenCalled();
      });

      it('should create user with empty body', async () => {
        mockPrismaService.user.create.mockResolvedValue({
          ...mockUser,
          email: undefined,
          displayName: undefined,
        });
        mockPrismaService.coinLedger.create.mockResolvedValue({});

        const response = await request(app.getHttpServer())
          .post('/users')
          .send({})
          .expect(201);

        expect(response.body).toBeDefined();
      });
    });

    describe('GET /users/:id', () => {
      it('should return user by id', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

        const response = await request(app.getHttpServer())
          .get(`/users/${mockUser.id}`)
          .expect(200);

        expect(response.body.id).toBe(mockUser.id);
      });

      it('should return 404 for non-existent user', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await request(app.getHttpServer())
          .get('/users/550e8400-e29b-41d4-a716-446655440001')
          .expect(404);
      });
    });

    describe('PATCH /users/:id', () => {
      it('should update user', async () => {
        const updatedUser = { ...mockUser, displayName: 'Updated Name' };
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.user.update.mockResolvedValue(updatedUser);

        const response = await request(app.getHttpServer())
          .patch(`/users/${mockUser.id}`)
          .send({ displayName: 'Updated Name' })
          .expect(200);

        expect(response.body.displayName).toBe('Updated Name');
      });
    });

    describe('GET /users/:id/coins', () => {
      it('should return user coins', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.coinLedger.aggregate.mockResolvedValue({
          _sum: { amount: 15000 },
        });

        const response = await request(app.getHttpServer())
          .get(`/users/${mockUser.id}/coins`)
          .expect(200);

        expect(response.body.coins).toBe(15000);
      });
    });
  });

  describe('/coins', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
    const mockUser = { id: mockUserId, email: 'test@example.com' };

    describe('POST /coins/add', () => {
      it('should add coins to user', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.coinLedger.create.mockResolvedValue({
          id: 'ledger-1',
          amount: 500,
          reason: 'ad_reward',
          createdAt: new Date(),
        });

        const response = await request(app.getHttpServer())
          .post('/coins/add')
          .send({ userId: mockUserId, amount: 500, reason: 'ad_reward' })
          .expect(201);

        expect(response.body.amount).toBe(500);
      });

      it('should return 404 for non-existent user', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await request(app.getHttpServer())
          .post('/coins/add')
          .send({
            userId: '550e8400-e29b-41d4-a716-446655440001',
            amount: 500,
            reason: 'test',
          })
          .expect(404);
      });
    });

    describe('POST /coins/spend', () => {
      it('should spend coins when sufficient balance', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.coinLedger.aggregate.mockResolvedValue({
          _sum: { amount: 10000 },
        });
        mockPrismaService.coinLedger.create.mockResolvedValue({
          id: 'ledger-1',
          amount: -500,
          reason: 'game_play',
          createdAt: new Date(),
        });

        const response = await request(app.getHttpServer())
          .post('/coins/spend')
          .send({ userId: mockUserId, amount: 500, reason: 'game_play' })
          .expect(201);

        expect(response.body.amount).toBe(-500);
      });

      it('should return 400 for insufficient balance', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.coinLedger.aggregate.mockResolvedValue({
          _sum: { amount: 100 },
        });

        await request(app.getHttpServer())
          .post('/coins/spend')
          .send({ userId: mockUserId, amount: 500, reason: 'game_play' })
          .expect(400);
      });
    });

    describe('GET /coins/balance/:userId', () => {
      it('should return balance', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.coinLedger.aggregate.mockResolvedValue({
          _sum: { amount: 5000 },
        });

        const response = await request(app.getHttpServer())
          .get(`/coins/balance/${mockUserId}`)
          .expect(200);

        expect(response.body.balance).toBe(5000);
      });
    });

    describe('GET /coins/ledger/:userId', () => {
      it('should return ledger entries', async () => {
        const entries = [
          { id: '1', amount: 500, reason: 'ad', createdAt: new Date() },
        ];
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.coinLedger.findMany.mockResolvedValue(entries);
        mockPrismaService.coinLedger.count.mockResolvedValue(1);

        const response = await request(app.getHttpServer())
          .get(`/coins/ledger/${mockUserId}`)
          .expect(200);

        expect(response.body.entries).toHaveLength(1);
        expect(response.body.total).toBe(1);
      });
    });
  });

  describe('/scores', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
    const mockUser = { id: mockUserId, email: 'test@example.com' };
    const mockScore = {
      id: 'score-1',
      userId: mockUserId,
      gameId: 'galaga',
      score: 50000,
      createdAt: new Date(),
    };

    describe('POST /scores', () => {
      it('should create a score', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.score.create.mockResolvedValue(mockScore);

        const response = await request(app.getHttpServer())
          .post('/scores')
          .send({ userId: mockUserId, gameId: 'galaga', score: 50000 })
          .expect(201);

        expect(response.body.score).toBe(50000);
      });
    });

    describe('GET /scores/user/:userId', () => {
      it('should return user scores', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.score.findMany.mockResolvedValue([mockScore]);

        const response = await request(app.getHttpServer())
          .get(`/scores/user/${mockUserId}`)
          .expect(200);

        expect(response.body).toHaveLength(1);
      });
    });

    describe('GET /scores/ranking/:gameId', () => {
      it('should return game ranking', async () => {
        mockPrismaService.score.findMany.mockResolvedValue([
          { ...mockScore, user: { displayName: 'Test' } },
        ]);

        const response = await request(app.getHttpServer())
          .get('/scores/ranking/galaga')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /scores/rank/:userId/:gameId', () => {
      it('should return user rank', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.score.findMany.mockResolvedValue([
          { ...mockScore, user: { id: mockUserId, displayName: 'Test' } },
        ]);

        const response = await request(app.getHttpServer())
          .get(`/scores/rank/${mockUserId}/galaga`)
          .expect(200);

        expect(response.body).toHaveProperty('rank');
      });

      it('should return null rank when no scores', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.score.findMany.mockResolvedValue([]);

        const response = await request(app.getHttpServer())
          .get(`/scores/rank/${mockUserId}/galaga`)
          .expect(200);

        expect(response.body.rank).toBeNull();
      });
    });
  });
});
