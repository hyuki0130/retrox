import {
  RewardedAd,
  InterstitialAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { AdService } from '../adService';

describe('AdService', () => {
  let mockRewardedAd: {
    addAdEventListener: jest.Mock;
    load: jest.Mock;
    show: jest.Mock;
  };

  let mockInterstitialAd: {
    addAdEventListener: jest.Mock;
    load: jest.Mock;
    show: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRewardedAd = {
      addAdEventListener: jest.fn(() => jest.fn()),
      load: jest.fn(),
      show: jest.fn(() => Promise.resolve()),
    };

    mockInterstitialAd = {
      addAdEventListener: jest.fn(() => jest.fn()),
      load: jest.fn(),
      show: jest.fn(() => Promise.resolve()),
    };

    (RewardedAd.createForAdRequest as jest.Mock).mockReturnValue(mockRewardedAd);
    (InterstitialAd.createForAdRequest as jest.Mock).mockReturnValue(mockInterstitialAd);
  });

  describe('initializeRewardedAd', () => {
    it('should create a rewarded ad request', async () => {
      mockRewardedAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === RewardedAdEventType.LOADED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });

      await AdService.initializeRewardedAd();

      expect(RewardedAd.createForAdRequest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          requestNonPersonalizedAdsOnly: true,
        })
      );
    });

    it('should call load on the ad', async () => {
      mockRewardedAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === RewardedAdEventType.LOADED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });

      await AdService.initializeRewardedAd();

      expect(mockRewardedAd.load).toHaveBeenCalled();
    });

    it('should resolve when ad is loaded', async () => {
      mockRewardedAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === RewardedAdEventType.LOADED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });

      await expect(AdService.initializeRewardedAd()).resolves.toBeUndefined();
    });

    it('should reject when ad fails to load', async () => {
      const mockError = new Error('Ad load failed');

      mockRewardedAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === AdEventType.ERROR) {
          setTimeout(() => callback(mockError), 0);
        }
        return jest.fn();
      });

      await expect(AdService.initializeRewardedAd()).rejects.toThrow('Ad load failed');
    });
  });

  describe('showRewardedAd', () => {
    beforeEach(async () => {
      mockRewardedAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === RewardedAdEventType.LOADED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });
      await AdService.initializeRewardedAd();
    });

    it('should show the rewarded ad', async () => {
      mockRewardedAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === AdEventType.CLOSED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });

      const onRewarded = jest.fn();
      await AdService.showRewardedAd(onRewarded);

      expect(mockRewardedAd.show).toHaveBeenCalled();
    });

    it('should call onRewarded callback when reward is earned', async () => {
      const onRewarded = jest.fn();
      let earnedCallback: () => void;
      let closedCallback: () => void;

      mockRewardedAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === RewardedAdEventType.EARNED_REWARD) {
          earnedCallback = callback;
        }
        if (event === AdEventType.CLOSED) {
          closedCallback = callback;
        }
        return jest.fn();
      });

      const showPromise = AdService.showRewardedAd(onRewarded);

      setTimeout(() => {
        earnedCallback();
        closedCallback();
      }, 0);

      await showPromise;

      expect(onRewarded).toHaveBeenCalled();
    });

    it('should reject if ad is not loaded', async () => {
      jest.resetModules();
      const freshAdService = require('../adService').AdService;

      const onRewarded = jest.fn();
      await expect(freshAdService.showRewardedAd(onRewarded)).rejects.toThrow(
        'Rewarded ad not loaded'
      );
    });
  });

  describe('initializeInterstitialAd', () => {
    it('should create an interstitial ad request', async () => {
      mockInterstitialAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === AdEventType.LOADED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });

      await AdService.initializeInterstitialAd();

      expect(InterstitialAd.createForAdRequest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          requestNonPersonalizedAdsOnly: true,
        })
      );
    });

    it('should call load on the ad', async () => {
      mockInterstitialAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === AdEventType.LOADED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });

      await AdService.initializeInterstitialAd();

      expect(mockInterstitialAd.load).toHaveBeenCalled();
    });

    it('should reject when ad fails to load', async () => {
      const mockError = new Error('Interstitial load failed');

      mockInterstitialAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === AdEventType.ERROR) {
          setTimeout(() => callback(mockError), 0);
        }
        return jest.fn();
      });

      await expect(AdService.initializeInterstitialAd()).rejects.toThrow(
        'Interstitial load failed'
      );
    });
  });

  describe('showInterstitialAd', () => {
    beforeEach(async () => {
      mockInterstitialAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === AdEventType.LOADED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });
      await AdService.initializeInterstitialAd();
    });

    it('should show the interstitial ad', async () => {
      mockInterstitialAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === AdEventType.CLOSED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });

      await AdService.showInterstitialAd();

      expect(mockInterstitialAd.show).toHaveBeenCalled();
    });

    it('should reject if ad is not loaded', async () => {
      jest.resetModules();
      const freshAdService = require('../adService').AdService;

      await expect(freshAdService.showInterstitialAd()).rejects.toThrow(
        'Interstitial ad not loaded'
      );
    });
  });

  describe('preloadAds', () => {
    it('should initialize both ad types', async () => {
      mockRewardedAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === RewardedAdEventType.LOADED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });

      mockInterstitialAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === AdEventType.LOADED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });

      await AdService.preloadAds();

      expect(RewardedAd.createForAdRequest).toHaveBeenCalled();
      expect(InterstitialAd.createForAdRequest).toHaveBeenCalled();
    });

    it('should not throw if one ad type fails to load', async () => {
      mockRewardedAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === AdEventType.ERROR) {
          setTimeout(() => callback(new Error('Failed')), 0);
        }
        return jest.fn();
      });

      mockInterstitialAd.addAdEventListener.mockImplementation((event, callback) => {
        if (event === AdEventType.LOADED) {
          setTimeout(() => callback(), 0);
        }
        return jest.fn();
      });

      await expect(AdService.preloadAds()).resolves.toBeUndefined();
    });
  });
});
