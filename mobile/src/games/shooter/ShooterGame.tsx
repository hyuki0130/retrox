import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, PanResponder, LayoutChangeEvent } from 'react-native';
import { Canvas, Group, Path, BlurMask, RoundedRect, Image } from '@shopify/react-native-skia';
import { GameCountdown } from '@/ui';
import { useShooterSprites } from '@/core';

const { width } = Dimensions.get('window');
const PLAYER_SIZE = 40;
const BULLET_SIZE = 8;
const ENEMY_SIZE = 30;
const FRAME_MS = 16.67;
const PLAYER_BOTTOM_MARGIN = 60;

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
  const sprites = useShooterSprites();
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'gameover'>('countdown');
  const [score, setScore] = useState(0);
  const [playerX, setPlayerX] = useState(width / 2);
  const [bullets, setBullets] = useState<Entity[]>([]);
  const [enemies, setEnemies] = useState<Entity[]>([]);
  const [canvasHeight, setCanvasHeight] = useState(600);

  const playerXRef = useRef(width / 2);
  const scoreRef = useRef(0);
  const nextId = useRef(0);
  const lastEnemySpawn = useRef(0);
  const lastBulletFire = useRef(0);
  const nextSpawnTime = useRef(1500);
  const bulletsRef = useRef<Entity[]>([]);
  const enemiesRef = useRef<Entity[]>([]);
  const canvasHeightRef = useRef(600);
  const gameTimeRef = useRef(0);
  const difficultyRef = useRef(1);
  const gameStateRef = useRef<'countdown' | 'playing' | 'gameover'>('countdown');

  const handleCanvasLayout = (event: LayoutChangeEvent) => {
    const { height: measuredHeight } = event.nativeEvent.layout;
    setCanvasHeight(measuredHeight);
    canvasHeightRef.current = measuredHeight;
  };

  const playerY = canvasHeight - PLAYER_BOTTOM_MARGIN;

  // Sync gameState to ref for PanResponder closure
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gameStateRef.current !== 'playing') return;
        const newX = Math.max(PLAYER_SIZE / 2, Math.min(width - PLAYER_SIZE / 2, gestureState.moveX));
        setPlayerX(newX);
        playerXRef.current = newX;
      },
    })
  ).current;

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      gameTimeRef.current += FRAME_MS;
      difficultyRef.current = 1 + Math.floor(gameTimeRef.current / 10000) * 0.2 + scoreRef.current / 5000;
      const difficulty = Math.min(difficultyRef.current, 3);

      lastBulletFire.current += FRAME_MS;
      const fireRate = Math.max(60, 120 - difficulty * 15);
      if (lastBulletFire.current >= fireRate) {
        const bulletY = canvasHeightRef.current - PLAYER_BOTTOM_MARGIN;
        const bullet: Entity = {
          id: nextId.current++,
          x: playerXRef.current,
          y: bulletY,
          active: true,
        };
        bulletsRef.current = [...bulletsRef.current, bullet];
        lastBulletFire.current = 0;
      }

      bulletsRef.current = bulletsRef.current
        .map((b) => ({ ...b, y: b.y - 12 }))
        .filter((b) => b.y > -BULLET_SIZE);

      const enemySpeedMultiplier = 1 + (difficulty - 1) * 0.3;
      enemiesRef.current = enemiesRef.current
        .map((e) => ({ ...e, y: e.y + (e.speed ?? 3) * enemySpeedMultiplier }))
        .filter((e) => e.y < canvasHeightRef.current + ENEMY_SIZE);

      lastEnemySpawn.current += FRAME_MS;
      const spawnInterval = Math.max(200, 500 - difficulty * 80);
      if (lastEnemySpawn.current > nextSpawnTime.current) {
        const baseSpeed = 4 + difficulty;
        const enemy: Entity = {
          id: nextId.current++,
          x: Math.random() * (width - ENEMY_SIZE) + ENEMY_SIZE / 2,
          y: -ENEMY_SIZE,
          active: true,
          speed: Math.random() * 3 + baseSpeed,
        };
        enemiesRef.current = [...enemiesRef.current, enemy];
        nextSpawnTime.current = Math.random() * 150 + spawnInterval;
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
        const playerCenterY = canvasHeightRef.current - PLAYER_BOTTOM_MARGIN + PLAYER_SIZE / 2;
        const dy = e.y - playerCenterY;
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

  const handleCountdownComplete = useCallback(() => {
    setGameState('playing');
  }, []);

  const restart = () => {
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
    gameTimeRef.current = 0;
    difficultyRef.current = 1;
    setGameState('countdown');
  };

  return (
    <View 
      style={styles.container} 
      testID="shooter-container"
      {...panResponder.panHandlers}
    >
      <View style={styles.canvasContainer} onLayout={handleCanvasLayout}>
        <Canvas style={styles.canvas} testID="shooter-canvas">
          {/* Player */}
          {sprites.player ? (
            <Image
              image={sprites.player}
              x={playerX - PLAYER_SIZE / 2}
              y={playerY}
              width={PLAYER_SIZE}
              height={PLAYER_SIZE}
              fit="contain"
            />
          ) : (
            <Group transform={[{ translate: [playerX - PLAYER_SIZE / 2, playerY] }]}>
              <Path path={PLAYER_PATH} color="#00ff9d" />
            </Group>
          )}

          {/* Bullets */}
          {bullets.map((b) => (
            sprites.laserBlue ? (
              <Image
                key={b.id}
                image={sprites.laserBlue}
                x={b.x - BULLET_SIZE / 2}
                y={b.y - BULLET_SIZE * 1.5}
                width={BULLET_SIZE}
                height={BULLET_SIZE * 3}
                fit="contain"
              />
            ) : (
              <Group key={b.id} transform={[{ translate: [b.x - 2, b.y - 6] }]}>
                <RoundedRect x={0} y={0} width={4} height={12} r={2} color="#ffff00" />
              </Group>
            )
          ))}

          {/* Enemies */}
          {enemies.map((e) => {
            const enemySprites = [sprites.enemy1, sprites.enemy2, sprites.enemy3];
            const enemySprite = enemySprites[e.id % 3];
            return enemySprite ? (
              <Image
                key={e.id}
                image={enemySprite}
                x={e.x - ENEMY_SIZE / 2}
                y={e.y - ENEMY_SIZE / 2}
                width={ENEMY_SIZE}
                height={ENEMY_SIZE}
                fit="contain"
              />
            ) : (
              <Group key={e.id} transform={[{ translate: [e.x - ENEMY_SIZE / 2, e.y - ENEMY_SIZE / 2] }]}>
                <Path path={ENEMY_PATH} color="#ff0066" />
              </Group>
            );
          })}
        </Canvas>
      </View>

      {gameState === 'countdown' && (
        <GameCountdown onComplete={handleCountdownComplete} />
      )}

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
  canvasContainer: { flex: 1 },
  canvas: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  gameOverText: { color: '#ff0066', fontSize: 36, fontWeight: 'bold', fontFamily: 'monospace' },
  finalScore: { color: '#fff', fontSize: 24, marginTop: 20 },
  restartBtn: { marginTop: 30, backgroundColor: '#00ff9d', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8 },
  restartText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});
