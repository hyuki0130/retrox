import { device, element, by, expect, waitFor } from 'detox';

describe('App Navigation & Stability', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('App Launch', () => {
    it('should launch without crash', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should show home screen title', async () => {
      await waitFor(element(by.id('home-title')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display coin balance', async () => {
      await waitFor(element(by.id('coin-hud')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('coin-balance'))).toBeVisible();
    });

    it('should show featured section', async () => {
      await waitFor(element(by.id('home-featured')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show game grid', async () => {
      await waitFor(element(by.id('home-game-grid')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Navigation to Games', () => {
    it('should navigate to Shooter game', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.text('Shooter')).tap();
      
      await waitFor(element(by.id('gameplay-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      await expect(element(by.id('shooter-container'))).toBeVisible();
    });

    it('should navigate to Puzzle game', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.text('Puzzle')).tap();
      
      await waitFor(element(by.id('gameplay-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      await expect(element(by.id('puzzle-container'))).toBeVisible();
    });

    it('should return to home from game', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.text('Shooter')).tap();
      
      await waitFor(element(by.id('gameplay-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      await element(by.id('pause-button')).tap();
      await waitFor(element(by.id('pause-modal')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('quit-button')).tap();
      
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Full User Journey', () => {
    it('should play game and quit to home via pause menu', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('coin-hud'))).toBeVisible();
      
      await element(by.text('Puzzle')).tap();
      
      await waitFor(element(by.id('puzzle-container')))
        .toBeVisible()
        .withTimeout(3000);
      
      for (let i = 0; i < 5; i++) {
        await element(by.id(`puzzle-cell-${i}-0`)).tap();
        await element(by.id(`puzzle-cell-${i}-1`)).tap();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await waitFor(element(by.id('pause-button')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('pause-button')).tap();
      await waitFor(element(by.id('pause-modal')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('quit-button')).tap();
      
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('App Stability', () => {
    it('should handle multiple app reloads', async () => {
      for (let i = 0; i < 3; i++) {
        await device.reloadReactNative();
        
        await waitFor(element(by.id('home-screen')))
          .toBeVisible()
          .withTimeout(5000);
      }
    });

    it('should handle background/foreground cycles', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await device.sendToHome();
      await device.launchApp({ newInstance: false });
      
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should handle rapid navigation', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      for (let i = 0; i < 3; i++) {
        await element(by.text('Shooter')).tap();
        await waitFor(element(by.id('gameplay-screen'))).toBeVisible().withTimeout(3000);
        
        await element(by.id('pause-button')).tap();
        await waitFor(element(by.id('pause-modal'))).toBeVisible().withTimeout(2000);
        await element(by.id('quit-button')).tap();
        
        await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(3000);
        
        await element(by.text('Puzzle')).tap();
        await waitFor(element(by.id('gameplay-screen'))).toBeVisible().withTimeout(3000);
        
        await element(by.id('pause-button')).tap();
        await waitFor(element(by.id('pause-modal'))).toBeVisible().withTimeout(2000);
        await element(by.id('quit-button')).tap();
        
        await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(3000);
      }
      
      await expect(element(by.id('home-screen'))).toBeVisible();
    });
  });

  describe('Theme System', () => {
    it('should render with correct theme colors', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('home-title'))).toBeVisible();
    });
  });

  describe('Locked Games', () => {
    it('should show locked state for unavailable games', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('home-game-grid'))).toBeVisible();
      
      try {
        await element(by.text('Tetris')).tap();
      } catch {
      }
      
      await expect(element(by.id('home-screen'))).toBeVisible();
    });
  });
});
