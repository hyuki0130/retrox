import { useState, useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export interface ScreenEffects {
  flashColor: string | null;
  flashOpacity: number;
  shakeX: Animated.Value;
  shakeY: Animated.Value;
  flash: (color: string, duration?: number) => void;
  shake: (intensity?: number, duration?: number) => void;
  damageEffect: () => void;
  successEffect: () => void;
}

export function useScreenEffects(): ScreenEffects {
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const shakeX = useRef(new Animated.Value(0)).current;
  const shakeY = useRef(new Animated.Value(0)).current;
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((color: string, duration = 100) => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    setFlashColor(color);
    setFlashOpacity(0.6);
    
    flashTimeoutRef.current = setTimeout(() => {
      setFlashOpacity(0.3);
      flashTimeoutRef.current = setTimeout(() => {
        setFlashOpacity(0);
        flashTimeoutRef.current = setTimeout(() => {
          setFlashColor(null);
        }, 50);
      }, duration / 2);
    }, duration / 2);
  }, []);

  const shake = useCallback((intensity = 10, duration = 200) => {
    const shakeSequence = Animated.sequence([
      Animated.timing(shakeX, {
        toValue: intensity,
        duration: duration / 8,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: -intensity,
        duration: duration / 4,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: intensity * 0.5,
        duration: duration / 4,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: -intensity * 0.5,
        duration: duration / 4,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: 0,
        duration: duration / 8,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]);

    shakeSequence.start();
  }, [shakeX]);

  const damageEffect = useCallback(() => {
    flash('#ff0000', 150);
    shake(12, 250);
  }, [flash, shake]);

  const successEffect = useCallback(() => {
    flash('#00ff9d', 100);
    shake(5, 100);
  }, [flash, shake]);

  return {
    flashColor,
    flashOpacity,
    shakeX,
    shakeY,
    flash,
    shake,
    damageEffect,
    successEffect,
  };
}
