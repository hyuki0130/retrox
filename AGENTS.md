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

## Testing Patterns

```typescript
// Unit test structure
describe('CoinService', () => {
  let service: CoinService;

  beforeEach(() => {
    service = new CoinService(mockRepo);
  });

  describe('addCoins', () => {
    it('should increase user coins by amount', async () => {
      const result = await service.addCoins('user-1', 500);
      expect(result.coins).toBe(10500);
    });

    it('should throw on negative amount', async () => {
      await expect(service.addCoins('user-1', -100))
        .rejects.toThrow(BadRequestException);
    });
  });
});
```

## Task Management (Linear + Git Worktrees)

- Linear 팀/프로젝트: 팀 `Hyuki0130`, 프로젝트 `retrox`에서 모든 작업을 관리합니다.
- 이슈 ID 규칙: 모바일은 `app-123`, 서버는 `server-123` 형태로 발급하고, 브랜치명도 이슈 ID와 동일하게 사용합니다.
- Worktree 병렬 작업 가이드 (루트에 `worktree/` 디렉토리 사용):
  - 최신 기준 갱신: `git fetch origin`
  - 워크트리 추가: `git worktree add worktree/app-123 -b app-123 origin/main` (이슈 ID에 맞춰 경로/브랜치명 교체)
  - 워크트리 제거: `git worktree remove worktree/app-123` (병합/정리 후)
  - 브랜치 청소: `git branch -D app-123` (워크트리 제거 후 필요 시)
  - 기본 규칙: 한 이슈 = 한 worktree/브랜치, 이름은 이슈 ID와 동일하게 유지합니다.

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
