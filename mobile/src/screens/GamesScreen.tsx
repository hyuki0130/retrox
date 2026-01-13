import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore, useCoinStore } from '@/store';
import type { Game } from '@/navigation/types';

const ALL_GAMES: Game[] = [
  { id: 'shooter', name: 'Space Shooter', icon: '🚀', difficulty: 'hard', coinCost: 200, isLocked: false, isNew: true, description: 'Galaga-style vertical shooter' },
  { id: 'puzzle', name: 'Match Puzzle', icon: '🧩', difficulty: 'medium', coinCost: 150, isLocked: false, description: 'Match-3 puzzle game' },
  { id: 'tetris', name: 'Block Drop', icon: '🟦', difficulty: 'medium', coinCost: 150, isLocked: true, description: 'Classic block stacking' },
  { id: 'pacman', name: 'Maze Runner', icon: '🟡', difficulty: 'hard', coinCost: 250, isLocked: true, description: 'Navigate the maze' },
  { id: 'snake', name: 'Snake', icon: '🐍', difficulty: 'easy', coinCost: 100, isLocked: true, description: 'Classic snake game' },
  { id: 'pong', name: 'Pong', icon: '🏓', difficulty: 'easy', coinCost: 100, isLocked: true, description: 'Table tennis classic' },
  { id: 'breakout', name: 'Brick Breaker', icon: '🧱', difficulty: 'medium', coinCost: 150, isLocked: true, description: 'Break all the bricks' },
  { id: 'asteroids', name: 'Asteroids', icon: '☄️', difficulty: 'hard', coinCost: 200, isLocked: true, description: 'Destroy the asteroids' },
];

const DIFFICULTY_COLORS: Record<Game['difficulty'], string> = {
  easy: '#00ff9d',
  medium: '#ffcc00',
  hard: '#ff0066',
};

export const GamesScreen: React.FC = () => {
  const navigation = useNavigation();
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const { coins, spendCoins } = useCoinStore();
  const colors = getThemeColors();

  const handleGamePress = (game: Game) => {
    if (game.isLocked) {
      Alert.alert('Locked', 'This game is coming soon!');
      return;
    }
    if (coins < game.coinCost) {
      Alert.alert('Insufficient Coins', 'Watch an ad to earn more coins!');
      return;
    }
    spendCoins(game.coinCost);
    navigation.navigate('Gameplay', { gameId: game.id });
  };

  const renderGameItem = ({ item }: { item: Game }) => (
    <TouchableOpacity
      style={[styles.gameCard, { backgroundColor: '#1a1a1a' }, item.isLocked && styles.lockedCard]}
      onPress={() => handleGamePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.gameHeader}>
        <Text style={styles.gameIcon}>{item.isLocked ? '🔒' : item.icon}</Text>
        {item.isNew && (
          <View style={[styles.newBadge, { backgroundColor: colors.secondary }]}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
      </View>
      <Text style={[styles.gameName, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.gameDescription, { color: colors.text }]} numberOfLines={1}>
        {item.description}
      </Text>
      <View style={styles.gameFooter}>
        <Text style={[styles.difficulty, { color: DIFFICULTY_COLORS[item.difficulty] }]}>
          {item.difficulty.toUpperCase()}
        </Text>
        <View style={styles.costContainer}>
          <Text style={styles.coinIcon}>💰</Text>
          <Text style={[styles.cost, { color: colors.primary }]}>{item.coinCost}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>GAMES</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>{ALL_GAMES.length} games available</Text>
      </View>
      <FlatList
        data={ALL_GAMES}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginTop: 4,
    opacity: 0.7,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  gameCard: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    padding: 12,
    maxWidth: '48%',
  },
  lockedCard: {
    opacity: 0.5,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gameIcon: {
    fontSize: 32,
  },
  newBadge: {
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
  gameName: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 10,
    fontFamily: 'monospace',
    opacity: 0.6,
    marginBottom: 8,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficulty: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
