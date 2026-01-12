import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSettingsStore } from '@/store';
import { GameCard, GAME_CARD_SPACING } from './GameCard';
import type { Game } from '@/navigation/types';

const GAMES: Game[] = [
  { 
    id: 'shooter', 
    name: 'Shooter', 
    icon: '🔫', 
    difficulty: 'hard', 
    coinCost: 200, 
    isLocked: false, 
    isNew: true 
  },
  { 
    id: 'puzzle', 
    name: 'Puzzle', 
    icon: '🧩', 
    difficulty: 'medium', 
    coinCost: 300, 
    isLocked: false 
  },
  { 
    id: 'tetris', 
    name: 'Tetris', 
    icon: '🟦', 
    difficulty: 'easy', 
    coinCost: 150, 
    isLocked: true 
  },
  { 
    id: 'pacman', 
    name: 'Pac-Man', 
    icon: '🟡', 
    difficulty: 'medium', 
    coinCost: 250, 
    isLocked: true 
  },
  { 
    id: 'snake', 
    name: 'Snake', 
    icon: '🐍', 
    difficulty: 'easy', 
    coinCost: 100, 
    isLocked: true 
  },
  { 
    id: 'pong', 
    name: 'Pong', 
    icon: '🏓', 
    difficulty: 'easy', 
    coinCost: 100, 
    isLocked: true 
  },
];

export const GameGrid: React.FC = () => {
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const colors = getThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        ALL GAMES
      </Text>
      <FlatList
        data={GAMES}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameCard game={item} />}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  grid: {
    paddingBottom: 100,
  },
});
