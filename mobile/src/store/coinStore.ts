import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INITIAL_COINS = 10000;
const AD_REWARD_COINS = 800;

interface CoinStore {
  coins: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  rewardFromAd: () => void;
  resetCoins: () => void;
}

export const useCoinStore = create<CoinStore>()(
  persist(
    (set, get) => ({
      coins: INITIAL_COINS,

      addCoins: (amount: number) => {
        if (amount <= 0) return;
        set((state) => ({ coins: state.coins + amount }));
      },

      spendCoins: (amount: number) => {
        const current = get().coins;
        if (amount <= 0 || current < amount) return false;
        set({ coins: current - amount });
        return true;
      },

      rewardFromAd: () => {
        set((state) => ({ coins: state.coins + AD_REWARD_COINS }));
      },

      resetCoins: () => {
        set({ coins: INITIAL_COINS });
      },
    }),
    {
      name: 'retrox-coin-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
