import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'neon' | 'pixel' | 'crt';

interface ThemeColors {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

const THEMES: Record<ThemeType, ThemeColors> = {
  neon: {
    background: '#0a0a0a',
    primary: '#00ff9d',
    secondary: '#ff0066',
    accent: '#00ccff',
    text: '#ffffff',
  },
  pixel: {
    background: '#1a1a2e',
    primary: '#16c79a',
    secondary: '#f67280',
    accent: '#c3e0e5',
    text: '#e4e4e4',
  },
  crt: {
    background: '#0d1117',
    primary: '#39ff14',
    secondary: '#ff6600',
    accent: '#33ccff',
    text: '#c9d1d9',
  },
};

interface SettingsStore {
  theme: ThemeType;
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;

  setTheme: (theme: ThemeType) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleVibration: () => void;
  getThemeColors: () => ThemeColors;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      theme: 'neon',
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,

      setTheme: (theme: ThemeType) => set({ theme }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),

      toggleVibration: () => set((state) => ({ vibrationEnabled: !state.vibrationEnabled })),

      getThemeColors: () => THEMES[get().theme],
    }),
    {
      name: 'retrox-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { THEMES };
export type { ThemeType, ThemeColors };
