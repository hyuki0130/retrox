import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '@/navigation/types';
import { useSettingsStore, useCoinStore } from '@/store';
import { ShooterGame } from '@/games/shooter';
import { PuzzleGame } from '@/games/puzzle';
import { SnakeGame } from '@/games/snake';
import { PongGame } from '@/games/pong';
import { BlockDropGame } from '@/games/blockdrop';

type GameplayRouteProp = RootStackScreenProps<'Gameplay'>['route'];

const GAME_REWARDS: Record<string, number> = {
  shooter: 100,
  puzzle: 80,
  snake: 60,
  pong: 60,
  tetris: 70,
};

export const GameplayScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<GameplayRouteProp>();
  const { gameId } = route.params;
  const insets = useSafeAreaInsets();
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const addCoins = useCoinStore((s) => s.addCoins);
  const colors = getThemeColors();
  
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleGameOver = useCallback((finalScore: number) => {
    const baseReward = GAME_REWARDS[gameId] || 50;
    const bonusCoins = Math.floor(finalScore / 1000) * 10;
    addCoins(bonusCoins);
    
    navigation.navigate('Results', {
      score: finalScore,
      gameId,
      highScore: 150000,
    });
  }, [navigation, gameId, addCoins]);

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleQuit = () => {
    navigation.goBack();
  };

  const renderGame = () => {
    switch (gameId) {
      case 'shooter':
        return (
          <ShooterGame 
            onGameOver={handleGameOver}
            onScoreChange={handleScoreChange}
          />
        );
      case 'puzzle':
        return (
          <PuzzleGame 
            onGameOver={handleGameOver}
            onScoreChange={handleScoreChange}
          />
        );
      case 'snake':
        return (
          <SnakeGame 
            onGameOver={handleGameOver}
            onScoreChange={handleScoreChange}
          />
        );
      case 'pong':
        return (
          <PongGame 
            onGameOver={handleGameOver}
            onScoreChange={handleScoreChange}
          />
        );
      case 'tetris':
        return (
          <BlockDropGame 
            onGameOver={handleGameOver}
            onScoreChange={handleScoreChange}
          />
        );
      default:
        return (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderText, { color: colors.text }]}>
              Game "{gameId}" coming soon!
            </Text>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: colors.primary }]}
              onPress={handleQuit}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View testID="gameplay-screen" style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={[styles.hud, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity testID="pause-button" style={styles.pauseButton} onPress={handlePause}>
          <Text style={styles.pauseIcon}>⏸️</Text>
        </TouchableOpacity>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreLabel, { color: colors.text }]}>SCORE</Text>
          <Text testID="gameplay-score" style={[styles.scoreValue, { color: colors.primary }]}>
            {score.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={[styles.gameContainer, { paddingTop: insets.top + 60, paddingBottom: insets.bottom }]}>
        {renderGame()}
      </View>

      {isPaused && (
        <View testID="pause-modal" style={styles.pauseOverlay}>
          <View style={[styles.pauseModal, { backgroundColor: '#1a1a1a' }]}>
            <Text style={[styles.pauseTitle, { color: colors.primary }]}>PAUSED</Text>
            <TouchableOpacity 
              testID="resume-button"
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleResume}
            >
              <Text style={styles.modalButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="quit-button"
              style={[styles.modalButton, styles.quitButton]}
              onPress={handleQuit}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: {
    fontSize: 20,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  scoreValue: {
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  pauseModal: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  pauseTitle: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  quitButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
