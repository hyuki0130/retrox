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
```

## Native Setup (Required)

> ⚠️ **중요**: 네이티브 모듈(Skia, Reanimated, AdMob)은 추가 설정이 필요합니다.

### iOS Setup

#### 1. CocoaPods 설치

```bash
# CocoaPods 설치 (없는 경우)
sudo gem install cocoapods

# Pod 설치
cd ios && pod install && cd ..
```

#### 2. Info.plist 설정 (AdMob)

`ios/RetroX/Info.plist`에 추가:

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>
<!-- 위는 테스트 App ID. 프로덕션에서는 실제 AdMob App ID로 교체 -->

<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>4fzdc2evr5.skadnetwork</string>
  </dict>
  <!-- 추가 SKAdNetwork ID는 AdMob 문서 참조 -->
</array>

<!-- App Tracking Transparency (iOS 14+) -->
<key>NSUserTrackingUsageDescription</key>
<string>맞춤형 광고를 제공하기 위해 사용됩니다.</string>
```

#### 3. Podfile 설정

`ios/Podfile` 최소 iOS 버전 확인:

```ruby
platform :ios, '13.4'  # Skia 요구사항

# Reanimated 설정
pod 'RNReanimated', :path => '../node_modules/react-native-reanimated'
```

#### 4. Build Settings (Xcode)

1. Xcode에서 `ios/RetroX.xcworkspace` 열기
2. Build Settings → Enable Bitcode → `No`
3. Build Settings → Other Linker Flags → `-ObjC` 추가

#### 5. iOS 실행

```bash
# Simulator
npm run ios

# 특정 시뮬레이터
npm run ios -- --simulator="iPhone 15 Pro"

# 실제 기기
npm run ios -- --device
```

### Android Setup

#### 1. android/build.gradle

프로젝트 레벨 `android/build.gradle`:

```gradle
buildscript {
    ext {
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
        kotlinVersion = "1.9.0"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
```

#### 2. android/app/build.gradle

앱 레벨 `android/app/build.gradle`:

```gradle
android {
    compileSdk rootProject.ext.compileSdkVersion

    defaultConfig {
        minSdk rootProject.ext.minSdkVersion
        targetSdk rootProject.ext.targetSdkVersion
    }
}

dependencies {
    // Reanimated
    implementation project(':react-native-reanimated')
}
```

#### 3. MainApplication.kt (Reanimated)

`android/app/src/main/java/.../MainApplication.kt`:

```kotlin
import com.facebook.react.defaults.DefaultReactActivityDelegate

// onCreate에서
override fun onCreate() {
    super.onCreate()
    // Reanimated 워크렛 초기화 (React Native 0.73+는 자동)
}
```

#### 4. AndroidManifest.xml (AdMob)

`android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <application>
        <!-- AdMob App ID -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713"/>
        <!-- 위는 테스트 App ID. 프로덕션에서는 실제 AdMob App ID로 교체 -->

        <!-- 광고 최적화를 위한 권한 (선택) -->
        <meta-data
            android:name="com.google.android.gms.ads.AD_MANAGER_APP"
            android:value="true"/>
    </application>

    <!-- 인터넷 권한 -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
</manifest>
```

#### 5. babel.config.js (Reanimated)

프로젝트 루트 `mobile/babel.config.js`:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Reanimated 플러그인 - 반드시 마지막에!
    'react-native-reanimated/plugin',
  ],
};
```

#### 6. Android 실행

```bash
# Emulator
npm run android

# 연결된 기기 목록
adb devices

# 특정 기기
npm run android -- --deviceId=<device_id>
```

### Common Issues & Troubleshooting

#### iOS

| 문제 | 해결 |
|------|------|
| `Pod install` 실패 | `cd ios && pod deintegrate && pod install` |
| Skia 빌드 에러 | Xcode → Clean Build Folder (Cmd+Shift+K) |
| Bitcode 에러 | Build Settings → Enable Bitcode → No |
| Signing 에러 | Xcode에서 Team 설정 확인 |

#### Android

| 문제 | 해결 |
|------|------|
| Gradle 빌드 실패 | `cd android && ./gradlew clean` |
| SDK 버전 에러 | `minSdkVersion = 21` 확인 |
| Reanimated 크래시 | `babel.config.js` 플러그인 순서 확인 |
| AdMob 초기화 에러 | AndroidManifest.xml App ID 확인 |

#### Metro

```bash
# 캐시 클리어
npm start -- --reset-cache

# Watchman 리셋 (macOS)
watchman watch-del-all

# node_modules 재설치
rm -rf node_modules && npm install
```

### AdMob Test IDs

개발 중에는 테스트 ID를 사용합니다 (이미 코드에 적용됨):

| 타입 | Test ID |
|------|---------|
| App ID (iOS) | `ca-app-pub-3940256099942544~1458002511` |
| App ID (Android) | `ca-app-pub-3940256099942544~3347511713` |
| Rewarded | `ca-app-pub-3940256099942544/5224354917` |
| Interstitial | `ca-app-pub-3940256099942544/1033173712` |
| Banner | `ca-app-pub-3940256099942544/6300978111` |

> 프로덕션 배포 시 실제 AdMob 계정에서 발급받은 ID로 교체 필요

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
