import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore, useCoinStore } from '@/store';
import type { Game } from '@/navigation/types';

const ALL_GAMES: Game[] = [
  { id: 'shooter', name: 'Space Shooter', icon: '🚀', difficulty: 'hard', coinCost: 200, isLocked: false, isNew: true, description: 'Galaga-style vertical shooter' },
  { id: 'puzzle', name: 'Match Puzzle', icon: '🧩', difficulty: 'medium', coinCost: 150, isLocked: false, description: 'Match-3 puzzle game' },
  { id: 'tetris', name: 'Block Drop', icon: '🟦', difficulty: 'medium', coinCost: 150, isLocked: true, description: 'Classic block stacking' },
  { id: 'pacman', name: 'Maze Runner', icon: '🟡', difficulty: 'hard', coinCost: 250, isLocked: true, description: 'Navigate the maze' },
  { id: 'snake', name: 'Snake', icon: '🐍', difficulty: 'easy', coinCost: 100, isLocked: false, isNew: true, description: 'Classic snake game' },
  { id: 'pong', name: 'Pong', icon: '🏓', difficulty: 'easy', coinCost: 100, isLocked: false, isNew: true, description: 'Table tennis classic' },
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
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleGamePress = (game: Game) => {
    if (game.isLocked) {
      Alert.alert('Locked', 'This game is coming soon!');
      return;
    }
    if (coins < game.coinCost) {
      Alert.alert(
        'Insufficient Coins',
        'Watch an ad to earn more coins!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Get Coins', onPress: () => navigation.navigate('CoinCharge') },
        ]
      );
      return;
    }
    setSelectedGame(game);
    setShowConfirmModal(true);
  };

  const handleConfirmPlay = () => {
    if (!selectedGame) return;
    spendCoins(selectedGame.coinCost);
    setShowConfirmModal(false);
    setSelectedGame(null);
    navigation.navigate('Gameplay', { gameId: selectedGame.id });
  };

  const handleCancelPlay = () => {
    setShowConfirmModal(false);
    setSelectedGame(null);
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

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelPlay}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#1a1a1a', borderColor: colors.primary }]}>
            {selectedGame && (
              <>
                <Text style={styles.modalIcon}>{selectedGame.icon}</Text>
                <Text style={[styles.modalTitle, { color: colors.text }]} testID="confirm-game-name">
                  {selectedGame.name}
                </Text>
                <Text style={[styles.modalDescription, { color: colors.text }]}>
                  {selectedGame.description}
                </Text>

                <View style={styles.modalCostRow}>
                  <Text style={[styles.modalCostLabel, { color: colors.text }]}>Cost:</Text>
                  <View style={styles.costContainer}>
                    <Text style={styles.coinIcon}>💰</Text>
                    <Text style={[styles.modalCostValue, { color: colors.secondary }]}>
                      {selectedGame.coinCost}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalBalanceRow}>
                  <Text style={[styles.modalBalanceLabel, { color: colors.text }]}>Balance:</Text>
                  <View style={styles.costContainer}>
                    <Text style={styles.coinIcon}>💰</Text>
                    <Text style={[styles.modalBalanceValue, { color: colors.primary }]} testID="confirm-coin-balance">
                      {coins.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelPlay}
                    testID="confirm-cancel-button"
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={handleConfirmPlay}
                    testID="confirm-play-button"
                  >
                    <Text style={styles.playButtonText}>Play</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: 'monospace',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  modalCostLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  modalCostValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  modalBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  modalBalanceLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  modalBalanceValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  playButtonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
