import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, PanResponder, LayoutChangeEvent } from 'react-native';
import { Canvas, RoundedRect, Rect, Circle, BlurMask } from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 14;
const FRAME_MS = 16.67;
const MAX_LIVES = 3;
const AI_SPEED = 4;
const BALL_SPEED_INITIAL = 5;
const PADDLE_MARGIN = 30;
const SPEED_INCREASE_INTERVAL = 10000;
const SPEED_INCREASE_RATE = 0.1;

interface PongGameProps {
  onGameOver?: (score: number) => void;
  onScoreChange?: (score: number) => void;
}

export const PongGame: React.FC<PongGameProps> = ({
  onGameOver,
  onScoreChange,
}) => {
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [playerScore, setPlayerScore] = useState(0);
  const [playerLives, setPlayerLives] = useState(MAX_LIVES);
  const [playerX, setPlayerX] = useState(width / 2 - PADDLE_WIDTH / 2);
  const [aiX, setAiX] = useState(width / 2 - PADDLE_WIDTH / 2);
  const [ballPos, setBallPos] = useState({ x: width / 2, y: 300 });
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [level, setLevel] = useState(1);
  const [_speedMultiplier, setSpeedMultiplier] = useState(1);

  const playerXRef = useRef(width / 2 - PADDLE_WIDTH / 2);
  const aiXRef = useRef(width / 2 - PADDLE_WIDTH / 2);
  const ballRef = useRef({ x: width / 2, y: 300, vx: BALL_SPEED_INITIAL, vy: BALL_SPEED_INITIAL });
  const playerScoreRef = useRef(0);
  const playerLivesRef = useRef(MAX_LIVES);
  const canvasHeightRef = useRef(600);
  const gameStartTimeRef = useRef(Date.now());
  const speedMultiplierRef = useRef(1);

  const handleCanvasLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setCanvasHeight(height);
    canvasHeightRef.current = height;
    ballRef.current.y = height / 2;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gameState !== 'playing') return;
        const newX = Math.max(0, Math.min(width - PADDLE_WIDTH, gestureState.moveX - PADDLE_WIDTH / 2));
        setPlayerX(newX);
        playerXRef.current = newX;
      },
    })
  ).current;

  const resetBall = (direction: number) => {
    const currentSpeed = BALL_SPEED_INITIAL * speedMultiplierRef.current;
    ballRef.current = {
      x: width / 2,
      y: canvasHeightRef.current / 2,
      vx: (Math.random() > 0.5 ? 1 : -1) * currentSpeed,
      vy: direction * currentSpeed,
    };
    setBallPos({ x: width / 2, y: canvasHeightRef.current / 2 });
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      const ball = ballRef.current;
      const height = canvasHeightRef.current;
      
      const elapsedTime = Date.now() - gameStartTimeRef.current;
      const newLevel = Math.floor(elapsedTime / SPEED_INCREASE_INTERVAL) + 1;
      const newMultiplier = 1 + (newLevel - 1) * SPEED_INCREASE_RATE;
      if (newMultiplier !== speedMultiplierRef.current) {
        speedMultiplierRef.current = newMultiplier;
        setSpeedMultiplier(newMultiplier);
        setLevel(newLevel);
      }
      
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x <= BALL_SIZE / 2 || ball.x >= width - BALL_SIZE / 2) {
        ball.vx *= -1;
        ball.x = Math.max(BALL_SIZE / 2, Math.min(width - BALL_SIZE / 2, ball.x));
      }

      const playerPaddleY = height - PADDLE_MARGIN - PADDLE_HEIGHT;
      if (
        ball.vy > 0 &&
        ball.y + BALL_SIZE / 2 >= playerPaddleY &&
        ball.y - BALL_SIZE / 2 <= playerPaddleY + PADDLE_HEIGHT &&
        ball.x >= playerXRef.current &&
        ball.x <= playerXRef.current + PADDLE_WIDTH
      ) {
        ball.vy *= -1.05;
        ball.y = playerPaddleY - BALL_SIZE / 2;
        const hitPos = (ball.x - playerXRef.current) / PADDLE_WIDTH - 0.5;
        ball.vx += hitPos * 3;
        
        const currentLevel = Math.floor(elapsedTime / SPEED_INCREASE_INTERVAL) + 1;
        const hitScore = 10 * currentLevel;
        const newScore = playerScoreRef.current + hitScore;
        playerScoreRef.current = newScore;
        setPlayerScore(newScore);
        onScoreChange?.(newScore);
      }

      const aiPaddleY = PADDLE_MARGIN;
      if (
        ball.vy < 0 &&
        ball.y - BALL_SIZE / 2 <= aiPaddleY + PADDLE_HEIGHT &&
        ball.y + BALL_SIZE / 2 >= aiPaddleY &&
        ball.x >= aiXRef.current &&
        ball.x <= aiXRef.current + PADDLE_WIDTH
      ) {
        ball.vy *= -1.05;
        ball.y = aiPaddleY + PADDLE_HEIGHT + BALL_SIZE / 2;
        const hitPos = (ball.x - aiXRef.current) / PADDLE_WIDTH - 0.5;
        ball.vx += hitPos * 3;
      }

      const aiCenter = aiXRef.current + PADDLE_WIDTH / 2;
      const targetX = ball.x;
      if (aiCenter < targetX - 10) {
        aiXRef.current = Math.min(width - PADDLE_WIDTH, aiXRef.current + AI_SPEED);
      } else if (aiCenter > targetX + 10) {
        aiXRef.current = Math.max(0, aiXRef.current - AI_SPEED);
      }
      setAiX(aiXRef.current);

      if (ball.y < 0) {
        const currentLevel = Math.floor(elapsedTime / SPEED_INCREASE_INTERVAL) + 1;
        const missScore = 100 * currentLevel;
        const newScore = playerScoreRef.current + missScore;
        playerScoreRef.current = newScore;
        setPlayerScore(newScore);
        onScoreChange?.(newScore);
        resetBall(1);
      } else if (ball.y > height) {
        const newLives = playerLivesRef.current - 1;
        playerLivesRef.current = newLives;
        setPlayerLives(newLives);
        
        if (newLives <= 0) {
          setGameState('gameover');
          onGameOver?.(playerScoreRef.current);
        } else {
          resetBall(-1);
        }
      }

      const maxSpeed = 12 * speedMultiplierRef.current;
      ball.vx = Math.max(-maxSpeed, Math.min(maxSpeed, ball.vx));
      ball.vy = Math.max(-maxSpeed, Math.min(maxSpeed, ball.vy));

      setBallPos({ x: ball.x, y: ball.y });
    }, FRAME_MS);

    return () => clearInterval(gameLoop);
  }, [gameState, onGameOver, onScoreChange]);

  const restart = () => {
    setGameState('playing');
    setPlayerScore(0);
    setPlayerLives(MAX_LIVES);
    setLevel(1);
    setSpeedMultiplier(1);
    playerScoreRef.current = 0;
    playerLivesRef.current = MAX_LIVES;
    speedMultiplierRef.current = 1;
    gameStartTimeRef.current = Date.now();
    setPlayerX(width / 2 - PADDLE_WIDTH / 2);
    setAiX(width / 2 - PADDLE_WIDTH / 2);
    playerXRef.current = width / 2 - PADDLE_WIDTH / 2;
    aiXRef.current = width / 2 - PADDLE_WIDTH / 2;
    resetBall(1);
  };

  return (
    <View 
      style={styles.container} 
      testID="pong-container"
      {...panResponder.panHandlers}
    >
      <View style={styles.scoreBar}>
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>LIVES</Text>
          <Text style={[styles.livesValue, { color: '#00ff9d' }]} testID="pong-player-lives">{'❤️'.repeat(playerLives)}</Text>
        </View>
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>LEVEL</Text>
          <Text style={[styles.scoreValue, { color: '#ffcc00' }]} testID="pong-level">{level}</Text>
        </View>
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={[styles.scoreValue, { color: '#fff' }]} testID="pong-player-score">{playerScore}</Text>
        </View>
      </View>

      <View style={styles.canvasContainer} onLayout={handleCanvasLayout}>
        <Canvas style={styles.canvas}>
          {/* Center line */}
          <Rect x={0} y={canvasHeight / 2 - 1} width={width} height={2} color="#222" />
          
          {/* Center circle */}
          <Circle cx={width / 2} cy={canvasHeight / 2} r={40} color="#1a1a1a" style="stroke" strokeWidth={2} />

          {/* AI Paddle (top) */}
          <RoundedRect
            x={aiX}
            y={PADDLE_MARGIN}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            r={6}
            color="#ff0066"
            opacity={0.5}
          >
            <BlurMask blur={4} style="normal" />
          </RoundedRect>
          <RoundedRect
            x={aiX}
            y={PADDLE_MARGIN}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            r={6}
            color="#ff0066"
          />

          {/* Player Paddle (bottom) */}
          <RoundedRect
            x={playerX}
            y={canvasHeight - PADDLE_MARGIN - PADDLE_HEIGHT}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            r={6}
            color="#00ff9d"
            opacity={0.5}
          >
            <BlurMask blur={4} style="normal" />
          </RoundedRect>
          <RoundedRect
            x={playerX}
            y={canvasHeight - PADDLE_MARGIN - PADDLE_HEIGHT}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            r={6}
            color="#00ff9d"
          />

          {/* Ball */}
          <Circle
            cx={ballPos.x}
            cy={ballPos.y}
            r={BALL_SIZE / 2 + 4}
            color="#fff"
            opacity={0.3}
          >
            <BlurMask blur={6} style="normal" />
          </Circle>
          <Circle
            cx={ballPos.x}
            cy={ballPos.y}
            r={BALL_SIZE / 2}
            color="#fff"
          />
        </Canvas>
      </View>

      <View style={styles.controls}>
        <Text style={styles.controlHint}>Drag to move paddle</Text>
      </View>

      {gameState === 'gameover' && (
        <View style={styles.overlay} testID="pong-gameover">
          <Text style={[styles.gameOverText, { color: '#ff0066' }]}>
            GAME OVER
          </Text>
          <Text style={styles.finalScore} testID="pong-final-score">
            Score: {playerScore}
          </Text>
          <TouchableOpacity style={styles.restartBtn} onPress={restart} testID="pong-restart">
            <Text style={styles.restartText}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a0a0a',
  },
  scoreBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  scoreSection: {
    alignItems: 'center',
    minWidth: 60,
  },
  scoreLabel: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  scoreValue: {
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  livesValue: {
    fontSize: 16,
    letterSpacing: 2,
  },
  canvasContainer: { 
    flex: 1,
  },
  canvas: { 
    flex: 1,
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  controlHint: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.9)', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  gameOverText: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    fontFamily: 'monospace',
  },
  finalScore: { 
    color: '#fff', 
    fontSize: 48, 
    marginTop: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  restartBtn: { 
    marginTop: 30, 
    backgroundColor: '#00ff9d', 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    borderRadius: 8,
  },
  restartText: { 
    color: '#000', 
    fontSize: 18, 
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});
