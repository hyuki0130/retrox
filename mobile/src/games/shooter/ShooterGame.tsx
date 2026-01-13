import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Canvas, Circle, Rect, Group } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 40;
const BULLET_SIZE = 8;
const ENEMY_SIZE = 30;
const FRAME_MS = 16.67;

interface Entity {
  id: number;
  x: number;
  y: number;
  active: boolean;
}

interface ShooterGameProps {
  onGameOver?: (score: number) => void;
  onScoreChange?: (score: number) => void;
}

export const ShooterGame: React.FC<ShooterGameProps> = ({
  onGameOver,
  onScoreChange,
}) => {
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [score, setScore] = useState(0);
  const [playerX, setPlayerX] = useState(width / 2);
  const [bullets, setBullets] = useState<Entity[]>([]);
  const [enemies, setEnemies] = useState<Entity[]>([]);

  const nextId = useRef(0);
  const lastEnemySpawn = useRef(0);

  const spawnEnemy = useCallback(() => {
    const enemy: Entity = {
      id: nextId.current++,
      x: Math.random() * (width - ENEMY_SIZE) + ENEMY_SIZE / 2,
      y: -ENEMY_SIZE,
      active: true,
    };
    setEnemies((prev) => [...prev, enemy]);
  }, []);

  const fireBullet = useCallback(() => {
    const bullet: Entity = {
      id: nextId.current++,
      x: playerX,
      y: height - 100,
      active: true,
    };
    setBullets((prev) => [...prev, bullet]);
  }, [playerX]);

  const movePlayer = useCallback((direction: 'left' | 'right') => {
    setPlayerX((prev) => {
      const newX = direction === 'left' ? prev - 30 : prev + 30;
      return Math.max(PLAYER_SIZE / 2, Math.min(width - PLAYER_SIZE / 2, newX));
    });
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - 10 }))
          .filter((b) => b.y > -BULLET_SIZE)
      );

      setEnemies((prev) =>
        prev
          .map((e) => ({ ...e, y: e.y + 3 }))
          .filter((e) => e.y < height + ENEMY_SIZE)
      );

      lastEnemySpawn.current += FRAME_MS;
      if (lastEnemySpawn.current > 1500) {
        spawnEnemy();
        lastEnemySpawn.current = 0;
      }

      setBullets((prevBullets) => {
        setEnemies((prevEnemies) => {
          const newEnemies = [...prevEnemies];
          const newBullets = [...prevBullets];
          let scoreIncrease = 0;

          for (let i = newBullets.length - 1; i >= 0; i--) {
            for (let j = newEnemies.length - 1; j >= 0; j--) {
              const dx = newBullets[i].x - newEnemies[j].x;
              const dy = newBullets[i].y - newEnemies[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < (BULLET_SIZE + ENEMY_SIZE) / 2) {
                newBullets.splice(i, 1);
                newEnemies.splice(j, 1);
                scoreIncrease += 100;
                break;
              }
            }
          }

          if (scoreIncrease > 0) {
            setScore((s) => {
              const newScore = s + scoreIncrease;
              onScoreChange?.(newScore);
              return newScore;
            });
          }

          return newEnemies;
        });
        return prevBullets;
      });

      setEnemies((prev) => {
        const playerHit = prev.some((e) => {
          const dx = e.x - playerX;
          const dy = e.y - (height - 80);
          return Math.sqrt(dx * dx + dy * dy) < (PLAYER_SIZE + ENEMY_SIZE) / 2;
        });

        if (playerHit) {
          setGameState('gameover');
          onGameOver?.(score);
        }

        return prev;
      });
    }, FRAME_MS);

    return () => clearInterval(gameLoop);
  }, [gameState, playerX, score, spawnEnemy, onGameOver, onScoreChange]);

  const restart = () => {
    setGameState('playing');
    setScore(0);
    setBullets([]);
    setEnemies([]);
    setPlayerX(width / 2);
  };

  return (
    <View style={styles.container} testID="shooter-container">
      <Text style={styles.score}>SCORE: <Text testID="shooter-score">{score}</Text></Text>

      <Canvas style={styles.canvas} testID="shooter-canvas">
        <Rect x={playerX - PLAYER_SIZE / 2} y={height - 100} width={PLAYER_SIZE} height={PLAYER_SIZE} color="#00ff9d" />

        {bullets.map((b) => (
          <Circle key={b.id} cx={b.x} cy={b.y} r={BULLET_SIZE / 2} color="#ffff00" />
        ))}

        {enemies.map((e) => (
          <Rect key={e.id} x={e.x - ENEMY_SIZE / 2} y={e.y - ENEMY_SIZE / 2} width={ENEMY_SIZE} height={ENEMY_SIZE} color="#ff0066" />
        ))}
      </Canvas>

      {gameState === 'gameover' && (
        <View style={styles.overlay} testID="shooter-gameover">
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <Text style={styles.finalScore} testID="shooter-final-score">Score: {score}</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={restart} testID="shooter-restart">
            <Text style={styles.restartText}>RESTART</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.controls} testID="shooter-controls">
        <TouchableOpacity style={styles.controlBtn} onPress={() => movePlayer('left')} testID="shooter-move-left">
          <Text style={styles.controlText}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={fireBullet} testID="shooter-fire">
          <Text style={styles.controlText}>FIRE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={() => movePlayer('right')} testID="shooter-move-right">
          <Text style={styles.controlText}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  canvas: { flex: 1 },
  score: { color: '#00ff9d', fontSize: 20, fontWeight: 'bold', textAlign: 'center', paddingTop: 50, fontFamily: 'monospace' },
  controls: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 40, paddingHorizontal: 20 },
  controlBtn: { backgroundColor: '#333', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, borderWidth: 2, borderColor: '#00ff9d' },
  controlText: { color: '#00ff9d', fontSize: 18, fontWeight: 'bold' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  gameOverText: { color: '#ff0066', fontSize: 36, fontWeight: 'bold', fontFamily: 'monospace' },
  finalScore: { color: '#fff', fontSize: 24, marginTop: 20 },
  restartBtn: { marginTop: 30, backgroundColor: '#00ff9d', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8 },
  restartText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});
