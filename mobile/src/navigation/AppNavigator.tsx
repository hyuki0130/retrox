import React from 'react';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import { GameplayScreen } from '@/screens/GameplayScreen';
import { ResultsScreen } from '@/screens/ResultsScreen';

enableScreens();

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <RootStack.Screen 
            name="MainTabs" 
            component={MainTabNavigator} 
          />
          <RootStack.Screen
            name="Gameplay"
            component={GameplayScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
              gestureEnabled: false,
              statusBarHidden: true,
            }}
          />
          <RootStack.Screen
            name="Results"
            component={ResultsScreen}
            options={{
              animation: 'slide_from_bottom',
              gestureEnabled: false,
            }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
