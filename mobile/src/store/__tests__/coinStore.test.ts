import { useCoinStore } from '../coinStore';

describe('coinStore', () => {
  beforeEach(() => {
    useCoinStore.setState({ coins: 10000 });
  });

  describe('initial state', () => {
    it('should have initial coins of 10000', () => {
      const { coins } = useCoinStore.getState();
      expect(coins).toBe(10000);
    });
  });

  describe('addCoins', () => {
    it('should add coins to current balance', () => {
      const { addCoins } = useCoinStore.getState();
      addCoins(500);
      expect(useCoinStore.getState().coins).toBe(10500);
    });

    it('should not add coins when amount is 0', () => {
      const { addCoins } = useCoinStore.getState();
      addCoins(0);
      expect(useCoinStore.getState().coins).toBe(10000);
    });

    it('should not add coins when amount is negative', () => {
      const { addCoins } = useCoinStore.getState();
      addCoins(-100);
      expect(useCoinStore.getState().coins).toBe(10000);
    });

    it('should accumulate multiple additions', () => {
      const { addCoins } = useCoinStore.getState();
      addCoins(100);
      addCoins(200);
      addCoins(300);
      expect(useCoinStore.getState().coins).toBe(10600);
    });
  });

  describe('spendCoins', () => {
    it('should deduct coins and return true when sufficient balance', () => {
      const { spendCoins } = useCoinStore.getState();
      const result = spendCoins(500);
      expect(result).toBe(true);
      expect(useCoinStore.getState().coins).toBe(9500);
    });

    it('should not deduct and return false when insufficient balance', () => {
      const { spendCoins } = useCoinStore.getState();
      const result = spendCoins(15000);
      expect(result).toBe(false);
      expect(useCoinStore.getState().coins).toBe(10000);
    });

    it('should not deduct and return false when amount is 0', () => {
      const { spendCoins } = useCoinStore.getState();
      const result = spendCoins(0);
      expect(result).toBe(false);
      expect(useCoinStore.getState().coins).toBe(10000);
    });

    it('should not deduct and return false when amount is negative', () => {
      const { spendCoins } = useCoinStore.getState();
      const result = spendCoins(-100);
      expect(result).toBe(false);
      expect(useCoinStore.getState().coins).toBe(10000);
    });

    it('should allow spending exact balance', () => {
      const { spendCoins } = useCoinStore.getState();
      const result = spendCoins(10000);
      expect(result).toBe(true);
      expect(useCoinStore.getState().coins).toBe(0);
    });

    it('should handle multiple spend operations', () => {
      const { spendCoins } = useCoinStore.getState();
      spendCoins(1000);
      spendCoins(2000);
      spendCoins(3000);
      expect(useCoinStore.getState().coins).toBe(4000);
    });
  });

  describe('rewardFromAd', () => {
    it('should add 800 coins from ad reward', () => {
      const { rewardFromAd } = useCoinStore.getState();
      rewardFromAd();
      expect(useCoinStore.getState().coins).toBe(10800);
    });

    it('should accumulate multiple ad rewards', () => {
      const { rewardFromAd } = useCoinStore.getState();
      rewardFromAd();
      rewardFromAd();
      rewardFromAd();
      expect(useCoinStore.getState().coins).toBe(12400);
    });
  });

  describe('resetCoins', () => {
    it('should reset coins to initial value', () => {
      useCoinStore.setState({ coins: 5000 });
      const { resetCoins } = useCoinStore.getState();
      resetCoins();
      expect(useCoinStore.getState().coins).toBe(10000);
    });

    it('should reset from 0 to initial value', () => {
      useCoinStore.setState({ coins: 0 });
      const { resetCoins } = useCoinStore.getState();
      resetCoins();
      expect(useCoinStore.getState().coins).toBe(10000);
    });

    it('should reset from higher value to initial', () => {
      useCoinStore.setState({ coins: 50000 });
      const { resetCoins } = useCoinStore.getState();
      resetCoins();
      expect(useCoinStore.getState().coins).toBe(10000);
    });
  });

  describe('integration scenarios', () => {
    it('should handle play session: spend, reward, spend cycle', () => {
      const store = useCoinStore.getState();

      store.spendCoins(500);
      expect(useCoinStore.getState().coins).toBe(9500);

      store.rewardFromAd();
      expect(useCoinStore.getState().coins).toBe(10300);

      store.spendCoins(800);
      expect(useCoinStore.getState().coins).toBe(9500);
    });

    it('should handle bankruptcy scenario', () => {
      const store = useCoinStore.getState();

      store.spendCoins(10000);
      expect(useCoinStore.getState().coins).toBe(0);

      const failedSpend = store.spendCoins(100);
      expect(failedSpend).toBe(false);

      store.rewardFromAd();
      expect(useCoinStore.getState().coins).toBe(800);

      const successfulSpend = store.spendCoins(500);
      expect(successfulSpend).toBe(true);
      expect(useCoinStore.getState().coins).toBe(300);
    });
  });
});
