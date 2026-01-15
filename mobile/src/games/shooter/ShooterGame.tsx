import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, PanResponder } from 'react-native';
import { Canvas, Group, Path, BlurMask, RoundedRect } from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 40;
const BULLET_SIZE = 8;
const ENEMY_SIZE = 30;
const FRAME_MS = 16.67;

// Skia Path Strings
// Player: Arrow pointing up (40x40)
const PLAYER_PATH = "M 20 0 L 40 40 L 20 30 L 0 40 Z";
// Enemy: Inverted Triangle (30x30)
const ENEMY_PATH = "M 0 0 L 30 0 L 15 30 Z";

interface Entity {
  id: number;
  x: number;
  y: number;
  active: boolean;
  speed?: number;
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

  const playerXRef = useRef(width / 2);
  const scoreRef = useRef(0);
  const nextId = useRef(0);
  const lastEnemySpawn = useRef(0);
  const lastBulletFire = useRef(0);
  const nextSpawnTime = useRef(1500);
  const bulletsRef = useRef<Entity[]>([]);
  const enemiesRef = useRef<Entity[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gameState !== 'playing') return;
        const newX = Math.max(PLAYER_SIZE / 2, Math.min(width - PLAYER_SIZE / 2, gestureState.moveX));
        setPlayerX(newX);
        playerXRef.current = newX;
      },
    })
  ).current;

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      lastBulletFire.current += FRAME_MS;
      if (lastBulletFire.current >= 120) {
        const bullet: Entity = {
          id: nextId.current++,
          x: playerXRef.current,
          y: height - 100,
          active: true,
        };
        bulletsRef.current = [...bulletsRef.current, bullet];
        lastBulletFire.current = 0;
      }

      bulletsRef.current = bulletsRef.current
        .map((b) => ({ ...b, y: b.y - 10 }))
        .filter((b) => b.y > -BULLET_SIZE);

      enemiesRef.current = enemiesRef.current
        .map((e) => ({ ...e, y: e.y + (e.speed ?? 3) }))
        .filter((e) => e.y < height + ENEMY_SIZE);

      lastEnemySpawn.current += FRAME_MS;
      if (lastEnemySpawn.current > nextSpawnTime.current) {
        const enemy: Entity = {
          id: nextId.current++,
          x: Math.random() * (width - ENEMY_SIZE) + ENEMY_SIZE / 2,
          y: -ENEMY_SIZE,
          active: true,
          speed: Math.random() * 3 + 5,
        };
        enemiesRef.current = [...enemiesRef.current, enemy];
        nextSpawnTime.current = Math.random() * 300 + 500;
        lastEnemySpawn.current = 0;
      }

      let scoreIncrease = 0;
      const newBullets = [...bulletsRef.current];
      const newEnemies = [...enemiesRef.current];

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

      bulletsRef.current = newBullets;
      enemiesRef.current = newEnemies;

      const playerHit = enemiesRef.current.some((e) => {
        const dx = e.x - playerXRef.current;
        const dy = e.y - (height - 100 + PLAYER_SIZE / 2);
        return Math.sqrt(dx * dx + dy * dy) < (PLAYER_SIZE + ENEMY_SIZE) / 2;
      });

      setBullets(bulletsRef.current);
      setEnemies(enemiesRef.current);

      if (scoreIncrease > 0) {
        const newScore = scoreRef.current + scoreIncrease;
        scoreRef.current = newScore;
        setScore(newScore);
        onScoreChange?.(newScore);
      }

      if (playerHit) {
        setGameState('gameover');
        onGameOver?.(scoreRef.current);
      }
    }, FRAME_MS);

    return () => clearInterval(gameLoop);
  }, [gameState, onGameOver, onScoreChange]);

  const restart = () => {
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    setBullets([]);
    setEnemies([]);
    bulletsRef.current = [];
    enemiesRef.current = [];
    setPlayerX(width / 2);
    playerXRef.current = width / 2;
    lastBulletFire.current = 0;
    lastEnemySpawn.current = 0;
  };

  return (
    <View 
      style={styles.container} 
      testID="shooter-container"
      {...panResponder.panHandlers}
    >
      <Text testID="shooter-score" style={styles.score}>SCORE: {score}</Text>

      <Canvas style={styles.canvas} testID="shooter-canvas">
        {/* Player */}
        <Group transform={[{ translate: [playerX - PLAYER_SIZE / 2, height - 100] }]}>
          <Path
            path={PLAYER_PATH}
            color="#00ff9d"
            style="stroke"
            strokeWidth={4}
            opacity={0.5}
          >
            <BlurMask blur={4} style="normal" />
          </Path>
          <Path path={PLAYER_PATH} color="#00ff9d" />
        </Group>

        {/* Bullets */}
        {bullets.map((b) => (
          <Group key={b.id} transform={[{ translate: [b.x - 2, b.y - 6] }]}>
            <RoundedRect
              x={0}
              y={0}
              width={4}
              height={12}
              r={2}
              color="#ffff00"
              opacity={0.6}
            >
              <BlurMask blur={2} style="normal" />
            </RoundedRect>
            <RoundedRect x={0} y={0} width={4} height={12} r={2} color="#ffff00" />
          </Group>
        ))}

        {/* Enemies */}
        {enemies.map((e) => (
          <Group key={e.id} transform={[{ translate: [e.x - ENEMY_SIZE / 2, e.y - ENEMY_SIZE / 2] }]}>
            <Path path={ENEMY_PATH} color="#ff0066" />
          </Group>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  canvas: { flex: 1 },
  score: { color: '#00ff9d', fontSize: 20, fontWeight: 'bold', textAlign: 'center', paddingTop: 50, fontFamily: 'monospace' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  gameOverText: { color: '#ff0066', fontSize: 36, fontWeight: 'bold', fontFamily: 'monospace' },
  finalScore: { color: '#fff', fontSize: 24, marginTop: 20 },
  restartBtn: { marginTop: 30, backgroundColor: '#00ff9d', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8 },
  restartText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});
