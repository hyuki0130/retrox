import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore, useCoinStore } from '@/store';
import { AdService } from '@/services/adService';

type AdState = 'ready' | 'loading' | 'unavailable';

export const CoinChargeScreen: React.FC = () => {
  const navigation = useNavigation();
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const { coins, rewardFromAd } = useCoinStore();
  const colors = getThemeColors();
  
  const [adState, setAdState] = useState<AdState>('loading');

  useEffect(() => {
    loadAd();
  }, []);

  const loadAd = async () => {
    setAdState('loading');
    try {
      await AdService.initializeRewardedAd();
      setAdState('ready');
    } catch {
      setAdState('unavailable');
    }
  };

  const handleWatchAd = async () => {
    if (adState !== 'ready') return;
    
    setAdState('loading');
    try {
      await AdService.showRewardedAd(() => {
        rewardFromAd();
        Alert.alert('Reward Received!', 'You earned 800 coins!');
      });
      setAdState('loading');
      await loadAd();
    } catch {
      Alert.alert('Ad Error', 'Failed to show ad. Please try again.');
      setAdState('unavailable');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} testID="coin-charge-back">
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primary }]}>COIN CHARGE</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceLabel, { color: colors.text }]}>Current Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.coinIcon}>💰</Text>
            <Text style={[styles.balanceValue, { color: colors.primary }]} testID="coin-balance">
              {coins.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={[styles.adCard, { backgroundColor: '#1a1a1a', borderColor: colors.primary }]}>
          <Text style={styles.adIcon}>🎬</Text>
          <Text style={[styles.adTitle, { color: colors.text }]}>Watch Ad</Text>
          <Text style={[styles.adDescription, { color: colors.text }]}>
            Watch a short video to earn coins
          </Text>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardIcon}>💰</Text>
            <Text style={[styles.rewardAmount, { color: colors.secondary }]}>+800</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.watchButton,
              { backgroundColor: adState === 'ready' ? colors.primary : '#333' },
            ]}
            onPress={handleWatchAd}
            disabled={adState !== 'ready'}
            testID="watch-ad-button"
          >
            {adState === 'loading' ? (
              <ActivityIndicator color="#000" testID="ad-loading" />
            ) : (
              <Text style={styles.watchButtonText}>
                {adState === 'ready' ? 'WATCH NOW' : 'AD UNAVAILABLE'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.hint, { color: colors.text }]}>
          Tip: Watch ads to keep playing your favorite games!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
    opacity: 0.7,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    fontSize: 32,
    marginRight: 8,
  },
  balanceValue: {
    fontSize: 48,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  adCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 24,
  },
  adIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  adTitle: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  adDescription: {
    fontSize: 14,
    fontFamily: 'monospace',
    opacity: 0.7,
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  rewardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  rewardAmount: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  watchButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  watchButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    opacity: 0.5,
  },
});
