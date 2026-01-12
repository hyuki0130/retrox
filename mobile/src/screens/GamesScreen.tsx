import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/store';

export const GamesScreen: React.FC = () => {
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const colors = getThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.primary }]}>GAMES</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>All Games</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'monospace',
    marginTop: 8,
  },
});
