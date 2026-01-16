import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Gameplay: { gameId: string };
  Results: { score: number; gameId: string; highScore: number };
  CoinCharge: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Games: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  GameDetails: { gameId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export interface Game {
  id: string;
  name: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  coinCost: number;
  isLocked: boolean;
  isNew?: boolean;
  description?: string;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
