import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';

const { width, height } = Dimensions.get('window');
const BALL_SIZE = 40;

interface GameLoopProps {}

export const GameLoop: React.FC<GameLoopProps> = () => {
  const [position, setPosition] = useState({ x: width / 2 - BALL_SIZE / 2, y: height / 2 - BALL_SIZE / 2 });
  const velocity = useRef({ x: 4, y: 4 });
  const requestRef = useRef<number | undefined>(undefined);

  const update = () => {
    setPosition((prev) => {
      let newX = prev.x + velocity.current.x;
      let newY = prev.y + velocity.current.y;

      if (newX <= 0 || newX >= width - BALL_SIZE) {
        velocity.current.x *= -1;
        newX = Math.max(0, Math.min(newX, width - BALL_SIZE));
      }
      if (newY <= 0 || newY >= height - BALL_SIZE) {
        velocity.current.y *= -1;
        newY = Math.max(0, Math.min(newY, height - BALL_SIZE));
      }

      return { x: newX, y: newY };
    });

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.debugText}>
        FPS PoC: {Math.round(position.x)}, {Math.round(position.y)}
      </Text>
      <View
        style={[
          styles.ball,
          {
            transform: [{ translateX: position.x }, { translateY: position.y }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  ball: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BALL_SIZE,
    height: BALL_SIZE,
    backgroundColor: '#00ff9d',
    borderRadius: BALL_SIZE / 2,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  debugText: {
    color: '#00ff9d',
    position: 'absolute',
    top: 50,
    left: 20,
    fontFamily: 'monospace',
    fontSize: 14,
    zIndex: 10,
  },
});
