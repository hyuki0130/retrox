import { useSettingsStore, THEMES } from '../settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      theme: 'neon',
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
    });
  });

  describe('initial state', () => {
    it('should have neon as default theme', () => {
      const { theme } = useSettingsStore.getState();
      expect(theme).toBe('neon');
    });

    it('should have sound enabled by default', () => {
      const { soundEnabled } = useSettingsStore.getState();
      expect(soundEnabled).toBe(true);
    });

    it('should have music enabled by default', () => {
      const { musicEnabled } = useSettingsStore.getState();
      expect(musicEnabled).toBe(true);
    });

    it('should have vibration enabled by default', () => {
      const { vibrationEnabled } = useSettingsStore.getState();
      expect(vibrationEnabled).toBe(true);
    });
  });

  describe('setTheme', () => {
    it('should change theme to pixel', () => {
      const { setTheme } = useSettingsStore.getState();
      setTheme('pixel');
      expect(useSettingsStore.getState().theme).toBe('pixel');
    });

    it('should change theme to crt', () => {
      const { setTheme } = useSettingsStore.getState();
      setTheme('crt');
      expect(useSettingsStore.getState().theme).toBe('crt');
    });

    it('should change theme back to neon', () => {
      const { setTheme } = useSettingsStore.getState();
      setTheme('crt');
      setTheme('neon');
      expect(useSettingsStore.getState().theme).toBe('neon');
    });
  });

  describe('toggleSound', () => {
    it('should toggle sound from true to false', () => {
      const { toggleSound } = useSettingsStore.getState();
      toggleSound();
      expect(useSettingsStore.getState().soundEnabled).toBe(false);
    });

    it('should toggle sound from false to true', () => {
      useSettingsStore.setState({ soundEnabled: false });
      const { toggleSound } = useSettingsStore.getState();
      toggleSound();
      expect(useSettingsStore.getState().soundEnabled).toBe(true);
    });

    it('should toggle sound multiple times', () => {
      const { toggleSound } = useSettingsStore.getState();
      toggleSound();
      toggleSound();
      toggleSound();
      expect(useSettingsStore.getState().soundEnabled).toBe(false);
    });
  });

  describe('toggleMusic', () => {
    it('should toggle music from true to false', () => {
      const { toggleMusic } = useSettingsStore.getState();
      toggleMusic();
      expect(useSettingsStore.getState().musicEnabled).toBe(false);
    });

    it('should toggle music from false to true', () => {
      useSettingsStore.setState({ musicEnabled: false });
      const { toggleMusic } = useSettingsStore.getState();
      toggleMusic();
      expect(useSettingsStore.getState().musicEnabled).toBe(true);
    });
  });

  describe('toggleVibration', () => {
    it('should toggle vibration from true to false', () => {
      const { toggleVibration } = useSettingsStore.getState();
      toggleVibration();
      expect(useSettingsStore.getState().vibrationEnabled).toBe(false);
    });

    it('should toggle vibration from false to true', () => {
      useSettingsStore.setState({ vibrationEnabled: false });
      const { toggleVibration } = useSettingsStore.getState();
      toggleVibration();
      expect(useSettingsStore.getState().vibrationEnabled).toBe(true);
    });
  });

  describe('getThemeColors', () => {
    it('should return neon theme colors by default', () => {
      const { getThemeColors } = useSettingsStore.getState();
      const colors = getThemeColors();
      expect(colors).toEqual(THEMES.neon);
      expect(colors.background).toBe('#0a0a0a');
      expect(colors.primary).toBe('#00ff9d');
    });

    it('should return pixel theme colors when set', () => {
      useSettingsStore.setState({ theme: 'pixel' });
      const { getThemeColors } = useSettingsStore.getState();
      const colors = getThemeColors();
      expect(colors).toEqual(THEMES.pixel);
      expect(colors.background).toBe('#1a1a2e');
      expect(colors.primary).toBe('#16c79a');
    });

    it('should return crt theme colors when set', () => {
      useSettingsStore.setState({ theme: 'crt' });
      const { getThemeColors } = useSettingsStore.getState();
      const colors = getThemeColors();
      expect(colors).toEqual(THEMES.crt);
      expect(colors.background).toBe('#0d1117');
      expect(colors.primary).toBe('#39ff14');
    });
  });

  describe('THEMES constant', () => {
    it('should have all three themes defined', () => {
      expect(THEMES).toHaveProperty('neon');
      expect(THEMES).toHaveProperty('pixel');
      expect(THEMES).toHaveProperty('crt');
    });

    it('should have all required color properties in each theme', () => {
      const requiredColors = ['background', 'primary', 'secondary', 'accent', 'text'];

      for (const themeName of ['neon', 'pixel', 'crt'] as const) {
        const theme = THEMES[themeName];
        for (const color of requiredColors) {
          expect(theme).toHaveProperty(color);
          expect(typeof theme[color as keyof typeof theme]).toBe('string');
        }
      }
    });

    it('should have valid hex color values', () => {
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

      for (const themeName of ['neon', 'pixel', 'crt'] as const) {
        const theme = THEMES[themeName];
        for (const [, value] of Object.entries(theme)) {
          expect(value).toMatch(hexColorRegex);
        }
      }
    });
  });

  describe('integration scenarios', () => {
    it('should handle settings change during gameplay', () => {
      const store = useSettingsStore.getState();

      expect(store.soundEnabled).toBe(true);
      expect(store.theme).toBe('neon');

      store.toggleSound();
      expect(useSettingsStore.getState().soundEnabled).toBe(false);

      store.setTheme('crt');
      expect(useSettingsStore.getState().theme).toBe('crt');

      const colors = useSettingsStore.getState().getThemeColors();
      expect(colors.primary).toBe('#39ff14');
    });

    it('should maintain independent toggle states', () => {
      const store = useSettingsStore.getState();

      store.toggleSound();
      expect(useSettingsStore.getState().soundEnabled).toBe(false);
      expect(useSettingsStore.getState().musicEnabled).toBe(true);
      expect(useSettingsStore.getState().vibrationEnabled).toBe(true);

      store.toggleMusic();
      expect(useSettingsStore.getState().soundEnabled).toBe(false);
      expect(useSettingsStore.getState().musicEnabled).toBe(false);
      expect(useSettingsStore.getState().vibrationEnabled).toBe(true);

      store.toggleVibration();
      expect(useSettingsStore.getState().soundEnabled).toBe(false);
      expect(useSettingsStore.getState().musicEnabled).toBe(false);
      expect(useSettingsStore.getState().vibrationEnabled).toBe(false);
    });
  });
});
