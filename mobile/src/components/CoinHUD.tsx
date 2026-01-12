import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCoinStore, useSettingsStore } from '@/store';

interface CoinHUDProps {
  onPress?: () => void;
}

export const CoinHUD: React.FC<CoinHUDProps> = ({ onPress }) => {
  const coins = useCoinStore((s) => s.coins);
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const colors = getThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity 
      style={[styles.container, { top: insets.top + 8 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.coinBox, { backgroundColor: colors.background }]}>
        <Text style={styles.coinIcon}>💰</Text>
        <Text style={[styles.coinAmount, { color: colors.primary }]}>
          {coins.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
  },
  coinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  coinIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  coinAmount: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
