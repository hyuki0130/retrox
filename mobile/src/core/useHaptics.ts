import { useCallback } from 'react';
import { Vibration, Platform } from 'react-native';
import { useSettingsStore } from '@/store';

export interface HapticsAPI {
  light: () => void;
  medium: () => void;
  heavy: () => void;
  success: () => void;
  warning: () => void;
  error: () => void;
  custom: (pattern: number | number[]) => void;
}

export function useHaptics(): HapticsAPI {
  const vibrationEnabled = useSettingsStore((state) => state.vibrationEnabled);

  const vibrate = useCallback(
    (duration: number | number[]) => {
      if (!vibrationEnabled) return;
      
      if (Platform.OS === 'android') {
        Vibration.vibrate(duration);
      } else {
        Vibration.vibrate(Array.isArray(duration) ? duration : [duration]);
      }
    },
    [vibrationEnabled]
  );

  const light = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  const medium = useCallback(() => {
    vibrate(25);
  }, [vibrate]);

  const heavy = useCallback(() => {
    vibrate(50);
  }, [vibrate]);

  const success = useCallback(() => {
    vibrate([0, 10, 50, 10]);
  }, [vibrate]);

  const warning = useCallback(() => {
    vibrate([0, 20, 40, 20]);
  }, [vibrate]);

  const error = useCallback(() => {
    vibrate([0, 50, 50, 50, 50, 50]);
  }, [vibrate]);

  const custom = useCallback(
    (pattern: number | number[]) => {
      vibrate(pattern);
    },
    [vibrate]
  );

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    custom,
  };
}
