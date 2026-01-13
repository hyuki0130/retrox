# RetroX Games Guide

> 90년대 오락실 게임 모바일 조작 가이드

## Shooter Game (Galaga-style)

### Overview
수직 스크롤 슈팅 게임. 적을 격추하고 생존하세요.

### Controls

| 버튼 | 위치 | 동작 |
|------|------|------|
| ◀ | 좌측 하단 | 왼쪽 이동 (30px) |
| ▶ | 우측 하단 | 오른쪽 이동 (30px) |
| FIRE | 중앙 하단 | 탄환 발사 |

### Game Rules

- **적 스폰**: 1.5초 간격으로 화면 상단에서 랜덤 위치 출현
- **적 속도**: 3px/frame 하강
- **탄환 속도**: 10px/frame 상승
- **충돌 판정**: 원형 히트박스 (적 30px, 탄환 8px, 플레이어 40px)
- **점수**: 적 격추 시 +100점
- **게임 오버**: 적과 플레이어 충돌

### Scoring

| 행동 | 점수 |
|------|------|
| 적 격추 | +100 |
| 생존 보너스 | 없음 |

### Tips

1. 화면 하단 중앙에서 시작 - 좌우 이동 여유 확보
2. 적이 내려오기 전에 빠르게 격추
3. 적 밀집 시 한쪽으로 이동하며 회피

---

## Puzzle Game (Match-3)

### Overview
6x6 그리드에서 같은 색상의 타일 3개 이상을 연결하여 제거하는 퍼즐 게임.

### Controls

| 동작 | 방법 |
|------|------|
| 타일 선택 | 타일 탭 |
| 타일 교환 | 인접한 타일 순차 탭 |

### Game Rules

- **그리드**: 6x6 (36 타일)
- **색상**: 6종류 (빨강, 초록, 노랑, 파랑, 주황, 보라)
- **매칭**: 가로 또는 세로로 3개 이상 같은 색상
- **연쇄**: 매칭 후 타일이 떨어지며 추가 매칭 발생 가능
- **제한**: 30 moves
- **게임 오버**: moves 소진

### Matching Mechanics

```
매칭 전:          매칭 후:          결과:
[R][G][B]         [ ][ ][ ]         새 타일 생성
[R][R][R] ← 매칭  [ ][ ][ ] ← 제거   ↓ 위에서 떨어짐
[G][B][Y]         [G][B][Y]         [?][?][?]
```

### Scoring

| 행동 | 점수 |
|------|------|
| 타일 매칭 | 제거된 타일 × 10 |
| 연쇄 보너스 | 추가 매칭도 동일 |

### Tips

1. 연쇄 매칭을 노려 높은 점수 획득
2. 화면 하단부터 정리하면 자연스럽게 연쇄 발생
3. moves 관리 중요 - 확실한 매칭만 시도

---

## Common Features

### Pause Menu

게임 중 `pause-button` 탭으로 일시정지:
- **RESUME**: 게임 계속
- **QUIT**: 홈 화면으로 복귀

### Themes

게임은 설정에서 선택한 테마 색상을 사용:

| 테마 | Primary | Secondary | Background |
|------|---------|-----------|------------|
| Neon | #00ff9d | #ff0066 | #0a0a0a |
| Pixel | #16c79a | #f67280 | #1a1a2e |
| CRT | #39ff14 | #ff6600 | #0d1117 |

---

## UX Improvement Roadmap

### Shooter Game Improvements

| Priority | Feature | Description |
|----------|---------|-------------|
| High | Virtual Joystick | 버튼 대신 아날로그 조이스틱 도입 |
| High | Auto-fire Option | 연사 모드 설정 추가 |
| Medium | Haptic Feedback | 발사/피격 시 진동 |
| Medium | Power-ups | 스프레드샷, 실드 등 아이템 |
| Low | Boss Battles | 스테이지 보스 추가 |

### Puzzle Game Improvements

| Priority | Feature | Description |
|----------|---------|-------------|
| High | Swipe to Swap | 탭 대신 스와이프로 교환 |
| High | Hint System | 일정 시간 후 힌트 표시 |
| Medium | Combo Indicator | 연쇄 시 시각적 피드백 강화 |
| Medium | Undo Move | 마지막 동작 취소 기능 |
| Low | Special Tiles | 폭탄, 라인클리어 특수 타일 |

### General Improvements

| Priority | Feature | Description |
|----------|---------|-------------|
| High | Sound Effects | 게임별 사운드 추가 |
| High | Score Animation | 점수 획득 시 애니메이션 |
| Medium | Tutorial | 첫 플레이 시 조작법 안내 |
| Medium | Achievement | 업적 시스템 |
| Low | Leaderboard | 글로벌 랭킹 |

---

## Accessibility Notes

- 모든 인터랙티브 요소에 최소 44×44pt 터치 영역 확보
- 색상만으로 구분하지 않고 형태로도 구분 가능하게
- 게임 속도 조절 옵션 고려 (접근성)
