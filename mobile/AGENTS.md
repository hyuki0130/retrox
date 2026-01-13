# Mobile AGENTS.md - React Native Development Guidelines

> RetroX 모바일 앱 개발 가이드라인

## Build & Run Commands

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

## Testing Commands

### Unit Tests

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

### E2E Tests (Detox)

```bash
cd mobile

# LOCAL FIRST: Always run E2E tests locally before pushing
./scripts/e2e-ci-ios.sh              # iOS: Auto-detects simulator
./scripts/e2e-ci-android.sh          # Android: Auto-detects emulator

# Manual commands (if needed)
npm run e2e:build:ios                # iOS debug build
npm run e2e:build:ios:release        # iOS release build
npm run e2e:test:ios                 # iOS tests
npm run e2e:test:ios:release         # iOS release tests

# Android manual
npm run e2e:build:android            # Android build
npm run e2e:test:android             # Android tests
```

### Simulator Environment

| Environment | Xcode | Default Simulator |
|-------------|-------|-------------------|
| Local (2026) | 26.2 | iPhone 17 Pro |
| CI (GitHub Actions) | 15.4 | iPhone 15 Pro |

The E2E scripts auto-detect available simulators. Override with `DETOX_DEVICE_TYPE` or `SIMULATOR_NAME` environment variables if needed.

## React Native Patterns

### Components

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

### Error Handling

```typescript
// Use Result pattern for game logic
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// NEVER: Empty catch blocks
// BAD
try { ... } catch (e) {}

// GOOD
try { ... } catch (error) {
  logger.error('Operation failed', { error, context });
  // Handle appropriately
}
```

## Game Development Guidelines

- Use React Native Skia for 2D rendering
- Target 60fps on mid-range devices
- Keep game assets under 50MB total
- Implement game loop with `requestAnimationFrame`
- Sound: use `expo-av` or `react-native-sound`

## E2E Testing Guidelines (MANDATORY)

### testID Rules

Detox requires `testID` prop to identify UI elements.

```typescript
// Naming convention: {screen/feature}-{element}-{state?}
<TouchableOpacity testID="shooter-move-left" />
<Text testID="coin-balance" />
<View testID="puzzle-cell-0-0" />
<TouchableOpacity testID="watch-ad-button" />
```

| Component Type | testID Pattern | Example |
|----------------|----------------|---------|
| Button | `{feature}-{action}` | `shooter-fire`, `watch-ad-button` |
| Text | `{feature}-{data}` | `coin-balance`, `shooter-score` |
| Grid Cell | `{feature}-cell-{row}-{col}` | `puzzle-cell-0-0` |
| State View | `{feature}-{state}` | `shooter-gameover`, `ad-loading` |

### Test File Structure

```
mobile/e2e/
├── jest.config.js
├── flows/
│   ├── app.test.ts           # App launch/navigation
│   ├── shooter.test.ts       # Shooter game play
│   ├── puzzle.test.ts        # Puzzle game play
│   ├── ads.test.ts           # Ad system
│   └── [feature].test.ts     # Feature-specific tests
└── helpers/
    └── testHelpers.ts
```

### E2E Test Template

```typescript
import { device, element, by, expect, waitFor } from 'detox';

describe('Feature Name', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Happy Path', () => {
    it('should do expected behavior', async () => {
      await element(by.id('feature-button')).tap();
      await expect(element(by.id('feature-result'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle failure gracefully', async () => {
      await device.setURLBlacklist(['.*api.*']);
      await element(by.id('feature-button')).tap();
      await expect(element(by.id('error-message'))).toBeVisible();
      await device.setURLBlacklist([]);
    });
  });
});
```

### Feature E2E Test Requirements (MANDATORY)

| Feature Type | Required Test Cases |
|--------------|---------------------|
| New game | Game entry, play actions, game over, pause/resume |
| New screen | Screen entry, UI elements visible, navigation |
| Ad changes | Ad load, completion callback, failure handling |
| Coin system | Coin display, increase/decrease, insufficient balance |
| Settings | Toggle behavior, save/restore settings |

### Blocking Rules

| Forbidden | Reason |
|-----------|--------|
| **Hardcoded test pass** | Must test real functionality |
| **`.skip()` or `.only()` in commits** | All tests must run |
| **Unrelated tests** | Only add tests for current issue/task |
| **Feature without testID** | Detox can't test it |
| **PR without E2E tests** | Features require E2E coverage |
| **Deleting tests to pass CI** | Fix the code, not the tests |

### Ad Testing Notes

AdMob ads are native overlays requiring special handling:

```typescript
// Close test ad (coordinate-based)
await device.tap({ x: 30, y: 60 });

// Block ad network (failure scenario)
await device.setURLBlacklist(['.*googlesyndication.*', '.*doubleclick.*']);

// Wait for ad load
await new Promise(resolve => setTimeout(resolve, 6000));
```

### Pre-Commit Checklist (MANDATORY)

**커밋 전 반드시 로컬에서 모든 테스트 통과 확인!**

```bash
cd mobile

# 1. Lint & Type Check
npm run lint && npm run typecheck

# 2. Unit Tests
npm test

# 3. E2E Tests (iOS)
./scripts/e2e-ci-ios.sh

# 4. E2E Tests (Android) - if Android code changed
./scripts/e2e-ci-android.sh
```

**One-liner (iOS only):**
```bash
npm run lint && npm run typecheck && npm test && ./scripts/e2e-ci-ios.sh
```

**One-liner (Full - iOS + Android):**
```bash
npm run lint && npm run typecheck && npm test && ./scripts/e2e-ci-ios.sh && ./scripts/e2e-ci-android.sh
```

### PR Merge Conditions

| Condition | Verification |
|-----------|--------------|
| Lint pass | `npm run lint` |
| Type check pass | `npm run typecheck` |
| Unit tests pass | `npm test` |
| E2E tests (iOS) pass | `./scripts/e2e-ci-ios.sh` |
| E2E tests (Android) pass | `./scripts/e2e-ci-android.sh` |

**모든 테스트 통과 = 커밋 가능. 실패 시 커밋 금지.**

### Exception Handling

| Situation | Allowed Action |
|-----------|----------------|
| Test bug | Fix test (note in PR description) |
| Flaky test | Add `retry` or adjust `waitFor` timeout |
| External service dependency | Use `device.setURLBlacklist()` or mock |

## References

- [Detox Official Docs](https://wix.github.io/Detox/)
- [Detox Actions API](https://wix.github.io/Detox/docs/api/actions)
- [Detox Matchers API](https://wix.github.io/Detox/docs/api/matchers)
