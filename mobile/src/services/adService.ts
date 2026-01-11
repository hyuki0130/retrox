import {
  RewardedAd,
  RewardedAdEventType,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-xxxxx/xxxxx';

const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-xxxxx/xxxxx';

let rewardedAd: RewardedAd | null = null;
let interstitialAd: InterstitialAd | null = null;

export const AdService = {
  initializeRewardedAd: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          unsubscribeLoaded();
          resolve();
        }
      );

      const unsubscribeError = rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        (error) => {
          unsubscribeError();
          reject(error);
        }
      );

      rewardedAd.load();
    });
  },

  showRewardedAd: (onRewarded: () => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!rewardedAd) {
        reject(new Error('Rewarded ad not loaded'));
        return;
      }

      const unsubscribeEarned = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          unsubscribeEarned();
          onRewarded();
        }
      );

      const unsubscribeClosed = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeClosed();
          resolve();
          AdService.initializeRewardedAd().catch(console.warn);
        }
      );

      rewardedAd.show().catch(reject);
    });
  },

  initializeInterstitialAd: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      interstitialAd = InterstitialAd.createForAdRequest(
        INTERSTITIAL_AD_UNIT_ID,
        {
          requestNonPersonalizedAdsOnly: true,
        }
      );

      const unsubscribeLoaded = interstitialAd.addAdEventListener(
        AdEventType.LOADED,
        () => {
          unsubscribeLoaded();
          resolve();
        }
      );

      const unsubscribeError = interstitialAd.addAdEventListener(
        AdEventType.ERROR,
        (error) => {
          unsubscribeError();
          reject(error);
        }
      );

      interstitialAd.load();
    });
  },

  showInterstitialAd: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!interstitialAd) {
        reject(new Error('Interstitial ad not loaded'));
        return;
      }

      const unsubscribeClosed = interstitialAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeClosed();
          resolve();
          AdService.initializeInterstitialAd().catch(console.warn);
        }
      );

      interstitialAd.show().catch(reject);
    });
  },

  preloadAds: async (): Promise<void> => {
    await Promise.allSettled([
      AdService.initializeRewardedAd(),
      AdService.initializeInterstitialAd(),
    ]);
  },
};
