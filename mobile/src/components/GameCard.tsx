import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCoinStore, useSettingsStore } from '@/store';
import type { Game } from '@/navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - SPACING * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

interface GameCardProps {
  game: Game;
}

const DIFFICULTY_STARS: Record<Game['difficulty'], string> = {
  easy: '⭐',
  medium: '⭐⭐',
  hard: '⭐⭐⭐',
};

const DIFFICULTY_COLORS: Record<Game['difficulty'], string> = {
  easy: '#00ff9d',
  medium: '#ffcc00',
  hard: '#ff0066',
};

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const navigation = useNavigation();
  const { coins, spendCoins } = useCoinStore();
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const colors = getThemeColors();

  const handlePress = () => {
    if (game.isLocked) {
      Alert.alert('Locked Game', 'This game is still locked.');
      return;
    }
    if (coins < game.coinCost) {
      Alert.alert('Insufficient Coins', 'Not enough coins.\nWatch an ad to earn more!');
      return;
    }
    spendCoins(game.coinCost);
    navigation.navigate('Gameplay', { gameId: game.id });
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: '#1a1a1a' },
        game.isLocked && styles.lockedCard,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {game.isNew && (
        <View style={[styles.newBadge, { backgroundColor: colors.secondary }]}>
          <Text style={styles.badgeText}>NEW</Text>
        </View>
      )}
      
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{game.isLocked ? '🔒' : game.icon}</Text>
      </View>
      
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {game.name}
      </Text>
      
      <Text style={[styles.difficulty, { color: DIFFICULTY_COLORS[game.difficulty] }]}>
        {DIFFICULTY_STARS[game.difficulty]}
      </Text>
      
      <View style={styles.costRow}>
        <Text style={styles.coinIcon}>💰</Text>
        <Text style={[styles.cost, { color: colors.primary }]}>
          {game.coinCost}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const GAME_CARD_WIDTH = CARD_WIDTH;
export const GAME_CARD_SPACING = SPACING;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    aspectRatio: 0.85,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING,
  },
  lockedCard: {
    opacity: 0.5,
  },
  newBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  difficulty: {
    fontSize: 10,
    marginTop: 4,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  coinIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  cost: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
