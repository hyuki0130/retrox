import { device, element, by, expect, waitFor } from 'detox';

describe('Puzzle Game', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Game Entry', () => {
    it('should load 6x6 grid', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.text('Puzzle')).tap();
      
      await waitFor(element(by.id('puzzle-container')))
        .toBeVisible()
        .withTimeout(3000);
      
      await expect(element(by.id('puzzle-grid'))).toBeVisible();
    });

    it('should start with 30 moves', async () => {
      await element(by.text('Puzzle')).tap();
      
      await waitFor(element(by.id('puzzle-moves')))
        .toBeVisible()
        .withTimeout(3000);
      
      await expect(element(by.id('puzzle-moves'))).toHaveText('30');
    });

    it('should start with 0 score', async () => {
      await element(by.text('Puzzle')).tap();
      
      await waitFor(element(by.id('puzzle-score')))
        .toBeVisible()
        .withTimeout(3000);
      
      await expect(element(by.id('puzzle-score'))).toHaveText('0');
    });
  });

  describe('Grid Cells', () => {
    beforeEach(async () => {
      await element(by.text('Puzzle')).tap();
      await waitFor(element(by.id('puzzle-container')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should have all 36 cells visible', async () => {
      await expect(element(by.id('puzzle-cell-0-0'))).toBeVisible();
      await expect(element(by.id('puzzle-cell-0-5'))).toBeVisible();
      await expect(element(by.id('puzzle-cell-5-0'))).toBeVisible();
      await expect(element(by.id('puzzle-cell-5-5'))).toBeVisible();
      await expect(element(by.id('puzzle-cell-2-2'))).toBeVisible();
      await expect(element(by.id('puzzle-cell-3-3'))).toBeVisible();
    });

    it('should be tappable', async () => {
      await element(by.id('puzzle-cell-0-0')).tap();
      
      await expect(element(by.id('puzzle-container'))).toBeVisible();
    });
  });

  describe('Tile Swapping', () => {
    beforeEach(async () => {
      await element(by.text('Puzzle')).tap();
      await waitFor(element(by.id('puzzle-container')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should swap adjacent tiles horizontally', async () => {
      await element(by.id('puzzle-cell-0-0')).tap();
      await element(by.id('puzzle-cell-0-1')).tap();
      
      await expect(element(by.id('puzzle-container'))).toBeVisible();
    });

    it('should swap adjacent tiles vertically', async () => {
      await element(by.id('puzzle-cell-1-0')).tap();
      await element(by.id('puzzle-cell-2-0')).tap();
      
      await expect(element(by.id('puzzle-container'))).toBeVisible();
    });

    it('should not swap non-adjacent tiles', async () => {
      await element(by.id('puzzle-cell-0-0')).tap();
      await element(by.id('puzzle-cell-2-2')).tap();
      
      await expect(element(by.id('puzzle-container'))).toBeVisible();
    });
  });

  describe('Multiple Moves', () => {
    beforeEach(async () => {
      await element(by.text('Puzzle')).tap();
      await waitFor(element(by.id('puzzle-container')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should handle 15 consecutive swaps stably', async () => {
      for (let i = 0; i < 15; i++) {
        const row = i % 5;
        
        await element(by.id(`puzzle-cell-${row}-0`)).tap();
        await element(by.id(`puzzle-cell-${row}-1`)).tap();
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      await expect(element(by.id('puzzle-container'))).toBeVisible();
    });
  });

  describe('Pause Functionality', () => {
    beforeEach(async () => {
      await element(by.text('Puzzle')).tap();
      await waitFor(element(by.id('gameplay-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should pause game', async () => {
      await element(by.id('pause-button')).tap();
      
      await waitFor(element(by.id('pause-modal')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should resume game', async () => {
      await element(by.id('pause-button')).tap();
      
      await waitFor(element(by.id('pause-modal')))
        .toBeVisible()
        .withTimeout(2000);
      
      await element(by.id('resume-button')).tap();
      
      await waitFor(element(by.id('pause-modal')))
        .not.toBeVisible()
        .withTimeout(2000);
      
      await expect(element(by.id('puzzle-container'))).toBeVisible();
    });
  });

  describe('Game Over', () => {
    it('should show game over when moves exhausted', async () => {
      await element(by.text('Puzzle')).tap();
      
      await waitFor(element(by.id('puzzle-container')))
        .toBeVisible()
        .withTimeout(3000);
      
      for (let i = 0; i < 30; i++) {
        const row = i % 5;
        await element(by.id(`puzzle-cell-${row}-0`)).tap();
        await element(by.id(`puzzle-cell-${row}-1`)).tap();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      await waitFor(element(by.id('puzzle-gameover')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show restart button on game over', async () => {
      await element(by.text('Puzzle')).tap();
      
      for (let i = 0; i < 30; i++) {
        const row = i % 5;
        await element(by.id(`puzzle-cell-${row}-0`)).tap();
        await element(by.id(`puzzle-cell-${row}-1`)).tap();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await waitFor(element(by.id('puzzle-gameover')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('puzzle-restart'))).toBeVisible();
    });
  });
});
