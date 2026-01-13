import { device, element, by, expect, waitFor } from 'detox';

describe('Shooter Game', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Game Entry', () => {
    it('should launch without StatusBar crash', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.text('Shooter')).tap();
      
      await waitFor(element(by.id('gameplay-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show initial score as 0', async () => {
      await element(by.text('Shooter')).tap();
      
      await waitFor(element(by.id('shooter-score')))
        .toBeVisible()
        .withTimeout(3000);
      
      await expect(element(by.id('shooter-score'))).toHaveText('0');
    });
  });

  describe('Player Controls', () => {
    beforeEach(async () => {
      await element(by.text('Shooter')).tap();
      await waitFor(element(by.id('shooter-container')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should move player left', async () => {
      const leftButton = element(by.id('shooter-move-left'));
      await expect(leftButton).toBeVisible();
      
      await leftButton.tap();
      await leftButton.tap();
      await leftButton.tap();
      
      await expect(element(by.id('shooter-container'))).toBeVisible();
    });

    it('should move player right', async () => {
      const rightButton = element(by.id('shooter-move-right'));
      await expect(rightButton).toBeVisible();
      
      await rightButton.tap();
      await rightButton.tap();
      await rightButton.tap();
      
      await expect(element(by.id('shooter-container'))).toBeVisible();
    });

    it('should stay within screen boundaries', async () => {
      const leftButton = element(by.id('shooter-move-left'));
      
      for (let i = 0; i < 20; i++) {
        await leftButton.tap();
      }
      
      await expect(element(by.id('shooter-container'))).toBeVisible();
      
      const rightButton = element(by.id('shooter-move-right'));
      
      for (let i = 0; i < 40; i++) {
        await rightButton.tap();
      }
      
      await expect(element(by.id('shooter-container'))).toBeVisible();
    });

    it('should fire bullets', async () => {
      const fireButton = element(by.id('shooter-fire'));
      await expect(fireButton).toBeVisible();
      
      await fireButton.tap();
      
      await expect(element(by.id('shooter-container'))).toBeVisible();
    });

    it('should handle rapid fire without crash', async () => {
      const fireButton = element(by.id('shooter-fire'));
      
      for (let i = 0; i < 10; i++) {
        await fireButton.tap();
      }
      
      await expect(element(by.id('shooter-container'))).toBeVisible();
    });
  });

  describe('Gameplay Stability', () => {
    beforeEach(async () => {
      await element(by.text('Shooter')).tap();
      await waitFor(element(by.id('shooter-container')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should run stably for 10 seconds', async () => {
      const startTime = Date.now();
      const duration = 10000;
      
      while (Date.now() - startTime < duration) {
        await element(by.id('shooter-move-left')).tap();
        await element(by.id('shooter-fire')).tap();
        await element(by.id('shooter-move-right')).tap();
        await element(by.id('shooter-fire')).tap();
      }
      
      await expect(element(by.id('shooter-container'))).toBeVisible();
    });
  });

  describe('Pause Functionality', () => {
    beforeEach(async () => {
      await element(by.text('Shooter')).tap();
      await waitFor(element(by.id('gameplay-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should pause game when pause button pressed', async () => {
      await element(by.id('pause-button')).tap();
      
      await waitFor(element(by.id('pause-modal')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should resume game when resume button pressed', async () => {
      await element(by.id('pause-button')).tap();
      
      await waitFor(element(by.id('pause-modal')))
        .toBeVisible()
        .withTimeout(2000);
      
      await element(by.id('resume-button')).tap();
      
      await waitFor(element(by.id('pause-modal')))
        .not.toBeVisible()
        .withTimeout(2000);
      
      await expect(element(by.id('shooter-container'))).toBeVisible();
    });
  });

  describe('Game Over', () => {
    it('should show game over screen when player dies', async () => {
      await element(by.text('Shooter')).tap();
      
      await waitFor(element(by.id('shooter-container')))
        .toBeVisible()
        .withTimeout(3000);
      
      await waitFor(element(by.id('shooter-gameover')))
        .toBeVisible()
        .withTimeout(60000);
    });

    it('should show restart button on game over', async () => {
      await element(by.text('Shooter')).tap();
      
      await waitFor(element(by.id('shooter-gameover')))
        .toBeVisible()
        .withTimeout(60000);
      
      await expect(element(by.id('shooter-restart'))).toBeVisible();
    });
  });
});
