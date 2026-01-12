# Retrox Backend

NestJS 기반 90년대 오락실 게임 API 서버

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NestJS Application                        │
├─────────────────────────────────────────────────────────────────┤
│  main.ts                                                        │
│  ├── ValidationPipe (global)                                    │
│  └── Swagger UI (/api)                                          │
├─────────────────────────────────────────────────────────────────┤
│  Modules                                                        │
│  ├── AppModule (root)                                           │
│  │   ├── HealthModule      → GET /health                        │
│  │   ├── UserModule        → /users CRUD                        │
│  │   ├── CoinModule        → /coins 지급/소비/잔액              │
│  │   ├── ScoreModule       → /scores 점수/랭킹                  │
│  │   └── PrismaModule      → DB 연결                            │
├─────────────────────────────────────────────────────────────────┤
│  Services                                                       │
│  ├── UserService           → 사용자 CRUD 로직                   │
│  ├── CoinService           → 코인 원장(Ledger) 관리             │
│  ├── ScoreService          → 점수 기록 및 랭킹 계산             │
│  └── PrismaService         → Prisma Client 라이프사이클         │
├─────────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL via Prisma)                               │
│  ├── User                  → 사용자 정보                        │
│  ├── CoinLedger            → 코인 거래 내역                     │
│  ├── Score                 → 게임 점수                          │
│  └── Session               → 플레이 세션                        │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS 10
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (또는 Supabase 계정)

### Installation

```bash
cd backend
npm install
```

### Environment Setup

루트 디렉토리에 `.env` 파일 생성:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
PORT=3000
```

### Database Setup

```bash
# Prisma Client 생성
npx prisma generate

# 마이그레이션 실행 (개발)
npx prisma migrate dev

# 또는 스키마 직접 푸시 (Supabase)
npx prisma db push
```

### Run Server

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm start
```

서버 실행 후:
- Health Check: http://localhost:3000/health
- Swagger UI: http://localhost:3000/api

## API Endpoints

| Tag | Method | Endpoint | Description |
|-----|--------|----------|-------------|
| health | GET | `/health` | 서버 상태 확인 |
| users | POST | `/users` | 사용자 생성 |
| users | GET | `/users/:id` | 사용자 조회 |
| users | PATCH | `/users/:id` | 사용자 수정 |
| coins | GET | `/coins/balance/:userId` | 코인 잔액 조회 |
| coins | POST | `/coins/add` | 코인 지급 |
| coins | POST | `/coins/spend` | 코인 차감 |
| coins | GET | `/coins/ledger/:userId` | 거래 내역 조회 |
| scores | POST | `/scores` | 점수 기록 |
| scores | GET | `/scores/user/:userId` | 유저별 점수 |
| scores | GET | `/scores/ranking/:gameId` | 게임별 랭킹 |
| scores | GET | `/scores/rank/:userId/:gameId` | 유저 순위 |

## Testing

```bash
# Unit Tests (121 tests)
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E Tests (18 tests)
npm run test:e2e

# All tests + coverage
npm run test:all
```

### Test Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.service.spec.ts      # Unit tests
│   │   │   └── user.controller.spec.ts   # Controller tests
│   │   ├── coin/
│   │   │   ├── coin.service.spec.ts
│   │   │   └── coin.controller.spec.ts
│   │   └── score/
│   │       ├── score.service.spec.ts
│   │       └── score.controller.spec.ts
│   ├── health/
│   │   └── health.controller.spec.ts
│   ├── prisma/
│   │   └── prisma.service.spec.ts
│   └── app.module.spec.ts                 # Module integration
└── test/
    └── app.e2e-spec.ts                    # E2E tests
```

### Coverage

- Target: 80%+
- Current: 84.64%

## Database Schema

```prisma
model User {
  id          String       @id @default(uuid())
  email       String?      @unique
  displayName String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  coinLedger  CoinLedger[]
  scores      Score[]
  sessions    Session[]
}

model CoinLedger {
  id        String   @id @default(uuid())
  userId    String
  amount    Int      // 양수: 지급, 음수: 차감
  reason    String
  createdAt DateTime @default(now())
  @@index([userId])
}

model Score {
  id        String   @id @default(uuid())
  userId    String
  gameId    String
  score     Int
  createdAt DateTime @default(now())
  @@index([userId])
  @@index([gameId])
}

model Session {
  id        String    @id @default(uuid())
  userId    String
  startedAt DateTime  @default(now())
  endedAt   DateTime?
  @@index([userId])
}
```

## Deployment

### Docker

```bash
# Build image
docker build -t retrox-backend .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  retrox-backend
```

### Railway

1. GitHub 연동
2. 환경변수 설정:
   - `DATABASE_URL`
   - `NODE_ENV=production`
3. Deploy

설정 파일: `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Health Check

Docker/Railway 모두 `/health` 엔드포인트로 헬스체크:

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

## Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Entry point + Swagger setup
│   ├── app.module.ts              # Root module
│   ├── health/                    # Health check module
│   ├── prisma/                    # Prisma service
│   └── modules/
│       ├── user/                  # User CRUD
│       ├── coin/                  # Coin ledger
│       └── score/                 # Scores & rankings
├── prisma/
│   └── schema.prisma              # Database schema
├── test/
│   └── app.e2e-spec.ts            # E2E tests
├── Dockerfile                     # Multi-stage production build
├── railway.json                   # Railway deployment config
└── package.json
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm start` | Run production server |
| `npm run start:dev` | Run with watch mode |
| `npm run build` | Compile TypeScript |
| `npm test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:all` | Run all tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
