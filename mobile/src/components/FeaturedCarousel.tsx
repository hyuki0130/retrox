import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore } from '@/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 180;

interface FeaturedGame {
  id: string;
  title: string;
  subtitle: string;
  badge?: 'NEW' | 'HOT' | 'SOON';
  backgroundColor: string;
}

const FEATURED_GAMES: FeaturedGame[] = [
  { 
    id: 'shooter', 
    title: 'Space Shooter', 
    subtitle: 'Galaga-style Action', 
    badge: 'NEW', 
    backgroundColor: '#1a0a2e' 
  },
  { 
    id: 'puzzle', 
    title: 'Match Puzzle', 
    subtitle: 'Match-3 Challenge', 
    badge: 'HOT', 
    backgroundColor: '#0a1a2e' 
  },
  { 
    id: 'tetris', 
    title: 'Block Drop', 
    subtitle: 'Classic Block Stacking', 
    badge: 'NEW', 
    backgroundColor: '#2e1a0a' 
  },
];

export const FeaturedCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();
  const getThemeColors = useSettingsStore((s) => s.getThemeColors);
  const colors = getThemeColors();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const handleCardPress = (gameId: string) => {
    navigation.navigate('Gameplay', { gameId });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {FEATURED_GAMES.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[
              styles.card, 
              { 
                backgroundColor: game.backgroundColor, 
                width: SCREEN_WIDTH - 32,
                marginHorizontal: 16,
              }
            ]}
            onPress={() => handleCardPress(game.id)}
            activeOpacity={0.8}
          >
            {game.badge && (
              <View style={[
                styles.badge, 
                { backgroundColor: colors.secondary }
              ]}>
                <Text style={styles.badgeText}>{game.badge}</Text>
              </View>
            )}
            <Text style={[styles.title, { color: colors.primary }]}>
              {game.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              {game.subtitle}
            </Text>
            <View style={[styles.playButton, { borderColor: colors.primary }]}>
              <Text style={[styles.playButtonText, { color: colors.primary }]}>
                PLAY
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {FEATURED_GAMES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === activeIndex ? colors.primary : '#333' },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CAROUSEL_HEIGHT + 30,
  },
  card: {
    height: CAROUSEL_HEIGHT,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginTop: 4,
    opacity: 0.8,
  },
  playButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  playButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
