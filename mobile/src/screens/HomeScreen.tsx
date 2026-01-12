import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/store';
import { CoinHUD, FeaturedCarousel, GameGrid } from '@/components';

export const HomeScreen: React.FC = () => {
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const colors = getThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CoinHUD />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>RETROX</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>90s Arcade Games</Text>
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>FEATURED</Text>
        <FeaturedCarousel />
        
        <GameGrid />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginTop: 4,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});
