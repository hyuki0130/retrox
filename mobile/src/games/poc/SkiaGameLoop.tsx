import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
} from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const BALL_SIZE = 40;
const BALL_RADIUS = BALL_SIZE / 2;
const FRAME_INTERVAL_MS = 16.67;

interface SkiaGameLoopProps {}

/**
 * Skia-based Game Loop PoC
 * Implements same bouncing ball demo as RAF-based GameLoop.tsx for comparison
 */
export const SkiaGameLoop: React.FC<SkiaGameLoopProps> = () => {
  const posX = useSharedValue(width / 2);
  const posY = useSharedValue(height / 2);
  const velocityX = useSharedValue(4);
  const velocityY = useSharedValue(4);

  React.useEffect(() => {
    const updatePosition = () => {
      'worklet';
      let newX = posX.value + velocityX.value;
      let newY = posY.value + velocityY.value;

      if (newX <= BALL_RADIUS || newX >= width - BALL_RADIUS) {
        velocityX.value *= -1;
        newX = Math.max(BALL_RADIUS, Math.min(newX, width - BALL_RADIUS));
      }
      if (newY <= BALL_RADIUS || newY >= height - BALL_RADIUS) {
        velocityY.value *= -1;
        newY = Math.max(BALL_RADIUS, Math.min(newY, height - BALL_RADIUS));
      }

      posX.value = newX;
      posY.value = newY;
    };

    const intervalId = setInterval(updatePosition, FRAME_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

  const displayX = useDerivedValue(() => Math.round(posX.value));
  const displayY = useDerivedValue(() => Math.round(posY.value));

  return (
    <View style={styles.container}>
      <Text style={styles.debugText}>
        Skia PoC: {Math.round(posX.value)}, {Math.round(posY.value)}
      </Text>
      <Canvas style={styles.canvas}>
        <Circle cx={posX} cy={posY} r={BALL_RADIUS} color="#00ff9d" />
        <Circle
          cx={posX}
          cy={posY}
          r={BALL_RADIUS}
          color="white"
          style="stroke"
          strokeWidth={2}
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  canvas: {
    flex: 1,
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
