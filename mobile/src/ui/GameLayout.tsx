import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GameLayoutProps {
  children: React.ReactNode;
  hudContent?: React.ReactNode;
  controlsContent?: React.ReactNode;
  style?: ViewStyle;
  gameAreaStyle?: ViewStyle;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  hudContent,
  controlsContent,
  style,
  gameAreaStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {hudContent && (
        <View style={styles.hudArea}>
          {hudContent}
        </View>
      )}
      
      <View style={[styles.gameArea, gameAreaStyle]}>
        {children}
      </View>
      
      {controlsContent && (
        <View style={styles.controlsArea}>
          {controlsContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  hudArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsArea: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
