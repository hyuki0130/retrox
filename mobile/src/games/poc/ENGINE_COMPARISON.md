# Game Engine PoC Comparison: RAF vs Skia

## Overview

This document compares two approaches for implementing game loops in React Native:
1. **RAF (requestAnimationFrame)** - Native RN View + transform
2. **Skia** - @shopify/react-native-skia Canvas

---

## Implementation Summary

| Aspect | RAF (GameLoop.tsx) | Skia (SkiaGameLoop.tsx) |
|--------|-------------------|------------------------|
| Rendering | RN View + transform | Skia Canvas + Circle |
| Animation | requestAnimationFrame | setInterval + Reanimated |
| State | useState + useRef | useSharedValue (worklet) |
| Bundle Size | ~0KB (native RN) | +2-3MB (@shopify/react-native-skia) |

---

## RAF Approach (GameLoop.tsx)

### Pros
- Zero additional dependencies
- Simple mental model
- Works with all RN components
- Smaller bundle size

### Cons
- Each frame triggers React re-render
- Limited to RN View capabilities
- No hardware-accelerated graphics primitives
- Complex shapes require SVG or custom views

### Best For
- Simple UI animations
- Prototyping
- Apps where bundle size is critical

---

## Skia Approach (SkiaGameLoop.tsx)

### Pros
- GPU-accelerated rendering
- Rich graphics primitives (paths, gradients, shaders)
- Worklet-based animation (off main thread)
- Better performance for complex scenes
- Professional game-quality graphics

### Cons
- +2-3MB bundle size
- Learning curve for Skia API
- iOS/Android native module required
- More complex setup (pod install, gradle)

### Best For
- Actual games with multiple sprites
- Complex visual effects
- 60fps requirement with many objects
- Professional-grade graphics

---

## Performance Characteristics

### Simple Scene (1 moving object)
Both approaches perform similarly (~60fps)

### Complex Scene (50+ objects)
- RAF: Frame drops expected due to JS bridge overhead
- Skia: Maintains 60fps via GPU acceleration

### Memory Usage
- RAF: Lower baseline, spikes on re-renders
- Skia: Higher baseline, stable under load

---

## Recommendation for Retrox

**Selected: Skia (@shopify/react-native-skia)**

### Rationale
1. **Game Quality**: Retro arcade games need smooth animations
2. **Scalability**: Multiple enemies, bullets, effects per frame
3. **Visual Fidelity**: CRT effects, neon glow, pixel-perfect rendering
4. **Future-Proof**: Can implement complex shaders for retro effects

### Trade-offs Accepted
- +2-3MB bundle size (acceptable for game app)
- Pod/Gradle setup complexity (one-time)
- Team learning curve (documented patterns)

---

## Next Steps
1. Install @shopify/react-native-skia in mobile/
2. Set up reanimated worklet for game loop
3. Create base GameEngine class using Skia
4. Implement first game (shooter) with Skia primitives

---

## Files
- `GameLoop.tsx` - RAF reference implementation
- `SkiaGameLoop.tsx` - Skia implementation (recommended)
