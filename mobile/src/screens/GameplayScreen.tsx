import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '@/navigation/types';
import { useSettingsStore } from '@/store';

type GameplayRouteProp = RootStackScreenProps<'Gameplay'>['route'];

export const GameplayScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<GameplayRouteProp>();
  const { gameId } = route.params;
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const colors = getThemeColors();

  const handleEndGame = () => {
    navigation.navigate('Results', {
      score: Math.floor(Math.random() * 100000),
      gameId,
      highScore: 150000,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>GAMEPLAY</Text>
      <Text style={[styles.gameId, { color: colors.text }]}>Game: {gameId}</Text>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.secondary }]}
        onPress={handleEndGame}
      >
        <Text style={styles.buttonText}>End Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  gameId: {
    fontSize: 16,
    fontFamily: 'monospace',
    marginTop: 16,
  },
  button: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
