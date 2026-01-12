import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '@/navigation/types';
import { useSettingsStore } from '@/store';

type ResultsRouteProp = RootStackScreenProps<'Results'>['route'];

export const ResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ResultsRouteProp>();
  const { score, gameId, highScore } = route.params;
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const colors = getThemeColors();

  const isNewHighScore = score > highScore;

  const handlePlayAgain = () => {
    navigation.navigate('Gameplay', { gameId });
  };

  const handleGoHome = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>GAME OVER</Text>
      
      {isNewHighScore && (
        <Text style={[styles.newHighScore, { color: colors.secondary }]}>
          NEW HIGH SCORE!
        </Text>
      )}
      
      <View style={styles.scoreContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Score</Text>
        <Text style={[styles.score, { color: colors.primary }]}>
          {score.toLocaleString()}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={[styles.label, { color: colors.text }]}>High Score</Text>
        <Text style={[styles.highScore, { color: colors.text }]}>
          {Math.max(score, highScore).toLocaleString()}
        </Text>
      </View>

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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  newHighScore: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 8,
  },
  scoreContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  score: {
    fontSize: 48,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  highScore: {
    fontSize: 24,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginTop: 48,
    width: '100%',
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
