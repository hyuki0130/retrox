import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '@/navigation/types';
import { useSettingsStore, useCoinStore } from '@/store';
import { AdService } from '@/services/adService';

type ResultsRouteProp = RootStackScreenProps<'Results'>['route'];

const COIN_REWARD = 50;

export const ResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ResultsRouteProp>();
  const insets = useSafeAreaInsets();
  const { score, gameId, highScore } = route.params;
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const { addCoins, rewardFromAd } = useCoinStore();
  const colors = getThemeColors();

  const [hasDoubled, setHasDoubled] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const isNewHighScore = score > highScore;
  const earnedCoins = Math.floor(score / 1000) * 10 + COIN_REWARD;

  const handleWatchAd = async () => {
    setIsLoadingAd(true);
    try {
      await AdService.initializeRewardedAd();
      await AdService.showRewardedAd(() => {
        rewardFromAd();
        setHasDoubled(true);
      });
    } catch (error) {
      Alert.alert('Ad Not Available', 'Please try again later.');
    } finally {
      setIsLoadingAd(false);
    }
  };

  const handlePlayAgain = () => {
    navigation.navigate('Gameplay', { gameId });
  };

  const handleGoHome = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.primary }]}>GAME OVER</Text>
      
      {isNewHighScore && (
        <View style={[styles.highScoreBadge, { backgroundColor: colors.secondary }]}>
          <Text style={styles.highScoreBadgeText}>NEW HIGH SCORE!</Text>
        </View>
      )}
      
      <View style={styles.scoreSection}>
        <Text style={[styles.label, { color: colors.text }]}>SCORE</Text>
        <Text style={[styles.score, { color: colors.primary }]}>
          {score.toLocaleString()}
        </Text>
      </View>

      <View style={styles.scoreSection}>
        <Text style={[styles.label, { color: colors.text }]}>HIGH SCORE</Text>
        <Text style={[styles.highScore, { color: colors.text }]}>
          {Math.max(score, highScore).toLocaleString()}
        </Text>
      </View>

      <View style={[styles.coinsCard, { backgroundColor: '#1a1a1a' }]}>
        <Text style={styles.coinIcon}>💰</Text>
        <View style={styles.coinInfo}>
          <Text style={[styles.coinLabel, { color: colors.text }]}>Coins Earned</Text>
          <Text style={[styles.coinValue, { color: colors.primary }]}>
            +{hasDoubled ? earnedCoins * 2 : earnedCoins}
          </Text>
        </View>
        {hasDoubled && (
          <View style={[styles.doubledBadge, { backgroundColor: colors.secondary }]}>
            <Text style={styles.doubledText}>2X</Text>
          </View>
        )}
      </View>

      {!hasDoubled && (
        <TouchableOpacity 
          style={[styles.adButton, { backgroundColor: colors.secondary }]}
          onPress={handleWatchAd}
          disabled={isLoadingAd}
        >
          {isLoadingAd ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.adIcon}>🎬</Text>
              <Text style={styles.adButtonText}>Watch Ad to Double Coins!</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handlePlayAgain}
        >
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.homeButton]}
          onPress={handleGoHome}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 40,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 24,
  },
  highScoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  highScoreBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  scoreSection: {
    alignItems: 'center',
    marginTop: 32,
  },
  label: {
    fontSize: 12,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  score: {
    fontSize: 56,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  highScore: {
    fontSize: 28,
    fontFamily: 'monospace',
  },
  coinsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  coinIcon: {
    fontSize: 32,
  },
  coinInfo: {
    flex: 1,
    marginLeft: 12,
  },
  coinLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  coinValue: {
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  doubledBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  doubledText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  adButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  adIcon: {
    fontSize: 20,
  },
  adButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
