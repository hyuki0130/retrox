# AGENTS.md - Retrox Development Guidelines

> 90년대 오락실 게임을 React Native로 재현하는 모바일 앱 + NestJS 백엔드

**Domain-Specific Guidelines:**
- [mobile/AGENTS.md](./mobile/AGENTS.md) - React Native, Detox E2E, Game Development
- [backend/AGENTS.md](./backend/AGENTS.md) - NestJS, API Testing, Database

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

## Local-First Testing Workflow (MANDATORY)

**모든 테스트는 로컬에서 먼저 실행하고 통과한 후에 푸시합니다.**

CI는 검증 단계이지, 테스트 환경이 아닙니다.

### Pre-Push Checklist

```bash
# Backend
cd backend
npm run lint && npm run typecheck && npm test && npm run build

# Mobile
cd mobile
npm run lint && npm run typecheck && npm test
./scripts/e2e-ci-ios.sh  # E2E tests (auto-detects local simulator)
```

| Step | Mobile | Backend |
|------|--------|---------|
| Lint | `npm run lint` | `npm run lint` |
| Type Check | `npm run typecheck` | `npm run typecheck` |
| Unit Tests | `npm test` | `npm test` |
| E2E Tests | `./scripts/e2e-ci-ios.sh` | `npm run test:e2e` |
| Build | `npm run build:ios` | `npm run build` |

**All steps must pass locally before pushing.**

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

### TDD Cycle

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve code quality (tests must still pass)

### Blocking Rules

| Forbidden | Reason |
|-----------|--------|
| Hardcoded test pass | Must test real logic |
| `skip`, `only` abuse | All tests must run |
| Commit without tests | Tests must pass before commit |
| Excessive mocking | Must verify real behavior |

### Test Failure Response

1. **Analyze**: Check error message
2. **Fix Code**: Modify implementation, not tests
3. **Re-verify**: Run tests again
4. **Repeat**: Until passing

**NEVER modify tests to pass** (unless test itself is wrong)

## Task Management (Linear + Git Worktrees)

### Linear API (curl)

```bash
# Prerequisite: LINEAR_TOKEN must be set
source ~/.zshrc  # if not loaded

# List incomplete issues
curl -s -X POST https://api.linear.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_TOKEN" \
  -d '{"query": "{ issues(filter: { state: { type: { nin: [\"completed\", \"canceled\"] } } }) { nodes { identifier title state { name } priority } } }"}' | jq '.data.issues.nodes'
```

### Reference IDs

- Team ID (Hyuki0130): `33ddd07b-8942-47d7-a1b4-110c0cb80551`
- Project ID (retrox): `f2594889-8f9b-4db5-b888-4e69866688cd`
- Done State ID: `ea3e052d-9afa-4c66-98e6-6eb8099092d6`
- In Progress State ID: `9e72bb99-e9a1-4943-847d-6d71384e35dd`
- Todo State ID: `c5a86554-75e5-48f3-9367-c99770372016`
- Canceled State ID: `53d662ab-bc7d-478b-ab3b-9667ed3eaff3`

### Issue Naming

- Mobile: `app-123`
- Server: `server-123`
- Issue title format: `[app-123] ...`, `[server-123] ...`
- Branch name = Issue ID

### Worktree Workflow

```bash
# Setup
git fetch origin
git worktree add worktree/{issue-id} -b {issue-id} origin/main

# Work (TDD cycle)
# ... implement, test, lint, typecheck, build ...

# Commit & Push
git add . && git commit && git push -u origin {issue-id}

# Create PR
gh pr create --title "[issue-id] Title" --body "## Summary..."

# Merge (after review)
gh pr merge --squash --delete-branch

# Cleanup
git checkout main && git pull origin main
cd backend && npm test  # or mobile tests
git worktree remove worktree/{issue-id}
```

### Work Loop (MANDATORY)

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Linear 이슈 생성/할당                                        │
│     ↓                                                           │
│  2. Worktree + Branch 생성 (이슈 ID 기반)                        │
│     ↓                                                           │
│  3. 작업 수행 (TDD 방식) + 로컬 테스트 통과 확인                   │
│     ↓                                                           │
│  4. 커밋 & 푸시                                                  │
│     ↓                                                           │
│  5. PR 생성 (gh CLI)                                            │
│     ↓                                                           │
│  6. PR 머지 (리뷰 후)                                            │
│     ↓                                                           │
│  7. main 통합 테스트 (BLOCKING)                                  │
│     ↓                                                           │
│  8. Worktree 삭제 → Linear 이슈 Done                            │
└─────────────────────────────────────────────────────────────────┘
```

## Issue Tracking Guidelines

### Issue Description Update Format

```markdown
---

## Completed Work

### Files Created/Modified
- `path/to/file.ts`: Description

### Implementation Details
- Key implementation 1
- Key implementation 2

### Test Coverage
- Unit Tests: X added
- E2E Tests: X added
- Coverage: XX% → XX%

### Commit & PR (Required)
- Branch: `branch-name`
- Commit: `hash` - message
- **PR: [#N](https://github.com/hyuki0130/retrox/pull/N)**
```

### Status Update Timing

| Timing | Action |
|--------|--------|
| Start work | Set status to `In Progress` |
| Implementation done | Add Completed Work section |
| Commit/push done | Add commit info |
| PR created | Add PR link |
| Merge done | Set status to `Done` |

## Documentation Guidelines

**README updates required when:**

| Change Type | Update Needed |
|-------------|---------------|
| New module/feature | Architecture diagram, Project Structure |
| API endpoint changes | API Endpoints table |
| Test additions | Testing section, Coverage numbers |
| Dependency additions | Dependencies, Tech Stack |

**README locations:**
- `backend/README.md`: Backend architecture, API, tests, deployment
- `mobile/README.md`: Mobile app architecture, games, state management, tests
