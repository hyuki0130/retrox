import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList } from './types';
import { useSettingsStore } from '@/store';
import { HomeScreen } from '@/screens/HomeScreen';
import { GamesScreen } from '@/screens/GamesScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabIconProps {
  name: 'home' | 'gamepad' | 'user';
  _color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, _color, size }) => {
  const icons = {
    home: '🏠',
    gamepad: '🎮',
    user: '👤',
  };
  return <Text style={{ fontSize: size - 4 }}>{icons[name]}</Text>;
};

export const MainTabNavigator: React.FC = () => {
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const colors = getThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
        },
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" _color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Games"
        component={GamesScreen}
        options={{
          tabBarLabel: '게임',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="gamepad" _color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '프로필',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="user" _color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0a0a0a',
    borderTopColor: '#1a1a1a',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
});
