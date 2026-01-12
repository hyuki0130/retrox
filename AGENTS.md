# AGENTS.md - Retrox Development Guidelines

> 90년대 오락실 게임을 React Native로 재현하는 모바일 앱 + NestJS 백엔드

## Project Structure

```
retrox/
├── mobile/                 # React Native app (iOS/Android)
│   ├── src/
│   │   ├── core/          # Game engine, utilities
│   │   ├── games/         # Individual game implementations
│   │   ├── ui/            # Shared UI components
│   │   ├── store/         # Zustand state management
│   │   ├── services/      # Ads, analytics, API client
│   │   ├── assets/        # Images, sounds, fonts
│   │   ├── theme/         # Retro themes (neon/pixel/CRT)
│   │   └── config/        # App configuration
│   └── package.json
├── backend/               # NestJS API server
│   ├── src/
│   │   ├── modules/       # Feature modules (user, coin, game)
│   │   ├── common/        # Shared decorators, guards, pipes
│   │   └── config/        # Environment configuration
│   └── package.json
└── package.json           # Root workspace config
```

## Build & Run Commands

### Mobile (React Native)

```bash
cd mobile

# Install dependencies
npm install

# iOS
npm run ios                          # Run on iOS simulator
npm run ios -- --device              # Run on physical device
cd ios && pod install && cd ..       # Install CocoaPods

# Android
npm run android                      # Run on Android emulator

# Metro bundler
npm start                            # Start Metro
npm start -- --reset-cache           # Clear Metro cache

# Build
npm run build:ios                    # Production iOS build
npm run build:android                # Production Android build
```

### Backend (NestJS)

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

### Mobile Tests

```bash
cd mobile

# Run all tests
npm test

# Run single test file
npm test -- path/to/file.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="GameEngine"

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Backend Tests

```bash
cd backend

# Unit tests
npm run test                         # All unit tests
npm run test -- path/to/file.spec.ts # Single file
npm run test -- --watch              # Watch mode

# E2E tests
npm run test:e2e                     # All e2e tests
npm run test:e2e -- --grep "coins"   # Filter by name

# Coverage
npm run test:cov
```

## Linting & Formatting

```bash
# Lint
npm run lint                         # ESLint check
npm run lint -- --fix                # Auto-fix issues

# Format
npm run format                       # Prettier format
npm run format:check                 # Check formatting

# Type check
npm run typecheck                    # tsc --noEmit
```

## Code Style Guidelines

### TypeScript Strict Mode

- Enable `strict: true` in tsconfig.json
- NEVER use `any` - use `unknown` and type guards instead
- NEVER use `@ts-ignore` or `@ts-expect-error`
- NEVER use non-null assertion `!` without validation

### Import Order

```typescript
// 1. Node built-ins
import path from 'path';

// 2. External packages
import React from 'react';
import { Injectable } from '@nestjs/common';

// 3. Internal aliases (@/)
import { GameEngine } from '@/core/engine';

// 4. Relative imports
import { Button } from './Button';
import type { GameProps } from './types';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `GameScreen.tsx` |
| Hooks | camelCase with `use` | `useGameState.ts` |
| Utilities | camelCase | `formatCoins.ts` |
| Constants | UPPER_SNAKE | `MAX_COINS` |
| Types/Interfaces | PascalCase | `GameState`, `IGameService` |
| NestJS Services | PascalCase + suffix | `CoinService` |
| NestJS Controllers | PascalCase + suffix | `GameController` |

### React Native Patterns

```typescript
// Components: FC with explicit props
interface GameCardProps {
  game: Game;
  onPress: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPress }) => {
  // ...
};

// Styles: StyleSheet at bottom of file
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### NestJS Patterns

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
// Mobile: Use Result pattern for game logic
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// Backend: Use NestJS exceptions
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

### State Management (Zustand)

```typescript
// Store definition
interface CoinStore {
  coins: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
}

export const useCoinStore = create<CoinStore>((set, get) => ({
  coins: 10000, // Initial coins
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  spendCoins: (amount) => {
    if (get().coins < amount) return false;
    set((state) => ({ coins: state.coins - amount }));
    return true;
  },
}));
```

## Git Commit Convention

```
type(scope): description

feat(game): add Galaga-style shooter
fix(coins): correct reward calculation
refactor(ui): extract RetroButton component
test(api): add coin service unit tests
docs(readme): update setup instructions
```

## TDD Development Guidelines (MANDATORY)

### TDD 원칙

모든 기능 구현은 **Test-Driven Development** 방식을 따릅니다:

1. **Red**: 실패하는 테스트를 먼저 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 품질 개선 (테스트는 계속 통과해야 함)

### 테스트 작성 규칙

#### 필수 테스트 커버리지

| 항목 | 요구사항 |
|------|----------|
| Happy Path | 정상 동작 케이스 필수 |
| Edge Cases | 경계값, 빈 값, null/undefined 등 |
| Error Cases | 예외 상황, 에러 핸들링 |
| Input Validation | 잘못된 입력값 처리 |

#### Edge Case 체크리스트

- [ ] 빈 배열/객체
- [ ] null/undefined 입력
- [ ] 경계값 (0, 음수, 최대값)
- [ ] 중복 데이터
- [ ] 존재하지 않는 리소스
- [ ] 권한 없는 접근
- [ ] 동시성 이슈 (해당 시)

### 금지 사항 (BLOCKING)

| 금지 항목 | 이유 |
|-----------|------|
| 테스트 통과용 임시 코드 | 실제 로직이 아닌 하드코딩 금지 |
| `skip`, `only` 남용 | 모든 테스트가 실행되어야 함 |
| 테스트 없이 커밋 | 테스트 통과 후에만 커밋 |
| Mock 과다 사용 | 실제 동작을 검증해야 함 |

### 검증 프로세스 (커밋 전 필수)

```bash
# 1. 린트 검사
npm run lint

# 2. 타입 체크
npm run typecheck  # 또는 npx tsc --noEmit

# 3. 테스트 실행
npm test

# 4. 빌드 검증
npm run build
```

**모든 단계가 통과해야만 커밋 가능합니다.**

### 테스트 실패 시 대응

1. **실패 원인 분석**: 에러 메시지 확인
2. **코드 수정**: 테스트가 아닌 구현 코드 수정
3. **재검증**: 테스트 재실행
4. **반복**: 통과할 때까지 2-3 반복

**절대 테스트를 수정해서 통과시키지 않습니다** (테스트 자체가 잘못된 경우 제외)

### 테스트 구조 표준

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

### CI/CD 연동

모든 PR은 다음 검사를 통과해야 머지 가능:

- [ ] `npm run lint` 통과
- [ ] `npm run typecheck` 통과
- [ ] `npm test` 통과 (커버리지 80% 이상)
- [ ] `npm run build` 성공

## Task Management (Linear + Git Worktrees)

- Linear 팀/프로젝트: 팀 `Hyuki0130`, 프로젝트 `retrox`에서 모든 작업을 관리합니다.
- 이슈 ID 규칙: 모바일은 `app-123`, 서버는 `server-123` 형태로 발급합니다.
- 이슈 제목은 `[app-123] ...`, `[server-123] ...` 형식으로 사용합니다.
- 브랜치명은 이슈 ID와 동일하게 사용합니다.
- Worktree 병렬 작업 가이드 (루트에 `worktree/` 디렉토리 사용):
  - 최신 기준 갱신: `git fetch origin`
  - 워크트리 추가: `git worktree add worktree/app-123 -b app-123 origin/main` (이슈 ID에 맞춰 경로/브랜치명 교체)
  - 워크트리 제거: `git worktree remove worktree/app-123` (병합/정리 후)
  - 브랜치 청소: `git branch -D app-123` (워크트리 제거 후 필요 시)
  - 기본 규칙: 한 이슈 = 한 worktree/브랜치, 이름은 이슈 ID와 동일하게 유지합니다.
- 업무 진행 원칙:
  - 병렬 가능한 작업은 병렬로 진행
  - 선행 작업이 필요한 경우 해당 작업 완료 후 진행
  - Linear 이슈에서 작업을 가져와 상태/내용을 지속 업데이트
  - 작업 완료 후 Git 커밋 → 푸시 → PR/머지 순서로 진행 (필요 시 리뷰 후 병합)

## Issue Tracking Guidelines (MANDATORY)

### 이슈 업데이트 원칙

모든 작업은 Linear 이슈에 **상세하게 기록**해야 합니다. 진행 상황뿐만 아니라 **실제 구현 내용**도 반드시 포함합니다.

### 이슈 설명(Description) 업데이트 형식

작업 완료 시 이슈 Description에 다음 섹션을 추가합니다:

```markdown
---

## Completed Work

### Files Created/Modified
- `path/to/file.ts`: 설명
- `path/to/another.ts`: 설명

### Implementation Details
- 주요 구현 내용 1
- 주요 구현 내용 2

### Technical Decisions
- 선택한 기술/패턴과 그 이유

### API Endpoints (서버 작업 시)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/coins/add | 코인 지급 |

### Dependencies Added (패키지 추가 시)
- `package-name`: 용도 설명

### Commit
- Branch: `branch-name`
- Commit: `commit-hash` - commit message
```

### 댓글(Comment) 활용

- **진행 중 이슈**: 막힌 부분, 결정 필요 사항, 질문 등을 댓글로 기록
- **코드 리뷰 피드백**: PR 관련 논의는 댓글로 추적
- **버그/이슈 발견**: 작업 중 발견한 문제점 기록

### 상태 업데이트 타이밍

| 시점 | 액션 |
|------|------|
| 작업 시작 | 상태를 `In Progress`로 변경 |
| 구현 완료 | Description에 Completed Work 섹션 추가 |
| 커밋/푸시 완료 | 커밋 정보 추가 |
| PR 생성 | PR 링크 댓글로 추가 |
| 머지 완료 | 상태를 `Done`으로 변경 |

### 예시: 완료된 이슈 Description

```markdown
## Goal
* AdMob 연동 및 코인 지급 루프 완성

## Scope
* AdMob SDK 초기화
* Rewarded/Interstitial 광고 플로우

## Acceptance
* 광고 정상 노출
* 완료 시 코인 증가

---

## Completed Work

### Files Created/Modified
- `mobile/src/services/adService.ts`: AdMob 서비스 구현
- `mobile/src/store/coinStore.ts`: Zustand 코인 스토어
- `mobile/package.json`: react-native-google-mobile-ads 추가

### Implementation Details
- `AdMobService` 클래스: Rewarded/Interstitial 광고 로드/표시
- `useCoinStore`: Zustand + AsyncStorage 영속성
- 테스트 광고 ID 자동 적용 (__DEV__ 모드)

### Dependencies Added
- `react-native-google-mobile-ads`: AdMob SDK
- `zustand`: 상태 관리
- `@react-native-async-storage/async-storage`: 영속성

### Commit
- Branch: `app-102`
- Commit: `abc1234` - feat(ads): implement AdMob integration with coin rewards
```

## Infrastructure Notes

- **Backend Hosting**: Railway, Render, or Fly.io (free tier)
- **Database**: Supabase PostgreSQL (free tier) or PlanetScale
- **File Storage**: Cloudflare R2 (free egress)
- **Ads**: Google AdMob (Rewarded + Interstitial)

## Game Development Guidelines

- Use React Native Skia for 2D rendering
- Target 60fps on mid-range devices
- Keep game assets under 50MB total
- Implement game loop with `requestAnimationFrame`
- Sound: use `expo-av` or `react-native-sound`
