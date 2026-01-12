# Retrox Mobile

React Native 기반 90년대 오락실 게임 모바일 앱

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Native App                            │
├─────────────────────────────────────────────────────────────────┤
│  Games Layer (React Native Skia)                                │
│  ├── ShooterGame        → Galaga 스타일 슈팅 게임               │
│  ├── PuzzleGame         → Match-3 퍼즐 게임                     │
│  └── PoC                → GameLoop, SkiaGameLoop 프로토타입     │
├─────────────────────────────────────────────────────────────────┤
│  State Management (Zustand + AsyncStorage)                      │
│  ├── coinStore          → 코인 잔액, 지급/차감/보상             │
│  └── settingsStore      → 테마, 사운드, 진동 설정               │
├─────────────────────────────────────────────────────────────────┤
│  Services                                                       │
│  └── adService          → AdMob Rewarded/Interstitial 광고      │
├─────────────────────────────────────────────────────────────────┤
│  Theme                                                          │
│  ├── neon               → #00ff9d / #ff0066 / #0a0a0a           │
│  ├── pixel              → #16c79a / #f67280 / #1a1a2e           │
│  └── crt                → #39ff14 / #ff6600 / #0d1117           │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Framework**: React Native 0.73+
- **Rendering**: React Native Skia (GPU 가속 2D)
- **Animation**: React Native Reanimated
- **State**: Zustand + AsyncStorage
- **Ads**: Google AdMob (react-native-google-mobile-ads)
- **Testing**: Jest

## Quick Start

### Prerequisites

- Node.js 18+
- Xcode 15+ (iOS)
- Android Studio (Android)
- CocoaPods (iOS)

### Installation

```bash
cd mobile
npm install

# iOS only
cd ios && pod install && cd ..
```

### Run App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Metro Bundler
npm start
```

## Project Structure

```
mobile/
├── src/
│   ├── games/                    # Game implementations
│   │   ├── shooter/
│   │   │   └── ShooterGame.tsx   # Galaga-style shooter
│   │   ├── puzzle/
│   │   │   └── PuzzleGame.tsx    # Match-3 puzzle
│   │   └── poc/
│   │       ├── GameLoop.tsx      # RAF-based game loop
│   │       └── SkiaGameLoop.tsx  # Skia-based game loop
│   ├── store/                    # Zustand stores
│   │   ├── coinStore.ts          # Coin management
│   │   ├── settingsStore.ts      # App settings
│   │   └── __tests__/            # Store tests
│   ├── services/                 # External services
│   │   ├── adService.ts          # AdMob integration
│   │   └── __tests__/            # Service tests
│   ├── theme/                    # Theme definitions
│   ├── ui/                       # Shared UI components
│   ├── core/                     # Game engine utilities
│   ├── config/                   # App configuration
│   └── index.ts                  # Entry point
├── ios/                          # iOS native code
├── android/                      # Android native code
├── jest.config.js                # Jest configuration
├── jest.setup.js                 # Test mocks setup
└── package.json
```

## State Management

### Coin Store

```typescript
import { useCoinStore } from '@/store';

// 코인 조회
const coins = useCoinStore((state) => state.coins);

// 코인 지급
useCoinStore.getState().addCoins(500);

// 코인 차감 (잔액 부족 시 false 반환)
const success = useCoinStore.getState().spendCoins(200);

// 광고 보상 (800 코인)
useCoinStore.getState().rewardFromAd();

// 초기화 (10,000 코인)
useCoinStore.getState().resetCoins();
```

### Settings Store

```typescript
import { useSettingsStore } from '@/store';

// 현재 테마 색상
const colors = useSettingsStore.getState().getThemeColors();
// { primary: '#00ff9d', secondary: '#ff0066', background: '#0a0a0a' }

// 테마 변경
useSettingsStore.getState().setTheme('pixel'); // 'neon' | 'pixel' | 'crt'

// 토글
useSettingsStore.getState().toggleSound();
useSettingsStore.getState().toggleMusic();
useSettingsStore.getState().toggleVibration();
```

## Ad Service

```typescript
import { adService } from '@/services';

// 앱 시작 시 사전 로드
await adService.preloadAds();

// 보상형 광고 표시
await adService.showRewardedAd(() => {
  // 광고 완료 시 콜백
  useCoinStore.getState().rewardFromAd();
});

// 전면 광고 표시
await adService.showInterstitialAd();
```

## Games

### Shooter Game (Galaga-style)

```typescript
import { ShooterGame } from '@/games/shooter';

// Features:
// - 플레이어 좌우 이동
// - 탄환 발사
// - 적 스폰 (1.5초 간격)
// - 충돌 감지 (원형)
// - 점수 시스템 (처치 당 100점)
// - 게임 오버 + 재시작

<ShooterGame />
```

### Puzzle Game (Match-3)

```typescript
import { PuzzleGame } from '@/games/puzzle';

// Features:
// - 6x6 그리드
// - 6가지 컬러 타일
// - 인접 타일 스왑
// - 3+ 매칭 감지
// - 연쇄 매칭 (cascade)
// - 점수 시스템 (매칭 당 10점)
// - 30 moves 제한

<PuzzleGame />
```

## Testing

```bash
# Run all tests (54 tests)
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Run specific test file
npm test -- coinStore.test.ts
```

### Test Structure

```
mobile/src/
├── store/__tests__/
│   ├── coinStore.test.ts       # 17 tests
│   └── settingsStore.test.ts   # 21 tests
└── services/__tests__/
    └── adService.test.ts       # 16 tests
```

### Coverage

| Metric | Result |
|--------|--------|
| Statements | 100% |
| Branches | 85.71% |
| Functions | 100% |
| Lines | 100% |

### Test Configuration

**jest.config.js**
```javascript
module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|zustand)/)'
  ],
};
```

**jest.setup.js** - Mocks:
- `@react-native-async-storage/async-storage`
- `react-native-google-mobile-ads`
- `react-native` (Dimensions)

## Theme System

### Available Themes

| Theme | Primary | Secondary | Background |
|-------|---------|-----------|------------|
| neon | #00ff9d | #ff0066 | #0a0a0a |
| pixel | #16c79a | #f67280 | #1a1a2e |
| crt | #39ff14 | #ff6600 | #0d1117 |

### Usage

```typescript
const { theme, getThemeColors, setTheme } = useSettingsStore();

// 현재 테마 색상 가져오기
const colors = getThemeColors();

// 스타일 적용
<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.primary }}>Retrox</Text>
</View>
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm start` | Start Metro bundler |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm test` | Run all tests |
| `npm run lint` | ESLint check |

## Game Engine Decision

**Skia** 선택 이유:

| Aspect | RAF | Skia |
|--------|-----|------|
| Bundle | 0KB | +2-3MB |
| Performance (50+ objects) | Frame drops | 60fps |
| Graphics | Basic views | GPU primitives |
| Effects | Limited | CRT/네온 가능 |

상세 비교: `ENGINE_COMPARISON.md`

## Coin Economy

| Item | Coins |
|------|-------|
| Initial balance | 10,000 |
| Easy game | -200 |
| Medium game | -500 |
| Hard game | -800 |
| Ad reward | +800 |
| Win bonus | +50~150 |

## Build

### iOS

```bash
# Development build
npm run ios

# Release build
cd ios
xcodebuild -workspace RetroX.xcworkspace \
  -scheme RetroX \
  -configuration Release \
  -sdk iphoneos \
  archive
```

### Android

```bash
# Development build
npm run android

# Release APK
cd android
./gradlew assembleRelease
```

## Dependencies

### Core

- `react-native`: Mobile framework
- `@shopify/react-native-skia`: 2D rendering
- `react-native-reanimated`: Animations
- `zustand`: State management
- `@react-native-async-storage/async-storage`: Persistence

### Ads

- `react-native-google-mobile-ads`: AdMob SDK

### Dev

- `jest`: Testing
- `eslint`: Linting
- `typescript`: Type checking
