# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RetroX is a retro 1990s arcade game mobile app built with React Native and NestJS backend. It features rewarded ads monetization with a coin-based economy system.

## Project Structure

```
retrox/
├── mobile/               # React Native app (iOS/Android)
│   ├── src/
│   │   ├── core/        # Game engine utilities (particles, haptics, audio, sprites)
│   │   ├── games/       # Game implementations (shooter, puzzle, blockdrop, snake, pong)
│   │   ├── ui/          # Shared UI components
│   │   ├── store/       # Zustand state management
│   │   ├── services/    # Ads, audio services
│   │   ├── screens/     # Navigation screens
│   │   ├── navigation/  # React Navigation setup
│   │   ├── theme/       # Retro themes (neon/pixel/CRT)
│   │   └── assets/      # Images, sounds, fonts
│   └── e2e/             # Detox E2E tests
├── backend/             # NestJS API server
│   ├── src/
│   │   ├── modules/     # Feature modules (user, coin, score)
│   │   ├── prisma/      # Prisma ORM service
│   │   └── health/      # Health check endpoint
│   └── prisma/          # Database schema
└── scripts/             # Automation scripts (pre-commit, hooks)
```

## Build & Run Commands

### Mobile

```bash
cd mobile
npm install
npm run ios                    # iOS simulator
npm run android               # Android emulator
npm start                     # Metro bundler (port 9091)
```

### Backend

```bash
cd backend
npm install
npm run start:dev             # Development with hot reload
npm run build                 # Compile TypeScript
npm start                     # Production
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Run database migrations
```

## Testing Commands

### Mobile

```bash
cd mobile
npm test                          # Unit tests
npm test -- path/to/file.test.ts  # Single file
npm test -- --watch               # Watch mode
npm run lint                      # ESLint
npm run typecheck                 # TypeScript check

# E2E Tests (Detox)
./scripts/e2e-ci-ios.sh           # iOS E2E (auto-detects simulator)
./scripts/e2e-ci-android.sh       # Android E2E
```

### Backend

```bash
cd backend
npm test                      # Unit tests
npm run test:e2e              # E2E tests (HTTP endpoints)
npm run test:cov              # Coverage report
npm run test:all              # All tests + coverage
```

### Pre-Commit Validation

```bash
# Mobile
cd mobile && npm run lint && npm run typecheck && npm test && ./scripts/e2e-ci-ios.sh

# Backend
cd backend && npm run lint && npm run typecheck && npm test && npm run build
```

## Architecture

### Mobile Tech Stack
- **Rendering**: React Native Skia for 2D GPU-accelerated graphics (60fps target)
- **Animation**: React Native Reanimated
- **State**: Zustand with persistence via AsyncStorage
- **Navigation**: React Navigation (native-stack + bottom-tabs)
- **Ads**: Google Mobile Ads SDK (AdMob rewarded/interstitial)

### Backend Tech Stack
- **Framework**: NestJS with Express
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Validation**: class-validator decorators
- **API Docs**: Swagger at `/api`

### Key Patterns

**Zustand Store Pattern (Mobile)**:
```typescript
export const useCoinStore = create<CoinStore>((set, get) => ({
  coins: 10000,
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  spendCoins: (amount) => {
    if (get().coins < amount) return false;
    set((state) => ({ coins: state.coins - amount }));
    return true;
  },
}));
```

**NestJS Service Pattern (Backend)**:
```typescript
@Injectable()
export class CoinService {
  constructor(private readonly prisma: PrismaService) {}

  async addCoins(userId: string, amount: number): Promise<User> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    // ...
  }
}
```

### SafeAreaView Requirement (Mobile)
All game/screen components must wrap content in `SafeAreaView` from `react-native-safe-area-context` to avoid notch/status bar overlap.

### E2E Test IDs (Mobile)
All interactive elements need `testID` for Detox:
- Buttons: `{feature}-{action}` (e.g., `shooter-fire`)
- Text: `{feature}-{data}` (e.g., `coin-balance`)
- Grid cells: `{feature}-cell-{row}-{col}`

## Workflow

### Git Worktree Workflow
Never work directly on `main`. Use worktrees with Linear issue IDs:

```bash
git worktree add worktree/{issue-id} -b {issue-id} origin/main
cd worktree/{issue-id}
# ... work, test, commit ...
git push -u origin {issue-id}
gh pr create --title "[{issue-id}] Title" --body "..."
# After merge:
git worktree remove worktree/{issue-id}
```

### Issue Naming
- Mobile issues: `app-123`
- Backend issues: `server-123`

### Commit Convention
```
type(scope): description

feat(game): add shooter power-ups
fix(coins): correct reward calculation
test(api): add coin service tests
```

## Code Style

- TypeScript strict mode enabled (`strict: true`)
- Never use `any` - use `unknown` with type guards
- Never use `@ts-ignore` or `@ts-expect-error`
- Import order: Node built-ins → External packages → Internal (@/) → Relative

## API Endpoints

- `GET /health` - Health check
- `POST /users`, `GET /users/:id`, `PATCH /users/:id` - User CRUD
- `GET /coins/balance/:userId`, `POST /coins/add`, `POST /coins/spend` - Coin operations
- `POST /scores`, `GET /scores/ranking/:gameId` - Score/ranking system
