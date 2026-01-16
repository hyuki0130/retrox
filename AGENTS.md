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

## Gate System (BLOCKING - 반드시 통과해야 다음 단계 진행)

**각 Gate에서 검증 실패 시 → 다음 단계 진행 불가**

### Gate 1: 작업 시작 전 (Pre-Work)

| 검증 항목 | 명령어 | 통과 기준 |
|-----------|--------|-----------|
| Linear 이슈 존재 | `linear_get_issue {issue-id}` | 이슈 찾음 |
| 이슈 상태 | - | `In Progress` 설정됨 |
| Worktree 생성 | `git worktree list` | `worktree/{issue-id}` 존재 |
| main에서 직접 작업 안함 | `git branch --show-current` | `main` 아님 |

**위반 시**: 작업 시작 전에 반드시 Linear 이슈 생성 → In Progress → Worktree 생성

### Gate 2: 커밋 전 (Pre-Commit)

```bash
# 자동화 스크립트 실행
./scripts/pre-commit-check.sh
```

| 검증 항목 | 명령어 | 통과 기준 |
|-----------|--------|-----------|
| Lint | `npm run lint` | Exit 0 (에러 0개) |
| TypeCheck | `npm run typecheck` | Exit 0 |
| Unit Tests | `npm test` | All pass |
| 변경 파일 존재 | `git status` | 커밋할 파일 있음 |

**위반 시**: 테스트/린트 실패 수정 후 재시도

### Gate 3: PR 생성 전 (Pre-PR)

| 검증 항목 | 명령어 | 통과 기준 |
|-----------|--------|-----------|
| 원격에 Push됨 | `git status` | "Your branch is ahead" |
| 커밋 메시지 | `git log -1 --format=%s` | Convention 준수 |
| 브랜치명 | `git branch --show-current` | 이슈 ID 포함 |

**위반 시**: Push 먼저 수행

### Gate 4: 머지 전 (Pre-Merge)

| 검증 항목 | 명령어 | 통과 기준 |
|-----------|--------|-----------|
| PR 생성됨 | `gh pr view` | PR 존재 |
| CI 통과 | `gh pr checks` | All pass |
| Linear 이슈 링크 | Linear API | PR attachment 존재 |

**위반 시**: CI 실패 수정 또는 Linear 이슈에 PR 링크 추가

### Gate 5: 완료 선언 전 (Pre-Done)

| 검증 항목 | 명령어 | 통과 기준 |
|-----------|--------|-----------|
| PR 머지됨 | `gh pr view --json state` | `MERGED` |
| main 최신화 | `git pull origin main` | Fast-forward |
| 통합 테스트 | `npm test` (main에서) | All pass |
| Linear 업데이트 | Linear API | `Done` + PR 링크 + Completed Work |
| Worktree 정리 | `git worktree list` | 해당 worktree 없음 |

**위반 시**: 위 항목 모두 완료 후 Done 선언

---

## Violation Recovery (위반 시 복구 절차)

### 케이스 1: Linear 이슈 없이 작업 시작함

```bash
# 1. 현재 변경사항 스태시
git stash

# 2. Linear 이슈 생성 (MCP 또는 웹)
# linear_create_issue ...

# 3. 올바른 worktree 생성
git worktree add worktree/{new-issue-id} -b {new-issue-id} origin/main

# 4. 스태시 적용
cd worktree/{new-issue-id}
git stash pop

# 5. Linear 이슈 In Progress로 변경
```

### 케이스 2: main에서 직접 작업함

```bash
# 1. 변경사항 스태시
git stash

# 2. Linear 이슈 생성/확인
# 3. worktree 생성
git worktree add worktree/{issue-id} -b {issue-id} origin/main

# 4. worktree로 이동 후 스태시 적용
cd worktree/{issue-id}
git stash pop
```

### 케이스 3: 테스트 실패 상태로 커밋/푸시함

```bash
# 1. 로컬에서 테스트 수정
npm run lint -- --fix
npm run typecheck
npm test

# 2. 수정 커밋
git add . && git commit -m "fix: resolve lint/test failures"
git push

# 3. CI 재실행 (필요시)
gh pr checks --watch
```

### 케이스 4: PR 없이 Done 처리함

```bash
# 1. 해당 이슈 찾기
# linear_get_issue {issue-id}

# 2. 관련 커밋/PR 찾기
git log --oneline --grep="{issue-id}"
gh pr list --state merged --search "{issue-id}"

# 3. Linear 이슈에 PR 링크 추가
# linear_update_issue ...

# 4. Completed Work 섹션 추가
```

---

## Workflow Automation Scripts

### 자동 검증 스크립트 위치

```
scripts/
├── pre-commit-check.sh    # Gate 2: 커밋 전 자동 검증
├── workflow-check.sh      # 전체 워크플로우 상태 확인
└── setup-hooks.sh         # Git hooks 설치
```

### 사용법

```bash
# Git hooks 설치 (최초 1회)
./scripts/setup-hooks.sh

# 수동 워크플로우 상태 확인
./scripts/workflow-check.sh {issue-id}

# 커밋 전 자동 실행 (hook 설치 시)
# git commit 시 자동으로 pre-commit-check.sh 실행
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
