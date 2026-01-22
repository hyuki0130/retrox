import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAudio } from '@/core';

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
  const onCompleteRef = useRef(onComplete);
  const audio = useAudio();
  const hasPlayedVoice = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!hasPlayedVoice.current) {
      hasPlayedVoice.current = true;
      audio.play('countdown_voice');
    }
  }, [audio]);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(c => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (count === 0 && !showGo) {
      setShowGo(true);
    }
  }, [count, showGo]);

  useEffect(() => {
    if (showGo) {
      const timer = setTimeout(() => {
        onCompleteRef.current();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showGo]);

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
