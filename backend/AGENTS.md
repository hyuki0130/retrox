# Backend AGENTS.md - NestJS Development Guidelines

> RetroX 백엔드 서버 개발 가이드라인

## Build & Run Commands

```bash
cd backend

# Development
npm run start:dev                    # Watch mode
npm run start:debug                  # Debug mode with inspector

# Production
npm run build                        # Compile TypeScript
npm run start:prod                   # Run compiled code

# Database
npm run migration:generate           # Generate migration
npm run migration:run                # Run migrations
```

## Testing Commands

```bash
cd backend

# Unit tests (서비스/컨트롤러 개별 테스트)
npm run test                         # All unit tests
npm run test -- path/to/file.spec.ts # Single file
npm run test -- --watch              # Watch mode

# E2E tests (HTTP 엔드포인트 통합 테스트)
npm run test:e2e                     # All e2e tests
npm run test:e2e -- --grep "coins"   # Filter by name

# Module tests (모듈 통합 테스트)
npm run test -- --testPathPattern="module"

# Coverage (80% 이상 필수)
npm run test:cov                     # Unit + Module coverage
npm run test:e2e:cov                 # E2E coverage (별도)

# 전체 테스트 실행 (커밋 전 필수)
npm run test:all                     # Unit + E2E + Coverage
```

### Test Types

| Test Type | File Pattern | Purpose | Coverage Target |
|-----------|--------------|---------|-----------------|
| Unit Test | `*.spec.ts` | Individual class/function isolation | 80%+ |
| Module Test | `*.module.spec.ts` | Module dependency integration | Included |
| E2E Test | `*.e2e-spec.ts` | HTTP request/response full flow | Measured separately |

## NestJS Patterns

### Service Pattern

```typescript
// Use decorators properly
@Injectable()
export class CoinService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async addCoins(userId: string, amount: number): Promise<User> {
    // Validate input
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    // ...
  }
}
```

### Error Handling

```typescript
// Use NestJS exceptions
throw new NotFoundException(`Game ${id} not found`);
throw new BadRequestException('Insufficient coins');

// NEVER: Empty catch blocks
// BAD
try { ... } catch (e) {}

// GOOD
try { ... } catch (error) {
  logger.error('Operation failed', { error, context });
  throw new InternalServerErrorException();
}
```

### Test Structure Standard

```typescript
describe('ServiceName', () => {
  // Setup
  let service: ServiceName;
  let mockDependency: jest.Mocked<Dependency>;

  beforeEach(() => {
    mockDependency = createMockDependency();
    service = new ServiceName(mockDependency);
  });

  describe('methodName', () => {
    // Happy path
    describe('when valid input is provided', () => {
      it('should return expected result', async () => {
        const result = await service.methodName(validInput);
        expect(result).toEqual(expectedOutput);
      });
    });

    // Edge cases
    describe('when edge case occurs', () => {
      it('should handle empty input', async () => {
        const result = await service.methodName([]);
        expect(result).toEqual([]);
      });

      it('should handle boundary value', async () => {
        const result = await service.methodName(0);
        expect(result).toBe(0);
      });
    });

    // Error cases
    describe('when error condition exists', () => {
      it('should throw NotFoundException for missing resource', async () => {
        await expect(service.methodName('non-existent'))
          .rejects.toThrow(NotFoundException);
      });

      it('should throw BadRequestException for invalid input', async () => {
        await expect(service.methodName(-1))
          .rejects.toThrow(BadRequestException);
      });
    });
  });
});
```

## Required Test Coverage

| Item | Requirement |
|------|-------------|
| Happy Path | Normal operation cases required |
| Edge Cases | Boundary values, empty values, null/undefined |
| Error Cases | Exception handling, error scenarios |
| Input Validation | Invalid input handling |

### Edge Case Checklist

- [ ] Empty array/object
- [ ] null/undefined input
- [ ] Boundary values (0, negative, max value)
- [ ] Duplicate data
- [ ] Non-existent resource
- [ ] Unauthorized access
- [ ] Concurrency issues (when applicable)

## Pre-Commit Verification

```bash
# 1. Lint check
npm run lint

# 2. Type check
npm run typecheck  # or npx tsc --noEmit

# 3. Run tests
npm test

# 4. Build verification
npm run build
```

**All steps must pass before committing.**

## Infrastructure Notes

- **Backend Hosting**: Railway, Render, or Fly.io (free tier)
- **Database**: Supabase PostgreSQL (free tier) or PlanetScale
- **File Storage**: Cloudflare R2 (free egress)
