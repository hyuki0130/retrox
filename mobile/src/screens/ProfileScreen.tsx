import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCoinStore, useSettingsStore } from '@/store';

const THEMES = [
  { id: 'neon', name: 'Neon', colors: ['#00ff9d', '#ff0066'] },
  { id: 'pixel', name: 'Pixel', colors: ['#16c79a', '#f67280'] },
  { id: 'crt', name: 'CRT', colors: ['#39ff14', '#ff6600'] },
] as const;

export const ProfileScreen: React.FC = () => {
  const coins = useCoinStore((s) => s.coins);
  const { 
    theme, 
    soundEnabled, 
    musicEnabled, 
    vibrationEnabled,
    getThemeColors,
    setTheme,
    toggleSound,
    toggleMusic,
    toggleVibration,
  } = useSettingsStore();
  const colors = getThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.primary }]}>PROFILE</Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>STATS</Text>
          <View style={[styles.statsCard, { backgroundColor: '#1a1a1a' }]}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💰</Text>
              <View>
                <Text style={[styles.statLabel, { color: colors.text }]}>Total Coins</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {coins.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🎮</Text>
              <View>
                <Text style={[styles.statLabel, { color: colors.text }]}>Games Played</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>THEME</Text>
          <View style={styles.themeContainer}>
            {THEMES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeButton,
                  { borderColor: theme === t.id ? colors.primary : '#333' },
                  theme === t.id && { borderWidth: 2 },
                ]}
                onPress={() => setTheme(t.id)}
              >
                <View style={styles.themePreview}>
                  <View style={[styles.themeColor, { backgroundColor: t.colors[0] }]} />
                  <View style={[styles.themeColor, { backgroundColor: t.colors[1] }]} />
                </View>
                <Text style={[styles.themeName, { color: colors.text }]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>SETTINGS</Text>
          <View style={[styles.settingsCard, { backgroundColor: '#1a1a1a' }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔊</Text>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Sound Effects</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: '#333', true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🎵</Text>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Music</Text>
              </View>
              <Switch
                value={musicEnabled}
                onValueChange={toggleMusic}
                trackColor={{ false: '#333', true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📳</Text>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Vibration</Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={toggleVibration}
                trackColor={{ false: '#333', true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>ABOUT</Text>
          <View style={[styles.aboutCard, { backgroundColor: '#1a1a1a' }]}>
            <Text style={[styles.appName, { color: colors.primary }]}>RETROX</Text>
            <Text style={[styles.version, { color: colors.text }]}>Version 1.0.0</Text>
            <Text style={[styles.copyright, { color: '#666' }]}>
              90s Arcade Games Revival
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 12,
    opacity: 0.7,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
    marginHorizontal: 16,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  themePreview: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  themeColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  themeName: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  settingsCard: {
    borderRadius: 12,
    padding: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 12,
  },
  aboutCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  version: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  copyright: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  bottomPadding: {
    height: 100,
  },
});
