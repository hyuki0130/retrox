import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GameCountdownProps {
  onComplete: () => void;
  startFrom?: number;
}

export const GameCountdown: React.FC<GameCountdownProps> = ({
  onComplete,
  startFrom = 3,
}) => {
  const [count, setCount] = useState(startFrom);
  const [showGo, setShowGo] = useState(false);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (count === 0 && !showGo) {
      setShowGo(true);
      const timer = setTimeout(() => {
        handleComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [count, showGo, handleComplete]);

  return (
    <View style={styles.overlay} testID="game-countdown">
      <Text style={styles.countText} testID="countdown-number">
        {showGo ? 'GO!' : count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countText: {
    color: '#00ff9d',
    fontSize: 120,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: '#00ff9d',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
});
